import { pool } from "./connection";

export async function initializeDatabase() {
  try {
    // Create users table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        username VARCHAR(255),
        role VARCHAR(50) DEFAULT 'student',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(255)
    `).catch(() => {});

    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS email_notification_preference VARCHAR(32) DEFAULT 'none'
    `).catch(() => {});

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email_notification_preference
      ON users(email_notification_preference)
    `).catch(() => {});

    await pool.query(`
      DO $$ BEGIN
        ALTER TABLE users ADD CONSTRAINT users_email_notification_preference_check
          CHECK (email_notification_preference IN ('none', 'reminder', 'weekly', 'updates'));
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$
    `).catch(() => {});

    // Create refresh_tokens table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        token TEXT NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        revoked BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create password_reset_tokens table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        token TEXT NOT NULL UNIQUE,
        expires_at TIMESTAMP NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create user_progress table if it doesn't exist
    // Use TEXT[] for lesson IDs to support LS001 format
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_progress (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        xp INTEGER DEFAULT 0,
        completed_lessons TEXT[] DEFAULT ARRAY[]::TEXT[],
        unlocked_lessons TEXT[] DEFAULT ARRAY['LS001']::TEXT[],
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id)
      )
    `);

    // Create lessons table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS lessons (
        id SERIAL PRIMARY KEY,
        lesson_id VARCHAR(10) UNIQUE NOT NULL,
        lesson_number INTEGER NOT NULL,
        title_sanskrit TEXT NOT NULL,
        title_english TEXT NOT NULL,
        difficulty_level VARCHAR(50) DEFAULT 'Beginner',
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create lessonPlayer table if it doesn't exist (using lowercase for PostgreSQL)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS lessonplayer (
        id SERIAL PRIMARY KEY,
        lesson_id INTEGER NOT NULL,
        lesson_slide_id INTEGER NOT NULL,
        lesson_id_string VARCHAR(10),
        order_index INTEGER NOT NULL,
        content_type VARCHAR(20) DEFAULT 'Slide',
        sanskrit TEXT NOT NULL,
        word TEXT NOT NULL,
        transliteration VARCHAR(255) NOT NULL,
        meaning TEXT NOT NULL,
        example_meaning TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(lesson_id, lesson_slide_id)
      )
    `);

    // Create indexes for lessonplayer table
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_lessonplayer_lesson_id ON lessonplayer(lesson_id)
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_lessonplayer_lesson_id_string ON lessonplayer(lesson_id_string)
    `);

    // Create index on lessons.lesson_number for faster lookups (fixed typo)
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_lessons_lesson_number ON lessons(lesson_number)
    `);

    // Create index on lessons.lesson_id for faster lookups
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_lessons_lesson_id ON lessons(lesson_id)
    `);

    // Try to update user_progress to use TEXT[] for lesson IDs (to support LS001 format)
    // This will fail silently if columns are already TEXT[] or don't exist
    try {
      await pool.query(`
        DO $$
        BEGIN
          -- Check if columns are INTEGER[] and convert to TEXT[]
          IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'user_progress' 
            AND column_name = 'completed_lessons' 
            AND udt_name = '_int4'
          ) THEN
            ALTER TABLE user_progress 
              ALTER COLUMN completed_lessons TYPE TEXT[] USING ARRAY[]::TEXT[];
          END IF;
          
          IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'user_progress' 
            AND column_name = 'unlocked_lessons' 
            AND udt_name = '_int4'
          ) THEN
            ALTER TABLE user_progress 
              ALTER COLUMN unlocked_lessons TYPE TEXT[] USING ARRAY['LS001']::TEXT[];
          END IF;
        END $$;
      `);
    } catch (error) {
      // Ignore errors - columns might already be TEXT[] or conversion might have failed
      console.log("Note: user_progress columns may already be TEXT[] or conversion skipped");
    }

    console.log("Database tables initialized successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
}
