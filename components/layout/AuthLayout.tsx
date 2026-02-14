'use client';

import { Box, Flex, Heading, Text, VStack, Container } from '@chakra-ui/react';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

export default function AuthLayout({ children, title, subtitle }: { children: React.ReactNode; title: string; subtitle: string }) {
    return (
        <Flex minH="100vh" direction={{ base: 'column', md: 'row' }}>
            {/* Left Side - Hero/Branding */}
            <Box
                flex={{ base: '0', md: '1' }}
                bg="brand.600"
                position="relative"
                overflow="hidden"
                display={{ base: 'none', md: 'flex' }}
                alignItems="center"
                justifyContent="center"
            >
                <Box
                    position="absolute"
                    top="0"
                    left="0"
                    right="0"
                    bottom="0"
                    bgGradient="linear-to-br from-brand.600 to-purple.700"
                    opacity="0.9"
                />

                {/* Animated Background Elements */}
                <MotionBox
                    position="absolute"
                    top="20%"
                    left="20%"
                    width="300px"
                    height="300px"
                    bg="whiteAlpha.100"
                    borderRadius="full"
                    animate={{
                        y: [0, -20, 0],
                        scale: [1, 1.1, 1],
                    }}
                    transition={{
                        duration: 5,
                        repeat: Infinity,
                        ease: "easeInOut"
                    } as any}
                />
                <MotionBox
                    position="absolute"
                    bottom="10%"
                    right="10%"
                    width="200px"
                    height="200px"
                    bg="accent.400"
                    filter="blur(60px)"
                    borderRadius="full"
                    animate={{
                        y: [0, 30, 0],
                        opacity: [0.4, 0.6, 0.4],
                    }}
                    transition={{
                        duration: 7,
                        repeat: Infinity,
                        ease: "easeInOut"
                    } as any}
                />

                <VStack position="relative" zIndex="1" color="white" textAlign="center" p={8} gap={6} maxW="500px">
                    <Heading size="4xl" fontWeight="bold" letterSpacing="tight">
                        Master Your Technical Interview
                    </Heading>
                    <Text fontSize="xl" opacity="0.9">
                        Join thousands of developers preparing for their dream jobs with AI-powered feedback and real-world scenarios.
                    </Text>
                </VStack>
            </Box>

            {/* Right Side - Form */}
            <Flex
                flex="1"
                align="center"
                justify="center"
                bg="bgSub"
                p={{ base: 4, md: 8 }}
            >
                <Container maxW="md">
                    <VStack gap={8} align="stretch">
                        <VStack gap={2} textAlign="center" mb={4}>
                            <Heading size="2xl" color="fg">{title}</Heading>
                            <Text color="fgMuted" fontSize="lg">{subtitle}</Text>
                        </VStack>

                        <Box bg="bg" p={8} borderRadius="2xl" boxShadow="lg" border="1px solid" borderColor="border">
                            {children}
                        </Box>
                    </VStack>
                </Container>
            </Flex>
        </Flex>
    );
}
