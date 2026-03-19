'use client';

import { Box, Button, Container, Flex, Heading, Text, SimpleGrid, Icon, VStack, HStack, Accordion, Separator, Avatar, Card } from '@chakra-ui/react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaRobot, FaCode, FaChartLine, FaArrowRight, FaTwitter, FaGithub, FaLinkedin, FaInstagram, FaCheckCircle } from 'react-icons/fa';
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
                                    <Button px={10} colorPalette="brand" borderRadius="full" fontWeight="bold">Go to Dashboard</Button>
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
                        <VStack gap={4} textAlign="center" maxW="2xl" mx="auto">
                            <Box color="brand.500" fontWeight="bold" fontSize="sm" letterSpacing="wide" textTransform="uppercase">Features</Box>
                            <Heading size="4xl">Everything you need to succeed</Heading>
                            <Text fontSize="xl" color="fgMuted">
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

            {/* How It Works Section */}
            <Box py={24} bg="bg">
                <Container maxW="container.xl" px={{ base: 4, md: 8 }} mx="auto">
                    <VStack gap={16}>
                        <VStack gap={4} textAlign="center" maxW="2xl" mx="auto">
                            <Box color="brand.500" fontWeight="bold" fontSize="sm" letterSpacing="wide" textTransform="uppercase">How It Works</Box>
                            <Heading size="4xl">Master your skills in 3 steps</Heading>
                        </VStack>

                        <SimpleGrid columns={{ base: 1, md: 3 }} gap={12}>
                            {[
                                {
                                    step: '01',
                                    title: 'Pick a Challenge',
                                    description: 'Choose from hundreds of real interview questions categorized by company, topic, and difficulty.'
                                },
                                {
                                    step: '02',
                                    title: 'Practice & Record',
                                    description: 'Code your solution in our editor or use the transcriber to practice your verbal explanation.'
                                },
                                {
                                    step: '03',
                                    title: 'Get AI Insights',
                                    description: 'Receive instant, actionable feedback on your code efficiency, correctness, and communication style.'
                                }
                            ].map((item, index) => (
                                <MotionBox
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: index * 0.1 } as any}
                                    position="relative"
                                >
                                    <VStack align="start" gap={4}>
                                        <Heading size="6xl" color="brand.100" position="absolute" top="-40px" left="-20px" zIndex={0} opacity={0.5}>
                                            {item.step}
                                        </Heading>
                                        <Box position="relative" zIndex={1}>
                                            <Heading size="xl" mb={2}>{item.title}</Heading>
                                            <Text color="fgMuted" fontSize="lg" lineHeight="tall">{item.description}</Text>
                                        </Box>
                                    </VStack>
                                </MotionBox>
                            ))}
                        </SimpleGrid>
                    </VStack>
                </Container>
            </Box>

            {/* Testimonials Section */}
            <Box bg="bgSub" py={24}>
                <Container maxW="container.xl" px={{ base: 4, md: 8 }} mx="auto">
                    <VStack gap={16}>
                        <VStack gap={4} textAlign="center" maxW="2xl" mx="auto">
                            <Box color="brand.500" fontWeight="bold" fontSize="sm" letterSpacing="wide" textTransform="uppercase">Testimonials</Box>
                            <Heading size="4xl">Loved by developers</Heading>
                        </VStack>

                        <SimpleGrid columns={{ base: 1, md: 3 }} gap={8}>
                            {[
                                {
                                    name: "Alex Chen",
                                    role: "Software Engineer at Google",
                                    content: "MockMate changed the game using AI. The feedback was specific and helped me optimize my solutions. Landed the offer!",
                                    avatar: "https://bit.ly/dan-abramov"
                                },
                                {
                                    name: "Sarah Jones",
                                    role: "Frontend Dev at Amazon",
                                    content: "The verbal practice with the transcriber was exactly what I needed. It built my confidence to speak while coding.",
                                    avatar: "https://bit.ly/sage-adebayo"
                                },
                                {
                                    name: "Michael Brown",
                                    role: "Full Stack at Meta",
                                    content: "I used to struggle with system design. The structured questions and AI hints really verified my understanding.",
                                    avatar: "https://bit.ly/kent-c-dodds"
                                }
                            ].map((testimonial, index) => (
                                <MotionBox
                                    key={index}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: index * 0.1 } as any}
                                >
                                    <Card.Root h="full" bg={"bg"} border="none" shadow="md">
                                        <Card.Body px={5} py={5} gap={4}>
                                            <Box mb={4}>
                                                {[1, 2, 3, 4, 5].map((s) => (
                                                    <Icon key={s} as={FaCheckCircle} color="brand.500" mr={1} boxSize={4} />
                                                ))}
                                            </Box>
                                            <Text fontSize="lg" fontStyle="italic" color="fg.muted" mb={6}>
                                                &quot;{testimonial.content}&quot;
                                            </Text>
                                            <HStack gap={4}>
                                                <Avatar.Root size="md">
                                                    <Avatar.Image src={testimonial.avatar} />
                                                    <Avatar.Fallback name={testimonial.name} />
                                                </Avatar.Root>
                                                <VStack align="start" gap={0}>
                                                    <Text fontWeight="bold">{testimonial.name}</Text>
                                                    <Text fontSize="sm" color="fgMuted">{testimonial.role}</Text>
                                                </VStack>
                                            </HStack>
                                        </Card.Body>
                                    </Card.Root>
                                </MotionBox>
                            ))}
                        </SimpleGrid>
                    </VStack>
                </Container>
            </Box>

            {/* FAQ Section */}
            <Box py={24} bg="bg">
                <Container maxW="container.md" px={{ base: 4, md: 8 }} mx="auto">
                    <VStack gap={10}>
                        <VStack gap={4} textAlign="center">
                            <Box color="brand.500" fontWeight="bold" fontSize="sm" letterSpacing="wide" textTransform="uppercase">FAQ</Box>
                            <Heading size="3xl">Common Questions</Heading>
                        </VStack>

                        <Accordion.Root collapsible variant="enclosed" w="full">
                            {[
                                {
                                    q: "Is MockMate free to use?",
                                    a: "Yes! You can access a wide range of questions and basic AI feedback for free. We also offer premium features for advanced analytics."
                                },
                                {
                                    q: "What programming languages are supported?",
                                    a: "We currently support JavaScript, Python, Java, C++, and TypeScript. We are constantly adding support for more languages."
                                },
                                {
                                    q: "How accurate is the AI feedback?",
                                    a: "Our AI is powered by Gemini 3.0 Flash, providing highly accurate and context-aware feedback on code correctness, efficiency, and style."
                                },
                                {
                                    q: "Can I use this for behavioral interviews?",
                                    a: "Absolutely! Our Transcriber tool allows you to record your answers to behavioral questions and get feedback on your delivery and content."
                                }
                            ].map((item, index) => (
                                <Accordion.Item key={index} value={item.q} mb={4} border="none" bg="bgSub" borderRadius="xl">
                                    <Accordion.ItemTrigger p={6} cursor="pointer">
                                        <Box flex="1" textAlign="left" fontWeight="bold" fontSize="lg">
                                            {item.q}
                                        </Box>
                                    </Accordion.ItemTrigger>
                                    <Accordion.ItemContent px={6} pb={6} color="fgMuted">
                                        {item.a}
                                    </Accordion.ItemContent>
                                </Accordion.Item>
                            ))}
                        </Accordion.Root>
                    </VStack>
                </Container>
            </Box>

            {/* Footer */}
            <Box py={16} bg="black" color="white">
                <Container maxW="container.xl" px={{ base: 4, md: 8 }} mx="auto">
                    <SimpleGrid columns={{ base: 1, md: 4 }} gap={12} mb={12}>
                        <VStack align="start" gap={6}>
                            <Heading size="lg" color="white" letterSpacing="tight">MockMate</Heading>
                            <Text color="gray.400" lineHeight="tall">
                                The ultimate AI-powered platform to help you ace your next technical interview. Practice, learn, and succeed.
                            </Text>
                            <HStack gap={4}>
                                <Icon as={FaTwitter} boxSize={5} color="gray.400" _hover={{ color: "white" }} cursor="pointer" />
                                <Icon as={FaGithub} boxSize={5} color="gray.400" _hover={{ color: "white" }} cursor="pointer" />
                                <Icon as={FaLinkedin} boxSize={5} color="gray.400" _hover={{ color: "white" }} cursor="pointer" />
                                <Icon as={FaInstagram} boxSize={5} color="gray.400" _hover={{ color: "white" }} cursor="pointer" />
                            </HStack>
                        </VStack>

                        <VStack align="start" gap={4}>
                            <Heading size="md" color="white">Product</Heading>
                            <Link href="/companies"><Text color="gray.400" _hover={{ color: "brand.300" }}>Companies</Text></Link>
                            <Link href="/transcriber"><Text color="gray.400" _hover={{ color: "brand.300" }}>Transcriber</Text></Link>
                            <Link href="/admission"><Text color="gray.400" _hover={{ color: "brand.300" }}>Admission Chances</Text></Link>
                            <Link href="#pricing"><Text color="gray.400" _hover={{ color: "brand.300" }}>Pricing</Text></Link>
                        </VStack>

                        <VStack align="start" gap={4}>
                            <Heading size="md" color="white">Resources</Heading>
                            <Link href="#blog"><Text color="gray.400" _hover={{ color: "brand.300" }}>Blog</Text></Link>
                            <Link href="#community"><Text color="gray.400" _hover={{ color: "brand.300" }}>Community</Text></Link>
                            <Link href="#help"><Text color="gray.400" _hover={{ color: "brand.300" }}>Help Center</Text></Link>
                        </VStack>

                        <VStack align="start" gap={4}>
                            <Heading size="md" color="white">Legal</Heading>
                            <Link href="#privacy"><Text color="gray.400" _hover={{ color: "brand.300" }}>Privacy Policy</Text></Link>
                            <Link href="#terms"><Text color="gray.400" _hover={{ color: "brand.300" }}>Terms of Service</Text></Link>
                        </VStack>
                    </SimpleGrid>

                    <Separator borderColor="gray.800" mb={8} />

                    <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" align="center" gap={4}>
                        <Text color="gray.500" fontSize="sm">
                            © {new Date().getFullYear()} MockMate Inc. All rights reserved.
                        </Text>
                        <Text color="gray.600" fontSize="xs">
                            Designed with ❤️ for developers.
                        </Text>
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
