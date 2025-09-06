/*
  # RLS Politikalarını Güncelle - Paylaşımlı Erişim

  1. Güvenlik Değişiklikleri
    - Tüm yetkili kullanıcılar tüm öğrenci verilerini okuyabilir
    - Kullanıcılar sadece kendi oluşturdukları kayıtları düzenleyebilir/silebilir
    - Yeni kayıtlar kullanıcının kendi ID'si ile oluşturulur

  2. Etkilenen Tablolar
    - `students` - Öğrenci bilgileri
    - `interviews` - Görüşme kayıtları  
    - `price_quotes` - Fiyat teklifleri

  3. Yeni Politika Yapısı
    - SELECT: Tüm yetkili kullanıcılar için açık
    - INSERT: Kullanıcı kendi ID'si ile kayıt oluşturabilir
    - UPDATE/DELETE: Sadece kendi kayıtlarını düzenleyebilir
*/

-- Students tablosu için mevcut politikaları kaldır
DROP POLICY IF EXISTS "Users can manage their own students" ON students;

-- Students tablosu için yeni politikalar
CREATE POLICY "All authenticated users can read students"
  ON students
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own students"
  ON students
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own students"
  ON students
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own students"
  ON students
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Interviews tablosu için mevcut politikaları kaldır
DROP POLICY IF EXISTS "Users can manage their own interviews" ON interviews;

-- Interviews tablosu için yeni politikalar
CREATE POLICY "All authenticated users can read interviews"
  ON interviews
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own interviews"
  ON interviews
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own interviews"
  ON interviews
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own interviews"
  ON interviews
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Price quotes tablosu için mevcut politikaları kaldır
DROP POLICY IF EXISTS "Users can manage their own price quotes" ON price_quotes;

-- Price quotes tablosu için yeni politikalar
CREATE POLICY "All authenticated users can read price quotes"
  ON price_quotes
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own price quotes"
  ON price_quotes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own price quotes"
  ON price_quotes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own price quotes"
  ON price_quotes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);