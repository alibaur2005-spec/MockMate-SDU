
'use client';

import { Box, Button, Container, Heading, SimpleGrid, Text, VStack } from '@chakra-ui/react';
import { toaster } from '@/components/ui/toaster';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import CompanyCard from '@/components/companies/CompanyCard';
import { FaBuilding } from 'react-icons/fa';

interface Company {
    id: string;
    name: string;
    description: string;
    logo_url: string;
}

export default function CompaniesPage() {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    const fetchCompanies = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('companies').select('*');
        if (error) {
            console.error('Error fetching companies:', JSON.stringify(error, null, 2), error);
            toaster.create({
                title: 'Error fetching companies',
                description: error.message,
                type: 'error',
                duration: 5000,
            });
        } else {
            setCompanies(data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchCompanies();
    }, []);

    const seedCompanies = async () => {
        const mockCompanies = [
            {
                name: 'Google',
                description: 'Search engine giant and tech innovator known for challenging coding interviews.',
                logo_url: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg',
            },
            {
                name: 'Amazon',
                description: 'E-commerce and cloud computing leader with a focus on leadership principles.',
                logo_url: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
            },
            {
                name: 'Meta',
                description: 'Social networking pioneer connecting billions of users worldwide.',
                logo_url: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg',
            },
            {
                name: 'Netflix',
                description: 'Streaming service revolutionizing entertainment with a culture of freedom and responsibility.',
                logo_url: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg',
            },
            {
                name: 'Apple',
                description: 'Consumer electronics and software company known for design excellence.',
                logo_url: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg',
            },
        ];

        const { error } = await supabase.from('companies').insert(mockCompanies);

        if (error) {
            toaster.create({
                title: 'Error seeding data',
                description: error.message,
                type: 'error',
            });
        } else {
            toaster.create({
                title: 'Data seeded successfully',
                type: 'success',
            });
            fetchCompanies();
        }
    };

    return (
        <Container maxW="container.xl" py={8}>
            <VStack gap={8} align="stretch">
                <Box>
                    <Heading size="2xl" mb={2}>Target Companies</Heading>
                    <Text color="fgMuted" fontSize="lg">Select a company to start practicing specific interview questions.</Text>
                </Box>

                {loading ? (
                    <Text>Loading companies...</Text>
                ) : companies.length === 0 ? (
                    <VStack py={12} bg="bgSub" borderRadius="xl" gap={4}>
                        <Text fontSize="lg">No companies found.</Text>
                        <Button onClick={seedCompanies} colorPalette="brand">
                            Seed Mock Data
                        </Button>
                    </VStack>
                ) : (
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
                        {companies.map((company) => (
                            <CompanyCard
                                key={company.id}
                                {...company}
                            />
                        ))}
                    </SimpleGrid>
                )}
            </VStack>
        </Container>
    );
}
