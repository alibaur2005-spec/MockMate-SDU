
'use client';

import { Box, Container, Heading, Text, VStack, HStack, Progress, Card, SimpleGrid, Badge, Spinner } from '@chakra-ui/react';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { toaster } from '@/components/ui/toaster';
import { FaChartLine, FaCheckCircle, FaUniversity } from 'react-icons/fa';

interface AdmissionStats {
    totalInterviews: number;
    avgScore: number;
    probability: number;
}

export default function AdmissionPage() {
    const [stats, setStats] = useState<AdmissionStats | null>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const calculateAdmission = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setLoading(false);
                return;
            }

            // Fetch all evaluations


            // Optimized query: Get attempts first for user, then evaluations
            const { data: attempts, error: attemptsError } = await supabase
                .from('interview_attempts')
                .select('id, evaluations(score)')
                .eq('user_id', user.id)
                .eq('status', 'completed');

            if (attemptsError) {
                console.error('Error fetching attempts:', JSON.stringify(attemptsError, null, 2), attemptsError);
                return;
            }

            let totalScore = 0;
            let count = 0;

            attempts?.forEach((att: any) => {
                const evals = Array.isArray(att.evaluations) ? att.evaluations : [att.evaluations];
                evals.forEach((e: any) => {
                    if (e && typeof e.score === 'number') {
                        totalScore += e.score;
                        count++;
                    }
                });
            });

            const avgScore = count > 0 ? totalScore / count : 0;
            // Simple logic: Probability = (Avg Score / 100) * 0.8 + (Count * 0.05) [max 0.2 bonus]
            let prob = (avgScore / 100) * 0.8;
            prob += Math.min(count * 0.02, 0.2); // Bonus for experience
            prob = Math.min(prob, 0.99); // Max 99%

            setStats({
                totalInterviews: attempts?.length || 0,
                avgScore: Math.round(avgScore),
                probability: Math.round(prob * 100)
            });
            setLoading(false);
        };

        calculateAdmission();
    }, []);

    if (loading) {
        return (
            <Container centerContent py={20}>
                <Spinner size="xl" />
                <Text mt={4}>Calculating admission chances...</Text>
            </Container>
        );
    }

    return (
        <Container maxW="container.xl" py={8}>
            <VStack gap={8} align="stretch">
                <Box>
                    <Heading size="2xl" mb={2}>Admission Chances</Heading>
                    <Text color="fgMuted" fontSize="lg">
                        AI-powered prediction of your success rate based on interview performance.
                    </Text>
                </Box>

                {!stats || stats.totalInterviews === 0 ? (
                    <Box bg="bgSub" p={8} borderRadius="xl" textAlign="center">
                        <Heading size="md" mb={2}>Not enough data</Heading>
                        <Text color="fgMuted">Complete at least one interview to get a prediction.</Text>
                    </Box>
                ) : (
                    <SimpleGrid columns={{ base: 1, md: 2 }} gap={8}>
                        {/* Probability Card */}
                        <Card.Root variant="elevated" borderTop="4px solid" borderColor={stats.probability >= 70 ? 'green.500' : stats.probability >= 40 ? 'orange.500' : 'red.500'}>
                            <Card.Body p={6}>
                                <VStack gap={6}>
                                    <Heading size="lg">Predicted Success Rate</Heading>
                                    <Box w="full" px={4}>
                                        <Progress.Root value={stats.probability} size="lg" colorPalette={stats.probability >= 70 ? 'green' : stats.probability >= 40 ? 'orange' : 'red'}>
                                            <HStack justify="space-between" mb={2}>
                                                <Progress.Label>Probability</Progress.Label>
                                                <Progress.ValueText>{stats.probability}%</Progress.ValueText>
                                            </HStack>
                                            <Progress.Track>
                                                <Progress.Range />
                                            </Progress.Track>
                                        </Progress.Root>
                                    </Box>
                                    <Text textAlign="center" color="fgMuted">
                                        Based on your average score of {stats.avgScore}/100 across {stats.totalInterviews} interviews.
                                    </Text>
                                    <Badge size="lg" colorPalette={stats.probability >= 70 ? 'green' : 'orange'}>
                                        {stats.probability >= 70 ? 'High Chance' : stats.probability >= 40 ? 'Moderate Chance' : 'Needs Improvement'}
                                    </Badge>
                                </VStack>
                            </Card.Body>
                        </Card.Root>

                        {/* Insights Card */}
                        <VStack gap={4} align="stretch">
                            <Card.Root variant="outline">
                                <Card.Body p={6}>
                                    <HStack gap={4}>
                                        <Box bg="blue.50" p={3} borderRadius="lg">
                                            <FaChartLine size={24} color="var(--chakra-colors-blue-500)" />
                                        </Box>
                                        <VStack align="start" gap={1}>
                                            <Text fontSize="sm" color="fgMuted">Average Score</Text>
                                            <Heading size="md">{stats.avgScore}/100</Heading>
                                        </VStack>
                                    </HStack>
                                </Card.Body>
                            </Card.Root>

                            <Card.Root variant="outline">
                                <Card.Body p={6}>
                                    <HStack gap={4}>
                                        <Box bg="purple.50" p={3} borderRadius="lg">
                                            <FaCheckCircle size={24} color="var(--chakra-colors-purple-500)" />
                                        </Box>
                                        <VStack align="start" gap={1}>
                                            <Text fontSize="sm" color="fgMuted">Mock Interviews Completed</Text>
                                            <Heading size="md">{stats.totalInterviews}</Heading>
                                        </VStack>
                                    </HStack>
                                </Card.Body>
                            </Card.Root>

                            <Card.Root variant="outline">
                                <Card.Body p={6}>
                                    <HStack gap={4}>
                                        <Box bg="green.50" p={3} borderRadius="lg">
                                            <FaUniversity size={24} color="var(--chakra-colors-green-500)" />
                                        </Box>
                                        <VStack align="start" gap={1}>
                                            <Text fontSize="sm" color="fgMuted">Readiness Level</Text>
                                            <Heading size="md">
                                                {stats.avgScore >= 80 ? 'Job Ready' : stats.avgScore >= 60 ? 'Practicing' : 'Foundation'}
                                            </Heading>
                                        </VStack>
                                    </HStack>
                                </Card.Body>
                            </Card.Root>
                        </VStack>
                    </SimpleGrid>
                )}
            </VStack>
        </Container>
    );
}
