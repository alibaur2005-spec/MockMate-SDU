'use client';

import { Box, Button, Container, Flex, Heading, Text, SimpleGrid, Icon, VStack, HStack } from '@chakra-ui/react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaRobot, FaCode, FaChartLine, FaArrowRight } from 'react-icons/fa';
import { useAuth } from '@/lib/auth/hooks';
import { useRouter } from 'next/navigation';

const MotionBox = motion(Box);
const MotionContainer = motion(Container);

export default function Home() {
    const { user, loading } = useAuth();
    const router = useRouter();
    return (
        <Box minH="100vh" bg="bg">
            {/* Navigation */}
            <Box as="nav" position="sticky" top="0" zIndex="sticky" bg="bg/80" backdropFilter="blur(10px)" borderBottom="1px solid" borderColor="border">
                <Container maxW="container.xl" px={{ base: 4, md: 8 }} mx="auto">
                    <Flex h="16" align="center" justify="space-between">
                        <Heading size="lg" color="blue.600" letterSpacing="tight">MockMate</Heading>
                        <HStack gap={4}>
                            {loading ? (
                                <Button variant="ghost" disabled>Loading...</Button>
                            ) : user ? (
                                <Link href="/dashboard">
                                    <Button colorPalette="brand" borderRadius="full" fontWeight="bold">Go to Dashboard</Button>
                                </Link>
                            ) : (
                                <>
                                    <Link href="/login">
                                        <Button variant="ghost" fontWeight="medium">Sign In</Button>
                                    </Link>
                                    <Link href="/register">
                                        <Button colorPalette="brand" borderRadius="full" fontWeight="bold">Get Started</Button>
                                    </Link>
                                </>
                            )}
                        </HStack>
                    </Flex>
                </Container>
            </Box>

            {/* Hero Section */}
            <Container maxW="container.xl" py={{ base: 20, md: 32 }} px={{ base: 4, md: 8 }} mx="auto">
                <VStack gap={8} textAlign="center" maxW="3xl" mx="auto">
                    <MotionBox
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 } as any}
                    >
                        <Box
                            bg="brand.50"
                            color="brand.700"
                            px={4}
                            py={1}
                            borderRadius="full"
                            fontSize="sm"
                            fontWeight="bold"
                            display="inline-block"
                            mb={4}
                        >
                            🚀 AI-Powered Interview Prep
                        </Box>
                        <Heading size="6xl" fontWeight="bold" letterSpacing="tight" lineHeight="1.1">
                            Master Your Next <br />
                            <Box as="span" color="brand.500" bgClip="text" bgGradient="linear(to-r, brand.500, accent.500)">
                                Technical Interview
                            </Box>
                        </Heading>
                    </MotionBox>

                    <MotionBox
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 } as any}
                    >
                        <Text fontSize="xl" color="fgMuted" lineHeight="tall">
                            Practice with real-world coding questions, get instant AI feedback, and track your progress to land your dream job at top tech companies.
                        </Text>
                    </MotionBox>

                    <MotionBox
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 } as any}
                    >
                        <HStack gap={4} justify="center">
                            {loading ? (
                                <Button size="xl" variant="ghost" disabled>Loading...</Button>
                            ) : user ? (
                                <Link href="/dashboard">
                                    <Button size="xl" colorPalette="brand" borderRadius="full" px={8} fontSize="lg">
                                        Go to Dashboard <Icon as={FaArrowRight} ml={2} />
                                    </Button>
                                </Link>
                            ) : (
                                <>
                                    <Link href="/register">
                                        <Button size="xl" colorPalette="brand" borderRadius="full" px={8} fontSize="lg">
                                            Start Practicing <Icon as={FaArrowRight} ml={2} />
                                        </Button>
                                    </Link>
                                    <Link href="/login">
                                        <Button size="xl" variant="outline" borderRadius="full" px={8} fontSize="lg">
                                            View Demo
                                        </Button>
                                    </Link>
                                </>
                            )}
                        </HStack>
                    </MotionBox>
                </VStack>
            </Container>

            {/* Features Section */}
            <Box bg="bgSub" py={24}>
                <Container maxW="container.xl" px={{ base: 4, md: 8 }} mx="auto">
                    <VStack gap={16}>
                        <VStack gap={4} textAlign="center" maxW="2xl">
                            <Heading size="3xl">Everything you need to succeed</Heading>
                            <Text fontSize="lg" color="fgMuted">
                                Our platform provides comprehensive tools to help you identify weaknesses and improve your coding skills.
                            </Text>
                        </VStack>

                        <SimpleGrid columns={{ base: 1, md: 3 }} gap={8} width="100%">
                            <FeatureCard
                                icon={FaRobot}
                                title="AI Feedback"
                                description="Get instant, detailed feedback on your code quality, optimization, and edge cases from our advanced AI."
                                delay={0.1}
                            />
                            <FeatureCard
                                icon={FaCode}
                                title="Real Scenarios"
                                description="Practice with questions curated from actual interviews at top tech companies like Google, Amazon, and Meta."
                                delay={0.2}
                            />
                            <FeatureCard
                                icon={FaChartLine}
                                title="Progress Tracking"
                                description="Visualize your improvement over time with detailed analytics and performance metrics."
                                delay={0.3}
                            />
                        </SimpleGrid>
                    </VStack>
                </Container>
            </Box>

            {/* Footer */}
            <Box borderTop="1px solid" borderColor="border" py={12} bg="bg">
                <Container maxW="container.xl" px={{ base: 4, md: 8 }} mx="auto">
                    <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" align="center" gap={6}>
                        <Heading size="md" color="brand.600">MockMate</Heading>
                        <Text color="fgMuted" fontSize="sm">
                            © {new Date().getFullYear()} MockMate. All rights reserved.
                        </Text>
                        <HStack gap={6}>
                            <Link href="#"><Text fontSize="sm" color="fgMuted" _hover={{ color: 'brand.500' }}>Privacy</Text></Link>
                            <Link href="#"><Text fontSize="sm" color="fgMuted" _hover={{ color: 'brand.500' }}>Terms</Text></Link>
                            <Link href="#"><Text fontSize="sm" color="fgMuted" _hover={{ color: 'brand.500' }}>Contact</Text></Link>
                        </HStack>
                    </Flex>
                </Container>
            </Box>
        </Box>
    );
}

function FeatureCard({ icon, title, description, delay }: { icon: any, title: string, description: string, delay: number }) {
    return (
        <MotionBox
            bg="bg"
            p={8}
            borderRadius="2xl"
            border="1px solid"
            borderColor="border"
            boxShadow="sm"
            whileHover={{ y: -5, boxShadow: 'md' }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay } as any}
        >
            <Box
                bg="brand.50"
                color="brand.600"
                w={12}
                h={12}
                display="flex"
                alignItems="center"
                justifyContent="center"
                borderRadius="xl"
                mb={6}
            >
                <Icon as={icon} fontSize="xl" />
            </Box>
            <Heading size="lg" mb={4}>{title}</Heading>
            <Text color="fgMuted" lineHeight="tall">{description}</Text>
        </MotionBox>
    );
}
