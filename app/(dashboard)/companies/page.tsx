'use client';

import { Box, Button, Heading, SimpleGrid, Text, VStack, HStack, Input, Image } from '@chakra-ui/react';
import { toaster } from '@/components/ui/toaster';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState, useRef } from 'react';
import CompanyCard from '@/components/companies/CompanyCard';
import { useAdmin } from '@/lib/auth/hooks';
import { FaUpload } from 'react-icons/fa';

interface Company { id: string; name: string; description: string; logo_url: string; category: string; }

const CATEGORY_ORDER = ['Big Tech', 'KZ Companies', 'Big 4', 'Other'];

export default function CompaniesPage() {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const { isAdmin } = useAdmin();
    const supabase = createClient();

    const [showAddForm, setShowAddForm] = useState(false);
    const [newName, setNewName] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [newCategory, setNewCategory] = useState('Other');
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const logoInputRef = useRef<HTMLInputElement>(null);

    const fetchCompanies = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('companies').select('*');
        if (error) { toaster.create({ title: 'Error fetching companies', description: error.message, type: 'error' }); }
        else { setCompanies(data || []); }
        setLoading(false);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { fetchCompanies(); }, []);

    const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const uploadLogo = async (file: File): Promise<string | null> => {
        const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
        const { error } = await supabase.storage.from('logos').upload(fileName, file);
        if (error) {
            toaster.create({ title: 'Logo upload failed', description: error.message, type: 'error' });
            return null;
        }
        const { data: urlData } = supabase.storage.from('logos').getPublicUrl(fileName);
        return urlData.publicUrl;
    };

    const handleAddCompany = async () => {
        if (!newName.trim()) { toaster.create({ title: 'Company name is required', type: 'error' }); return; }
        setIsAdding(true);

        let logoUrl: string | null = null;
        if (logoFile) {
            logoUrl = await uploadLogo(logoFile);
            if (!logoUrl) { setIsAdding(false); return; }
        }

        const { data, error } = await supabase
            .from('companies')
            .insert({ name: newName.trim(), description: newDescription.trim(), logo_url: logoUrl, category: newCategory })
            .select().single();
        setIsAdding(false);

        if (error) { toaster.create({ title: 'Error adding company', description: error.message, type: 'error' }); }
        else {
            setCompanies(prev => [data, ...prev]);
            setShowAddForm(false);
            setNewName(''); setNewDescription(''); setLogoFile(null); setLogoPreview(''); setNewCategory('Other');
            toaster.create({ title: 'Company added', type: 'success' });
        }
    };

    const resetForm = () => {
        setShowAddForm(false);
        setNewName(''); setNewDescription(''); setLogoFile(null); setLogoPreview(''); setNewCategory('Other');
    };

    const inputStyle = { bg: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)', color: 'white', _hover: { borderColor: 'rgba(255,255,255,0.15)' }, _focus: { borderColor: '#5672ea', boxShadow: '0 0 0 1px #5672ea' }, _placeholder: { color: 'gray.600' } };

    const grouped = CATEGORY_ORDER.reduce<Record<string, Company[]>>((acc, cat) => {
        const list = companies.filter(c => (c.category || 'Other') === cat);
        if (list.length > 0) acc[cat] = list;
        return acc;
    }, {});

    return (
        <VStack gap={8} align="stretch">
            <HStack justify="space-between" align="start" flexDir={{ base: 'column', md: 'row' }} gap={4}>
                <Box>
                    <Heading size="2xl" fontWeight="800" letterSpacing="-0.03em" mb={2}>Target Companies</Heading>
                    <Text color="gray.500" fontSize="sm">Select a company to start practicing specific interview questions.</Text>
                </Box>
                {isAdmin && (
                    <Button size="sm" onClick={() => showAddForm ? resetForm() : setShowAddForm(true)} borderRadius="lg" fontWeight="600"
                        {...(showAddForm ? { variant: 'ghost', color: '#ef4444', _hover: { bg: 'rgba(239,68,68,0.08)' } } : { bg: 'white', color: '#08080c', _hover: { bg: 'gray.200' } })}
                    >{showAddForm ? 'Cancel' : 'Add Company'}</Button>
                )}
            </HStack>

            {isAdmin && showAddForm && (
                <Box p={6} borderRadius="xl" style={{ background: 'rgba(86,114,234,0.06)', border: '1px solid rgba(86,114,234,0.15)' }}>
                    <VStack align="stretch" gap={4}>
                        <Heading size="sm" fontWeight="700">New Company</Heading>

                        <Box>
                            <Text mb={2} fontSize="xs" fontWeight="500" color="gray.400">Logo</Text>
                            <HStack gap={4}>
                                {logoPreview ? (
                                    <Box w={14} h={14} borderRadius="lg" overflow="hidden" bg="white" p={1.5} flexShrink={0}>
                                        <Image src={logoPreview} alt="Preview" w="full" h="full" objectFit="contain" />
                                    </Box>
                                ) : (
                                    <Box w={14} h={14} borderRadius="lg" display="flex" alignItems="center" justifyContent="center" flexShrink={0} style={{ background: 'rgba(255,255,255,0.04)', border: '1px dashed rgba(255,255,255,0.12)' }}>
                                        <FaUpload color="rgba(255,255,255,0.2)" />
                                    </Box>
                                )}
                                <VStack align="start" gap={1}>
                                    <Button size="xs" variant="outline" onClick={() => logoInputRef.current?.click()} borderColor="rgba(255,255,255,0.1)" color="gray.400" borderRadius="lg" _hover={{ bg: 'rgba(255,255,255,0.04)' }}>
                                        {logoFile ? 'Change File' : 'Upload Logo'}
                                    </Button>
                                    <Text fontSize="xs" color="gray.600">{logoFile ? logoFile.name : 'PNG, SVG, JPG (max 2MB)'}</Text>
                                </VStack>
                                <Input type="file" display="none" ref={logoInputRef} accept="image/*" onChange={handleLogoSelect} />
                            </HStack>
                        </Box>

                        <HStack gap={4} flexDir={{ base: 'column', md: 'row' }}>
                            <Box flex={1} w="full">
                                <Text mb={1} fontSize="xs" fontWeight="500" color="gray.400">Name *</Text>
                                <Input placeholder="e.g. Google" value={newName} onChange={(e) => setNewName(e.target.value)} borderRadius="lg" {...inputStyle} />
                            </Box>
                            <Box flex={1} w="full">
                                <Text mb={1} fontSize="xs" fontWeight="500" color="gray.400">Category</Text>
                                <select
                                    value={newCategory}
                                    onChange={(e) => setNewCategory(e.target.value)}
                                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: 'white', fontSize: '14px' }}
                                >
                                    {CATEGORY_ORDER.map(cat => <option key={cat} value={cat} style={{ background: '#1a1a2e' }}>{cat}</option>)}
                                </select>
                            </Box>
                        </HStack>
                        <Box>
                            <Text mb={1} fontSize="xs" fontWeight="500" color="gray.400">Description</Text>
                            <Input placeholder="Short description of the company..." value={newDescription} onChange={(e) => setNewDescription(e.target.value)} borderRadius="lg" {...inputStyle} />
                        </Box>
                        <HStack justify="flex-end">
                            <Button variant="ghost" onClick={resetForm} color="gray.500" px={4}>Cancel</Button>
                            <Button onClick={handleAddCompany} loading={isAdding} bg="white" color="#08080c" borderRadius="lg" fontWeight="600" px={6} _hover={{ bg: 'gray.200' }}>Save Company</Button>
                        </HStack>
                    </VStack>
                </Box>
            )}

            {loading ? (
                <Text color="gray.500">Loading companies...</Text>
            ) : companies.length === 0 ? (
                <VStack py={16} borderRadius="xl" gap={4} style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <Text color="gray.500">No companies found.</Text>
                </VStack>
            ) : (
                <VStack gap={10} align="stretch">
                    {Object.entries(grouped).map(([category, list]) => (
                        <Box key={category}>
                            <HStack gap={3} mb={5} align="center">
                                <Heading size="md" fontWeight="700" color="white">{category}</Heading>
                                <Box px={2} py={0.5} borderRadius="full" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                                    <Text fontSize="xs" color="gray.500">{list.length}</Text>
                                </Box>
                            </HStack>
                            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={5}>
                                {list.map((company) => <CompanyCard key={company.id} {...company} />)}
                            </SimpleGrid>
                        </Box>
                    ))}
                </VStack>
            )}
        </VStack>
    );
}