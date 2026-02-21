-- Database migrations for Sanskrit-Setu
-- Run this file if you need to manually set up the database

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  username VARCHAR(255),
  role VARCHAR(50) DEFAULT 'student',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add username column if it does not exist (for existing databases)
ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(255);
UPDATE users SET username = COALESCE(name, split_part(email, '@', 1)) WHERE username IS NULL OR username = '';

-- Create user_progress table
CREATE TABLE IF NOT EXISTS user_progress (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  xp INTEGER DEFAULT 0,
  completed_lessons INTEGER[] DEFAULT ARRAY[]::INTEGER[],
  unlocked_lessons INTEGER[] DEFAULT ARRAY[1]::INTEGER[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Create index on user_id for faster progress lookups
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);

-- Create refresh_tokens table
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  revoked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create password_reset_tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for refresh_tokens
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);

-- Create indexes for password_reset_tokens
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);

-- Create lessonPlayer table
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
);

-- Create indexes for lessonPlayer table
CREATE INDEX IF NOT EXISTS idx_lessonplayer_lesson_id ON lessonPlayer(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lessonplayer_lesson_id_string ON lessonplayer(lesson_id_string);

-- Create lessons table
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
);

-- Create index on lessons.lesson_id
CREATE INDEX IF NOT EXISTS idx_lessons_lesson_id ON lessons(lesson_id);

-- Update user_progress to use TEXT[] for lesson IDs (to support LS001 format)
-- Note: This may fail if columns are already TEXT[], which is fine
DO $$
BEGIN
  ALTER TABLE user_progress 
    ALTER COLUMN completed_lessons TYPE TEXT[] USING ARRAY[]::TEXT[],
    ALTER COLUMN unlocked_lessons TYPE TEXT[] USING ARRAY['LS001']::TEXT[];
EXCEPTION
  WHEN OTHERS THEN
    -- Column might already be TEXT[] or not exist, ignore error
    NULL;
END $$;
