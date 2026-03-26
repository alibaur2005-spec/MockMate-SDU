'use client';

import { Box, Button, Heading, Text, VStack, HStack, Badge, Spinner, SimpleGrid } from '@chakra-ui/react';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState, use } from 'react';
import { toaster } from '@/components/ui/toaster';
import { useRouter } from 'next/navigation';
import { FaRobot, FaCheckCircle, FaExclamationTriangle, FaArrowLeft } from 'react-icons/fa';

interface ReviewData { id: string; started_at: string; ended_at: string; answer: string; question: { content: string; topic: string; difficulty: string }; company: { name: string }; evaluations: { score: number; feedback: any; ai_model: string }[]; }

export default function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const supabase = createClient();
    const [review, setReview] = useState<ReviewData | null>(null);
    const [loading, setLoading] = useState(true);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        const fetchReview = async () => {
            const { data, error } = await supabase.from('interview_attempts').select(`id, started_at, ended_at, answer, question:questions (content, topic, difficulty), company:companies (name), evaluations (score, feedback, ai_model)`).eq('id', id).single();
            if (error) { toaster.create({ title: 'Error loading review', description: error.message, type: 'error' }); }
            else { setReview({ ...data, question: Array.isArray(data.question) ? data.question[0] : data.question, company: Array.isArray(data.company) ? data.company[0] : data.company } as ReviewData); }
            setLoading(false);
        };
        fetchReview();
    }, [id]);

    if (loading) return <VStack py={20}><Spinner size="xl" color="gray.500" /><Text mt={4} color="gray.500">Loading evaluation...</Text></VStack>;
    if (!review) return <VStack py={20}><Heading color="gray.400">Review not found</Heading><Button mt={4} onClick={() => router.push('/dashboard')} variant="outline" borderColor="rgba(255,255,255,0.08)" color="gray.400">Dashboard</Button></VStack>;

    const evaluation = review.evaluations?.length > 0 ? review.evaluations[0] : null;
    const diffColor = review.question.difficulty === 'Easy' ? '34,197,94' : review.question.difficulty === 'Medium' ? '234,179,8' : '239,68,68';

    return (
        <VStack gap={8} align="stretch">
            <Box>
                <Button variant="ghost" size="sm" color="gray.500" onClick={() => router.push('/reviews')} mb={3} _hover={{ color: 'white' }}><FaArrowLeft style={{ marginRight: '6px' }} /> Back to Reviews</Button>
                <Heading size="2xl" fontWeight="800" letterSpacing="-0.03em">Interview Result</Heading>
                <Text color="gray.500" fontSize="sm" mt={1}>{review.company.name} — {review.question.topic}</Text>
            </Box>

            <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6}>
                {/* Left: Q&A */}
                <VStack gap={5} align="stretch">
                    <Box p={6} borderRadius="xl" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <HStack mb={3}><Heading size="sm" fontWeight="700">Question</Heading><Badge ml={2} px={2} py={0} borderRadius="full" fontSize="xs" style={{ background: `rgba(${diffColor},0.08)`, color: `rgba(${diffColor},1)` }}>{review.question.difficulty}</Badge></HStack>
                        <Text color="gray.300" fontSize="sm" lineHeight="1.7">{review.question.content}</Text>
                    </Box>
                    <Box p={6} borderRadius="xl" style={{ background: '#0d0d14', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <Heading size="sm" fontWeight="700" mb={3}>Your Answer</Heading>
                        <Box whiteSpace="pre-wrap" fontSize="xs" fontFamily="monospace" color="#22c55e" lineHeight="1.8">
                            {(review.answer || '// No code submitted').replace(/\*/g, '').replace(/\\n/g, '\n')}
                        </Box>
                    </Box>
                </VStack>

                {/* Right: AI Feedback */}
                <VStack gap={5} align="stretch">
                    <Box p={6} borderRadius="xl" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', borderTop: evaluation ? `3px solid ${evaluation.score >= 70 ? '#22c55e' : '#eab308'}` : '3px solid rgba(255,255,255,0.06)' }}>
                        <HStack justify="space-between" mb={5}>
                            <HStack><FaRobot size={18} color="#5672ea" /><Heading size="sm" fontWeight="700">AI Evaluation</Heading></HStack>
                            {evaluation && <Badge px={3} py={0.5} borderRadius="full" fontSize="sm" fontWeight="700" style={{ background: evaluation.score >= 70 ? 'rgba(34,197,94,0.1)' : 'rgba(234,179,8,0.1)', color: evaluation.score >= 70 ? '#22c55e' : '#eab308', border: `1px solid ${evaluation.score >= 70 ? 'rgba(34,197,94,0.2)' : 'rgba(234,179,8,0.2)'}` }}>{evaluation.score}/100</Badge>}
                        </HStack>

                        {evaluation ? (
                            <VStack align="start" gap={5}>
                                <Text color="gray.300" fontSize="sm" lineHeight="1.7">{(evaluation.feedback?.summary || 'No summary.').replace(/\*/g, '')}</Text>
                                <Box w="full">
                                    <Heading size="xs" mb={2} color="#22c55e" fontWeight="700">Strengths</Heading>
                                    <VStack align="start" pl={2} gap={1.5}>
                                        {(evaluation.feedback?.strengths || []).map((s: string, i: number) => (
                                            <HStack key={i} align="start"><FaCheckCircle color="#22c55e" style={{ marginTop: '3px', flexShrink: 0 }} /><Text fontSize="xs" color="gray.400">{s.replace(/\*/g, '')}</Text></HStack>
                                        ))}
                                    </VStack>
                                </Box>
                                <Box w="full">
                                    <Heading size="xs" mb={2} color="#eab308" fontWeight="700">Areas for Improvement</Heading>
                                    <VStack align="start" pl={2} gap={1.5}>
                                        {(evaluation.feedback?.improvements || []).map((s: string, i: number) => (
                                            <HStack key={i} align="start"><FaExclamationTriangle color="#eab308" style={{ marginTop: '3px', flexShrink: 0 }} /><Text fontSize="xs" color="gray.400">{s.replace(/\*/g, '')}</Text></HStack>
                                        ))}
                                    </VStack>
                                </Box>
                            </VStack>
                        ) : (
                            <VStack py={8} gap={3}><Text color="gray.500" fontSize="sm">AI feedback is being generated...</Text></VStack>
                        )}
                    </Box>
                </VStack>
            </SimpleGrid>
        </VStack>
    );
}
