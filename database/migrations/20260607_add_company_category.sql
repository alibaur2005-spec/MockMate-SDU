-- ============================================
-- Add category column to companies
-- ============================================
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS category text DEFAULT 'Other';

UPDATE public.companies SET category = 'Big 4'        WHERE name IN ('Deloitte', 'PwC', 'EY', 'KPMG');
UPDATE public.companies SET category = 'KZ Companies' WHERE name IN ('Kaspi.kz', 'Zimran');
UPDATE public.companies SET category = 'Other'        WHERE category IS NULL OR category = 'Other';