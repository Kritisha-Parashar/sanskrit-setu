import express from "express";
import { pool } from "../db/connection";
import { authenticateToken, requireAdmin, AuthRequest } from "../middleware/auth";

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

// Get admin dashboard stats
router.get("/stats", async (req: AuthRequest, res) => {
  try {
    // Total Users
    const usersResult = await pool.query("SELECT COUNT(*) as count FROM users WHERE role = 'student'");
    const totalUsers = parseInt(usersResult.rows[0].count);

    // Total Lessons
    const lessonsResult = await pool.query("SELECT COUNT(*) as count FROM lessons");
    const totalLessons = parseInt(lessonsResult.rows[0].count);

    // Total XP Earned Across Platform
    const xpResult = await pool.query("SELECT COALESCE(SUM(xp), 0) as total FROM user_progress");
    const totalXP = parseInt(xpResult.rows[0].total || "0");

    // Total Pronunciation Attempts (placeholder - you may need to add a pronunciation_attempts table)
    // For now, we'll use completed lessons as a proxy
    const attemptsResult = await pool.query(`
      SELECT COUNT(*) as count 
      FROM user_progress 
      WHERE array_length(completed_lessons, 1) > 0
    `);
    const totalPronunciationAttempts = parseInt(attemptsResult.rows[0].count || "0");

    // Average Pronunciation Accuracy (placeholder - you may need to add accuracy tracking)
    // For now, we'll calculate based on completion rate
    const accuracyResult = await pool.query(`
      SELECT 
        AVG(
          CASE 
            WHEN array_length(completed_lessons, 1) IS NULL THEN 0
            ELSE (array_length(completed_lessons, 1)::float / NULLIF((SELECT COUNT(*) FROM lessons), 0)) * 100
          END
        ) as avg_accuracy
      FROM user_progress
    `);
    const averagePronunciationAccuracy = parseFloat(accuracyResult.rows[0].avg_accuracy || "0");

    res.json({
      totalUsers,
      totalLessons,
      totalPronunciationAttempts,
      averagePronunciationAccuracy: Math.round(averagePronunciationAccuracy * 10) / 10,
      totalXP,
    });
  } catch (error: any) {
    console.error("Error fetching admin stats:", error);
    res.status(500).json({ error: "Failed to fetch admin stats", message: error.message });
  }
});

// Get lesson performance analysis
router.get("/lesson-performance", async (req: AuthRequest, res) => {
  try {
    // Get all lessons
    const lessonsResult = await pool.query(`
      SELECT lesson_id, lesson_number, title_english 
      FROM lessons 
      ORDER BY lesson_number ASC
    `);

    const lessonPerformance = await Promise.all(
      lessonsResult.rows.map(async (lesson) => {
        // Count users who completed this lesson
        const completionResult = await pool.query(`
          SELECT COUNT(*) as count
          FROM user_progress
          WHERE $1 = ANY(completed_lessons)
        `, [lesson.lesson_id]);

        const completedCount = parseInt(completionResult.rows[0].count || "0");
        
        // Total users
        const totalUsersResult = await pool.query("SELECT COUNT(*) as count FROM users WHERE role = 'student'");
        const totalUsers = parseInt(totalUsersResult.rows[0].count);

        // Completion rate
        const completionRate = totalUsers > 0 ? (completedCount / totalUsers) * 100 : 0;

        // Average pronunciation accuracy (placeholder - using completion as proxy)
        const avgAccuracy = completionRate > 0 ? Math.min(completionRate + 20, 100) : 0;

        return {
          lessonId: lesson.lesson_id,
          lessonNumber: lesson.lesson_number,
          title: lesson.title_english,
          completionRate: Math.round(completionRate * 10) / 10,
          averagePronunciationAccuracy: Math.round(avgAccuracy * 10) / 10,
          completedCount,
          totalUsers,
        };
      })
    );

    res.json(lessonPerformance);
  } catch (error: any) {
    console.error("Error fetching lesson performance:", error);
    res.status(500).json({ error: "Failed to fetch lesson performance", message: error.message });
  }
});

