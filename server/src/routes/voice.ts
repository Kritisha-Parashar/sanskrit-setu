import { Router, Request, Response, NextFunction } from "express";
import axios from "axios";
import { pool } from "../db/connection";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// Type definitions
interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role?: string;
  };
}

interface EvaluationRequest {
  word_expected: string;
  audio_base64: string;
}

interface EvaluationResponse {
  word_match: boolean;
  score: number;
  transcription: string;
  feedback: string;
  phoneme_sequence_expected: string;
  phoneme_sequence_actual: string;
  similarity: number;
}

// ML Service URL (from environment or default)
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";

/**
 * POST /api/voice/evaluate
 * Evaluate Sanskrit pronunciation
 * Requires: JSON body with word_expected and audio_base64
 */
router.post("/evaluate", async (req: AuthRequest, res: Response) => {
  try {
    const { word_expected, audio_base64 } = req.body as {
      word_expected?: string;
      audio_base64?: string;
    };

    // Validation
    if (!word_expected || typeof word_expected !== "string") {
      return res.status(400).json({
        error: "word_expected is required and must be a non-empty string",
      });
    }

    if (!audio_base64 || typeof audio_base64 !== "string") {
      return res.status(400).json({
        error: "audio_base64 is required and must be a non-empty string",
      });
    }

    // Call ML service
    console.log(`[Voice] Evaluating pronunciation for: ${word_expected}`);
    let mlResponse: EvaluationResponse;

    try {
      const response = await axios.post(`${ML_SERVICE_URL}/evaluate`, {
        word_expected,
        audio_base64,
      });
      mlResponse = response.data;
    } catch (mlError: any) {
      console.error("[Voice] ML service error:", mlError.message);
      if (mlError.response?.status === 400) {
        return res.status(400).json({
          error: mlError.response.data.detail || "Invalid audio",
        });
      }
      throw new Error(
        `ML service unavailable: ${mlError.message}. Make sure FastAPI service is running on ${ML_SERVICE_URL}`,
      );
    }

    // Store pronunciation attempt in database
    try {
      console.log("[Voice] Storing pronunciation attempt in database...");

      // Try to get or create word_metadata entry
      const wordQuery = `
        INSERT INTO word_metadata (word_id, devanagari)
        VALUES ($1, $2)
        ON CONFLICT (word_id) DO NOTHING
        RETURNING id;
      `;
      const wordResult = await pool.query(wordQuery, [
        word_expected,
        word_expected,
      ]);

      // Insert pronunciation attempt
      const attemptQuery = `
        INSERT INTO pronunciation_attempts (
          user_id,
          word_id,
          transcription,
          score,
          word_match,
          feedback,
          phoneme_sequence_expected,
          phoneme_sequence_actual,
          similarity_score
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id, created_at;
      `;

      const attemptResult = await pool.query(attemptQuery, [
        req.user?.id || null,
        word_expected,
        mlResponse.transcription,
        mlResponse.score,
        mlResponse.word_match,
        mlResponse.feedback,
        mlResponse.phoneme_sequence_expected,
        mlResponse.phoneme_sequence_actual,
        mlResponse.similarity,
      ]);

      console.log(
        "[Voice] Pronunciation attempt stored with ID:",
        attemptResult.rows[0]?.id,
      );
    } catch (dbError: any) {
      // Log but don't fail the response—ML evaluation succeeded
      console.warn(
        "[Voice] Database storage failed (non-critical):",
        dbError.message,
      );
    }

    // Return evaluation result
    return res.status(200).json({
      data: mlResponse,
      message: "Pronunciation evaluation complete",
    });
  } catch (error: any) {
    console.error("[Voice] Evaluation error:", error.message);
    return res.status(500).json({
      error: error.message || "Pronunciation evaluation failed",
    });
  }
});

/**
 * GET /api/voice/stats
 * Get user's pronunciation statistics (requires auth)
 */
router.get(
  "/stats",
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const query = `
      SELECT
        COUNT(*) as total_attempts,
        AVG(score) as average_score,
        COUNT(CASE WHEN word_match = true THEN 1 END) as correct_matches,
        COUNT(DISTINCT word_id) as unique_words,
        MAX(created_at) as last_attempt
      FROM pronunciation_attempts
      WHERE user_id = $1;
    `;

      const result = await pool.query(query, [req.user?.id]);
      const stats = result.rows[0] || {
        total_attempts: 0,
        average_score: 0,
        correct_matches: 0,
        unique_words: 0,
        last_attempt: null,
      };

      return res.status(200).json({
        data: stats,
        message: "User pronunciation statistics",
      });
    } catch (error: any) {
      console.error("[Voice] Stats error:", error.message);
      return res.status(500).json({
        error: "Failed to retrieve statistics",
      });
    }
  },
);

/**
 * GET /api/voice/attempts/:wordId
 * Get user's pronunciation attempts for a specific word (requires auth)
 */
router.get(
  "/attempts/:wordId",
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const { wordId } = req.params;

      const query = `
      SELECT
        id,
        transcription,
        score,
        word_match,
        feedback,
        similarity_score,
        created_at
      FROM pronunciation_attempts
      WHERE user_id = $1 AND word_id = $2
      ORDER BY created_at DESC
      LIMIT 10;
    `;

      const result = await pool.query(query, [req.user?.id, wordId]);

      return res.status(200).json({
        data: result.rows,
        message: `Retrieved ${result.rows.length} pronunciation attempts for word: ${wordId}`,
      });
    } catch (error: any) {
      console.error("[Voice] Attempts error:", error.message);
      return res.status(500).json({
        error: "Failed to retrieve pronunciation attempts",
      });
    }
  },
);

export default router;
