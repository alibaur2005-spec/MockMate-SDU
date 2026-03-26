'use client';

import { Box, Flex, Heading, Text, VStack, Container } from '@chakra-ui/react';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

export default function AuthLayout({ children, title, subtitle }: { children: React.ReactNode; title: string; subtitle: string }) {
    return (
        <Flex minH="100vh" direction={{ base: 'column', md: 'row' }} bg="#08080c">
            {/* Left — Branding panel */}
            <Box
                flex={{ base: '0', md: '1' }}
                position="relative"
                overflow="hidden"
                display={{ base: 'none', md: 'flex' }}
                alignItems="center"
                justifyContent="center"
                style={{ background: 'linear-gradient(135deg, #0a0e1a 0%, #08080c 100%)' }}
            >
                {/* Gradient orbs */}
                <MotionBox
                    position="absolute"
                    top="15%"
                    left="20%"
                    w="350px"
                    h="350px"
                    borderRadius="full"
                    style={{ background: 'radial-gradient(circle, rgba(86,114,234,0.18), transparent 70%)' }}
                    filter="blur(60px)"
                    animate={{ y: [0, -25, 0], scale: [1, 1.08, 1] }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' } as any}
                />
                <MotionBox
                    position="absolute"
                    bottom="10%"
                    right="15%"
                    w="250px"
                    h="250px"
                    borderRadius="full"
                    style={{ background: 'radial-gradient(circle, rgba(26,177,181,0.15), transparent 70%)' }}
                    filter="blur(50px)"
                    animate={{ y: [0, 20, 0], opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' } as any}
                />

                {/* Dot grid */}
                <Box
                    position="absolute"
                    inset="0"
                    opacity={0.3}
                    style={{
                        backgroundImage: 'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)',
                        backgroundSize: '28px 28px',
                    }}
                />

                <VStack position="relative" zIndex={1} textAlign="center" p={10} gap={6} maxW="480px">
                    <Heading
                        fontSize="5xl"
                        fontWeight="800"
                        letterSpacing="-0.04em"
                        lineHeight="1.05"
                    >
                        Master Your{' '}
                        <Box
                            as="span"
                            style={{
                                background: 'linear-gradient(135deg, #5672ea, #1ab1b5)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}
                        >
                            Technical Interview
                        </Box>
                    </Heading>
                    <Text fontSize="md" color="gray.500" lineHeight="1.7">
                        Join thousands of developers preparing for their dream jobs with AI-powered feedback and real-world scenarios.
                    </Text>
                </VStack>
            </Box>

            {/* Right — Form */}
            <Flex flex="1" align="center" justify="center" p={{ base: 5, md: 8 }} position="relative">
                {/* Subtle orb behind form on mobile */}
                <Box
                    position="absolute"
                    top="30%"
                    left="50%"
                    transform="translateX(-50%)"
                    w="400px"
                    h="400px"
                    borderRadius="full"
                    style={{ background: 'radial-gradient(circle, rgba(86,114,234,0.06), transparent 70%)' }}
                    filter="blur(80px)"
                    pointerEvents="none"
                />

                <Container maxW="md" position="relative">
                    <VStack gap={8} align="stretch">
                        {/* Mobile logo */}
                        <Heading
                            display={{ base: 'block', md: 'none' }}
                            textAlign="center"
                            fontWeight="800"
                            mb={2}
                            style={{
                                background: 'linear-gradient(135deg, #5672ea, #1ab1b5)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}
                        >
                            MockMate
                        </Heading>

                        <VStack gap={2} textAlign="center" mb={2}>
                            <Heading size="2xl" fontWeight="800" letterSpacing="-0.02em">{title}</Heading>
                            <Text color="gray.500" fontSize="sm">{subtitle}</Text>
                        </VStack>

                        <Box
                            p={8}
                            borderRadius="2xl"
                            style={{
                                background: 'rgba(255,255,255,0.025)',
                                border: '1px solid rgba(255,255,255,0.06)',
                            }}
                        >
                            {children}
                        </Box>
                    </VStack>
                </Container>
            </Flex>
        </Flex>
    );
}
