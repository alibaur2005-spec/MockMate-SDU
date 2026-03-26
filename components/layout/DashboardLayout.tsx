'use client';

import { Box, Flex, VStack, Heading, Text, Icon, HStack, IconButton, Button, Spacer } from '@chakra-ui/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { FaHome, FaUser, FaMicrophone, FaHistory, FaBars, FaSignOutAlt, FaBuilding, FaChartPie, FaTimes } from 'react-icons/fa';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { toaster } from '@/components/ui/toaster';

const NAV_ITEMS = [
    { label: 'Dashboard', icon: FaHome, href: '/dashboard' },
    { label: 'Companies', icon: FaBuilding, href: '/companies' },
    { label: 'Profile', icon: FaUser, href: '/profile' },
    { label: 'Admissions', icon: FaChartPie, href: '/admission' },
    { label: 'Transcriber', icon: FaMicrophone, href: '/transcriber' },
    { label: 'Reviews', icon: FaHistory, href: '/reviews' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        setMobileMenuOpen(false);
    }, [pathname]);

    const handleLogout = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            router.push('/login');
            toaster.create({ title: 'Logged out successfully', type: 'success' });
        } catch (error: any) {
            toaster.create({ title: 'Logout failed', description: error.message, type: 'error' });
        }
    };

    return (
        <Flex minH="100vh" bg="#08080c">
            {/* Sidebar */}
            <Box
                as="aside"
                w={{ base: isMobileMenuOpen ? '260px' : '0', md: '260px' }}
                transition="width 0.2s"
                overflow="hidden"
                position={{ base: 'fixed', md: 'sticky' }}
                top="0"
                h="100vh"
                zIndex={40}
                style={{
                    background: 'rgba(10,10,16,0.97)',
                    borderRight: '1px solid rgba(255,255,255,0.05)',
                }}
                backdropFilter="blur(20px)"
            >
                <VStack h="full" align="stretch" p={4} gap={6}>
                    <Flex align="center" justify="space-between" px={3} pt={2}>
                        <Heading
                            size="lg"
                            fontWeight="800"
                            letterSpacing="-0.03em"
                            style={{
                                background: 'linear-gradient(135deg, #5672ea, #1ab1b5)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}
                        >
                            MockMate
                        </Heading>
                        <IconButton
                            aria-label="Close Sidebar"
                            variant="ghost"
                            color="gray.500"
                            size="sm"
                            onClick={() => setMobileMenuOpen(false)}
                            display={{ base: 'flex', md: 'none' }}
                        >
                            <Icon as={FaTimes} />
                        </IconButton>
                    </Flex>

                    <VStack align="stretch" gap={1} flex="1" mt={2}>
                        {NAV_ITEMS.map((item) => {
                            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                            return (
                                <Link key={item.href} href={item.href}>
                                    <HStack
                                        px={3}
                                        py={2.5}
                                        borderRadius="lg"
                                        gap={3}
                                        transition="all 0.15s"
                                        style={isActive ? {
                                            background: 'rgba(86,114,234,0.12)',
                                            borderLeft: '2px solid #5672ea',
                                        } : {
                                            background: 'transparent',
                                            borderLeft: '2px solid transparent',
                                        }}
                                        color={isActive ? 'white' : 'gray.500'}
                                        _hover={{
                                            bg: 'rgba(255,255,255,0.04)',
                                            color: 'white',
                                        }}
                                    >
                                        <Icon as={item.icon} boxSize={4} />
                                        <Text fontSize="sm" fontWeight={isActive ? '600' : '500'}>{item.label}</Text>
                                    </HStack>
                                </Link>
                            );
                        })}
                    </VStack>

                    <Box style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }} pt={4}>
                        <Button
                            variant="ghost"
                            justifyContent="flex-start"
                            onClick={handleLogout}
                            gap={3}
                            w="full"
                            px={3}
                            color="gray.500"
                            fontWeight="500"
                            fontSize="sm"
                            _hover={{ color: '#ef4444', bg: 'rgba(239,68,68,0.08)' }}
                        >
                            <Icon as={FaSignOutAlt} boxSize={4} />
                            Sign Out
                        </Button>
                    </Box>
                </VStack>
            </Box>

            {/* Mobile overlay */}
            {isMobileMenuOpen && (
                <Box
                    position="fixed"
                    inset="0"
                    bg="blackAlpha.700"
                    zIndex={35}
                    display={{ base: 'block', md: 'none' }}
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Main Content */}
            <Box flex="1" minW="0">
                {/* Mobile top bar */}
                <Flex
                    as="header"
                    h="14"
                    align="center"
                    px={4}
                    display={{ base: 'flex', md: 'none' }}
                    style={{
                        background: 'rgba(8,8,12,0.85)',
                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                    }}
                    backdropFilter="blur(20px)"
                    position="sticky"
                    top="0"
                    zIndex={30}
                >
                    <IconButton
                        aria-label="Open Menu"
                        variant="ghost"
                        color="gray.400"
                        size="sm"
                        onClick={() => setMobileMenuOpen(true)}
                    >
                        <Icon as={FaBars} />
                    </IconButton>
                    <Spacer />
                    <Heading
                        size="sm"
                        fontWeight="700"
                        style={{
                            background: 'linear-gradient(135deg, #5672ea, #1ab1b5)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}
                    >
                        MockMate
                    </Heading>
                </Flex>

                <Box p={{ base: 4, md: 8 }} maxW="1300px" mx="auto">
                    {children}
                </Box>
            </Box>
        </Flex>
    );
}