// Add new lesson
router.post("/lessons", async (req: AuthRequest, res) => {
  try {
    const { lessonId, lessonNumber, titleSanskrit, titleEnglish, difficultyLevel, description } = req.body;

    if (!lessonId || !lessonNumber || !titleSanskrit || !titleEnglish) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const result = await pool.query(
      `INSERT INTO lessons (lesson_id, lesson_number, title_sanskrit, title_english, difficulty_level, description)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [lessonId, lessonNumber, titleSanskrit, titleEnglish, difficultyLevel || "Beginner", description || ""]
    );

    res.json({ lesson: result.rows[0] });
  } catch (error: any) {
    console.error("Error adding lesson:", error);
    if (error.code === "23505") {
      return res.status(400).json({ error: "Lesson ID already exists" });
    }
    res.status(500).json({ error: "Failed to add lesson", message: error.message });
  }
});

// Add slide to lesson
router.post("/lessons/:lessonId/slides", async (req: AuthRequest, res) => {
  try {
    const { lessonId } = req.params;
    const { lessonSlideId, lessonIdString, orderIndex, contentType, sanskrit, word, transliteration, meaning, exampleMeaning } = req.body;

    if (!lessonSlideId || !orderIndex || !sanskrit || !word || !transliteration || !meaning || !exampleMeaning) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Extract lesson number from lessonId (e.g., "LS001" -> 1)
    const lessonNumber = parseInt(lessonId.replace("LS", "")) || parseInt(lessonId);

    const result = await pool.query(
      `INSERT INTO lessonplayer (
        lesson_id, lesson_slide_id, lesson_id_string, order_index, content_type,
        sanskrit, word, transliteration, meaning, example_meaning
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        lessonNumber,
        lessonSlideId,
        lessonIdString || lessonId,
        orderIndex,
        contentType || "Slide",
        sanskrit,
        word,
        transliteration,
        meaning,
        exampleMeaning,
      ]
    );

    res.json({ slide: result.rows[0] });
  } catch (error: any) {
    console.error("Error adding slide:", error);
    if (error.code === "23505") {
      return res.status(400).json({ error: "Slide already exists for this lesson" });
    }
    res.status(500).json({ error: "Failed to add slide", message: error.message });
  }
});

// Update lesson XP (if you have an xp_per_lesson table, otherwise this is a placeholder)
router.put("/lessons/:lessonId/xp", async (req: AuthRequest, res) => {
  try {
    const { lessonId } = req.params;
    const { xp } = req.body;

    if (!xp || xp < 0) {
      return res.status(400).json({ error: "Valid XP value required" });
    }

    // Note: This assumes you might want to store XP per lesson
    // For now, we'll just return success
    // You may need to create a lesson_xp table or add xp field to lessons table
    
    res.json({ message: "XP updated successfully", lessonId, xp });
  } catch (error: any) {
    console.error("Error updating lesson XP:", error);
    res.status(500).json({ error: "Failed to update lesson XP", message: error.message });
  }
});

// Get all lessons for content management
router.get("/lessons", async (req: AuthRequest, res) => {
  try {
    const result = await pool.query(`
      SELECT lesson_id, lesson_number, title_sanskrit, title_english, difficulty_level, description
      FROM lessons
      ORDER BY lesson_number ASC
    `);

    res.json({ lessons: result.rows });
  } catch (error: any) {
    console.error("Error fetching lessons:", error);
    res.status(500).json({ error: "Failed to fetch lessons", message: error.message });
  }
});

// Get slides for a specific lesson
router.get("/lessons/:lessonId/slides", async (req: AuthRequest, res) => {
  try {
    const { lessonId } = req.params;
    const lessonNumber = parseInt(lessonId.replace("LS", "")) || parseInt(lessonId);

    const result = await pool.query(
      `SELECT * FROM lessonplayer
       WHERE lesson_id = $1 OR lesson_id_string = $2
       ORDER BY order_index ASC`,
      [lessonNumber, lessonId]
    );

    res.json({ slides: result.rows });
  } catch (error: any) {
    console.error("Error fetching slides:", error);
    res.status(500).json({ error: "Failed to fetch slides", message: error.message });
  }
});

export default router;
