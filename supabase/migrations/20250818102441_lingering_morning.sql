/*
  # Add payment tracking for referral earnings

  1. New Columns
    - `referral_earnings_paid_at` (timestamp with time zone, nullable)
      - Records when referral earnings were paid out
    - `referred_student_bonus_paid_at` (timestamp with time zone, nullable)  
      - Records when referred student bonus was paid out

  2. Security
    - No additional RLS policies needed as these use existing student policies
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'students' AND column_name = 'referral_earnings_paid_at'
  ) THEN
    ALTER TABLE students ADD COLUMN referral_earnings_paid_at timestamptz;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'students' AND column_name = 'referred_student_bonus_paid_at'
  ) THEN
    ALTER TABLE students ADD COLUMN referred_student_bonus_paid_at timestamptz;
  END IF;
END $$;