
'use client';

import { Box, Button, Container, Heading, Text, VStack, HStack, Card, Badge, Spinner, Separator } from '@chakra-ui/react';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState, use } from 'react';
import { toaster } from '@/components/ui/toaster';
import { useRouter } from 'next/navigation';
import { FaRobot, FaCheckCircle, FaExclamationTriangle, FaClock } from 'react-icons/fa';

interface ReviewData {
    id: string;
    started_at: string;
    ended_at: string;
    answer: string;
    question: {
        content: string;
        topic: string;
        difficulty: string;
    };
    company: {
        name: string;
    };
    evaluations: {
        score: number;
        feedback: any;
        ai_model: string;
    }[];
}

export default function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const supabase = createClient();

    const [review, setReview] = useState<ReviewData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReview = async () => {
            const { data, error } = await supabase
                .from('interview_attempts')
                .select(`
                    id,
                    started_at,
                    ended_at,
                    answer,
                    question:questions (
                        content,
                        topic,
                        difficulty
                    ),
                    company:companies (
                        name
                    ),
                    evaluations (
                        score,
                        feedback,
                        ai_model
                    )
                `)
                .eq('id', id)
                .single();

            if (error) {
                console.error('Error fetching review:', error);
                toaster.create({
                    title: 'Error loading review',
                    description: error.message,
                    type: 'error',
                });
            } else {
                const processedData = {
                    ...data,
                    question: Array.isArray(data.question) ? data.question[0] : data.question,
                    company: Array.isArray(data.company) ? data.company[0] : data.company,
                };
                setReview(processedData as ReviewData);
            }
            setLoading(false);
        };

        fetchReview();
    }, [id]);

    if (loading) {
        return (
            <Container centerContent py={20}>
                <Spinner size="xl" />
                <Text mt={4}>Loading evaluation...</Text>
            </Container>
        );
    }

    if (!review) {
        return (
            <Container centerContent py={20}>
                <Heading>Review not found</Heading>
                <Button mt={4} onClick={() => router.push('/dashboard')}>Go to Dashboard</Button>
            </Container>
        );
    }

    const evaluation = review.evaluations && review.evaluations.length > 0 ? review.evaluations[0] : null;

    return (
        <Container maxW="container.xl" py={8}>
            <VStack gap={8} align="stretch">
                <Box>
                    <LinkButton href="/companies">Back to Companies</LinkButton>
                    <Heading size="2xl" mt={4}>Interview Result</Heading>
                    <Text color="fgMuted" fontSize="lg">
                        {review.company.name} - {review.question.topic}
                    </Text>
                </Box>

                <SimpleGrid columns={{ base: 1, lg: 2 }} gap={8}>
                    {/* Left Column: Q&A */}
                    <VStack gap={6} align="stretch">
                        <Card.Root variant="elevated">
                            <Card.Header>
                                <Heading size="md">Question</Heading>
                                <Badge colorPalette="blue" mt={2}>{review.question.difficulty}</Badge>
                            </Card.Header>
                            <Card.Body>
                                <Text>{review.question.content}</Text>
                            </Card.Body>
                        </Card.Root>

                        <Card.Root variant="elevated">
                            <Card.Header>
                                <Heading size="md">Your Solution</Heading>
                            </Card.Header>
                            <Card.Body bg="gray.900" color="green.300" borderRadius="md" fontFamily="monospace">
                                <Box whiteSpace="pre-wrap" fontSize="sm">
                                    <span dangerouslySetInnerHTML={{ __html: (review.answer || "// No code submitted").replace(/\\*\\*(.*?)\\*\\*/g, '<strong>$1</strong>') }} />
                                </Box>
                            </Card.Body>
                        </Card.Root>
                    </VStack>

                    {/* Right Column: AI Feedback */}
                    <VStack gap={6} align="stretch">
                        <Card.Root variant="elevated" borderTop="4px solid" borderColor={evaluation ? (evaluation.score >= 70 ? "green.500" : "orange.500") : "gray.300"}>
                            <Card.Header>
                                <HStack justify="space-between">
                                    <HStack>
                                        <FaRobot size={24} color="var(--chakra-colors-blue-500)" />
                                        <Heading size="md">AI Evaluation</Heading>
                                    </HStack>
                                    {evaluation && (
                                        <Badge size="lg" colorPalette={evaluation.score >= 70 ? "green" : "orange"}>
                                            Score: {evaluation.score}/100
                                        </Badge>
                                    )}
                                </HStack>
                            </Card.Header>
                            <Card.Body>
                                {evaluation ? (
                                    <VStack align="start" gap={4}>
                                        <Text>{evaluation.feedback?.summary || "No summary available."}</Text>

                                        <Box w="full">
                                            <Heading size="sm" mb={2} color="green.600">Strengths</Heading>
                                            <VStack align="start" pl={4}>
                                                {(evaluation.feedback?.strengths || []).map((s: string, i: number) => (
                                                    <HStack key={i} align="start">
                                                        <FaCheckCircle color="green" style={{ marginTop: '4px' }} />
                                                        <Text fontSize="sm">{s}</Text>
                                                    </HStack>
                                                ))}
                                            </VStack>
                                        </Box>

                                        <Box w="full">
                                            <Heading size="sm" mb={2} color="orange.600">Areas for Improvement</Heading>
                                            <VStack align="start" pl={4}>
                                                {(evaluation.feedback?.improvements || []).map((s: string, i: number) => (
                                                    <HStack key={i} align="start">
                                                        <FaExclamationTriangle color="orange" style={{ marginTop: '4px' }} />
                                                        <Text fontSize="sm">{s}</Text>
                                                    </HStack>
                                                ))}
                                            </VStack>
                                        </Box>
                                    </VStack>
                                ) : (
                                    <VStack py={8} gap={4}>
                                        <Text color="fgMuted">AI feedback is being generated...</Text>
                                        <Button colorPalette="blue" variant="outline" disabled>
                                            Generate Feedback (Coming Soon)
                                        </Button>
                                    </VStack>
                                )}
                            </Card.Body>
                        </Card.Root>
                    </VStack>
                </SimpleGrid>
            </VStack>
        </Container>
    );
}

function LinkButton({ href, children }: { href: string, children: React.ReactNode }) {
    const router = useRouter();
    return (
        <Button variant="ghost" size="sm" onClick={() => router.push(href)}>
            {children}
        </Button>
    );
}

import { SimpleGrid } from '@chakra-ui/react';
