/*
  # Kullanıcı Takibi için Veritabanı Güncellemeleri

  1. Yeni Sütunlar
    - `students` tablosuna `user_id` sütunu eklendi
    - `interviews` tablosuna `user_id` sütunu eklendi  
    - `price_quotes` tablosuna `user_id` sütunu eklendi

  2. Güvenlik
    - RLS politikaları güncellendi
    - Kullanıcılar sadece kendi kayıtlarını görebilir
    - Kimlik doğrulaması zorunlu hale getirildi

  3. Varsayılan Değerler
    - Yeni kayıtlar otomatik olarak mevcut kullanıcıya atanır
*/

-- Students tablosuna user_id sütunu ekle
ALTER TABLE public.students 
ADD COLUMN user_id uuid REFERENCES auth.users(id) DEFAULT auth.uid();

-- Interviews tablosuna user_id sütunu ekle
ALTER TABLE public.interviews 
ADD COLUMN user_id uuid REFERENCES auth.users(id) DEFAULT auth.uid();

-- Price quotes tablosuna user_id sütunu ekle
ALTER TABLE public.price_quotes 
ADD COLUMN user_id uuid REFERENCES auth.users(id) DEFAULT auth.uid();

-- RLS politikalarını güncelle - Students
DROP POLICY IF EXISTS "Allow anonymous access to students" ON public.students;

CREATE POLICY "Users can manage their own students"
  ON public.students
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS politikalarını güncelle - Interviews  
DROP POLICY IF EXISTS "Allow anonymous access to interviews" ON public.interviews;

CREATE POLICY "Users can manage their own interviews"
  ON public.interviews
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS politikalarını güncelle - Price Quotes
DROP POLICY IF EXISTS "Allow anonymous access to price quotes" ON public.price_quotes;

CREATE POLICY "Users can manage their own price quotes"
  ON public.price_quotes
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Mevcut kayıtları güncelle (eğer varsa)
UPDATE public.students SET user_id = auth.uid() WHERE user_id IS NULL;
UPDATE public.interviews SET user_id = auth.uid() WHERE user_id IS NULL;
UPDATE public.price_quotes SET user_id = auth.uid() WHERE user_id IS NULL;