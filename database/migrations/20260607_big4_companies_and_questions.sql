-- ============================================
-- Big 4 Consulting Companies & Questions
-- ============================================

-- 1. Insert PwC, EY, KPMG (Deloitte already exists)
-- ============================================
INSERT INTO public.companies (name, description, logo_url) VALUES
  ('PwC', 'PricewaterhouseCoopers — global professional services firm delivering assurance, tax, and consulting services across 157 countries.', 'https://upload.wikimedia.org/wikipedia/commons/0/05/PricewaterhouseCoopers_Logo.svg'),
  ('EY', 'Ernst & Young — global professional services firm focused on assurance, consulting, strategy, tax, and transactions in 150+ countries.', 'https://upload.wikimedia.org/wikipedia/commons/3/34/EY_logo_2019.svg'),
  ('KPMG', 'KPMG — global network of professional firms providing audit, tax, and advisory services across 143 countries.', 'https://upload.wikimedia.org/wikipedia/commons/9/9d/KPMG_logo.svg');

-- ============================================
-- 2. Deloitte questions
-- ============================================
INSERT INTO public.questions (company_id, content, topic, difficulty)
SELECT c.id, q.content, q.topic, q.difficulty
FROM public.companies c
CROSS JOIN (VALUES
  ('Tell me about a time you took initiative to solve a problem before being asked.', 'Behavioral', 'Medium'),
  ('Describe a situation where you had to resolve a conflict within your team.', 'Behavioral', 'Medium'),
  ('Tell me about a time you failed. What did you learn?', 'Behavioral', 'Medium'),
  ('Describe a time you had to deliver a difficult message to a stakeholder.', 'Behavioral', 'Hard'),
  ('Tell me about a time you worked with a difficult team member and how you handled it.', 'Behavioral', 'Medium'),
  ('How would you approach a profitability problem for a discount retailer that is losing inventory to theft across 5,000 stores?', 'Case Study', 'Hard'),
  ('A regional healthcare provider wants to improve patient communication and experience. Design an improvement plan.', 'Case Study', 'Hard'),
  ('Walk me through how you would assess the cost-effectiveness of a mobile healthcare platform in a rural emerging market.', 'Case Study', 'Hard'),
  ('How do Deloitte''s values — lead the way, serve with integrity, collaborate for impact — align with your career goals?', 'Values Fit', 'Easy'),
  ('Tell me about a time you actively fostered inclusion in a team or project.', 'Values', 'Medium')
) AS q(content, topic, difficulty)
WHERE c.name = 'Deloitte';

-- ============================================
-- 3. PwC questions
-- ============================================
INSERT INTO public.questions (company_id, content, topic, difficulty)
SELECT c.id, q.content, q.topic, q.difficulty
FROM public.companies c
CROSS JOIN (VALUES
  ('Tell me about a significant challenge you faced and how you overcame it.', 'Behavioral', 'Medium'),
  ('Describe a time when there were disagreements in your team. What did you do?', 'Behavioral', 'Medium'),
  ('Why PwC specifically? What about our culture and purpose appeals to you?', 'Values Fit', 'Easy'),
  ('Tell me about a time you delivered tangible results in a difficult business situation.', 'Behavioral', 'Medium'),
  ('How would you help a traditional financial institution develop a digital transformation strategy?', 'Case Study', 'Hard'),
  ('Estimate the market size for electric vehicle charging stations in Kazakhstan.', 'Market Sizing', 'Medium'),
  ('Describe a time you demonstrated integrity when it would have been easier not to.', 'Values', 'Medium'),
  ('A client''s e-commerce revenue is flat despite significant marketing investment. How would you diagnose this?', 'Case Study', 'Hard'),
  ('Tell me about a time you had to quickly adapt to an unexpected change in a project.', 'Behavioral', 'Medium'),
  ('Walk me through a framework for advising a client on entering a new geographic market.', 'Case Study', 'Hard'),
  ('Describe a time you made a lasting positive impact on someone you worked with.', 'Values', 'Easy'),
  ('How do you handle a situation where a client''s request conflicts with ethical best practice?', 'Ethics', 'Hard')
) AS q(content, topic, difficulty)
WHERE c.name = 'PwC';

-- ============================================
-- 4. EY questions
-- ============================================
INSERT INTO public.questions (company_id, content, topic, difficulty)
SELECT c.id, q.content, q.topic, q.difficulty
FROM public.companies c
CROSS JOIN (VALUES
  ('Tell me about a time you handled a difficult client or team member.', 'Competency', 'Medium'),
  ('Give an example of when you had to problem-solve under significant pressure.', 'Competency', 'Hard'),
  ('Describe a situation where you led a team through a major challenge.', 'Competency', 'Medium'),
  ('Tell me about a time you failed at a project. What did you learn?', 'Competency', 'Medium'),
  ('Give an example of a time your curiosity led to an unexpected insight or better solution.', 'Competency', 'Medium'),
  ('Describe a time you had to build a relationship with someone who was initially resistant.', 'Competency', 'Medium'),
  ('How would you evaluate a company for a potential acquisition?', 'Transaction Advisory', 'Hard'),
  ('A manufacturing client wants to improve operational efficiency by 20%. How would you approach this?', 'Case Study', 'Hard'),
  ('What does "building a better working world" mean to you personally and in your career?', 'Values Fit', 'Easy'),
  ('Tell me about a time you had to quickly learn a new skill or domain to complete a critical project.', 'Competency', 'Medium')
) AS q(content, topic, difficulty)
WHERE c.name = 'EY';

-- ============================================
-- 5. KPMG questions
-- ============================================
INSERT INTO public.questions (company_id, content, topic, difficulty)
SELECT c.id, q.content, q.topic, q.difficulty
FROM public.companies c
CROSS JOIN (VALUES
  ('Why KPMG specifically? What draws you to this firm over the other Big 4?', 'Motivation', 'Easy'),
  ('Tell me about a time you demonstrated integrity when facing a difficult or ethically ambiguous situation.', 'Values', 'Medium'),
  ('Describe a time you pushed yourself to excel beyond what was required of you.', 'Values', 'Medium'),
  ('Tell me about a situation where you showed courage by taking a risk or speaking up when it was hard.', 'Values', 'Medium'),
  ('How have you leveraged the strengths of different team members to deliver a successful outcome?', 'Values', 'Medium'),
  ('Tell me about a time you contributed to something that had a positive impact beyond your immediate team.', 'Values', 'Medium'),
  ('A retail company is losing market share to online competitors. What strategic recommendations would you make?', 'Case Study', 'Hard'),
  ('Walk me through how you would analyze a market entry opportunity for a client expanding into a new country.', 'Case Study', 'Hard'),
  ('A private equity firm wants to assess the value of a logistics company. What is your evaluation framework?', 'Deal Advisory', 'Hard'),
  ('Tell me about a time your critical thinking uncovered a solution that others had missed.', 'Behavioral', 'Hard'),
  ('Estimate the number of small and medium businesses in Kazakhstan that use cloud-based accounting software.', 'Market Sizing', 'Medium'),
  ('Describe a time you received critical feedback. How did you respond and what changed as a result?', 'Behavioral', 'Medium')
) AS q(content, topic, difficulty)
WHERE c.name = 'KPMG';