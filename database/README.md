# Database Setup

## Instructions

1. **Open your Supabase Dashboard** at https://supabase.com/dashboard
2. **Navigate to SQL Editor** (in the left sidebar)
3. **Copy the contents** of `schema.sql` in this directory
4. **Paste and run** the SQL in the editor  
5. **Verify** that all tables were created in the Table Editor

## Tables Created

- `profiles` - User profile information
- `interviews` - Mock interview sessions
- `transcriptions` - Audio/video transcriptions
- `ai_reviews` - AI-powered interview feedback

All tables have Row Level Security (RLS) enabled to ensure users can only access their own data.
