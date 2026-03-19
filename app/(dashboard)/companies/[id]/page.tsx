
'use client';

import { Box, Button, Container, Heading, Text, VStack, HStack, Image, Badge, Spinner, SimpleGrid, Card } from '@chakra-ui/react';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState, use } from 'react';
import { toaster } from '@/components/ui/toaster';
import { FaPlay, FaCode, FaDatabase, FaLayerGroup } from 'react-icons/fa';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Company {
    id: string;
    name: string;
    description: string;
    logo_url: string;
}

interface Question {
    id: string;
    content: string;
    topic: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
}

export default function CompanyDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    // Unwrap params using React.use()
    const { id } = use(params);
    const router = useRouter();

    const [company, setCompany] = useState<Company | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    const fetchData = async () => {
        setLoading(true);

        // Fetch Company
        const { data: companyData, error: companyError } = await supabase
            .from('companies')
            .select('*')
            .eq('id', id)
            .single();

        if (companyError) {
            console.error('Error fetching company:', companyError);
            toaster.create({
                title: 'Error fetching company',
                description: companyError.message,
                type: 'error',
            });
            setLoading(false);
            return;
        }

        setCompany(companyData);

        // Fetch Questions
        const { data: questionsData, error: questionsError } = await supabase
            .from('questions')
            .select('*')
            .eq('company_id', id);

        if (questionsError) {
            console.error('Error fetching questions:', questionsError);
        } else {
            setQuestions(questionsData || []);
        }

        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    const seedQuestions = async () => {
        if (!company) return;

        const mockQuestions = [
            {
                company_id: company.id,
                content: 'Reverse a linked list.',
                topic: 'Data Structures',
                difficulty: 'Easy',
            },
            {
                company_id: company.id,
                content: 'Implement LRU Cache.',
                topic: 'Algorithms',
                difficulty: 'Medium',
            },
            {
                company_id: company.id,
                content: 'Design a URL shortener like Bit.ly.',
                topic: 'System Design',
                difficulty: 'Hard',
            },
            {
                company_id: company.id,
                content: 'Find the longest substring without repeating characters.',
                topic: 'Algorithms',
                difficulty: 'Medium',
            },
            {
                company_id: company.id,
                content: 'Explain ACID properties in databases.',
                topic: 'Databases',
                difficulty: 'Easy',
            },
        ];

        const { error } = await supabase.from('questions').insert(mockQuestions);

        if (error) {
            toaster.create({
                title: 'Error seeding questions',
                description: error.message,
                type: 'error',
            });
        } else {
            toaster.create({
                title: 'Questions seeded successfully',
                type: 'success',
            });
            fetchData();
        }
    };

    const handleStartInterview = async (questionId: string) => {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            toaster.create({
                title: 'Authentication required',
                description: 'Please sign in to start practicing.',
                type: 'error',
            });
            router.push('/login');
            return;
        }

        const { data, error } = await supabase
            .from('interview_attempts')
            .insert({
                user_id: user.id,
                company_id: company?.id,
                question_id: questionId,
                status: 'in_progress',
                started_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (error) {
            console.error('Error starting interview:', error);
            toaster.create({
                title: 'Error starting interview',
                description: error.message,
                type: 'error',
            });
        } else {
            router.push(`/interview/${data.id}`);
        }
    };

    if (loading) {
        return (
            <Container centerContent py={20}>
                <Spinner size="xl" />
            </Container>
        );
    }

    if (!company) {
        return (
            <Container centerContent py={20}>
                <Heading>Company not found</Heading>
                <Link href="/companies">
                    <Button mt={4} variant="outline">Back to Companies</Button>
                </Link>
            </Container>
        );
    }

    return (
        <Container maxW="container.xl" py={8}>
            <VStack gap={8} align="stretch">
                {/* Company Header */}
                <Box bg="bg.panel" p={8} borderRadius="2xl" border="1px solid" borderColor="border" boxShadow="sm">
                    <HStack gap={6} align="start" flexDir={{ base: 'column', md: 'row' }}>
                        <Box bg="white" p={4} borderRadius="xl" border="1px solid" borderColor="border.muted">
                            <Image
                                src={company.logo_url}
                                alt={company.name}
                                w={24}
                                h={24}
                                objectFit="contain"
                            />
                        </Box>
                        <VStack align="start" gap={4} flex={1}>
                            <Heading size="2xl">{company.name}</Heading>
                            <Text color="fg.muted" fontSize="lg">{company.description}</Text>
                            <HStack>
                                <Badge style={{ padding: '0 10px' }} colorPalette="purple" variant="solid" size="lg">{questions.length} Questions Available</Badge>
                                <Link href={`/interview/live?company_id=${company.id}`}>
                                    <Button colorPalette="purple" variant="solid" size="sm" ml={4}>
                                        <FaPlay style={{ marginRight: '8px' }} /> Start Live AI Interview
                                    </Button>
                                </Link>
                            </HStack>
                        </VStack>
                    </HStack>
                </Box>

                {/* Questions List */}
                <Box>
                    <HStack justify="space-between" mb={6}>
                        <Heading size="xl">Interview Questions</Heading>
                        {questions.length === 0 && (
                            <Button size="sm" variant="outline" onClick={seedQuestions}>Seed Questions</Button>
                        )}
                    </HStack>

                    {questions.length === 0 ? (
                        <Box textAlign="center" py={12} bg="bgSub" borderRadius="xl">
                            <Text color="fgMuted">No questions available for {company.name} yet.</Text>
                        </Box>
                    ) : (
                        <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
                            {questions.map((q) => (
                                <Card.Root key={q.id} variant="elevated" _hover={{ boxShadow: 'md' }}>
                                    <Card.Body style={{ padding: '10px' }}>
                                        <VStack align="start" gap={4}>
                                            <HStack justify="space-between" w="full">
                                                <Badge style={{ padding: '0 10px' }} colorPalette={q.difficulty === 'Easy' ? 'green' : q.difficulty === 'Medium' ? 'yellow' : 'red'}>
                                                    {q.difficulty}
                                                </Badge>
                                                <Badge style={{ padding: '0 10px' }} variant="outline" colorPalette="blue">{q.topic}</Badge>
                                            </HStack>
                                            <Heading size="md" lineHeight="tall">{q.content}</Heading>
                                            <Button
                                                width="full"
                                                colorPalette="brand"
                                                variant="surface"
                                                onClick={() => handleStartInterview(q.id)}
                                            >
                                                <FaPlay style={{ marginRight: '8px' }} /> Start Practice
                                            </Button>
                                        </VStack>
                                    </Card.Body>
                                </Card.Root>
                            ))}
                        </SimpleGrid>
                    )}
                </Box>
            </VStack>
        </Container>
    );
}
