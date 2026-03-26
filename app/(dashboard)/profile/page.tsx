'use client';

import { useEffect, useState } from 'react';
import { Box, Button, Field, HStack, Heading, Input, Text, VStack, Icon } from '@chakra-ui/react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { toaster } from '@/components/ui/toaster';
import { FaCode, FaChartLine, FaMicrophone } from 'react-icons/fa';

interface Profile { full_name: string | null; email: string | null; }

export default function ProfilePage() {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [stats, setStats] = useState({ interviews: 0, averageScore: 'N/A', transcriptions: 0 });
    const router = useRouter();
    const supabase = createClient();

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { loadProfile(); }, []);

    const loadProfile = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { router.push('/login'); return; }
            const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
            if (error && error.code !== 'PGRST116') throw error;
            if (data) { setProfile(data); setFullName(data.full_name || ''); } else { setProfile({ full_name: null, email: user.email || null }); }
            const [{ count: tc }, { data: attempts }] = await Promise.all([
                supabase.from('transcriptions').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
                supabase.from('interview_attempts').select('id, evaluations(score)').eq('user_id', user.id).eq('status', 'completed'),
            ]);
            const scores = (attempts || []).flatMap(a => (Array.isArray(a.evaluations) ? a.evaluations : [a.evaluations])).filter(e => e && typeof e.score === 'number').map(e => e.score);
            const avg = scores.length > 0 ? Math.round(scores.reduce((s, v) => s + v, 0) / scores.length).toString() : 'N/A';
            setStats({ interviews: attempts?.length || 0, transcriptions: tc || 0, averageScore: avg });
        } catch (error: any) { toaster.create({ title: 'Error loading profile', description: error.message, type: 'error' }); }
        finally { setLoading(false); }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');
            const { error } = await supabase.from('profiles').upsert({ id: user.id, full_name: fullName, email: user.email, updated_at: new Date().toISOString() });
            if (error) throw error;
            toaster.create({ title: 'Profile updated', type: 'success' });
            loadProfile();
        } catch (error: any) { toaster.create({ title: 'Error', description: error.message, type: 'error' }); }
        finally { setSaving(false); }
    };

    if (loading) return <Box color="gray.500">Loading...</Box>;

    const statCards = [
        { label: 'Interviews Completed', value: stats.interviews, icon: FaCode, tint: '86,114,234' },
        { label: 'Average Score', value: stats.averageScore, icon: FaChartLine, tint: '34,197,94' },
        { label: 'Transcriptions', value: stats.transcriptions, icon: FaMicrophone, tint: '168,85,247' },
    ];

    const inputStyle = { bg: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)', color: 'white', _hover: { borderColor: 'rgba(255,255,255,0.15)' }, _focus: { borderColor: '#5672ea', boxShadow: '0 0 0 1px #5672ea' }, _placeholder: { color: 'gray.600' } };

    return (
        <VStack gap={8} align="stretch">
            <Heading size="2xl" fontWeight="800" letterSpacing="-0.03em">My Profile</Heading>

            <HStack gap={4} flexDir={{ base: 'column', md: 'row' }}>
                {statCards.map((s, i) => (
                    <Box key={i} flex={1} w="full" p={5} borderRadius="xl" style={{ background: `linear-gradient(135deg, rgba(${s.tint},0.08), rgba(${s.tint},0.02))`, border: `1px solid rgba(${s.tint},0.12)` }}>
                        <VStack align="stretch" gap={1}>
                            <HStack gap={2}><Icon as={s.icon} boxSize={3.5} style={{ color: `rgba(${s.tint},1)` }} /><Text fontSize="xs" color="gray.500" fontWeight="500">{s.label}</Text></HStack>
                            <Text fontSize="3xl" fontWeight="800" letterSpacing="-0.02em">{s.value}</Text>
                        </VStack>
                    </Box>
                ))}
            </HStack>

            <Box p={7} borderRadius="xl" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <Heading size="md" fontWeight="700" mb={6}>Profile Information</Heading>
                <Box as="form" onSubmit={handleSave}>
                    <VStack gap={5} align="stretch">
                        <Field.Root>
                            <Field.Label fontSize="sm" color="gray.400" fontWeight="500">Email</Field.Label>
                            <Input value={profile?.email || ''} disabled px={4} borderRadius="lg" {...inputStyle} opacity={0.5} />
                        </Field.Root>
                        <Field.Root required>
                            <Field.Label fontSize="sm" color="gray.400" fontWeight="500">Full Name</Field.Label>
                            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your full name" px={4} borderRadius="lg" {...inputStyle} />
                        </Field.Root>
                        <Button type="submit" loading={saving} bg="white" color="#08080c" borderRadius="lg" fontWeight="700" px={6} _hover={{ bg: 'gray.200' }} alignSelf="flex-start">Save Changes</Button>
                    </VStack>
                </Box>
            </Box>
        </VStack>
    );
}
