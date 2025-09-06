/*
  # Add tags column to classes table

  1. Changes
    - Add `tags` column to `classes` table as text array
    - Set default value as empty array
    - Column is nullable for backward compatibility

  2. Security
    - No changes to RLS policies needed
    - Existing policies will cover the new column
*/

-- Add tags column to classes table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'classes' AND column_name = 'tags'
  ) THEN
    ALTER TABLE classes ADD COLUMN tags text[] DEFAULT ARRAY[]::text[];
  END IF;
END $$;