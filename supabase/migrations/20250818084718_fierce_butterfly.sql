/*
  # Referans Sistemi ve Kazanç Takibi

  1. Yeni Sütunlar
    - `referral_code` (text, unique) - Öğrencinin benzersiz referans kodu
    - `referred_by_student_id` (uuid, foreign key) - Bu öğrenciyi referans eden öğrencinin ID'si
    - `referral_earnings` (numeric) - Referanslardan elde edilen toplam kazanç

  2. Güvenlik
    - Mevcut RLS politikaları bu sütunları da kapsayacak
    - Kullanıcılar kendi öğrencilerinin referans bilgilerini güncelleyebilir

  3. Özellikler
    - Kayıtlı duruma geçen her öğrenci otomatik referans kodu alır
    - Referans ile gelen öğrenciler takip edilir
    - Kazançlar otomatik hesaplanır
*/

-- Referans sistemi sütunlarını ekle
DO $$
BEGIN
  -- referral_code sütunu ekle
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'students' AND column_name = 'referral_code'
  ) THEN
    ALTER TABLE students ADD COLUMN referral_code TEXT UNIQUE;
  END IF;

  -- referred_by_student_id sütunu ekle
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'students' AND column_name = 'referred_by_student_id'
  ) THEN
    ALTER TABLE students ADD COLUMN referred_by_student_id UUID REFERENCES students(id);
  END IF;

  -- referral_earnings sütunu ekle
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'students' AND column_name = 'referral_earnings'
  ) THEN
    ALTER TABLE students ADD COLUMN referral_earnings NUMERIC(10,2) NOT NULL DEFAULT 0;
  END IF;
END $$;

-- Referans kodu için indeks oluştur
CREATE INDEX IF NOT EXISTS idx_students_referral_code ON students(referral_code);
CREATE INDEX IF NOT EXISTS idx_students_referred_by ON students(referred_by_student_id);

-- Referans kazançları için indeks oluştur
CREATE INDEX IF NOT EXISTS idx_students_referral_earnings ON students(referral_earnings) WHERE referral_earnings > 0;