import express from "express";
import { pool } from "../db/connection";
import { authenticateToken, AuthRequest } from "../middleware/auth";
import { z } from "zod";

const router = express.Router();

const updateProgressSchema = z.object({
  xp: z.number().int().min(0),
  completedLessons: z.array(z.union([z.string(), z.number()])),
  unlockedLessons: z.array(z.union([z.string(), z.number()])),
});

// Get user progress
router.get("/", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const result = await pool.query(
      `SELECT xp, completed_lessons, unlocked_lessons 
       FROM user_progress 
       WHERE user_id = $1`,
      [req.userId]
    );

    if (result.rows.length === 0) {
      // Create progress entry if it doesn't exist with first lesson unlocked
      await pool.query(
        `INSERT INTO user_progress (user_id, xp, completed_lessons, unlocked_lessons) 
         VALUES ($1, $2, $3, $4)`,
        [req.userId, 0, [], ['LS001']]
      );
      
      return res.json({
        xp: 0,
        completedLessons: [],
        unlockedLessons: ['LS001'],
      });
    }

    const progress = result.rows[0];
    // Ensure we always have at least LS001 unlocked
    let unlockedLessons = progress.unlocked_lessons || [];
    
    // Convert to array if it's not already
    if (!Array.isArray(unlockedLessons)) {
      unlockedLessons = [];
    }
    
    // Convert all to strings and ensure LS001 is included
    unlockedLessons = unlockedLessons.map((id: string | number) => String(id));
    if (!unlockedLessons.includes('LS001')) {
      unlockedLessons.unshift('LS001'); // Add to beginning
    }
    
    // Update database if we had to add LS001
    if (unlockedLessons.length !== (progress.unlocked_lessons || []).length) {
      await pool.query(
        `UPDATE user_progress 
         SET unlocked_lessons = $1, updated_at = CURRENT_TIMESTAMP 
         WHERE user_id = $2`,
        [unlockedLessons, req.userId]
      );
    }
    
    res.json({
      xp: progress.xp,
      completedLessons: (progress.completed_lessons || []).map((id: string | number) => String(id)),
      unlockedLessons: unlockedLessons,
    });
  } catch (error) {
    console.error("Get progress error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update user progress
router.put("/", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { xp, completedLessons, unlockedLessons } = updateProgressSchema.parse(req.body);

    // Normalize lesson IDs to strings
    const normalizedCompleted = completedLessons.map(id => String(id));
    let normalizedUnlocked = unlockedLessons.map(id => String(id));
    
    // Ensure LS001 is always unlocked (add to beginning if not present)
    if (!normalizedUnlocked.includes('LS001')) {
      normalizedUnlocked.unshift('LS001');
    }

    // Check if progress exists
    const existing = await pool.query(
      "SELECT id FROM user_progress WHERE user_id = $1",
      [req.userId]
    );

    if (existing.rows.length === 0) {
      // Create new progress entry
      await pool.query(
        `INSERT INTO user_progress (user_id, xp, completed_lessons, unlocked_lessons, updated_at) 
         VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)`,
        [req.userId, xp, normalizedCompleted, normalizedUnlocked]
      );
    } else {
      // Update existing progress
      await pool.query(
        `UPDATE user_progress 
         SET xp = $1, 
             completed_lessons = $2, 
             unlocked_lessons = $3, 
             updated_at = CURRENT_TIMESTAMP 
         WHERE user_id = $4`,
        [xp, normalizedCompleted, normalizedUnlocked, req.userId]
      );
    }

    res.json({
      success: true,
      progress: {
        xp,
        completedLessons,
        unlockedLessons,
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error("Update progress error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Reset user progress: XP = 0, only first lesson unlocked, no completed lessons
router.post("/reset", authenticateToken, async (req: AuthRequest, res) => {
  try {
    await pool.query(
      `INSERT INTO user_progress (user_id, xp, completed_lessons, unlocked_lessons, updated_at)
       VALUES ($1, 0, ARRAY[]::TEXT[], ARRAY['LS001']::TEXT[], CURRENT_TIMESTAMP)
       ON CONFLICT (user_id) DO UPDATE SET
         xp = 0,
         completed_lessons = ARRAY[]::TEXT[],
         unlocked_lessons = ARRAY['LS001']::TEXT[],
         updated_at = CURRENT_TIMESTAMP`,
      [req.userId]
    );

    res.json({
      success: true,
      progress: {
        xp: 0,
        completedLessons: [],
        unlockedLessons: ["LS001"],
      },
    });
  } catch (error) {
    console.error("Reset progress error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
