import express from "express";
import { pool } from "../db/connection";
import { authenticateToken, AuthRequest } from "../middleware/auth";
import { z } from "zod";

const router = express.Router();

const updateProgressSchema = z.object({
  xp: z.number().int().min(0),
  completedLessons: z.array(z.number().int()),
  unlockedLessons: z.array(z.number().int()),
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
      // Create progress entry if it doesn't exist
      await pool.query(
        `INSERT INTO user_progress (user_id, xp, completed_lessons, unlocked_lessons) 
         VALUES ($1, $2, $3, $4)`,
        [req.userId, 0, [], [1]]
      );
      
      return res.json({
        xp: 0,
        completedLessons: [],
        unlockedLessons: [1],
      });
    }

    const progress = result.rows[0];
    res.json({
      xp: progress.xp,
      completedLessons: progress.completed_lessons || [],
      unlockedLessons: progress.unlocked_lessons || [1],
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
        [req.userId, xp, completedLessons, unlockedLessons]
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
        [xp, completedLessons, unlockedLessons, req.userId]
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

export default router;
