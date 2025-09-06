/*
  # Mesajlar tablosu oluştur

  1. Yeni Tablolar
    - `messages`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `content` (text, not null)
      - `created_at` (timestamp)

  2. Güvenlik
    - Enable RLS on `messages` table
    - Add policy for authenticated users to read all messages
    - Add policy for authenticated users to insert their own messages
*/

CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Kimliği doğrulanmış kullanıcılar tüm mesajları okuyabilir
CREATE POLICY "Authenticated users can read all messages"
  ON messages
  FOR SELECT
  TO authenticated
  USING (true);

-- Kimliği doğrulanmış kullanıcılar kendi mesajlarını ekleyebilir
CREATE POLICY "Authenticated users can insert their own messages"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Mesajlar için indeks oluştur
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);