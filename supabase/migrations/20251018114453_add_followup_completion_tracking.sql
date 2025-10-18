/*
  # Add Follow-up Completion Tracking

  1. Changes
    - Add `follow_up_completed` column to track if a follow-up has been completed
    - Add `follow_up_completed_at` column to track when the follow-up was completed
    - Add `follow_up_notes` column for notes about the completed follow-up

  2. Security
    - No RLS changes needed as these columns are added to existing table with RLS already enabled
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'students' AND column_name = 'follow_up_completed'
  ) THEN
    ALTER TABLE students ADD COLUMN follow_up_completed boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'students' AND column_name = 'follow_up_completed_at'
  ) THEN
    ALTER TABLE students ADD COLUMN follow_up_completed_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'students' AND column_name = 'follow_up_notes'
  ) THEN
    ALTER TABLE students ADD COLUMN follow_up_notes text;
  END IF;
END $$;