'use client';

import { Box, Button, Heading, SimpleGrid, Text, VStack } from '@chakra-ui/react';
import { toaster } from '@/components/ui/toaster';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import CompanyCard from '@/components/companies/CompanyCard';

interface Company { id: string; name: string; description: string; logo_url: string; }

export default function CompaniesPage() {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    const fetchCompanies = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('companies').select('*');
        if (error) { toaster.create({ title: 'Error fetching companies', description: error.message, type: 'error', duration: 5000 }); }
        else { setCompanies(data || []); }
        setLoading(false);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { fetchCompanies(); }, []);

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

    return (
        <VStack gap={8} align="stretch">
            <Box>
                <Heading size="2xl" fontWeight="800" letterSpacing="-0.03em" mb={2}>Target Companies</Heading>
                <Text color="gray.500" fontSize="sm">Select a company to start practicing specific interview questions.</Text>
            </Box>

            {loading ? (
                <Text color="gray.500">Loading companies...</Text>
            ) : companies.length === 0 ? (
                <VStack py={16} borderRadius="xl" gap={4} style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <Text color="gray.500">No companies found.</Text>
                    <Button onClick={seedCompanies} bg="white" color="#08080c" borderRadius="lg" fontWeight="600" _hover={{ bg: 'gray.200' }}>Seed Mock Data</Button>
                </VStack>
            ) : (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={5}>
                    {companies.map((company) => <CompanyCard key={company.id} {...company} />)}
                </SimpleGrid>
            )}
        </VStack>
    );
}
