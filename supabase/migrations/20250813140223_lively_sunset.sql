/*
  # Fiyat Teklifi Tablosuna Peşin ve Taksitli Fiyat Alanları Ekleme

  1. Yeni Alanlar
    - `cash_price` (numeric) - Peşin ödeme fiyatı
    - `installment_price` (numeric) - Taksitli ödeme fiyatı

  2. Güncelleme
    - Mevcut kayıtlar için varsayılan değerler atanacak
*/

-- Peşin fiyat alanı ekle
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'price_quotes' AND column_name = 'cash_price'
  ) THEN
    ALTER TABLE price_quotes ADD COLUMN cash_price numeric(10,2);
  END IF;
END $$;

-- Taksitli fiyat alanı ekle
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'price_quotes' AND column_name = 'installment_price'
  ) THEN
    ALTER TABLE price_quotes ADD COLUMN installment_price numeric(10,2);
  END IF;
END $$;