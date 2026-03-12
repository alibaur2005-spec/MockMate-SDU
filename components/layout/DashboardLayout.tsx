'use client';

import { Box, Flex, VStack, Heading, Text, Icon, HStack, Avatar, Spacer, IconButton, Collapsible, Button } from '@chakra-ui/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { FaHome, FaUser, FaCode, FaMicrophone, FaHistory, FaBars, FaSignOutAlt, FaMoon, FaSun, FaBuilding, FaChartPie } from 'react-icons/fa';
import { ColorModeButton } from '@/components/ui/color-mode';
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

    // Close mobile menu on route change
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
        <Flex minH="100vh" bg="bgSub">
            {/* Sidebar */}
            <Box
                as="aside"
                bg="bg"
                borderRight="1px solid"
                borderColor="border"
                w={{ base: isMobileMenuOpen ? '64' : '0', md: '64' }}
                transition="width 0.2s"
                overflow="hidden"
                position={{ base: 'fixed', md: 'sticky' }}
                top="0"
                h="100vh"
                zIndex="sticky"
            >
                <VStack h="full" align="stretch" p={4} gap={8}>
                    <Flex align="center" justify="space-between" px={2}>
                        <Heading size="lg" color="brand.600">MockMate</Heading>
                        <IconButton
                            aria-label="Close Sidebar"
                            variant="ghost"
                            onClick={() => setMobileMenuOpen(false)}
                            display={{ base: 'flex', md: 'none' }}
                        >
                            <Icon as={FaBars} />
                        </IconButton>
                    </Flex>

                    <VStack align="stretch" gap={2} flex="1">
                        {NAV_ITEMS.map((item) => {
                            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                            return (
                                <Link key={item.href} href={item.href}>
                                    <HStack
                                        p={3}
                                        borderRadius="lg"
                                        bg={isActive ? 'brand.50' : 'transparent'}
                                        color={isActive ? 'brand.600' : 'fgMuted'}
                                        _hover={{ bg: 'brand.50', color: 'brand.600' }}
                                        transition="all 0.2s"
                                        gap={4}
                                    >
                                        <Icon as={item.icon} boxSize={5} />
                                        <Text fontWeight={isActive ? 'semibold' : 'medium'}>{item.label}</Text>
                                    </HStack>
                                </Link>
                            );
                        })}
                    </VStack>

                    <Box borderTop="1px solid" borderColor="border" pt={4}>
                        <VStack align="stretch" gap={2}>
                            <ColorModeButton />
                            <Button
                                variant="ghost"
                                colorPalette="red"
                                justifyContent="flex-start"
                                onClick={handleLogout}
                                gap={4}
                            >
                                <Icon as={FaSignOutAlt} />
                                Sign Out
                            </Button>
                        </VStack>
                    </Box>
                </VStack>
            </Box>

            {/* Main Content */}
            <Box flex="1" w="full" bg="bgSub">
                {/* Top Header (Mobile Only Toggle) */}
                <Flex
                    as="header"
                    bg="bg"
                    h="16"
                    align="center"
                    px={4}
                    borderBottom="1px solid"
                    borderColor="border"
                    display={{ base: 'flex', md: 'none' }}
                >
                    <IconButton
                        aria-label="Open Menu"
                        variant="ghost"
                        onClick={() => setMobileMenuOpen(true)}
                    >
                        <Icon as={FaBars} />
                    </IconButton>
                    <Spacer />
                    <Heading size="md" color="brand.600">MockMate</Heading>
                </Flex>

                {/* Page Content */}
                <Box p={{ base: 4, md: 8 }} maxW="7xl" mx="auto">
                    {children}
                </Box>
            </Box>
        </Flex>
    );
}


