/*
  # Create Payment Tables

  1. New Tables
    - `referral_payments`
      - `id` (uuid, primary key)
      - `student_id` (uuid, foreign key to students)
      - `amount` (numeric, payment amount)
      - `paid_at` (timestamp, when payment was made)
      - `user_id` (uuid, foreign key to users)
      - `notes` (text, optional payment notes)
      - `created_at` (timestamp)
    
    - `bonus_payments`
      - `id` (uuid, primary key)
      - `student_id` (uuid, foreign key to students)
      - `amount` (numeric, payment amount)
      - `paid_at` (timestamp, when payment was made)
      - `user_id` (uuid, foreign key to users)
      - `notes` (text, optional payment notes)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own payments

  3. Indexes
    - Add indexes for better query performance
*/

-- Create referral_payments table
CREATE TABLE IF NOT EXISTS referral_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  amount numeric(10,2) NOT NULL DEFAULT 0,
  paid_at timestamptz NOT NULL DEFAULT now(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create bonus_payments table
CREATE TABLE IF NOT EXISTS bonus_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  amount numeric(10,2) NOT NULL DEFAULT 0,
  paid_at timestamptz NOT NULL DEFAULT now(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE referral_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE bonus_payments ENABLE ROW LEVEL SECURITY;

-- Create policies for referral_payments
CREATE POLICY "Users can read their own referral payments"
  ON referral_payments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own referral payments"
  ON referral_payments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own referral payments"
  ON referral_payments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own referral payments"
  ON referral_payments
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for bonus_payments
CREATE POLICY "Users can read their own bonus payments"
  ON bonus_payments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bonus payments"
  ON bonus_payments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bonus payments"
  ON bonus_payments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bonus payments"
  ON bonus_payments
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_referral_payments_student_id ON referral_payments(student_id);
CREATE INDEX IF NOT EXISTS idx_referral_payments_user_id ON referral_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_referral_payments_paid_at ON referral_payments(paid_at);

CREATE INDEX IF NOT EXISTS idx_bonus_payments_student_id ON bonus_payments(student_id);
CREATE INDEX IF NOT EXISTS idx_bonus_payments_user_id ON bonus_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_bonus_payments_paid_at ON bonus_payments(paid_at);