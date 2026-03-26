'use client';

import { Box, Button, Heading, SimpleGrid, Text, VStack, HStack, Input } from '@chakra-ui/react';
import { toaster } from '@/components/ui/toaster';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import CompanyCard from '@/components/companies/CompanyCard';
import { useAdmin } from '@/lib/auth/hooks';

interface Company { id: string; name: string; description: string; logo_url: string; }

export default function CompaniesPage() {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const { isAdmin } = useAdmin();
    const supabase = createClient();

    const [showAddForm, setShowAddForm] = useState(false);
    const [newName, setNewName] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [newLogoUrl, setNewLogoUrl] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    const fetchCompanies = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('companies').select('*');
        if (error) { toaster.create({ title: 'Error fetching companies', description: error.message, type: 'error', duration: 5000 }); }
        else { setCompanies(data || []); }
        setLoading(false);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { fetchCompanies(); }, []);

    const handleAddCompany = async () => {
        if (!newName.trim()) { toaster.create({ title: 'Company name is required', type: 'error' }); return; }
        setIsAdding(true);
        const { data, error } = await supabase
            .from('companies')
            .insert({ name: newName.trim(), description: newDescription.trim(), logo_url: newLogoUrl.trim() || null })
            .select()
            .single();
        setIsAdding(false);
        if (error) { toaster.create({ title: 'Error adding company', description: error.message, type: 'error' }); }
        else {
            setCompanies(prev => [data, ...prev]);
            setShowAddForm(false);
            setNewName(''); setNewDescription(''); setNewLogoUrl('');
            toaster.create({ title: 'Company added', type: 'success' });
        }
    };

    const seedCompanies = async () => {
        const mockCompanies = [
            { name: 'Google', description: 'Search engine giant and tech innovator known for challenging coding interviews.', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg' },
            { name: 'Amazon', description: 'E-commerce and cloud computing leader with a focus on leadership principles.', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg' },
            { name: 'Meta', description: 'Social networking pioneer connecting billions of users worldwide.', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg' },
            { name: 'Netflix', description: 'Streaming service revolutionizing entertainment with a culture of freedom and responsibility.', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg' },
            { name: 'Apple', description: 'Consumer electronics and software company known for design excellence.', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg' },
        ];
        const { error } = await supabase.from('companies').insert(mockCompanies);
        if (error) { toaster.create({ title: 'Error seeding data', description: error.message, type: 'error' }); }
        else { toaster.create({ title: 'Data seeded successfully', type: 'success' }); fetchCompanies(); }
    };

    const inputStyle = { bg: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)', color: 'white', _hover: { borderColor: 'rgba(255,255,255,0.15)' }, _focus: { borderColor: '#5672ea', boxShadow: '0 0 0 1px #5672ea' }, _placeholder: { color: 'gray.600' } };

    return (
        <VStack gap={8} align="stretch">
            <HStack justify="space-between" align="start" flexDir={{ base: 'column', md: 'row' }} gap={4}>
                <Box>
                    <Heading size="2xl" fontWeight="800" letterSpacing="-0.03em" mb={2}>Target Companies</Heading>
                    <Text color="gray.500" fontSize="sm">Select a company to start practicing specific interview questions.</Text>
                </Box>
                {isAdmin && (
                    <Button
                        size="sm"
                        onClick={() => setShowAddForm(!showAddForm)}
                        borderRadius="lg"
                        fontWeight="600"
                        {...(showAddForm
                            ? { variant: 'ghost', color: '#ef4444', _hover: { bg: 'rgba(239,68,68,0.08)' } }
                            : { bg: 'white', color: '#08080c', _hover: { bg: 'gray.200' } }
                        )}
                    >
                        {showAddForm ? 'Cancel' : 'Add Company'}
                    </Button>
                )}
            </HStack>

            {/* Admin: Add Company Form */}
            {isAdmin && showAddForm && (
                <Box p={6} borderRadius="xl" style={{ background: 'rgba(86,114,234,0.06)', border: '1px solid rgba(86,114,234,0.15)' }}>
                    <VStack align="stretch" gap={4}>
                        <Heading size="sm" fontWeight="700">New Company</Heading>
                        <HStack gap={4} flexDir={{ base: 'column', md: 'row' }}>
                            <Box flex={1} w="full">
                                <Text mb={1} fontSize="xs" fontWeight="500" color="gray.400">Name *</Text>
                                <Input placeholder="e.g. Google" value={newName} onChange={(e) => setNewName(e.target.value)} borderRadius="lg" {...inputStyle} />
                            </Box>
                            <Box flex={1} w="full">
                                <Text mb={1} fontSize="xs" fontWeight="500" color="gray.400">Logo URL</Text>
                                <Input placeholder="https://..." value={newLogoUrl} onChange={(e) => setNewLogoUrl(e.target.value)} borderRadius="lg" {...inputStyle} />
                            </Box>
                        </HStack>
                        <Box>
                            <Text mb={1} fontSize="xs" fontWeight="500" color="gray.400">Description</Text>
                            <Input placeholder="Short description of the company..." value={newDescription} onChange={(e) => setNewDescription(e.target.value)} borderRadius="lg" {...inputStyle} />
                        </Box>
                        <HStack justify="flex-end">
                            <Button variant="ghost" onClick={() => setShowAddForm(false)} color="gray.500">Cancel</Button>
                            <Button onClick={handleAddCompany} loading={isAdding} bg="white" color="#08080c" borderRadius="lg" fontWeight="600" _hover={{ bg: 'gray.200' }}>Save Company</Button>
                        </HStack>
                    </VStack>
                </Box>
            )}

            {loading ? (
                <Text color="gray.500">Loading companies...</Text>
            ) : companies.length === 0 ? (
                <VStack py={16} borderRadius="xl" gap={4} style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <Text color="gray.500">No companies found.</Text>
                    {isAdmin && (
                        <Button onClick={seedCompanies} bg="white" color="#08080c" borderRadius="lg" fontWeight="600" _hover={{ bg: 'gray.200' }}>Seed Mock Data</Button>
                    )}
                </VStack>
            ) : (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={5}>
                    {companies.map((company) => <CompanyCard key={company.id} {...company} />)}
                </SimpleGrid>
            )}
        </VStack>
    );
}
