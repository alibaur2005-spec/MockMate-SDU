'use client';

import { Box, Heading, Text, VStack, HStack, Progress, SimpleGrid, Badge, Spinner, Icon } from '@chakra-ui/react';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { FaChartLine, FaCheckCircle, FaUniversity } from 'react-icons/fa';

interface AdmissionStats { totalInterviews: number; avgScore: number; probability: number; }

export default function AdmissionPage() {
    const [stats, setStats] = useState<AdmissionStats | null>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        const calc = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { setLoading(false); return; }
            const { data: attempts } = await supabase.from('interview_attempts').select('id, evaluations(score)').eq('user_id', user.id).eq('status', 'completed');
            let totalScore = 0, count = 0;
            attempts?.forEach((att: any) => { (Array.isArray(att.evaluations) ? att.evaluations : [att.evaluations]).forEach((e: any) => { if (e && typeof e.score === 'number') { totalScore += e.score; count++; } }); });
            const avgScore = count > 0 ? totalScore / count : 0;
            let prob = (avgScore / 100) * 0.8 + Math.min(count * 0.02, 0.2);
            prob = Math.min(prob, 0.99);
            setStats({ totalInterviews: attempts?.length || 0, avgScore: Math.round(avgScore), probability: Math.round(prob * 100) });
            setLoading(false);
        };
        calc();
    }, []);

    if (loading) return <VStack py={20}><Spinner size="xl" color="gray.500" /><Text mt={4} color="gray.500">Calculating...</Text></VStack>;

    const probColor = (stats?.probability || 0) >= 70 ? '34,197,94' : (stats?.probability || 0) >= 40 ? '234,179,8' : '239,68,68';

    return (
        <VStack gap={8} align="stretch">
            <Box>
                <Heading size="2xl" fontWeight="800" letterSpacing="-0.03em" mb={2}>Admission Chances</Heading>
                <Text color="gray.500" fontSize="sm">AI-powered prediction based on your interview performance.</Text>
            </Box>

            {!stats || stats.totalInterviews === 0 ? (
                <Box p={10} borderRadius="xl" textAlign="center" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <Heading size="md" fontWeight="700" color="gray.300" mb={2}>Not enough data</Heading>
                    <Text color="gray.500" fontSize="sm">Complete at least one interview to get a prediction.</Text>
                </Box>
            ) : (
                <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
                    {/* Probability */}
                    <Box p={7} borderRadius="xl" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', borderTop: `3px solid rgba(${probColor},0.8)` }}>
                        <VStack gap={6}>
                            <Heading size="md" fontWeight="700">Predicted Success Rate</Heading>
                            <Box w="full" px={4}>
                                <Progress.Root value={stats.probability} size="lg">
                                    <HStack justify="space-between" mb={2}>
                                        <Progress.Label fontSize="xs" color="gray.500">Probability</Progress.Label>
                                        <Progress.ValueText fontSize="sm" fontWeight="700" style={{ color: `rgba(${probColor},1)` }}>{stats.probability}%</Progress.ValueText>
                                    </HStack>
                                    <Progress.Track style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '999px' }}>
                                        <Progress.Range style={{ background: `rgba(${probColor},0.7)`, borderRadius: '999px' }} />
                                    </Progress.Track>
                                </Progress.Root>
                            </Box>
                            <Text textAlign="center" color="gray.500" fontSize="xs">Based on {stats.avgScore}/100 avg across {stats.totalInterviews} interviews.</Text>
                            <Badge px={3} py={1} borderRadius="full" fontSize="xs" fontWeight="700" style={{ background: `rgba(${probColor},0.1)`, color: `rgba(${probColor},1)`, border: `1px solid rgba(${probColor},0.2)` }}>
                                {stats.probability >= 70 ? 'High Chance' : stats.probability >= 40 ? 'Moderate' : 'Needs Improvement'}
                            </Badge>
                        </VStack>
                    </Box>

                    {/* Insights */}
                    <VStack gap={4} align="stretch">
                        {[
                            { label: 'Average Score', value: `${stats.avgScore}/100`, icon: FaChartLine, tint: '86,114,234' },
                            { label: 'Interviews Completed', value: stats.totalInterviews, icon: FaCheckCircle, tint: '168,85,247' },
                            { label: 'Readiness Level', value: stats.avgScore >= 80 ? 'Job Ready' : stats.avgScore >= 60 ? 'Practicing' : 'Foundation', icon: FaUniversity, tint: '34,197,94' },
                        ].map((item, i) => (
                            <Box key={i} p={5} borderRadius="xl" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                <HStack gap={4}>
                                    <Box p={2.5} borderRadius="lg" style={{ background: `rgba(${item.tint},0.1)` }}><Icon as={item.icon} boxSize={5} style={{ color: `rgba(${item.tint},1)` }} /></Box>
                                    <VStack align="start" gap={0}>
                                        <Text fontSize="xs" color="gray.500" fontWeight="500">{item.label}</Text>
                                        <Heading size="sm" fontWeight="700">{item.value}</Heading>
                                    </VStack>
                                </HStack>
                            </Box>
                        ))}
                    </VStack>
                </SimpleGrid>
            )}
        </VStack>
    );
}
