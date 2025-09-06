/*
  # Add referred student bonus column

  1. New Column
    - `referred_student_bonus` (numeric(10,2), default 0)
      - Tracks the bonus amount earned by students who were referred by others
      - Only applies when the referred student becomes 'kayitli' (enrolled)

  2. Changes
    - Add new column to students table with default value 0
    - This allows tracking bonuses for students who join via referral codes
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'students' AND column_name = 'referred_student_bonus'
  ) THEN
    ALTER TABLE students ADD COLUMN referred_student_bonus numeric(10,2) DEFAULT 0;
  END IF;
END $$;

-- Add index for performance when querying students with bonuses
CREATE INDEX IF NOT EXISTS idx_students_referred_bonus 
ON students (referred_student_bonus) 
WHERE referred_student_bonus > 0;