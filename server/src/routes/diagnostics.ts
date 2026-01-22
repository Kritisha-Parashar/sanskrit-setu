import express from "express";
import { pool } from "../db/connection";

const router = express.Router();

// Diagnostic endpoint to check database tables
router.get("/diagnostics", async (req, res) => {
  try {
    const diagnostics: any = {
      timestamp: new Date().toISOString(),
      database: {},
      tables: {},
      errors: []
    };

    // Check database connection
    try {
      const dbCheck = await pool.query("SELECT current_database(), current_user");
      diagnostics.database = {
        connected: true,
        name: dbCheck.rows[0].current_database,
        user: dbCheck.rows[0].current_user
      };
    } catch (error: any) {
      diagnostics.database = { connected: false, error: error.message };
      diagnostics.errors.push(`Database connection: ${error.message}`);
    }

    // Check if lessons table exists and has data
    try {
      const lessonsCheck = await pool.query(`
        SELECT COUNT(*) as count 
        FROM information_schema.tables 
        WHERE table_name = 'lessons'
      `);
      
      if (parseInt(lessonsCheck.rows[0].count) > 0) {
        const lessonsData = await pool.query("SELECT COUNT(*) as count FROM lessons");
        const lessonsRows = await pool.query("SELECT lesson_id, lesson_number, title_english FROM lessons LIMIT 5");
        diagnostics.tables.lessons = {
          exists: true,
          rowCount: parseInt(lessonsData.rows[0].count),
          sample: lessonsRows.rows
        };
      } else {
        diagnostics.tables.lessons = { exists: false };
        diagnostics.errors.push("Lessons table does not exist");
      }
    } catch (error: any) {
      diagnostics.tables.lessons = { exists: false, error: error.message };
      diagnostics.errors.push(`Lessons table check: ${error.message}`);
    }

    // Check if lessonplayer table exists (try both cases)
    try {
      const tableCheck = await pool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND (table_name = 'lessonplayer' OR table_name = 'lessonPlayer')
      `);
      
      if (tableCheck.rows.length > 0) {
        const tableName = tableCheck.rows[0].table_name;
        const playerData = await pool.query(`SELECT COUNT(*) as count FROM "${tableName}"`);
        const playerRows = await pool.query(`SELECT lesson_id, lesson_id_string, order_index FROM "${tableName}" LIMIT 5`);
        diagnostics.tables.lessonPlayer = {
          exists: true,
          tableName: tableName,
          rowCount: parseInt(playerData.rows[0].count),
          sample: playerRows.rows
        };
      } else {
        diagnostics.tables.lessonPlayer = { exists: false };
        diagnostics.errors.push("LessonPlayer table does not exist (checked both cases)");
      }
    } catch (error: any) {
      diagnostics.tables.lessonPlayer = { exists: false, error: error.message };
      diagnostics.errors.push(`LessonPlayer table check: ${error.message}`);
    }

    res.json(diagnostics);
  } catch (error: any) {
    res.status(500).json({ 
      error: "Diagnostic error",
      message: error.message 
    });
  }
});

export default router;
