-- ============================================
-- Kaspi.kz Company & Questions
-- Sources: Glassdoor, DataLemur
-- ============================================

INSERT INTO public.companies (name, description, logo_url) VALUES
  ('Kaspi.kz', 'Kazakhstan''s leading super app — marketplace, fintech, and payments platform serving over 14 million users.', 'https://www.google.com/s2/favicons?domain=kaspi.kz&sz=128');

-- ============================================
-- Kaspi.kz questions (sourced from real interviews)
-- ============================================
INSERT INTO public.questions (company_id, content, topic, difficulty)
SELECT c.id, q.content, q.topic, q.difficulty
FROM public.companies c
CROSS JOIN (VALUES
  ('Explain the SOLID principles and give a practical example for each.', 'OOP', 'Medium'),
  ('What are the Gang of Four design patterns? Name and explain at least five of them.', 'OOP', 'Hard'),
  ('Explain polymorphism in OOP and give a real-world application example.', 'OOP', 'Medium'),
  ('How does Spring handle cyclic dependencies between beans? How would you resolve one?', 'Spring', 'Hard'),
  ('What are the most important Spring Boot annotations and what does each one do?', 'Spring', 'Medium'),
  ('How do you handle exceptions properly in a Spring service layer?', 'Spring', 'Medium'),
  ('What is the difference between microservices and monolithic architecture? When would you choose each?', 'System Design', 'Medium'),
  ('How do microservices communicate with each other? Describe both synchronous and asynchronous approaches.', 'System Design', 'Medium'),
  ('Explain the JavaScript event loop. How does it handle asynchronous operations?', 'JavaScript', 'Medium'),
  ('Tell me about your most significant technical achievement in a previous role.', 'Behavioral', 'Easy'),
  ('Write a SQL query to calculate the average purchase amount per customer for each month.', 'SQL', 'Medium'),
  ('Write a SQL query to calculate the click-through rate (CTR) from product view events to add-to-cart events.', 'SQL', 'Medium'),
  ('Write a SQL query to find the average mobile wallet transaction amount grouped by month.', 'SQL', 'Medium'),
  ('Given an array of integers, find two numbers that add up to a given target sum. Explain your approach and its time complexity.', 'Algorithms', 'Easy')
) AS q(content, topic, difficulty)
WHERE c.name = 'Kaspi.kz';