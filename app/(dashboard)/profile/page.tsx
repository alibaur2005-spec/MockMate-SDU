'use client';

import { useEffect, useState } from 'react';
import {
    Box,
    Button,
    Field,
    HStack,
    Heading,
    Input,
    Text,
    VStack,
    Card,
} from '@chakra-ui/react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { toaster } from '@/components/ui/toaster';

interface Profile {
    full_name: string | null;
    email: string | null;
}

export default function ProfilePage() {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [stats, setStats] = useState({
        interviews: 0,
        averageScore: 'N/A',
        transcriptions: 0
    });
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        loadProfile();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadProfile = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                router.push('/login');
                return;
            }

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error && error.code !== 'PGRST116') {
                throw error;
            }

            if (data) {
                setProfile(data);
                setFullName(data.full_name || '');
            } else {
                setProfile({ full_name: null, email: user.email || null });
            }

            // Fetch Stats
            const [
                { count: transcriptionsCount },
                { data: attempts }
            ] = await Promise.all([
                supabase.from('transcriptions').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
                supabase.from('interview_attempts').select('id, evaluations(score)').eq('user_id', user.id).eq('status', 'completed')
            ]);

            const completedInterviews = attempts?.length || 0;

            let avgScore = 'N/A';
            if (attempts && attempts.length > 0) {
                // Flatten all evaluations from all attempts
                const scores = attempts.flatMap(a => (Array.isArray(a.evaluations) ? a.evaluations : [a.evaluations]))
                    .filter(e => e && typeof e.score === 'number')
                    .map(e => e.score);

                if (scores.length > 0) {
                    const total = scores.reduce((sum, score) => sum + score, 0);
                    avgScore = Math.round(total / scores.length).toString();
                }
            }

            setStats({
                interviews: completedInterviews,
                transcriptions: transcriptionsCount || 0,
                averageScore: avgScore
            });

        } catch (error: any) {
            toaster.create({
                title: 'Error loading profile',
                description: error.message,
                type: 'error',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) throw new Error('Not authenticated');

            const { error } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    full_name: fullName,
                    email: user.email,
                    updated_at: new Date().toISOString(),
                });

            if (error) throw error;

            toaster.create({
                title: 'Profile updated',
                type: 'success',
            });

            loadProfile();
        } catch (error: any) {
            toaster.create({
                title: 'Error updating profile',
                description: error.message,
                type: 'error',
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <Box>Loading...</Box>;
    }

    return (
        <VStack gap={8} align="stretch">
            <Heading>My Profile</Heading>

            <HStack gap={4}>
                <Card.Root flex={1} p={6}>
                    <Card.Body>
                        <VStack align="stretch" gap={2}>
                            <Text fontSize="sm" color="gray.600">
                                Interviews Completed
                            </Text>
                            <Text fontSize="3xl" fontWeight="bold">
                                {stats.interviews}
                            </Text>
                        </VStack>
                    </Card.Body>
                </Card.Root>

                <Card.Root flex={1} p={6}>
                    <Card.Body>
                        <VStack align="stretch" gap={2}>
                            <Text fontSize="sm" color="gray.600">
                                Average Score
                            </Text>
                            <Text fontSize="3xl" fontWeight="bold">
                                {stats.averageScore}
                            </Text>
                        </VStack>
                    </Card.Body>
                </Card.Root>

                <Card.Root flex={1} p={6}>
                    <Card.Body>
                        <VStack align="stretch" gap={2}>
                            <Text fontSize="sm" color="gray.600">
                                Transcriptions
                            </Text>
                            <Text fontSize="3xl" fontWeight="bold">
                                {stats.transcriptions}
                            </Text>
                        </VStack>
                    </Card.Body>
                </Card.Root>
            </HStack>

            <Card.Root>
                <Card.Header p={6}>
                    <Heading size="md">Profile Information</Heading>
                </Card.Header>
                <Card.Body p={6}>
                    <Box as="form" onSubmit={handleSave}>
                        <VStack gap={4} align="stretch">
                            <Field.Root>
                                <Field.Label>Email</Field.Label>
                                <Input value={profile?.email || ''} disabled px={4} />
                            </Field.Root>

                            <Field.Root required>
                                <Field.Label>Full Name</Field.Label>
                                <Input
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="Your full name"
                                    px={4}
                                />
                            </Field.Root>

                            <Button type="submit" colorScheme="blue" loading={saving}>
                                Save Changes
                            </Button>
                        </VStack>
                    </Box>
                </Card.Body>
            </Card.Root>
        </VStack>
    );
}
