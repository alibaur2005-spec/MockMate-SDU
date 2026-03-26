'use client';

import { Box, Button, Container, Flex, Heading, Text, SimpleGrid, Icon, VStack, HStack, Separator, Avatar } from '@chakra-ui/react';
import Link from 'next/link';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaRobot, FaChartLine, FaArrowRight, FaTwitter, FaGithub, FaLinkedin, FaMicrophone, FaStar, FaPlus } from 'react-icons/fa';
import { useAuth } from '@/lib/auth/hooks';

const MotionBox = motion(Box);

export default function Home() {
    const { user, loading } = useAuth();

    return (
        <Box minH="100vh" bg="#08080c" color="white" overflow="hidden">

            {/* ═══ Fixed atmospheric background ═══ */}
            <Box position="fixed" inset="0" pointerEvents="none" zIndex={0}>
                <Box
                    position="absolute"
                    top="-250px"
                    right="-150px"
                    w="800px"
                    h="800px"
                    borderRadius="full"
                    style={{ background: 'radial-gradient(circle, rgba(86,114,234,0.14) 0%, transparent 70%)' }}
                    filter="blur(80px)"
                />
                <Box
                    position="absolute"
                    bottom="-300px"
                    left="-200px"
                    w="700px"
                    h="700px"
                    borderRadius="full"
                    style={{ background: 'radial-gradient(circle, rgba(26,177,181,0.10) 0%, transparent 70%)' }}
                    filter="blur(90px)"
                />
                <Box
                    position="absolute"
                    top="40%"
                    left="50%"
                    w="500px"
                    h="500px"
                    borderRadius="full"
                    style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.06) 0%, transparent 70%)' }}
                    filter="blur(100px)"
                    transform="translateX(-50%)"
                />
                <Box
                    position="absolute"
                    inset="0"
                    opacity={0.4}
                    style={{
                        backgroundImage: 'radial-gradient(rgba(255,255,255,0.035) 1px, transparent 1px)',
                        backgroundSize: '30px 30px',
                    }}
                />
            </Box>

            {/* ═══ Navigation ═══ */}
            <Box
                as="nav"
                position="sticky"
                top="0"
                zIndex={50}
                style={{ background: 'rgba(8,8,12,0.75)' }}
                backdropFilter="blur(24px) saturate(1.4)"
                borderBottom="1px solid"
                borderColor="rgba(255,255,255,0.05)"
            >
                <Container maxW="1200px" mx="auto" px={{ base: 5, md: 8 }}>
                    <Flex h={{ base: '14', md: '16' }} align="center" justify="space-between">
                        <Heading
                            size="lg"
                            fontWeight="800"
                            letterSpacing="-0.03em"
                            style={{
                                background: 'linear-gradient(135deg, #5672ea 0%, #1ab1b5 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}
                        >
                            MockMate
                        </Heading>
                        <HStack gap={3}>
                            {!loading && (user ? (
                                <Link href="/dashboard">
                                    <Button size="sm" bg="white" color="#08080c" fontWeight="700" borderRadius="full" px={6} _hover={{ bg: 'gray.200' }}>
                                        Dashboard
                                    </Button>
                                </Link>
                            ) : (
                                <>
                                    <Link href="/login">
                                        <Button variant="ghost" color="gray.400" fontWeight="500" size="sm" _hover={{ color: 'white' }}>
                                            Sign In
                                        </Button>
                                    </Link>
                                    <Link href="/register">
                                        <Button size="sm" bg="white" color="#08080c" fontWeight="700" borderRadius="full" px={6} _hover={{ bg: 'gray.200' }}>
                                            Get Started
                                        </Button>
                                    </Link>
                                </>
                            ))}
                        </HStack>
                    </Flex>
                </Container>
            </Box>

            {/* ═══ Hero ═══ */}
            <Box position="relative" zIndex={1}>
                <Container maxW="1200px" mx="auto" px={{ base: 5, md: 8 }} pt={{ base: 16, md: 28 }} pb={{ base: 12, md: 20 }}>
                    <VStack gap={{ base: 7, md: 8 }} maxW="4xl" mx="auto" textAlign="center">
                        <MotionBox
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 } as any}
                        >
                            <HStack
                                display="inline-flex"
                                style={{ background: 'rgba(86,114,234,0.08)', border: '1px solid rgba(86,114,234,0.18)' }}
                                borderRadius="full"
                                px={4}
                                py={1.5}
                                gap={2}
                            >
                                <Box w="6px" h="6px" bg="#5672ea" borderRadius="full" />
                                <Text fontSize="xs" color="gray.400" fontWeight="600" letterSpacing="0.02em">
                                    AI-Powered Interview Preparation
                                </Text>
                            </HStack>
                        </MotionBox>

                        <MotionBox
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.1 } as any}
                        >
                            <Heading
                                fontSize={{ base: '5xl', md: '7xl', lg: '8xl' }}
                                fontWeight="800"
                                lineHeight="1.02"
                                letterSpacing="-0.04em"
                            >
                                Ace your next{' '}
                                <Box
                                    as="span"
                                    style={{
                                        background: 'linear-gradient(135deg, #5672ea 0%, #1ab1b5 100%)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                    }}
                                >
                                    technical interview
                                </Box>
                            </Heading>
                        </MotionBox>

                        <MotionBox
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.2 } as any}
                            maxW="2xl"
                        >
                            <Text fontSize={{ base: 'md', md: 'lg' }} color="gray.400" lineHeight="1.75">
                                Practice with real interview questions from top companies.
                                Get instant AI feedback on your code, communication, and problem-solving skills.
                            </Text>
                        </MotionBox>

                        <MotionBox
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.3 } as any}
                        >
                            <HStack gap={4} flexWrap="wrap" justify="center">
                                {!loading && (user ? (
                                    <Link href="/dashboard">
                                        <Button size="lg" bg="white" color="#08080c" borderRadius="full" px={8} fontWeight="700" _hover={{ bg: 'gray.200', transform: 'translateY(-2px)' }} transition="all 0.2s">
                                            Go to Dashboard <Icon as={FaArrowRight} ml={2} />
                                        </Button>
                                    </Link>
                                ) : (
                                    <>
                                        <Link href="/register">
                                            <Button size="lg" bg="white" color="#08080c" borderRadius="full" px={8} fontWeight="700" _hover={{ bg: 'gray.200', transform: 'translateY(-2px)' }} transition="all 0.2s">
                                                Start Free <Icon as={FaArrowRight} ml={2} />
                                            </Button>
                                        </Link>
                                        <Link href="/login">
                                            <Button
                                                size="lg"
                                                variant="outline"
                                                borderRadius="full"
                                                px={8}
                                                fontWeight="600"
                                                color="white"
                                                style={{ borderColor: 'rgba(255,255,255,0.14)' }}
                                                _hover={{ bg: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.25)' }}
                                            >
                                                View Demo
                                            </Button>
                                        </Link>
                                    </>
                                ))}
                            </HStack>
                        </MotionBox>

                        {/* ── Hero preview window ── */}
                        <MotionBox
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.9, delay: 0.45 } as any}
                            w="full"
                            mt={{ base: 6, md: 10 }}
                        >
                            <Box
                                position="relative"
                                style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}
                                borderRadius="2xl"
                                overflow="hidden"
                            >
                                <HStack px={5} py={3} style={{ background: 'rgba(255,255,255,0.015)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <HStack gap={2}>
                                        <Box w="10px" h="10px" borderRadius="full" bg="#ff5f57" />
                                        <Box w="10px" h="10px" borderRadius="full" bg="#febc2e" />
                                        <Box w="10px" h="10px" borderRadius="full" bg="#28c840" />
                                    </HStack>
                                    <Text fontSize="xs" color="gray.600" ml={4}>MockMate — Live Interview Session</Text>
                                </HStack>

                                <Box p={{ base: 4, md: 7 }}>
                                    <SimpleGrid columns={{ base: 1, md: 2 }} gap={5}>
                                        <Box style={{ background: 'rgba(86,114,234,0.06)', border: '1px solid rgba(86,114,234,0.12)' }} borderRadius="xl" p={5}>
                                            <HStack mb={3}>
                                                <Box w="7px" h="7px" bg="#5672ea" borderRadius="full" />
                                                <Text fontSize="xs" color="#7b98f2" fontWeight="700" letterSpacing="0.04em" textTransform="uppercase">AI Interviewer</Text>
                                            </HStack>
                                            <Text fontSize="sm" color="gray.400" lineHeight="1.75">
                                                &ldquo;Given an array of integers, find two numbers that add up to a specific target.
                                                Can you walk me through your approach before writing any code?&rdquo;
                                            </Text>
                                        </Box>

                                        <Box style={{ background: 'rgba(26,177,181,0.05)', border: '1px solid rgba(26,177,181,0.12)' }} borderRadius="xl" p={5}>
                                            <HStack mb={3}>
                                                <Box w="7px" h="7px" bg="#1ab1b5" borderRadius="full" />
                                                <Text fontSize="xs" color="#3dd3d6" fontWeight="700" letterSpacing="0.04em" textTransform="uppercase">Your Solution</Text>
                                            </HStack>
                                            <Text fontSize="xs" color="gray.500" fontFamily="monospace" whiteSpace="pre" lineHeight="1.9">
{`def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i`}
                                            </Text>
                                        </Box>
                                    </SimpleGrid>
                                </Box>

                                {/* Bottom glow */}
                                <Box
                                    position="absolute"
                                    bottom="-40%"
                                    left="50%"
                                    transform="translateX(-50%)"
                                    w="70%"
                                    h="200px"
                                    style={{ background: 'radial-gradient(ellipse, rgba(86,114,234,0.12), transparent 70%)' }}
                                    filter="blur(50px)"
                                    pointerEvents="none"
                                />
                            </Box>
                        </MotionBox>
                    </VStack>
                </Container>
            </Box>

            {/* ═══ Stats strip ═══ */}
            <Box
                position="relative"
                zIndex={1}
                py={{ base: 10, md: 14 }}
                borderTop="1px solid"
                borderBottom="1px solid"
                borderColor="rgba(255,255,255,0.05)"
            >
                <Container maxW="1200px" mx="auto" px={{ base: 5, md: 8 }}>
                    <SimpleGrid columns={{ base: 2, md: 4 }} gap={{ base: 8, md: 6 }}>
                        {[
                            { value: '10k+', label: 'Active Users' },
                            { value: '50k+', label: 'Interviews Done' },
                            { value: '200+', label: 'Company Questions' },
                            { value: '4.9/5', label: 'User Rating' },
                        ].map((stat, i) => (
                            <MotionBox
                                key={i}
                                textAlign="center"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: i * 0.08 } as any}
                            >
                                <Heading
                                    fontSize={{ base: '3xl', md: '4xl' }}
                                    fontWeight="800"
                                    letterSpacing="-0.03em"
                                    style={{
                                        background: 'linear-gradient(180deg, #fff 30%, rgba(255,255,255,0.5) 100%)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                    }}
                                >
                                    {stat.value}
                                </Heading>
                                <Text fontSize="xs" color="gray.500" mt={1} fontWeight="500">{stat.label}</Text>
                            </MotionBox>
                        ))}
                    </SimpleGrid>
                </Container>
            </Box>

            {/* ═══ Features ═══ */}
            <Box position="relative" zIndex={1} py={{ base: 20, md: 28 }}>
                <Container maxW="1200px" mx="auto" px={{ base: 5, md: 8 }}>
                    <VStack gap={{ base: 12, md: 16 }}>
                        <VStack gap={4} textAlign="center" maxW="2xl" mx="auto">
                            <MotionBox initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
                                <Text fontSize="xs" fontWeight="700" color="#5672ea" letterSpacing="0.14em" textTransform="uppercase">
                                    Features
                                </Text>
                            </MotionBox>
                            <MotionBox initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 } as any}>
                                <Heading fontSize={{ base: '3xl', md: '4xl' }} fontWeight="800" letterSpacing="-0.03em">
                                    Everything you need to succeed
                                </Heading>
                            </MotionBox>
                            <MotionBox initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.15 } as any}>
                                <Text color="gray.500" fontSize="md" maxW="lg" mx="auto">
                                    A complete toolkit designed to turn practice into real offers.
                                </Text>
                            </MotionBox>
                        </VStack>

                        <SimpleGrid columns={{ base: 1, md: 3 }} gap={5} w="full">
                            {[
                                {
                                    icon: FaRobot,
                                    title: 'AI-Powered Feedback',
                                    description: 'Get detailed, instant feedback on code quality, time complexity, and communication from Gemini AI.',
                                    tint: '86,114,234',
                                },
                                {
                                    icon: FaMicrophone,
                                    title: 'Live Voice Interviews',
                                    description: 'Real-time voice conversations with our AI interviewer. Practice thinking aloud, just like the real deal.',
                                    tint: '26,177,181',
                                },
                                {
                                    icon: FaChartLine,
                                    title: 'Track Your Progress',
                                    description: 'Visualize improvement over time with analytics, admission predictions, and performance scoring.',
                                    tint: '168,85,247',
                                },
                            ].map((f, i) => (
                                <MotionBox
                                    key={i}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: i * 0.12 } as any}
                                    whileHover={{ y: -6 }}
                                >
                                    <Box
                                        h="full"
                                        p={{ base: 6, md: 8 }}
                                        borderRadius="2xl"
                                        position="relative"
                                        overflow="hidden"
                                        style={{
                                            background: `linear-gradient(160deg, rgba(${f.tint},0.10) 0%, rgba(${f.tint},0.02) 100%)`,
                                            border: `1px solid rgba(${f.tint},0.14)`,
                                        }}
                                    >
                                        <Box
                                            w={11}
                                            h={11}
                                            display="flex"
                                            alignItems="center"
                                            justifyContent="center"
                                            borderRadius="xl"
                                            mb={5}
                                            style={{
                                                background: `rgba(${f.tint},0.12)`,
                                                border: `1px solid rgba(${f.tint},0.18)`,
                                            }}
                                        >
                                            <Icon as={f.icon} fontSize="lg" style={{ color: `rgba(${f.tint},1)` }} />
                                        </Box>
                                        <Heading size="md" fontWeight="700" mb={3}>{f.title}</Heading>
                                        <Text color="gray.400" fontSize="sm" lineHeight="1.75">{f.description}</Text>
                                    </Box>
                                </MotionBox>
                            ))}
                        </SimpleGrid>
                    </VStack>
                </Container>
            </Box>

            {/* ═══ How It Works ═══ */}
            <Box position="relative" zIndex={1} py={{ base: 20, md: 28 }} style={{ background: 'rgba(255,255,255,0.012)' }}>
                <Container maxW="1200px" mx="auto" px={{ base: 5, md: 8 }}>
                    <VStack gap={{ base: 12, md: 16 }}>
                        <VStack gap={4} textAlign="center" maxW="2xl" mx="auto">
                            <MotionBox initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
                                <Text fontSize="xs" fontWeight="700" color="#1ab1b5" letterSpacing="0.14em" textTransform="uppercase">
                                    How It Works
                                </Text>
                            </MotionBox>
                            <MotionBox initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 } as any}>
                                <Heading fontSize={{ base: '3xl', md: '4xl' }} fontWeight="800" letterSpacing="-0.03em">
                                    Three steps to interview mastery
                                </Heading>
                            </MotionBox>
                        </VStack>

                        <SimpleGrid columns={{ base: 1, md: 3 }} gap={{ base: 10, md: 8 }} w="full">
                            {[
                                { step: '01', title: 'Choose Your Challenge', description: 'Pick from real interview questions categorized by company, topic, and difficulty level.' },
                                { step: '02', title: 'Solve & Speak', description: 'Code your solution or join a live AI voice interview. Practice explaining your thought process aloud.' },
                                { step: '03', title: 'Get AI Insights', description: 'Receive detailed, actionable feedback on correctness, efficiency, and communication style.' },
                            ].map((item, i) => (
                                <MotionBox
                                    key={i}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: i * 0.12 } as any}
                                >
                                    <VStack align="start" gap={4}>
                                        <Text
                                            fontSize={{ base: '5xl', md: '6xl' }}
                                            fontWeight="900"
                                            lineHeight="1"
                                            style={{
                                                background: 'linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.02) 100%)',
                                                WebkitBackgroundClip: 'text',
                                                WebkitTextFillColor: 'transparent',
                                            }}
                                        >
                                            {item.step}
                                        </Text>
                                        <Heading size="lg" fontWeight="700">{item.title}</Heading>
                                        <Text color="gray.400" lineHeight="1.75" fontSize="sm">{item.description}</Text>
                                    </VStack>
                                </MotionBox>
                            ))}
                        </SimpleGrid>
                    </VStack>
                </Container>
            </Box>

            {/* ═══ Testimonials ═══ */}
            <Box position="relative" zIndex={1} py={{ base: 20, md: 28 }}>
                <Container maxW="1200px" mx="auto" px={{ base: 5, md: 8 }}>
                    <VStack gap={{ base: 12, md: 16 }}>
                        <VStack gap={4} textAlign="center" maxW="2xl" mx="auto">
                            <MotionBox initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
                                <Text fontSize="xs" fontWeight="700" color="#a855f7" letterSpacing="0.14em" textTransform="uppercase">
                                    Testimonials
                                </Text>
                            </MotionBox>
                            <MotionBox initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 } as any}>
                                <Heading fontSize={{ base: '3xl', md: '4xl' }} fontWeight="800" letterSpacing="-0.03em">
                                    Trusted by developers worldwide
                                </Heading>
                            </MotionBox>
                        </VStack>

                        <SimpleGrid columns={{ base: 1, md: 3 }} gap={5} w="full">
                            {[
                                {
                                    name: 'Alex Chen',
                                    role: 'Software Engineer at Google',
                                    content: "MockMate's AI feedback was incredibly specific and helped me optimize my solutions. The live interview feature built my confidence. Landed the offer!",
                                    avatar: 'https://bit.ly/dan-abramov',
                                },
                                {
                                    name: 'Sarah Jones',
                                    role: 'Frontend Dev at Amazon',
                                    content: 'The voice interview practice was a game-changer. Being able to practice explaining my approach while coding — exactly what real interviews demand.',
                                    avatar: 'https://bit.ly/sage-adebayo',
                                },
                                {
                                    name: 'Michael Brown',
                                    role: 'Full Stack at Meta',
                                    content: 'I went from failing system design rounds to acing them. The structured questions and detailed AI analysis really pinpointed my weak areas.',
                                    avatar: 'https://bit.ly/kent-c-dodds',
                                },
                            ].map((t, i) => (
                                <MotionBox
                                    key={i}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: i * 0.12 } as any}
                                >
                                    <Box
                                        h="full"
                                        p={{ base: 6, md: 7 }}
                                        borderRadius="2xl"
                                        style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}
                                    >
                                        <VStack align="start" gap={5} h="full">
                                            <HStack gap={1}>
                                                {[1, 2, 3, 4, 5].map(s => (
                                                    <Icon key={s} as={FaStar} color="#f59e0b" boxSize={3} />
                                                ))}
                                            </HStack>
                                            <Text color="gray.300" fontSize="sm" lineHeight="1.8" flex="1">
                                                &ldquo;{t.content}&rdquo;
                                            </Text>
                                            <HStack gap={3} pt={2}>
                                                <Avatar.Root size="sm">
                                                    <Avatar.Image src={t.avatar} />
                                                    <Avatar.Fallback name={t.name} />
                                                </Avatar.Root>
                                                <VStack align="start" gap={0}>
                                                    <Text fontSize="sm" fontWeight="600">{t.name}</Text>
                                                    <Text fontSize="xs" color="gray.500">{t.role}</Text>
                                                </VStack>
                                            </HStack>
                                        </VStack>
                                    </Box>
                                </MotionBox>
                            ))}
                        </SimpleGrid>
                    </VStack>
                </Container>
            </Box>

            {/* ═══ FAQ ═══ */}
            <Box position="relative" zIndex={1} py={{ base: 20, md: 28 }} style={{ background: 'rgba(255,255,255,0.012)' }}>
                <Container maxW="800px" mx="auto" px={{ base: 5, md: 8 }}>
                    <VStack gap={{ base: 10, md: 12 }}>
                        <VStack gap={4} textAlign="center">
                            <MotionBox initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
                                <Text fontSize="xs" fontWeight="700" color="#5672ea" letterSpacing="0.14em" textTransform="uppercase">
                                    FAQ
                                </Text>
                            </MotionBox>
                            <MotionBox initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 } as any}>
                                <Heading fontSize={{ base: '3xl', md: '4xl' }} fontWeight="800" letterSpacing="-0.03em">
                                    Common questions
                                </Heading>
                            </MotionBox>
                        </VStack>

                        <VStack w="full" gap={3}>
                            {[
                                { q: 'Is MockMate free to use?', a: 'Yes! You can access a wide range of questions and AI feedback for free. Premium features with advanced analytics are also available.' },
                                { q: 'What programming languages are supported?', a: 'We support JavaScript, Python, Java, C++, and TypeScript. More languages are constantly being added.' },
                                { q: 'How accurate is the AI feedback?', a: "Our AI is powered by Google's Gemini, providing highly accurate and context-aware feedback on code correctness, efficiency, and style." },
                                { q: 'Can I practice behavioral interviews?', a: 'Absolutely! Our live voice interview and transcriber tools let you practice and get feedback on behavioral questions too.' },
                            ].map((item, i) => (
                                <FAQItem key={i} q={item.q} a={item.a} />
                            ))}
                        </VStack>
                    </VStack>
                </Container>
            </Box>

            {/* ═══ Final CTA ═══ */}
            <Box position="relative" zIndex={1} py={{ base: 16, md: 24 }}>
                <Container maxW="1200px" mx="auto" px={{ base: 5, md: 8 }}>
                    <MotionBox
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 } as any}
                    >
                        <Box
                            position="relative"
                            borderRadius="3xl"
                            overflow="hidden"
                            p={{ base: 10, md: 16 }}
                            textAlign="center"
                            style={{
                                background: 'rgba(86,114,234,0.07)',
                                border: '1px solid rgba(86,114,234,0.14)',
                            }}
                        >
                            <Box
                                position="absolute"
                                top="50%"
                                left="50%"
                                transform="translate(-50%, -50%)"
                                w="450px"
                                h="450px"
                                borderRadius="full"
                                style={{ background: 'radial-gradient(circle, rgba(86,114,234,0.18), transparent 70%)' }}
                                filter="blur(70px)"
                                pointerEvents="none"
                            />
                            <VStack gap={6} position="relative">
                                <Heading fontSize={{ base: '3xl', md: '5xl' }} fontWeight="800" letterSpacing="-0.03em">
                                    Ready to land your dream job?
                                </Heading>
                                <Text color="gray.400" fontSize={{ base: 'sm', md: 'md' }} maxW="lg" mx="auto">
                                    Join thousands of developers who improved their interview skills with MockMate.
                                </Text>
                                <Link href={user ? '/dashboard' : '/register'}>
                                    <Button
                                        size="lg"
                                        bg="white"
                                        color="#08080c"
                                        borderRadius="full"
                                        px={8}
                                        fontWeight="700"
                                        _hover={{ bg: 'gray.200', transform: 'translateY(-2px)' }}
                                        transition="all 0.2s"
                                        mt={2}
                                    >
                                        Get Started Free <Icon as={FaArrowRight} ml={2} />
                                    </Button>
                                </Link>
                            </VStack>
                        </Box>
                    </MotionBox>
                </Container>
            </Box>

            {/* ═══ Footer ═══ */}
            <Box
                position="relative"
                zIndex={1}
                borderTop="1px solid"
                borderColor="rgba(255,255,255,0.05)"
                py={{ base: 12, md: 16 }}
            >
                <Container maxW="1200px" mx="auto" px={{ base: 5, md: 8 }}>
                    <SimpleGrid columns={{ base: 2, md: 4 }} gap={{ base: 8, md: 12 }} mb={12}>
                        <VStack align="start" gap={4} gridColumn={{ base: '1 / -1', md: 'auto' }}>
                            <Heading
                                size="lg"
                                fontWeight="800"
                                style={{
                                    background: 'linear-gradient(135deg, #5672ea, #1ab1b5)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                }}
                            >
                                MockMate
                            </Heading>
                            <Text color="gray.500" fontSize="sm" lineHeight="1.7" maxW="xs">
                                The AI-powered platform to help you ace your next technical interview.
                            </Text>
                            <HStack gap={2}>
                                {[FaTwitter, FaGithub, FaLinkedin].map((SocialIcon, i) => (
                                    <Box
                                        key={i}
                                        as="button"
                                        w={8}
                                        h={8}
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                        borderRadius="lg"
                                        style={{ background: 'rgba(255,255,255,0.04)' }}
                                        color="gray.500"
                                        _hover={{ bg: 'rgba(255,255,255,0.08)', color: 'white' }}
                                        transition="all 0.2s"
                                    >
                                        <Icon as={SocialIcon} boxSize={3.5} />
                                    </Box>
                                ))}
                            </HStack>
                        </VStack>

                        {[
                            { heading: 'Product', links: [{ label: 'Companies', href: '/companies' }, { label: 'Transcriber', href: '/transcriber' }, { label: 'Admission Chances', href: '/admission' }] },
                            { heading: 'Resources', links: [{ label: 'Blog', href: '#' }, { label: 'Community', href: '#' }, { label: 'Help Center', href: '#' }] },
                            { heading: 'Legal', links: [{ label: 'Privacy Policy', href: '#' }, { label: 'Terms of Service', href: '#' }] },
                        ].map((col, ci) => (
                            <VStack key={ci} align="start" gap={3}>
                                <Text fontWeight="600" fontSize="xs" color="gray.300" letterSpacing="0.04em" mb={1}>{col.heading}</Text>
                                {col.links.map((link, li) => (
                                    <Link key={li} href={link.href}>
                                        <Text color="gray.500" fontSize="sm" _hover={{ color: 'white' }} transition="color 0.2s">{link.label}</Text>
                                    </Link>
                                ))}
                            </VStack>
                        ))}
                    </SimpleGrid>

                    <Separator borderColor="rgba(255,255,255,0.05)" mb={6} />

                    <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" align="center" gap={3}>
                        <Text color="gray.600" fontSize="xs">&copy; {new Date().getFullYear()} MockMate. All rights reserved.</Text>
                        <Text color="gray.700" fontSize="xs">Built for developers, powered by AI.</Text>
                    </Flex>
                </Container>
            </Box>
        </Box>
    );
}

