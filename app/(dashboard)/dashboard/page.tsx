
'use client';

import {
    Box,
    Container,
    Heading,
    Text,
    SimpleGrid,
    VStack,
    HStack,
    Icon,
    Button,
    Card,
    Badge,
    Stat
} from '@chakra-ui/react';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import {
    FaBuilding,
    FaCode,
    FaMicrophone,
    FaChartLine,
    FaArrowRight,
    FaRocket
} from 'react-icons/fa';
import Link from 'next/link';

export default function DashboardPage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        streak: 0,
        problemsSolved: 0,
        companiesUnlocked: 0
    });
    const supabase = createClient();

    useEffect(() => {
        const getData = async () => {
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                // Fetch Profile for Name
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('full_name, email')
                    .eq('id', user.id)
                    .single();

                setUser({ ...user, ...profile });

                // Fetch Attempts for Stats
                const { data: attempts } = await supabase
                    .from('interview_attempts')
                    .select('id, status, started_at, question_id, company_id')
                    .eq('user_id', user.id);

                if (attempts) {
                    // 1. Problems Solved (Distinct completed questions)
                    const completedAttempts = attempts.filter(a => a.status === 'completed');
                    const distinctQuestions = new Set(completedAttempts.map(a => a.question_id)).size;

                    // 2. Companies Unlocked (Distinct companies attempted)
                    const distinctCompanies = new Set(attempts.map(a => a.company_id).filter(id => id !== null)).size;

                    // 3. Current Streak
                    const dates = [...new Set(attempts.map(a => new Date(a.started_at).toISOString().split('T')[0]))].sort().reverse();

                    let streak = 0;
                    if (dates.length > 0) {
                        const today = new Date().toISOString().split('T')[0];
                        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

                        // Check if latest activity is today or yesterday
                        if (dates[0] === today || dates[0] === yesterday) {
                            streak = 1;
                            let currentDate = new Date(dates[0]);

                            for (let i = 1; i < dates.length; i++) {
                                const prevDate = new Date(dates[i]);
                                const diffTime = Math.abs(currentDate.getTime() - prevDate.getTime());
                                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                                if (diffDays === 1) {
                                    streak++;
                                    currentDate = prevDate;
                                } else {
                                    break;
                                }
                            }
                        }
                    }

                    setStats({
                        streak,
                        problemsSolved: distinctQuestions,
                        companiesUnlocked: distinctCompanies
                    });
                }
            }
            setLoading(false);
        };
        getData();
    }, []);

    const features = [
        {
            title: 'Practice Interviews',
            description: 'Solve real interview questions from top tech companies.',
            icon: FaCode,
            color: 'blue.500',
            link: '/companies',
            cta: 'Start Coding'
        },
        {
            title: 'AI Transcriber',
            description: 'Record and transcribe your mock interviews with AI.',
            icon: FaMicrophone,
            color: 'red.500',
            link: '/transcriber',
            cta: 'Open Transcriber'
        },
        {
            title: 'Admission Chances',
            description: 'Get AI-powered predictions on your admission probability.',
            icon: FaChartLine,
            color: 'green.500',
            link: '/admission',
            cta: 'View Prediction'
        }
    ];

    return (
        <Container maxW="container.xl" py={8}>
            <VStack gap={8} align="stretch">

                {/* Welcome Section */}
                <Box py={8}>
                    <Heading size="3xl" mb={4}>
                        Welcome back{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : user?.email ? `, ${user.email.split('@')[0]}` : ''}! 👋
                    </Heading>
                    <Text fontSize="xl" color="fgMuted" maxW="2xl">
                        Ready to ace your next technical interview? Track your progress,
                        practice coding problems, and get AI feedback all in one place.
                    </Text>
                </Box>

                {/* Quick Stats Row (Placeholder for now) */}
                <SimpleGrid columns={{ base: 1, md: 3 }} gap={6}>
                    <Card.Root variant="elevated" borderLeft="4px solid" borderColor="purple.500">
                        <Card.Body p={6}>
                            <HStack gap={4}>
                                <Box p={3} bg="purple.100" borderRadius="lg" color="purple.600">
                                    <Icon as={FaRocket} boxSize={6} />
                                </Box>
                                <VStack align="start" gap={0}>
                                    <Text color="fgMuted" fontSize="sm">Current Streak</Text>
                                    <Heading size="xl">{stats.streak} Days</Heading>
                                </VStack>
                            </HStack>
                        </Card.Body>
                    </Card.Root>

                    <Card.Root variant="elevated" borderLeft="4px solid" borderColor="blue.500">
                        <Card.Body p={6}>
                            <HStack gap={4}>
                                <Box p={3} bg="blue.100" borderRadius="lg" color="blue.600">
                                    <Icon as={FaCode} boxSize={6} />
                                </Box>
                                <VStack align="start" gap={0}>
                                    <Text color="fgMuted" fontSize="sm">Problems Solved</Text>
                                    <Heading size="xl">{stats.problemsSolved}</Heading>
                                </VStack>
                            </HStack>
                        </Card.Body>
                    </Card.Root>

                    <Card.Root variant="elevated" borderLeft="4px solid" borderColor="green.500">
                        <Card.Body p={6}>
                            <HStack gap={4}>
                                <Box p={3} bg="green.100" borderRadius="lg" color="green.600">
                                    <Icon as={FaBuilding} boxSize={6} />
                                </Box>
                                <VStack align="start" gap={0}>
                                    <Text color="fgMuted" fontSize="sm">Companies Unlocked</Text>
                                    <Heading size="xl">{stats.companiesUnlocked}</Heading>
                                </VStack>
                            </HStack>
                        </Card.Body>
                    </Card.Root>
                </SimpleGrid>

                {/* Features Grid */}
                <Box mt={8}>
                    <Heading size="xl" mb={6}>Quick Actions</Heading>
                    <SimpleGrid columns={{ base: 1, md: 3 }} gap={6}>
                        {features.map((feature) => (
                            <Link href={feature.link} key={feature.title} style={{ textDecoration: 'none' }}>
                                <Card.Root
                                    variant="outline"
                                    h="full"
                                    _hover={{
                                        borderColor: feature.color,
                                        transform: 'translateY(-4px)',
                                        boxShadow: 'md'
                                    }}
                                    transition="all 0.2s"
                                >
                                    <Card.Body p={6}>
                                        <VStack align="start" gap={4} h="full">
                                            <Box p={3} bg={`${feature.color.split('.')[0]}.50`} borderRadius="xl" color={feature.color}>
                                                <Icon as={feature.icon} boxSize={6} />
                                            </Box>
                                            <VStack align="start" gap={2} flex={1}>
                                                <Heading size="md">{feature.title}</Heading>
                                                <Text color="fgMuted" fontSize="sm">
                                                    {feature.description}
                                                </Text>
                                            </VStack>
                                            <Button width="full" variant="ghost" colorPalette={feature.color.split('.')[0]} justifyContent="space-between">
                                                {feature.cta} <FaArrowRight />
                                            </Button>
                                        </VStack>
                                    </Card.Body>
                                </Card.Root>
                            </Link>
                        ))}
                    </SimpleGrid>
                </Box>
            </VStack>
        </Container>
    );
}
