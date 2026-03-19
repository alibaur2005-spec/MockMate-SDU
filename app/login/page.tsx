'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Box,
    Button,
    Field,
    Input,
    VStack,
    Text,
} from '@chakra-ui/react';
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
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            toaster.create({
                title: 'Login successful',
                type: 'success',
            });

            router.push('/profile');
        } catch (error: any) {
            toaster.create({
                title: 'Login failed',
                description: error.message,
                type: 'error',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Welcome Back"
            subtitle="Enter your credentials to access your account"
        >
            <Box as="form" onSubmit={handleLogin} width="100%">
                <VStack gap={5}>
                    <Field.Root required invalid={false}>
                        <Field.Label fontWeight="medium">Email</Field.Label>
                        <Input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your@email.com"
                            size="lg"
                            borderRadius="xl"
                            px={4}
                        />
                    </Field.Root>

                    <Field.Root required invalid={false}>
                        <Field.Label fontWeight="medium">Password</Field.Label>
                        <Input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Your password"
                            size="lg"
                            borderRadius="xl"
                            px={4}
                        />
                    </Field.Root>

                    <Button
                        type="submit"
                        colorPalette="brand"
                        size="lg"
                        width="100%"
                        loading={loading}
                        borderRadius="xl"
                        fontWeight="bold"
                    >
                        Sign In
                    </Button>

                    <Text fontSize="sm" color="fgMuted">
                        Don&apos;t have an account?{' '}
                        <Link href="/register" style={{ color: 'var(--chakra-colors-brand-500)', fontWeight: 600 }}>
                            Sign up
                        </Link>
                    </Text>
                </VStack>
            </Box>
        </AuthLayout>
    );
}
