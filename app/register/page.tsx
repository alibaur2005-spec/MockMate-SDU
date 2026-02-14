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

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                    },
                },
            });

            if (error) throw error;

            toaster.create({
                title: 'Registration successful',
                description: 'Please check your email to verify your account',
                type: 'success',
            });

            router.push('/login');
        } catch (error: any) {
            toaster.create({
                title: 'Registration failed',
                description: error.message,
                type: 'error',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Create an Account"
            subtitle="Start your journey to interview mastery"
        >
            <Box as="form" onSubmit={handleRegister} width="100%">
                <VStack gap={5}>
                    <Field.Root required invalid={false}>
                        <Field.Label fontWeight="medium">Full Name</Field.Label>
                        <Input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="John Doe"
                            size="lg"
                            borderRadius="xl"
                        />
                    </Field.Root>

                    <Field.Root required invalid={false}>
                        <Field.Label fontWeight="medium">Email</Field.Label>
                        <Input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your@email.com"
                            size="lg"
                            borderRadius="xl"
                        />
                    </Field.Root>

                    <Field.Root required invalid={false}>
                        <Field.Label fontWeight="medium">Password</Field.Label>
                        <Input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Create a strong password"
                            size="lg"
                            borderRadius="xl"
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
                        Sign Up
                    </Button>

                    <Text fontSize="sm" color="fgMuted">
                        Already have an account?{' '}
                        <Link href="/login" style={{ color: 'var(--chakra-colors-brand-500)', fontWeight: 600 }}>
                            Login
                        </Link>
                    </Text>
                </VStack>
            </Box>
        </AuthLayout>
    );
}
