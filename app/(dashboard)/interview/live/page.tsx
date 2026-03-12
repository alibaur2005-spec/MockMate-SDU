import { Container, Heading, Text, VStack } from '@chakra-ui/react';
import { LiveInterviewAgent } from '@/components/interview/LiveInterviewAgent';

export const metadata = {
    title: 'Live Interview | MockMate',
    description: 'Real-time AI voice interview',
};

export default function LiveInterviewPage() {
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

                <LiveInterviewAgent companyName="Google" role="Frontend Engineer" />
            </VStack>
        </Container>
    );
}
