export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string;
                    email: string | null;
                    full_name: string | null;
                    avatar_url: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id: string;
                    email?: string | null;
                    full_name?: string | null;
                    avatar_url?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    email?: string | null;
                    full_name?: string | null;
                    avatar_url?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            interviews: {
                Row: {
                    id: string;
                    user_id: string;
                    title: string;
                    difficulty: 'easy' | 'medium' | 'hard';
                    questions: any;
                    answers: any | null;
                    status: 'in_progress' | 'completed' | 'abandoned';
                    duration_seconds: number | null;
                    started_at: string;
                    completed_at: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    title: string;
                    difficulty: 'easy' | 'medium' | 'hard';
                    questions: any;
                    answers?: any | null;
                    status?: 'in_progress' | 'completed' | 'abandoned';
                    duration_seconds?: number | null;
                    started_at?: string;
                    completed_at?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    title?: string;
                    difficulty?: 'easy' | 'medium' | 'hard';
                    questions?: any;
                    answers?: any | null;
                    status?: 'in_progress' | 'completed' | 'abandoned';
                    duration_seconds?: number | null;
                    started_at?: string;
                    completed_at?: string | null;
                    created_at?: string;
                };
            };
            transcriptions: {
                Row: {
                    id: string;
                    user_id: string;
                    file_name: string;
                    file_url: string | null;
                    transcription_text: string | null;
                    status: 'processing' | 'completed' | 'failed';
                    created_at: string;
                    completed_at: string | null;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    file_name: string;
                    file_url?: string | null;
                    transcription_text?: string | null;
                    status?: 'processing' | 'completed' | 'failed';
                    created_at?: string;
                    completed_at?: string | null;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    file_name?: string;
                    file_url?: string | null;
                    transcription_text?: string | null;
                    status?: 'processing' | 'completed' | 'failed';
                    created_at?: string;
                    completed_at?: string | null;
                };
            };
            ai_reviews: {
                Row: {
                    id: string;
                    user_id: string;
                    interview_id: string | null;
                    review_text: string;
                    score: number | null;
                    strengths: any | null;
                    weaknesses: any | null;
                    suggestions: any | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    interview_id?: string | null;
                    review_text: string;
                    score?: number | null;
                    strengths?: any | null;
                    weaknesses?: any | null;
                    suggestions?: any | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    interview_id?: string | null;
                    review_text?: string;
                    score?: number | null;
                    strengths?: any | null;
                    weaknesses?: any | null;
                    suggestions?: any | null;
                    created_at?: string;
                };
            };
        };
    };
}
