import express from "express";
import { pool } from "../db/connection";

const router = express.Router();

// Get all lessons
router.get("/lessons", async (req, res) => {
  try {
    console.log("Fetching lessons from database...");
    
    // First check if lessons table exists and what columns it has
    try {
      const tableInfo = await pool.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'lessons' 
        ORDER BY ordinal_position
      `);
      console.log("Lessons table columns:", tableInfo.rows.map(r => `${r.column_name} (${r.data_type})`));
    } catch (err) {
      console.warn("Could not get table info:", err);
    }
    
    const result = await pool.query(
      `SELECT lesson_id as "LessonID", 
              lesson_number as "LessonNumber",
              title_sanskrit as "Title_Sanskrit",
              title_english as "Title_English",
              difficulty_level as "Difficulty_Level",
              description as "Description"
       FROM lessons 
       ORDER BY lesson_number ASC`
    );

    console.log(`Found ${result.rows.length} lessons in database`);
    if (result.rows.length === 0) {
      console.warn("WARNING: No lessons found in database. Make sure the lessons table has data.");
      // Return empty array instead of error
      return res.json([]);
    }
    console.log("Sample lesson data:", result.rows.slice(0, 2));
    res.json(result.rows);
  } catch (error: any) {
    console.error("Get lessons error:", error);
    console.error("Error details:", error.message, error.stack);
    
    // If table doesn't exist, return empty array
    if (error.message && error.message.includes("does not exist")) {
      console.error("Lessons table does not exist!");
      return res.json([]);
    }
    
    res.status(500).json({ 
      error: "Internal server error",
      message: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
});

// Get lesson content by lesson ID (e.g., LS001)
router.get("/lesson-content/:lessonId", async (req, res) => {
  try {
    const { lessonId } = req.params;
    console.log(`Fetching lesson content for: ${lessonId}`);
    
    // Extract lesson number from lessonId (e.g., "LS001" -> 1)
    const lessonNumber = parseInt(lessonId.replace("LS", "")) || parseInt(lessonId);
    console.log(`Looking for lesson number: ${lessonNumber} or lesson_id_string: ${lessonId}`);
    
    // First, find the actual table name (PostgreSQL is case-sensitive)
    let tableName = 'lessonplayer';
    try {
      const tableCheck = await pool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND LOWER(table_name) = 'lessonplayer'
        LIMIT 1
      `);
      
      if (tableCheck.rows.length > 0) {
        tableName = tableCheck.rows[0].table_name;
        console.log(`Found table: ${tableName}`);
      } else {
        console.warn("LessonPlayer table not found. Trying default name...");
      }
    } catch (err) {
      console.warn("Could not check table name, using default");
    }

    // Query the table (use quoted identifier if needed)
    const quotedTableName = tableName !== 'lessonplayer' ? `"${tableName}"` : tableName;
    
    // First check what columns exist in the table
    let hasIdColumn = true;
    try {
      const columnCheck = await pool.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = LOWER($1)
        AND table_schema = 'public'
        AND column_name = 'id'
        LIMIT 1
      `, [tableName]);
      hasIdColumn = columnCheck.rows.length > 0;
      console.log(`Table ${tableName} has id column:`, hasIdColumn);
    } catch (err) {
      console.warn("Could not check for id column, assuming it exists:", err);
    }
    
    // Build the SELECT statement based on whether id column exists
    let query: string;
    if (hasIdColumn) {
      query = `SELECT 
        id as "_id",
        lesson_id_string as "LessonID",
        order_index as "order",
        content_type as "contentType",
        sanskrit,
        word,
        transliteration,
        meaning,
        example_meaning as "exampleMeaning"
       FROM ${quotedTableName}
       WHERE lesson_id = $1 OR lesson_id_string = $2
       ORDER BY order_index ASC`;
    } else {
      query = `SELECT 
        lesson_id_string as "LessonID",
        order_index as "order",
        content_type as "contentType",
        sanskrit,
        word,
        transliteration,
        meaning,
        example_meaning as "exampleMeaning"
       FROM ${quotedTableName}
       WHERE lesson_id = $1 OR lesson_id_string = $2
       ORDER BY order_index ASC`;
    }
    
    const result = await pool.query(query, [lessonNumber, lessonId]);

    console.log(`Found ${result.rows.length} slides for lesson ${lessonId}`);
    
    if (result.rows.length === 0) {
      console.warn(`WARNING: No content found for lesson ${lessonId}. Check lesson_id and lesson_id_string in lessonplayer table.`);
    }

    // Map the data to match the frontend interface
    const lessons = result.rows.map((row, index) => ({
      _id: hasIdColumn && row._id ? row._id.toString() : `slide_${index + 1}`,
      LessonID: row.LessonID || `LS${String(lessonNumber).padStart(3, '0')}`,
      order: row.order,
      contentType: row.contentType || "Slide",
      sanskrit: row.sanskrit,
      word: row.word,
      transliteration: row.transliteration,
      meaning: row.meaning,
      exampleMeaning: row.exampleMeaning
    }));

    res.json(lessons);
  } catch (error: any) {
    console.error("Get lesson content error:", error);
    console.error("Error details:", error.message, error.stack);
    res.status(500).json({ 
      error: "Internal server error",
      message: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
});

export default router;
