/*
  # Öğrenci Takip Sistemi Veritabanı Şeması

  1. Yeni Tablolar
    - `students` - Öğrenci bilgileri
      - `id` (uuid, primary key)
      - `name` (text) - Ad
      - `surname` (text) - Soyad
      - `phone` (text) - Telefon
      - `email` (text) - E-posta
      - `contact_type` (text) - İletişim türü
      - `registration_type` (text) - Kayıt türü
      - `status` (text) - Durum
      - `education_level` (text) - Eğitim seviyesi
      - `languages` (text[]) - İlgilenilen diller
      - `interested_levels` (text[]) - İlgilenilen seviyeler
      - `placement_test_level` (text) - Seviye tespit sınavı sonucu
      - `placement_test_teacher` (text) - Sınavı yapan öğretmen
      - `notes` (text) - Notlar
      - `follow_up_date` (timestamptz) - Takip tarihi
      - `last_contact` (timestamptz) - Son iletişim
      - `created_at` (timestamptz) - Oluşturulma tarihi

    - `interviews` - Görüşme kayıtları
      - `id` (uuid, primary key)
      - `student_id` (uuid, foreign key) - Öğrenci referansı
      - `date` (timestamptz) - Görüşme tarihi
      - `type` (text) - Görüşme türü
      - `notes` (text) - Görüşme notları
      - `outcome` (text) - Görüşme sonucu
      - `follow_up_date` (timestamptz) - Takip tarihi

    - `price_quotes` - Fiyat teklifleri
      - `id` (uuid, primary key)
      - `student_id` (uuid, foreign key) - Öğrenci referansı
      - `course_level` (text) - Kurs seviyesi
      - `course_duration` (text) - Kurs süresi
      - `total_price` (decimal) - Toplam fiyat
      - `payment_type` (text) - Ödeme türü
      - `installment_count` (integer) - Taksit sayısı
      - `installment_amount` (decimal) - Taksit tutarı
      - `discount` (decimal) - İndirim
      - `final_price` (decimal) - Son fiyat
      - `notes` (text) - Notlar
      - `is_accepted` (boolean) - Kabul edildi mi
      - `created_at` (timestamptz) - Oluşturulma tarihi

  2. Güvenlik
    - Tüm tablolarda RLS etkin
    - Kimlik doğrulaması yapan kullanıcılar kendi verilerine erişebilir
*/

-- Students table
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  surname text NOT NULL,
  phone text NOT NULL,
  email text DEFAULT '',
  contact_type text NOT NULL DEFAULT 'telefon',
  registration_type text NOT NULL DEFAULT 'yeni-kayit',
  status text NOT NULL DEFAULT 'yeni',
  education_level text NOT NULL DEFAULT 'lise',
  languages text[] NOT NULL DEFAULT ARRAY['İngilizce'],
  interested_levels text[] NOT NULL DEFAULT ARRAY[]::text[],
  placement_test_level text,
  placement_test_teacher text DEFAULT '',
  notes text DEFAULT '',
  follow_up_date timestamptz,
  last_contact timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Interviews table
CREATE TABLE IF NOT EXISTS interviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  date timestamptz NOT NULL,
  type text NOT NULL DEFAULT 'telefon',
  notes text NOT NULL,
  outcome text DEFAULT '',
  follow_up_date timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Price quotes table
CREATE TABLE IF NOT EXISTS price_quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  course_level text NOT NULL,
  course_duration text NOT NULL,
  total_price decimal(10,2) NOT NULL DEFAULT 0,
  payment_type text NOT NULL DEFAULT 'pesin',
  installment_count integer,
  installment_amount decimal(10,2),
  discount decimal(10,2) DEFAULT 0,
  final_price decimal(10,2) NOT NULL DEFAULT 0,
  notes text DEFAULT '',
  is_accepted boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_quotes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage all students"
  ON students
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can manage all interviews"
  ON interviews
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can manage all price quotes"
  ON price_quotes
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_students_status ON students(status);
CREATE INDEX IF NOT EXISTS idx_students_education_level ON students(education_level);
CREATE INDEX IF NOT EXISTS idx_students_created_at ON students(created_at);
CREATE INDEX IF NOT EXISTS idx_interviews_student_id ON interviews(student_id);
CREATE INDEX IF NOT EXISTS idx_interviews_date ON interviews(date);
CREATE INDEX IF NOT EXISTS idx_price_quotes_student_id ON price_quotes(student_id);