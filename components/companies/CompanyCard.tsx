import { Box, Heading, Text, VStack, Image, Button, Badge, HStack } from '@chakra-ui/react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaPlay } from 'react-icons/fa';

const MotionBox = motion(Box);

interface CompanyCardProps {
    id: string;
    name: string;
    description: string;
    logo_url: string;
    question_count?: number;
}

export default function CompanyCard({ id, name, description, logo_url, question_count = 0 }: CompanyCardProps) {
    return (
        <MotionBox
            borderRadius="xl"
            overflow="hidden"
            whileHover={{ y: -5 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 } as any}
            style={{
                background: 'rgba(255,255,255,0.025)',
                border: '1px solid rgba(255,255,255,0.06)',
            }}
            _hover={{ borderColor: 'rgba(86,114,234,0.25)' }}
        >
            <Box p={6}>
                <HStack justify="space-between" align="start" mb={4}>
                    <Box
                        p={2.5}
                        borderRadius="lg"
                        bg="white"
                        style={{ border: '1px solid rgba(255,255,255,0.1)' }}
                    >
                        <Image
                            src={logo_url || 'https://via.placeholder.com/64'}
                            alt={name}
                            w={10}
                            h={10}
                            objectFit="contain"
                        />
                    </Box>
                    {question_count > 0 && (
                        <Badge
                            fontSize="xs"
                            px={2.5}
                            py={0.5}
                            borderRadius="full"
                            style={{ background: 'rgba(86,114,234,0.12)', color: '#7b98f2', border: '1px solid rgba(86,114,234,0.2)' }}
                        >
                            {question_count} Questions
                        </Badge>
                    )}
                </HStack>

                <VStack align="start" gap={1.5} mb={5}>
                    <Heading size="md" fontWeight="700">{name}</Heading>
                    <Text fontSize="xs" color="gray.500" lineClamp={2}>{description}</Text>
                </VStack>

                <VStack gap={2}>
                    <Link href={`/interview/live?company_id=${id}`} style={{ width: '100%' }}>
                        <Button
                            width="100%"
                            size="sm"
                            borderRadius="lg"
                            fontWeight="600"
                            bg="white"
                            color="#08080c"
                            _hover={{ bg: 'gray.200' }}
                        >
                            <FaPlay style={{ marginRight: '6px' }} /> Mock AI Interview
                        </Button>
                    </Link>
                    <Link href={`/companies/${id}`} style={{ width: '100%' }}>
                        <Button
                            width="100%"
                            size="sm"
                            variant="outline"
                            borderRadius="lg"
                            fontWeight="600"
                            color="gray.400"
                            style={{ borderColor: 'rgba(255,255,255,0.08)' }}
                            _hover={{ bg: 'rgba(255,255,255,0.04)', color: 'white' }}
                        >
                            View Questions
                        </Button>
                    </Link>
                </VStack>
            </Box>
        </MotionBox>
    );
}
