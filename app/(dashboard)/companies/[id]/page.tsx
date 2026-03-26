'use client';

import { Box, Button, Heading, Text, VStack, HStack, Image, Badge, Spinner, SimpleGrid, Card, Input, Container } from '@chakra-ui/react';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState, use } from 'react';
import { toaster } from '@/components/ui/toaster';
import { FaPlay } from 'react-icons/fa';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Company { id: string; name: string; description: string; logo_url: string; }
interface Question { id: string; content: string; topic: string; difficulty: 'Easy' | 'Medium' | 'Hard'; }

export default function CompanyDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [company, setCompany] = useState<Company | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newQuestionTopic, setNewQuestionTopic] = useState('');
    const [newQuestionContent, setNewQuestionContent] = useState('');
    const [newQuestionDifficulty, setNewQuestionDifficulty] = useState<'Easy'|'Medium'|'Hard'>('Medium');
    const [isAdding, setIsAdding] = useState(false);
    const supabase = createClient();

    const fetchData = async () => {
        setLoading(true);
        const { data: companyData, error: companyError } = await supabase.from('companies').select('*').eq('id', id).single();
        if (companyError) { toaster.create({ title: 'Error fetching company', description: companyError.message, type: 'error' }); setLoading(false); return; }
        setCompany(companyData);
        const { data: questionsData, error: questionsError } = await supabase.from('questions').select('*').eq('company_id', id);
        if (!questionsError) setQuestions(questionsData || []);
        setLoading(false);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { fetchData(); }, [id]);

    const handleAddQuestion = async () => {
        if (!newQuestionContent.trim() || !newQuestionTopic.trim()) { toaster.create({ title: 'Please fill in all fields', type: 'error' }); return; }
        setIsAdding(true);
        const { data, error } = await supabase.from('questions').insert({ company_id: id, content: newQuestionContent.trim(), topic: newQuestionTopic.trim(), difficulty: newQuestionDifficulty }).select().single();
        setIsAdding(false);
        if (error) { toaster.create({ title: 'Error adding question', description: error.message, type: 'error' }); }
        else { setQuestions(prev => [data, ...prev]); setShowAddForm(false); setNewQuestionContent(''); setNewQuestionTopic(''); setNewQuestionDifficulty('Medium'); toaster.create({ title: 'Question added', type: 'success' }); }
    };

    const seedQuestions = async () => {
        if (!company) return;
        const mockQuestions = [
            { company_id: company.id, content: 'Reverse a linked list.', topic: 'Data Structures', difficulty: 'Easy' },
            { company_id: company.id, content: 'Implement LRU Cache.', topic: 'Algorithms', difficulty: 'Medium' },
            { company_id: company.id, content: 'Design a URL shortener like Bit.ly.', topic: 'System Design', difficulty: 'Hard' },
            { company_id: company.id, content: 'Find the longest substring without repeating characters.', topic: 'Algorithms', difficulty: 'Medium' },
            { company_id: company.id, content: 'Explain ACID properties in databases.', topic: 'Databases', difficulty: 'Easy' },
        ];
        const { error } = await supabase.from('questions').insert(mockQuestions);
        if (error) { toaster.create({ title: 'Error seeding', description: error.message, type: 'error' }); }
        else { toaster.create({ title: 'Questions seeded', type: 'success' }); fetchData(); }
    };

    const handleStartInterview = async (questionId: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { router.push('/login'); return; }
        const { data, error } = await supabase.from('interview_attempts').insert({ user_id: user.id, company_id: company?.id, question_id: questionId, status: 'in_progress', started_at: new Date().toISOString() }).select().single();
        if (error) { toaster.create({ title: 'Error starting interview', description: error.message, type: 'error' }); }
        else { router.push(`/interview/${data.id}`); }
    };

    const inputStyle = { bg: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)', color: 'white', _hover: { borderColor: 'rgba(255,255,255,0.15)' }, _focus: { borderColor: '#5672ea', boxShadow: '0 0 0 1px #5672ea' }, _placeholder: { color: 'gray.600' } };
    const diffColor = (d: string) => d === 'Easy' ? '34,197,94' : d === 'Medium' ? '234,179,8' : '239,68,68';

    if (loading) return <VStack py={20}><Spinner size="xl" color="gray.500" /></VStack>;
    if (!company) return <VStack py={20}><Heading color="gray.400">Company not found</Heading><Link href="/companies"><Button mt={4} variant="outline" borderColor="rgba(255,255,255,0.1)" color="gray.400">Back</Button></Link></VStack>;

    return (
        <VStack gap={8} align="stretch">
            {/* Header */}
            <Box p={7} borderRadius="2xl" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <HStack gap={6} align="start" flexDir={{ base: 'column', md: 'row' }}>
                    <Box bg="white" p={3} borderRadius="xl"><Image src={company.logo_url} alt={company.name} w={20} h={20} objectFit="contain" /></Box>
                    <VStack align="start" gap={3} flex={1}>
                        <Heading size="2xl" fontWeight="800" letterSpacing="-0.03em">{company.name}</Heading>
                        <Text color="gray.500" fontSize="sm">{company.description}</Text>
                        <HStack flexWrap="wrap" gap={3}>
                            <Badge px={3} py={0.5} borderRadius="full" fontSize="xs" style={{ background: 'rgba(168,85,247,0.12)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.2)' }}>{questions.length} Questions</Badge>
                            <Link href={`/interview/live?company_id=${company.id}`}>
                                <Button size="sm" bg="white" color="#08080c" borderRadius="lg" fontWeight="600" _hover={{ bg: 'gray.200' }}><FaPlay style={{ marginRight: '6px' }} /> Live AI Interview</Button>
                            </Link>
                        </HStack>
                    </VStack>
                </HStack>
            </Box>

            {/* Questions */}
            <Box>
                <HStack justify="space-between" mb={5}>
                    <Heading size="lg" fontWeight="700">Interview Questions</Heading>
                    <HStack gap={3}>
                        <Button size="sm" variant={showAddForm ? 'ghost' : 'solid'} onClick={() => setShowAddForm(!showAddForm)} borderRadius="lg" fontWeight="600"
                            {...(showAddForm ? { color: '#ef4444', _hover: { bg: 'rgba(239,68,68,0.08)' } } : { bg: 'white', color: '#08080c', _hover: { bg: 'gray.200' } })}
                        >{showAddForm ? 'Cancel' : 'Add Question'}</Button>
                        {questions.length === 0 && <Button size="sm" variant="outline" onClick={seedQuestions} borderColor="rgba(255,255,255,0.08)" color="gray.400" borderRadius="lg">Seed Questions</Button>}
                    </HStack>
                </HStack>

                {showAddForm && (
                    <Box mb={6} p={6} borderRadius="xl" style={{ background: 'rgba(86,114,234,0.06)', border: '1px solid rgba(86,114,234,0.15)' }}>
                        <VStack align="stretch" gap={4}>
                            <Heading size="sm" fontWeight="700">Add New Question</Heading>
                            <HStack gap={4} flexDir={{ base: 'column', md: 'row' }}>
                                <Box flex={1} w="full"><Text mb={1} fontSize="xs" fontWeight="500" color="gray.400">Topic</Text><Input placeholder="e.g. Data Structures" value={newQuestionTopic} onChange={(e) => setNewQuestionTopic(e.target.value)} borderRadius="lg" {...inputStyle} /></Box>
                                <Box w={{ base: 'full', md: '150px' }}><Text mb={1} fontSize="xs" fontWeight="500" color="gray.400">Difficulty</Text>
                                    <select value={newQuestionDifficulty} onChange={(e) => setNewQuestionDifficulty(e.target.value as any)} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', color: 'white', fontSize: '14px' }}>
                                        <option style={{ background: '#1a1a2e', color: 'white' }} value="Easy">Easy</option>
                                        <option style={{ background: '#1a1a2e', color: 'white' }} value="Medium">Medium</option>
                                        <option style={{ background: '#1a1a2e', color: 'white' }} value="Hard">Hard</option>
                                    </select>
                                </Box>
                            </HStack>
                            <Box><Text mb={1} fontSize="xs" fontWeight="500" color="gray.400">Question</Text><Input placeholder="Write the question..." value={newQuestionContent} onChange={(e) => setNewQuestionContent(e.target.value)} borderRadius="lg" {...inputStyle} /></Box>
                            <HStack justify="flex-end"><Button variant="ghost" onClick={() => setShowAddForm(false)} color="gray.500">Cancel</Button><Button onClick={handleAddQuestion} loading={isAdding} bg="white" color="#08080c" borderRadius="lg" fontWeight="600" _hover={{ bg: 'gray.200' }}>Save</Button></HStack>
                        </VStack>
                    </Box>
                )}

                {questions.length === 0 ? (
                    <Box textAlign="center" py={12} borderRadius="xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}><Text color="gray.600">No questions available yet.</Text></Box>
                ) : (
                    <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                        {questions.map((q) => (
                            <Box key={q.id} p={5} borderRadius="xl" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }} _hover={{ borderColor: 'rgba(255,255,255,0.12)' }} transition="all 0.2s">
                                <VStack align="start" gap={3}>
                                    <HStack justify="space-between" w="full">
                                        <Badge px={2.5} py={0.5} borderRadius="full" fontSize="xs" style={{ background: `rgba(${diffColor(q.difficulty)},0.1)`, color: `rgba(${diffColor(q.difficulty)},1)`, border: `1px solid rgba(${diffColor(q.difficulty)},0.2)` }}>{q.difficulty}</Badge>
                                        <Badge px={2.5} py={0.5} borderRadius="full" fontSize="xs" style={{ background: 'rgba(86,114,234,0.08)', color: '#7b98f2', border: '1px solid rgba(86,114,234,0.15)' }}>{q.topic}</Badge>
                                    </HStack>
                                    <Heading size="sm" fontWeight="600" lineHeight="tall">{q.content}</Heading>
                                    <Button width="full" size="sm" borderRadius="lg" fontWeight="600" onClick={() => handleStartInterview(q.id)} style={{ background: 'rgba(86,114,234,0.1)', color: '#7b98f2', border: '1px solid rgba(86,114,234,0.15)' }} _hover={{ bg: 'rgba(86,114,234,0.2)' }}>
                                        <FaPlay style={{ marginRight: '6px' }} /> Start Practice
                                    </Button>
                                </VStack>
                            </Box>
                        ))}
                    </SimpleGrid>
                )}
            </Box>
        </VStack>
    );
}
