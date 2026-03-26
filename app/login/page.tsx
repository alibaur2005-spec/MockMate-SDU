'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Button, Field, Input, VStack, Text } from '@chakra-ui/react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { toaster } from '@/components/ui/toaster';
import AuthLayout from '@/components/layout/AuthLayout';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            toaster.create({ title: 'Login successful', type: 'success' });
            router.push('/profile');
        } catch (error: any) {
            toaster.create({ title: 'Login failed', description: error.message, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout title="Welcome Back" subtitle="Enter your credentials to access your account">
            <Box as="form" onSubmit={handleLogin} width="100%">
                <VStack gap={5}>
                    <Field.Root required>
                        <Field.Label fontWeight="500" fontSize="sm" color="gray.300">Email</Field.Label>
                        <Input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your@email.com"
                            size="lg"
                            borderRadius="xl"
                            px={4}
                            bg="rgba(255,255,255,0.03)"
                            borderColor="rgba(255,255,255,0.08)"
                            color="white"
                            _hover={{ borderColor: 'rgba(255,255,255,0.15)' }}
                            _focus={{ borderColor: '#5672ea', boxShadow: '0 0 0 1px #5672ea' }}
                            _placeholder={{ color: 'gray.600' }}
                        />
                    </Field.Root>

                    <Field.Root required>
                        <Field.Label fontWeight="500" fontSize="sm" color="gray.300">Password</Field.Label>
                        <Input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Your password"
                            size="lg"
                            borderRadius="xl"
                            px={4}
                            bg="rgba(255,255,255,0.03)"
                            borderColor="rgba(255,255,255,0.08)"
                            color="white"
                            _hover={{ borderColor: 'rgba(255,255,255,0.15)' }}
                            _focus={{ borderColor: '#5672ea', boxShadow: '0 0 0 1px #5672ea' }}
                            _placeholder={{ color: 'gray.600' }}
                        />
                    </Field.Root>

                    <Button
                        type="submit"
                        size="lg"
                        width="100%"
                        loading={loading}
                        borderRadius="xl"
                        fontWeight="700"
                        px={6}
                        bg="white"
                        color="#08080c"
                        _hover={{ bg: 'gray.200' }}
                    >
                        Sign In
                    </Button>

                    <Text fontSize="sm" color="gray.500">
                        Don&apos;t have an account?{' '}
                        <Link href="/register" style={{ color: '#5672ea', fontWeight: 600 }}>
                            Sign up
                        </Link>
                    </Text>
                </VStack>
            </Box>
        </AuthLayout>
    );
}
