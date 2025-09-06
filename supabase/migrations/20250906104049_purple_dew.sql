/*
  # Add schedule fields to classes table

  1. New Columns
    - `start_date` (timestamptz, nullable) - Class start date
    - `end_date` (timestamptz, nullable) - Class end date  
    - `days` (text[], default empty array) - Days of the week for classes
    - `time_range` (text, default empty string) - Time range for classes

  2. Changes
    - Add four new columns to existing classes table
    - Set appropriate defaults to ensure existing data remains valid
    - Use safe column addition with IF NOT EXISTS pattern
*/

-- Add start_date column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'classes' AND column_name = 'start_date'
  ) THEN
    ALTER TABLE classes ADD COLUMN start_date timestamptz;
  END IF;
END $$;

-- Add end_date column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'classes' AND column_name = 'end_date'
  ) THEN
    ALTER TABLE classes ADD COLUMN end_date timestamptz;
  END IF;
END $$;

-- Add days column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'classes' AND column_name = 'days'
  ) THEN
    ALTER TABLE classes ADD COLUMN days text[] DEFAULT ARRAY[]::text[];
  END IF;
END $$;

-- Add time_range column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'classes' AND column_name = 'time_range'
  ) THEN
    ALTER TABLE classes ADD COLUMN time_range text DEFAULT '';
  END IF;
END $$;