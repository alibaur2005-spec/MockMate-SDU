'use client';

import { Box, Button, Heading, Text, VStack, HStack, Image, Badge, Spinner, SimpleGrid, Input, Icon } from '@chakra-ui/react';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState, use, useRef, useMemo } from 'react';
import { toaster } from '@/components/ui/toaster';
import { FaPlay, FaSearch, FaPen, FaUpload, FaTimes, FaCheck } from 'react-icons/fa';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAdmin } from '@/lib/auth/hooks';

interface Company { id: string; name: string; description: string; logo_url: string; }
interface Question { id: string; content: string; topic: string; difficulty: 'Easy' | 'Medium' | 'Hard'; }

export default function CompanyDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { isAdmin } = useAdmin();
    const supabase = createClient();

    const [company, setCompany] = useState<Company | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);

    // Add question state
    const [showAddForm, setShowAddForm] = useState(false);
    const [newQuestionTopic, setNewQuestionTopic] = useState('');
    const [newQuestionContent, setNewQuestionContent] = useState('');
    const [newQuestionDifficulty, setNewQuestionDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
    const [isAdding, setIsAdding] = useState(false);

    // Edit company state
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editLogoFile, setEditLogoFile] = useState<File | null>(null);
    const [editLogoPreview, setEditLogoPreview] = useState('');
    const [isSavingEdit, setIsSavingEdit] = useState(false);
    const editLogoRef = useRef<HTMLInputElement>(null);

    // Search & sort
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('default');

    const fetchData = async () => {
        setLoading(true);
        const { data: companyData, error: companyError } = await supabase.from('companies').select('*').eq('id', id).single();
        if (companyError) { toaster.create({ title: 'Error', description: companyError.message, type: 'error' }); setLoading(false); return; }
        setCompany(companyData);
        const { data: questionsData } = await supabase.from('questions').select('*').eq('company_id', id);
        setQuestions(questionsData || []);
        setLoading(false);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { fetchData(); }, [id]);

    // ── Upload helper ──
    const uploadLogo = async (file: File): Promise<string | null> => {
        const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
        const { error } = await supabase.storage.from('logos').upload(fileName, file);
        if (error) { toaster.create({ title: 'Upload failed', description: error.message, type: 'error' }); return null; }
        const { data } = supabase.storage.from('logos').getPublicUrl(fileName);
        return data.publicUrl;
    };

    // ── Edit company ──
    const startEditing = () => {
        if (!company) return;
        setEditName(company.name);
        setEditDescription(company.description || '');
        setEditLogoPreview(company.logo_url || '');
        setEditLogoFile(null);
        setIsEditing(true);
    };

    const cancelEditing = () => { setIsEditing(false); setEditLogoFile(null); setEditLogoPreview(''); };

    const handleEditLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) { setEditLogoFile(file); setEditLogoPreview(URL.createObjectURL(file)); }
    };

    const handleSaveEdit = async () => {
        if (!editName.trim()) { toaster.create({ title: 'Name required', type: 'error' }); return; }
        setIsSavingEdit(true);
        let logoUrl = company?.logo_url || null;
        if (editLogoFile) {
            const url = await uploadLogo(editLogoFile);
            if (!url) { setIsSavingEdit(false); return; }
            logoUrl = url;
        }
        const { error } = await supabase.from('companies').update({ name: editName.trim(), description: editDescription.trim(), logo_url: logoUrl }).eq('id', id);
        setIsSavingEdit(false);
        if (error) { toaster.create({ title: 'Error saving', description: error.message, type: 'error' }); }
        else {
            setCompany(prev => prev ? { ...prev, name: editName.trim(), description: editDescription.trim(), logo_url: logoUrl || '' } : prev);
            setIsEditing(false);
            toaster.create({ title: 'Company updated', type: 'success' });
        }
    };

    // ── Add question ──
    const handleAddQuestion = async () => {
        if (!newQuestionContent.trim() || !newQuestionTopic.trim()) { toaster.create({ title: 'Fill in all fields', type: 'error' }); return; }
        setIsAdding(true);
        const { data, error } = await supabase.from('questions').insert({ company_id: id, content: newQuestionContent.trim(), topic: newQuestionTopic.trim(), difficulty: newQuestionDifficulty }).select().single();
        setIsAdding(false);
        if (error) { toaster.create({ title: 'Error', description: error.message, type: 'error' }); }
        else { setQuestions(prev => [data, ...prev]); setShowAddForm(false); setNewQuestionContent(''); setNewQuestionTopic(''); setNewQuestionDifficulty('Medium'); toaster.create({ title: 'Question added', type: 'success' }); }
    };

    const seedQuestions = async () => {
        if (!company) return;
        const mockQuestions = [
            { company_id: company.id, content: 'Reverse a linked list.', topic: 'Data Structures', difficulty: 'Easy' },
            { company_id: company.id, content: 'Implement LRU Cache.', topic: 'Algorithms', difficulty: 'Medium' },
            { company_id: company.id, content: 'Design a URL shortener like Bit.ly.', topic: 'System Design', difficulty: 'Hard' },
            { company_id: company.id, content: 'Tell me about a time you led a team through a difficult project.', topic: 'Behavioral', difficulty: 'Medium' },
            { company_id: company.id, content: 'How do you handle disagreements with colleagues?', topic: 'Behavioral', difficulty: 'Easy' },
        ];
        const { error } = await supabase.from('questions').insert(mockQuestions);
        if (error) { toaster.create({ title: 'Error', description: error.message, type: 'error' }); }
        else { toaster.create({ title: 'Questions seeded', type: 'success' }); fetchData(); }
    };

    // ── Start interview ──
    const handleStartInterview = async (questionId: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { router.push('/login'); return; }
        const { data, error } = await supabase.from('interview_attempts').insert({ user_id: user.id, company_id: company?.id, question_id: questionId, status: 'in_progress', started_at: new Date().toISOString() }).select().single();
        if (error) { toaster.create({ title: 'Error', description: error.message, type: 'error' }); }
        else { router.push(`/interview/${data.id}`); }
    };

    // ── Filtered & sorted questions ──
    const filteredQuestions = useMemo(() => {
        let result = [...questions];
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(item => item.content.toLowerCase().includes(q) || item.topic.toLowerCase().includes(q));
        }
        if (sortBy === 'difficulty') {
            const order: Record<string, number> = { Easy: 0, Medium: 1, Hard: 2 };
            result.sort((a, b) => (order[a.difficulty] ?? 1) - (order[b.difficulty] ?? 1));
        } else if (sortBy === 'topic') {
            result.sort((a, b) => a.topic.localeCompare(b.topic));
        }
        return result;
    }, [questions, searchQuery, sortBy]);

    const inputStyle = { bg: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)', color: 'white', _hover: { borderColor: 'rgba(255,255,255,0.15)' }, _focus: { borderColor: '#5672ea', boxShadow: '0 0 0 1px #5672ea' }, _placeholder: { color: 'gray.600' } };
    const diffColor = (d: string) => d === 'Easy' ? '34,197,94' : d === 'Medium' ? '234,179,8' : '239,68,68';

    if (loading) return <VStack py={20}><Spinner size="xl" color="gray.500" /></VStack>;
    if (!company) return <VStack py={20}><Heading color="gray.400">Company not found</Heading><Link href="/companies"><Button mt={4} variant="outline" borderColor="rgba(255,255,255,0.1)" color="gray.400">Back</Button></Link></VStack>;

    return (
        <VStack gap={8} align="stretch">

            {/* ════ Company Header ════ */}
            {isEditing ? (
                <Box p={7} borderRadius="2xl" style={{ background: 'rgba(86,114,234,0.06)', border: '1px solid rgba(86,114,234,0.15)' }}>
                    <VStack align="stretch" gap={4}>
                        <HStack justify="space-between"><Heading size="md" fontWeight="700">Edit Company</Heading></HStack>

                        {/* Logo upload */}
                        <HStack gap={4}>
                            {editLogoPreview ? (
                                <Box w={16} h={16} borderRadius="lg" overflow="hidden" bg="white" p={2} flexShrink={0}>
                                    <Image src={editLogoPreview} alt="Logo" w="full" h="full" objectFit="contain" />
                                </Box>
                            ) : (
                                <Box w={16} h={16} borderRadius="lg" display="flex" alignItems="center" justifyContent="center" flexShrink={0} style={{ background: 'rgba(255,255,255,0.04)', border: '1px dashed rgba(255,255,255,0.12)' }}>
                                    <FaUpload color="rgba(255,255,255,0.2)" />
                                </Box>
                            )}
                            <VStack align="start" gap={1}>
                                <Button size="xs" variant="outline" onClick={() => editLogoRef.current?.click()} borderColor="rgba(255,255,255,0.1)" color="gray.400" borderRadius="lg" _hover={{ bg: 'rgba(255,255,255,0.04)' }}>
                                    {editLogoFile ? 'Change' : 'Upload New Logo'}
                                </Button>
                                <Text fontSize="xs" color="gray.600">{editLogoFile ? editLogoFile.name : 'PNG, SVG, JPG'}</Text>
                            </VStack>
                            <Input type="file" display="none" ref={editLogoRef} accept="image/*" onChange={handleEditLogoSelect} />
                        </HStack>

                        <Box><Text mb={1} fontSize="xs" fontWeight="500" color="gray.400">Name</Text><Input value={editName} onChange={(e) => setEditName(e.target.value)} borderRadius="lg" {...inputStyle} /></Box>
                        <Box><Text mb={1} fontSize="xs" fontWeight="500" color="gray.400">Description</Text><Input value={editDescription} onChange={(e) => setEditDescription(e.target.value)} borderRadius="lg" {...inputStyle} /></Box>
                        <HStack justify="flex-end" gap={3}>
                            <Button variant="ghost" onClick={cancelEditing} color="gray.500" size="sm"><FaTimes style={{ marginRight: '4px' }} /> Cancel</Button>
                            <Button onClick={handleSaveEdit} loading={isSavingEdit} bg="white" color="#08080c" borderRadius="lg" fontWeight="600" _hover={{ bg: 'gray.200' }} size="sm"><FaCheck style={{ marginRight: '4px' }} /> Save</Button>
                        </HStack>
                    </VStack>
                </Box>
            ) : (
                <Box p={7} borderRadius="2xl" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <HStack gap={6} align="start" flexDir={{ base: 'column', md: 'row' }}>
                        {company.logo_url ? (
                            <Box bg="white" p={3} borderRadius="xl" flexShrink={0}><Image src={company.logo_url} alt={company.name} w={20} h={20} objectFit="contain" /></Box>
                        ) : (
                            <Box w={20} h={20} borderRadius="xl" display="flex" alignItems="center" justifyContent="center" bg="rgba(255,255,255,0.04)" flexShrink={0}>
                                <Text fontSize="3xl" fontWeight="800" color="gray.600">{company.name.charAt(0)}</Text>
                            </Box>
                        )}
                        <VStack align="start" gap={3} flex={1}>
                            <HStack gap={3} align="center">
                                <Heading size="2xl" fontWeight="800" letterSpacing="-0.03em">{company.name}</Heading>
                                {isAdmin && (
                                    <Button size="xs" variant="ghost" color="gray.500" onClick={startEditing} _hover={{ color: 'white' }}><FaPen /></Button>
                                )}
                            </HStack>
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
            )}

            {/* ════ Questions section ════ */}
            <Box>
                <HStack justify="space-between" mb={5} flexDir={{ base: 'column', md: 'row' }} gap={3} align={{ base: 'stretch', md: 'center' }}>
                    <Heading size="lg" fontWeight="700">Interview Questions</Heading>
                    {isAdmin && (
                        <HStack gap={3}>
                            <Button size="sm" onClick={() => setShowAddForm(!showAddForm)} borderRadius="lg" fontWeight="600"
                                {...(showAddForm ? { variant: 'ghost', color: '#ef4444', _hover: { bg: 'rgba(239,68,68,0.08)' } } : { bg: 'white', color: '#08080c', _hover: { bg: 'gray.200' } })}
                            >{showAddForm ? 'Cancel' : 'Add Question'}</Button>
                            {questions.length === 0 && <Button size="sm" variant="outline" onClick={seedQuestions} borderColor="rgba(255,255,255,0.08)" color="gray.400" borderRadius="lg">Seed Questions</Button>}
                        </HStack>
                    )}
                </HStack>

                {/* Admin add question form */}
                {isAdmin && showAddForm && (
                    <Box mb={6} p={6} borderRadius="xl" style={{ background: 'rgba(86,114,234,0.06)', border: '1px solid rgba(86,114,234,0.15)' }}>
                        <VStack align="stretch" gap={4}>
                            <Heading size="sm" fontWeight="700">Add New Question</Heading>
                            <HStack gap={4} flexDir={{ base: 'column', md: 'row' }}>
                                <Box flex={1} w="full"><Text mb={1} fontSize="xs" fontWeight="500" color="gray.400">Topic</Text><Input placeholder="e.g. Behavioral, Data Structures" value={newQuestionTopic} onChange={(e) => setNewQuestionTopic(e.target.value)} borderRadius="lg" {...inputStyle} /></Box>
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

                {/* Search & Sort bar */}
                {questions.length > 0 && (
                    <HStack mb={5} gap={3} flexDir={{ base: 'column', md: 'row' }}>
                        <Box flex={1} position="relative" w="full">
                            <Box position="absolute" left={3} top="50%" transform="translateY(-50%)" zIndex={1} pointerEvents="none"><FaSearch color="rgba(255,255,255,0.2)" size={12} /></Box>
                            <Input
                                placeholder="Search questions..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                pl={9}
                                borderRadius="lg"
                                size="sm"
                                {...inputStyle}
                            />
                        </Box>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            style={{ padding: '7px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.6)', fontSize: '13px', minWidth: '150px' }}
                        >
                            <option style={{ background: '#1a1a2e', color: 'white' }} value="default">Sort: Default</option>
                            <option style={{ background: '#1a1a2e', color: 'white' }} value="difficulty">Sort: Difficulty</option>
                            <option style={{ background: '#1a1a2e', color: 'white' }} value="topic">Sort: Topic A–Z</option>
                        </select>
                    </HStack>
                )}

                {/* Questions grid */}
                {questions.length === 0 ? (
                    <Box textAlign="center" py={12} borderRadius="xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}><Text color="gray.600">No questions available yet.</Text></Box>
                ) : filteredQuestions.length === 0 ? (
                    <Box textAlign="center" py={8} borderRadius="xl"><Text color="gray.500" fontSize="sm">No questions matching &ldquo;{searchQuery}&rdquo;</Text></Box>
                ) : (
                    <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                        {filteredQuestions.map((q) => (
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