const MotionDiv = motion.div;

function FAQItem({ q, a }: { q: string; a: string }) {
    const [open, setOpen] = useState(false);
    return (
        <Box w="full" borderRadius="xl" overflow="hidden" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <HStack
                as="button"
                w="full"
                p={5}
                cursor="pointer"
                onClick={() => setOpen(!open)}
                justify="space-between"
                _hover={{ bg: 'rgba(255,255,255,0.02)' }}
                transition="background 0.15s"
            >
                <Text flex="1" textAlign="left" fontWeight="600" fontSize="sm" color="gray.200">{q}</Text>
                <MotionDiv animate={{ rotate: open ? 45 : 0 }} transition={{ duration: 0.2 }} style={{ flexShrink: 0, marginLeft: '12px' }}>
                    <FaPlus color="rgba(255,255,255,0.25)" size={11} />
                </MotionDiv>
            </HStack>
            <AnimatePresence initial={false}>
                {open && (
                    <MotionDiv
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ height: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }, opacity: { duration: 0.2 } }}
                        style={{ overflow: 'hidden' }}
                    >
                        <Box px={5} pb={5} color="gray.400" fontSize="sm" lineHeight="1.7">{a}</Box>
                    </MotionDiv>
                )}
            </AnimatePresence>
        </Box>
    );
}
