-- ============================================
-- 1. Storage bucket for company logos
-- ============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('logos', 'logos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "auth_upload_logos" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'logos');

CREATE POLICY "public_view_logos" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'logos');

CREATE POLICY "admins_delete_logos" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'logos' AND
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- ============================================
-- 2. Non-IT company
-- ============================================
INSERT INTO public.companies (name, description, logo_url) VALUES
  ('Deloitte', 'Global professional services firm providing audit, consulting, financial advisory, risk advisory, and tax services.', 'https://upload.wikimedia.org/wikipedia/commons/5/56/Deloitte.svg');

-- ============================================
-- 3. Non-technical questions for Zimran
-- ============================================
INSERT INTO public.questions (company_id, content, topic, difficulty)
SELECT c.id, q.content, q.topic, q.difficulty
FROM public.companies c
CROSS JOIN (VALUES
  ('Tell me about a time you led a team through a difficult project.', 'Behavioral', 'Medium'),
  ('How do you handle disagreements with colleagues?', 'Behavioral', 'Easy'),
  ('Describe a situation where you had to meet a tight deadline.', 'Time Management', 'Medium'),
  ('What motivates you in your career?', 'Motivation', 'Easy'),
  ('How do you prioritize tasks when you have multiple deadlines?', 'Organization', 'Medium'),
  ('Tell me about a failure and what you learned from it.', 'Behavioral', 'Hard'),
  ('How would you explain a complex idea to a non-technical stakeholder?', 'Communication', 'Medium'),
  ('Describe your ideal work environment.', 'Culture Fit', 'Easy'),
  ('Where do you see yourself in 5 years?', 'Career Goals', 'Easy'),
  ('How do you stay up to date with industry trends?', 'Growth Mindset', 'Medium')
) AS q(content, topic, difficulty)
WHERE c.name = 'Zimran';
