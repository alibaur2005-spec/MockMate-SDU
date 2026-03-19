import { Container, Heading, Text, VStack } from '@chakra-ui/react';
import { LiveInterviewAgent } from '@/components/interview/LiveInterviewAgent';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export const metadata = {
    title: 'Live Interview | MockMate',
    description: 'Real-time AI voice interview',
};

export default async function LiveInterviewPage({ searchParams }: { searchParams: Promise<{ company_id?: string }> }) {
    const { company_id } = await searchParams;
    let companyName = undefined;
    let role = "Software Engineer";
    let questionPrompt = undefined;
    let attemptId = undefined;

    if (company_id) {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            redirect('/login');
        }

        const { data: company } = await supabase
            .from('companies')
            .select('name')
            .eq('id', company_id)
            .single();

        if (company) {
            companyName = company.name;
        }

        // Fetch random question
        const { data: questions } = await supabase
            .from('questions')
            .select('id, content')
            .eq('company_id', company_id);

        let questionId = null;
        if (questions && questions.length > 0) {
            const randomQ = questions[Math.floor(Math.random() * questions.length)];
            questionId = randomQ.id;
            questionPrompt = randomQ.content;
        }

        // Create attempt
        const { data: attempt } = await supabase
            .from('interview_attempts')
            .insert({
                user_id: user.id,
                company_id: company_id,
                question_id: questionId,
                status: 'in_progress',
                started_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (attempt) {
            attemptId = attempt.id;
        }
    }

    return (
        <Container maxW="container.xl" py={12}>
            <VStack gap={8} align="center">
                <VStack textAlign="center">
                    <Heading size="3xl">Live Voice Interview</Heading>
                    <Text color="fgMuted" fontSize="lg" maxW="2xl">
                        Experience a real-time conversation with our AI interviewer powered by Gemini Live API.
                        Enable your microphone and treat it like a real interview.
                    </Text>
                </VStack>

                <LiveInterviewAgent
                    attemptId={attemptId}
                    companyName={companyName}
                    role={role}
                    questionPrompt={questionPrompt}
                />
            </VStack>
        </Container>
    );
}
