/*
  # Add referral earnings increment function

  1. New Functions
    - `increment_referral_earnings` - Safely increment referral earnings for a student
  
  2. Security
    - Function uses security definer to allow updates
    - Only increments positive amounts
*/

-- Function to safely increment referral earnings
CREATE OR REPLACE FUNCTION increment_referral_earnings(student_id UUID, amount NUMERIC)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only allow positive amounts
  IF amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;
  
  -- Update the referral earnings
  UPDATE students 
  SET referral_earnings = COALESCE(referral_earnings, 0) + amount
  WHERE id = student_id;
  
  -- Check if the update affected any rows
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Student not found with id: %', student_id;
  END IF;
END;
$$;