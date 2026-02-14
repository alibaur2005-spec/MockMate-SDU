
'use client';

import { Box, Container, Heading, Text, VStack, HStack, Badge, Button, Spinner, Table, IconButton } from '@chakra-ui/react';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { toaster } from '@/components/ui/toaster';
import { useRouter } from 'next/navigation';
import { FaEye, FaArrowRight } from 'react-icons/fa';

interface ReviewSummary {
    id: string;
    started_at: string;
    status: string;
    question: {
        content: string;
        topic: string;
    };
    company: {
        name: string;
    };
    evaluations: {
        score: number;
    }[];
}

export default function ReviewsListPage() {
    const [reviews, setReviews] = useState<ReviewSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        const fetchReviews = async () => {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                setLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from('interview_attempts')
                .select(`
                    id,
                    started_at,
                    status,
                    question:questions (
                        content,
                        topic
                    ),
                    company:companies (
                        name
                    ),
                    evaluations (
                        score
                    )
                `)
                .eq('user_id', user.id)
                .order('started_at', { ascending: false });

            if (error) {
                console.error('Error fetching reviews:', error);
                toaster.create({
                    title: 'Error loading reviews',
                    description: error.message,
                    type: 'error',
                });
            } else {
                // Handle potential array responses for joined tables
                const processed = (data || []).map((item: any) => ({
                    ...item,
                    question: Array.isArray(item.question) ? item.question[0] : item.question,
                    company: Array.isArray(item.company) ? item.company[0] : item.company,
                }));
                setReviews(processed);
            }
            setLoading(false);
        };

        fetchReviews();
    }, []);

    if (loading) {
        return (
            <Container centerContent py={20}>
                <Spinner size="xl" />
            </Container>
        );
    }

    return (
        <Container maxW="container.xl" py={8}>
            <VStack gap={8} align="stretch">
                <Box>
                    <Heading size="2xl" mb={2}>Your Interviews</Heading>
                    <Text color="fgMuted" fontSize="lg">Track your progress and review feedback from past sessions.</Text>
                </Box>

                {reviews.length === 0 ? (
                    <VStack py={12} bg="bgSub" borderRadius="xl" gap={4} textAlign="center">
                        <Heading size="md">No interviews yet</Heading>
                        <Text color="fgMuted">Start practicing to see your results here.</Text>
                        <Button colorPalette="brand" onClick={() => router.push('/companies')}>
                            Start Practice <FaArrowRight style={{ marginLeft: '8px' }} />
                        </Button>
                    </VStack>
                ) : (
                    <Box overflowX="auto" bg="bg.panel" borderRadius="xl" border="1px solid" borderColor="border" boxShadow="sm">
                        <Table.Root size="lg" interactive>
                            <Table.Header>
                                <Table.Row>
                                    <Table.ColumnHeader>Company</Table.ColumnHeader>
                                    <Table.ColumnHeader>Question</Table.ColumnHeader>
                                    <Table.ColumnHeader>Date</Table.ColumnHeader>
                                    <Table.ColumnHeader>Score</Table.ColumnHeader>
                                    <Table.ColumnHeader>Status</Table.ColumnHeader>
                                    <Table.ColumnHeader textAlign="right">Action</Table.ColumnHeader>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {reviews.map((review) => {
                                    const score = review.evaluations && review.evaluations.length > 0 ? review.evaluations[0].score : null;

                                    return (
                                        <Table.Row key={review.id} _hover={{ bg: 'gray.800/50' }}>
                                            <Table.Cell fontWeight="medium">{review.company?.name || 'Unknown'}</Table.Cell>
                                            <Table.Cell py={4}>
                                                <VStack align="start" gap={2}>
                                                    <Text lineClamp={1} fontWeight="medium">{review.question?.content || 'Unknown'}</Text>
                                                    <Badge size="sm" variant="surface" colorPalette="blue">{review.question?.topic}</Badge>
                                                </VStack>
                                            </Table.Cell>
                                            <Table.Cell fontSize="sm" color="fgMuted">
                                                {new Date(review.started_at).toLocaleDateString()}
                                            </Table.Cell>
                                            <Table.Cell>
                                                {score !== null ? (
                                                    <Badge colorPalette={score >= 70 ? 'green' : 'orange'}>
                                                        {score}/100
                                                    </Badge>
                                                ) : (
                                                    <Text fontSize="sm" color="fgMuted">-</Text>
                                                )}
                                            </Table.Cell>
                                            <Table.Cell>
                                                <Badge size="md" colorPalette={review.status === 'completed' ? 'green' : 'blue'} variant="solid">
                                                    {review.status}
                                                </Badge>
                                            </Table.Cell>
                                            <Table.Cell textAlign="right">
                                                <IconButton
                                                    aria-label="View Review"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => router.push(`/reviews/${review.id}`)}
                                                >
                                                    <FaEye />
                                                </IconButton>
                                            </Table.Cell>
                                        </Table.Row>
                                    );
                                })}
                            </Table.Body>
                        </Table.Root>
                    </Box>
                )}
            </VStack>
        </Container>
    );
}
