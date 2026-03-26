'use client';

import { Box, Heading, Text, VStack, HStack, Badge, Button, Spinner, Table, IconButton } from '@chakra-ui/react';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { toaster } from '@/components/ui/toaster';
import { useRouter } from 'next/navigation';
import { FaEye, FaArrowRight } from 'react-icons/fa';

interface ReviewSummary { id: string; started_at: string; status: string; question: { content: string; topic: string }; company: { name: string }; evaluations: { score: number }[]; }

export default function ReviewsListPage() {
    const [reviews, setReviews] = useState<ReviewSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();
    const router = useRouter();

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        const fetchReviews = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { setLoading(false); return; }
            const { data, error } = await supabase.from('interview_attempts').select(`id, started_at, status, question:questions (content, topic), company:companies (name), evaluations (score)`).eq('user_id', user.id).order('started_at', { ascending: false });
            if (error) { toaster.create({ title: 'Error loading reviews', description: error.message, type: 'error' }); }
            else { setReviews((data || []).map((item: any) => ({ ...item, question: Array.isArray(item.question) ? item.question[0] : item.question, company: Array.isArray(item.company) ? item.company[0] : item.company }))); }
            setLoading(false);
        };
        fetchReviews();
    }, []);

    if (loading) return <VStack py={20}><Spinner size="xl" color="gray.500" /></VStack>;

    return (
        <VStack gap={8} align="stretch">
            <Box>
                <Heading size="2xl" fontWeight="800" letterSpacing="-0.03em" mb={2}>Your Interviews</Heading>
                <Text color="gray.500" fontSize="sm">Track your progress and review feedback from past sessions.</Text>
            </Box>

            {reviews.length === 0 ? (
                <VStack py={16} borderRadius="xl" gap={4} textAlign="center" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <Heading size="md" fontWeight="700" color="gray.300">No interviews yet</Heading>
                    <Text color="gray.500" fontSize="sm">Start practicing to see your results here.</Text>
                    <Button onClick={() => router.push('/companies')} bg="white" color="#08080c" borderRadius="lg" fontWeight="600" px={6} _hover={{ bg: 'gray.200' }}>Start Practice <FaArrowRight style={{ marginLeft: '6px' }} /></Button>
                </VStack>
            ) : (
                <Box overflowX="auto" borderRadius="xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <Table.Root size="lg">
                        <Table.Header>
                            <Table.Row style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <Table.ColumnHeader pl={6} color="gray.500" fontSize="xs" fontWeight="600">Company</Table.ColumnHeader>
                                <Table.ColumnHeader color="gray.500" fontSize="xs" fontWeight="600">Question</Table.ColumnHeader>
                                <Table.ColumnHeader color="gray.500" fontSize="xs" fontWeight="600">Date</Table.ColumnHeader>
                                <Table.ColumnHeader color="gray.500" fontSize="xs" fontWeight="600">Score</Table.ColumnHeader>
                                <Table.ColumnHeader color="gray.500" fontSize="xs" fontWeight="600">Status</Table.ColumnHeader>
                                <Table.ColumnHeader textAlign="right" pr={6} color="gray.500" fontSize="xs" fontWeight="600"></Table.ColumnHeader>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {reviews.map((r) => {
                                const score = r.evaluations?.length > 0 ? r.evaluations[0].score : null;
                                return (
                                    <Table.Row key={r.id} _hover={{ bg: 'rgba(255,255,255,0.02)' }} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }} cursor="pointer" onClick={() => router.push(`/reviews/${r.id}`)}>
                                        <Table.Cell pl={6} fontWeight="600" fontSize="sm">{r.company?.name || 'Unknown'}</Table.Cell>
                                        <Table.Cell py={4}>
                                            <VStack align="start" gap={1}>
                                                <Text lineClamp={1} fontWeight="500" fontSize="sm">{r.question?.content || 'Unknown'}</Text>
                                                <Badge px={2} py={0} borderRadius="full" fontSize="xs" style={{ background: 'rgba(86,114,234,0.08)', color: '#7b98f2' }}>{r.question?.topic}</Badge>
                                            </VStack>
                                        </Table.Cell>
                                        <Table.Cell fontSize="xs" color="gray.500">{new Date(r.started_at).toLocaleDateString()}</Table.Cell>
                                        <Table.Cell>
                                            {score !== null ? (
                                                <Badge px={2.5} py={0.5} borderRadius="full" fontSize="xs" style={{ background: score >= 70 ? 'rgba(34,197,94,0.1)' : 'rgba(234,179,8,0.1)', color: score >= 70 ? '#22c55e' : '#eab308', border: `1px solid ${score >= 70 ? 'rgba(34,197,94,0.2)' : 'rgba(234,179,8,0.2)'}` }}>{score}/100</Badge>
                                            ) : <Text fontSize="xs" color="gray.600">—</Text>}
                                        </Table.Cell>
                                        <Table.Cell>
                                            <Badge px={2.5} py={0.5} borderRadius="full" fontSize="xs" style={{ background: r.status === 'completed' ? 'rgba(34,197,94,0.1)' : 'rgba(86,114,234,0.1)', color: r.status === 'completed' ? '#22c55e' : '#7b98f2' }}>{r.status}</Badge>
                                        </Table.Cell>
                                        <Table.Cell textAlign="right" pr={6}>
                                            <IconButton aria-label="View" variant="ghost" size="sm" color="gray.500" _hover={{ color: 'white' }}><FaEye /></IconButton>
                                        </Table.Cell>
                                    </Table.Row>
                                );
                            })}
                        </Table.Body>
                    </Table.Root>
                </Box>
            )}
        </VStack>
    );
}
