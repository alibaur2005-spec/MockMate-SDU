
import { Box, Heading, Text, VStack, Image, Button, Badge, HStack } from '@chakra-ui/react';
import Link from 'next/link';
import { motion } from 'framer-motion';

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
            bg="bg"
            border="1px solid"
            borderColor="border"
            borderRadius="xl"
            overflow="hidden"
            whileHover={{ y: -5, boxShadow: 'lg' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 } as any}
        >
            <Box p={6}>
                <HStack justify="space-between" align="start" mb={4}>
                    <Box bg="white" p={2} borderRadius="lg" border="1px solid" borderColor="gray.100">
                        <Image
                            src={logo_url || "https://via.placeholder.com/64"}
                            alt={name}
                            w={12}
                            h={12}
                            objectFit="contain"
                        />
                    </Box>
                    {question_count > 0 && (
                        <Badge colorPalette="blue" variant="subtle" borderRadius="full" px={2}>
                            {question_count} Questions
                        </Badge>
                    )}
                </HStack>

                <VStack align="start" gap={2} mb={6}>
                    <Heading size="md">{name}</Heading>
                    <Text fontSize="sm" color="fgMuted" lineClamp={3}>
                        {description}
                    </Text>
                </VStack>

                <VStack gap={2} mt={2}>
                    <Link href={`/interview/live?company_id=${id}`} style={{ width: '100%' }}>
                        <Button width="100%" colorPalette="purple" variant="solid" size="sm">
                            Take Mock AI Interview
                        </Button>
                    </Link>
                    <Link href={`/companies/${id}`} style={{ width: '100%' }}>
                        <Button width="100%" colorPalette="brand" variant="outline" size="sm">
                            View Questions
                        </Button>
                    </Link>
                </VStack>
            </Box>
        </MotionBox>
    );
}
