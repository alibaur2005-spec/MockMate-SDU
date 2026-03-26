'use client';

import { Box, Container, Heading, Text, SimpleGrid, VStack, HStack, Icon, Button, Card } from '@chakra-ui/react';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { FaBuilding, FaCode, FaMicrophone, FaChartLine, FaArrowRight, FaRocket } from 'react-icons/fa';
import Link from 'next/link';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

export default function DashboardPage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ streak: 0, problemsSolved: 0, companiesUnlocked: 0 });

    useEffect(() => {
        const supabase = createClient();
        const getData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase.from('profiles').select('full_name, email').eq('id', user.id).single();
                setUser({ ...user, ...profile });

                const { data: attempts } = await supabase.from('interview_attempts').select('id, status, started_at, question_id, company_id').eq('user_id', user.id);
                if (attempts) {
                    const completedAttempts = attempts.filter(a => a.status === 'completed');
                    const distinctQuestions = new Set(completedAttempts.map(a => a.question_id)).size;
                    const distinctCompanies = new Set(attempts.map(a => a.company_id).filter(id => id !== null)).size;
                    const dates = [...new Set(attempts.map(a => new Date(a.started_at).toISOString().split('T')[0]))].sort().reverse();
                    let streak = 0;
                    if (dates.length > 0) {
                        const today = new Date().toISOString().split('T')[0];
                        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
                        if (dates[0] === today || dates[0] === yesterday) {
                            streak = 1;
                            let currentDate = new Date(dates[0]);
                            for (let i = 1; i < dates.length; i++) {
                                const prevDate = new Date(dates[i]);
                                const diffDays = Math.ceil(Math.abs(currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
                                if (diffDays === 1) { streak++; currentDate = prevDate; } else break;
                            }
                        }
                    }
                    setStats({ streak, problemsSolved: distinctQuestions, companiesUnlocked: distinctCompanies });
                }
            }
            setLoading(false);
        };
        getData();
    }, []);

    const features = [
        { title: 'Practice Interviews', description: 'Solve real interview questions from top tech companies.', icon: FaCode, tint: '86,114,234', link: '/companies', cta: 'Start Coding' },
        { title: 'AI Transcriber', description: 'Record and transcribe your mock interviews with AI.', icon: FaMicrophone, tint: '239,68,68', link: '/transcriber', cta: 'Open Transcriber' },
        { title: 'Admission Chances', description: 'Get AI-powered predictions on your admission probability.', icon: FaChartLine, tint: '34,197,94', link: '/admission', cta: 'View Prediction' },
    ];

    const statCards = [
        { label: 'Current Streak', value: `${stats.streak} Days`, icon: FaRocket, tint: '168,85,247' },
        { label: 'Problems Solved', value: stats.problemsSolved, icon: FaCode, tint: '86,114,234' },
        { label: 'Companies Unlocked', value: stats.companiesUnlocked, icon: FaBuilding, tint: '34,197,94' },
    ];

    return (
        <VStack gap={8} align="stretch">
            {/* Welcome */}
            <MotionBox initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 } as any}>
                <Box py={4}>
                    <Heading size="3xl" fontWeight="800" letterSpacing="-0.03em" mb={3}>
                        Welcome back{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : user?.email ? `, ${user.email.split('@')[0]}` : ''}
                    </Heading>
                    <Text fontSize="md" color="gray.500" maxW="xl">
                        Ready to ace your next technical interview? Track your progress, practice problems, and get AI feedback.
                    </Text>
                </Box>
            </MotionBox>

            {/* Stats */}
            <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
                {statCards.map((s, i) => (
                    <MotionBox key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 + i * 0.08 } as any}>
                        <Box
                            p={5}
                            borderRadius="xl"
                            style={{
                                background: `linear-gradient(135deg, rgba(${s.tint},0.08), rgba(${s.tint},0.02))`,
                                border: `1px solid rgba(${s.tint},0.12)`,
                            }}
                        >
                            <HStack gap={4}>
                                <Box
                                    p={2.5}
                                    borderRadius="lg"
                                    style={{ background: `rgba(${s.tint},0.12)` }}
                                >
                                    <Icon as={s.icon} boxSize={5} style={{ color: `rgba(${s.tint},1)` }} />
                                </Box>
                                <VStack align="start" gap={0}>
                                    <Text color="gray.500" fontSize="xs" fontWeight="500">{s.label}</Text>
                                    <Heading size="lg" fontWeight="800" letterSpacing="-0.02em">{s.value}</Heading>
                                </VStack>
                            </HStack>
                        </Box>
                    </MotionBox>
                ))}
            </SimpleGrid>

            {/* Quick Actions */}
            <Box mt={4}>
                <Heading size="lg" mb={5} fontWeight="700" letterSpacing="-0.02em">Quick Actions</Heading>
                <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
                    {features.map((f, i) => (
                        <MotionBox key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 + i * 0.08 } as any} whileHover={{ y: -4 }}>
                            <Link href={f.link} style={{ textDecoration: 'none' }}>
                                <Box
                                    h="full"
                                    p={6}
                                    borderRadius="xl"
                                    style={{
                                        background: 'rgba(255,255,255,0.025)',
                                        border: '1px solid rgba(255,255,255,0.06)',
                                    }}
                                    _hover={{ borderColor: `rgba(${f.tint},0.3)` }}
                                    transition="all 0.2s"
                                >
                                    <VStack align="start" gap={4} h="full">
                                        <Box p={2.5} borderRadius="lg" style={{ background: `rgba(${f.tint},0.1)` }}>
                                            <Icon as={f.icon} boxSize={5} style={{ color: `rgba(${f.tint},1)` }} />
                                        </Box>
                                        <VStack align="start" gap={1} flex={1}>
                                            <Heading size="sm" fontWeight="700">{f.title}</Heading>
                                            <Text color="gray.500" fontSize="xs">{f.description}</Text>
                                        </VStack>
                                        <HStack color="gray.500" fontSize="xs" fontWeight="600" _hover={{ color: 'white' }}>
                                            <Text>{f.cta}</Text>
                                            <FaArrowRight size={10} />
                                        </HStack>
                                    </VStack>
                                </Box>
                            </Link>
                        </MotionBox>
                    ))}
                </SimpleGrid>
            </Box>
        </VStack>
    );
}
