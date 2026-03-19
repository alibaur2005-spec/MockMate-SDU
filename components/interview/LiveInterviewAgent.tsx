'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Box, Button, VStack, HStack, Text, Heading, Badge, IconButton, Icon } from '@chakra-ui/react';
import { FaMicrophone, FaMicrophoneSlash, FaPlay, FaStop } from 'react-icons/fa';
import { useGeminiLiveClient } from '@/lib/gemini/live-client';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { toaster } from '@/components/ui/toaster';

const MotionBox = motion(Box);

export function LiveInterviewAgent({ attemptId, companyName, role, questionPrompt }: { attemptId?: string, companyName?: string, role?: string, questionPrompt?: string }) {
    const systemPrompt = `You are an expert technical interviewer at ${companyName || 'a top tech company'}. You are interviewing a candidate for a ${role || 'Software Engineer'} role. ${questionPrompt ? `Start by asking this question: ${questionPrompt}` : 'Start by asking a classic algorithm or system design question.'} Speak clearly and wait for the candidate's audio response. Be critical but constructive. Speak with a natural, conversational tone.`;

    const {
        isConnected,
        isRecording,
        isAiSpeaking,
        logs,
        connect,
        disconnect,
        startRecording,
        stopRecording
    } = useGeminiLiveClient({ systemInstruction: systemPrompt });

    const [isClient, setIsClient] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs]);

    const handleEndInterview = async () => {
        disconnect();
        
        if (!attemptId || logs.length === 0) {
            router.push('/dashboard');
            return;
        }

        setIsSubmitting(true);
        try {
            const transcript = logs
                .filter(log => log.role === 'user' || log.role === 'ai')
                .map(log => `${log.role === 'ai' ? 'Interviewer' : 'Candidate'}: ${log.content}`)
                .join('\n\n');

            const { error: updateError } = await supabase
                .from('interview_attempts')
                .update({ 
                    status: 'completed', 
                    ended_at: new Date().toISOString(),
                    answer: transcript || 'No answer provided'
                })
                .eq('id', attemptId);

            if (updateError) throw updateError;

            // Trigger Evaluation API
            toaster.create({
                title: 'Interview Completed',
                description: 'Generating AI feedback...',
                type: 'info',
            });

            const evaluateRes = await fetch('/api/evaluate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    attemptId, 
                    answer: transcript || 'No answer provided',
                    question: { content: questionPrompt || 'General Interview', topic: 'General', difficulty: 'Medium' }, // Provide mock or real question
                    company: companyName || 'Unknown Company'
                })
            });

            if (!evaluateRes.ok) {
                throw new Error('Failed to generate AI evaluation');
            }

            const aiResult = await evaluateRes.json();

            const { error: evalError } = await supabase
                .from('evaluations')
                .insert({
                    attempt_id: attemptId,
                    score: aiResult.score || 0,
                    feedback: aiResult.feedback || {},
                    ai_model: 'gemini-1.5-flash',
                    review_text: aiResult.feedback?.summary || "No summary provided."
                });

            if (evalError) throw evalError;

            router.push(`/reviews/${attemptId}`);
        } catch (error: any) {
            console.error('Error ending interview:', error);
            toaster.create({
                title: 'Error saving transcript',
                description: error.message,
                type: 'error',
            });
            setIsSubmitting(false);
        }
    };

    if (!isClient) return null;

    return (
        <VStack gap={6} align="stretch" w="full" maxW="4xl" mx="auto" p={6} bg="bgSub" borderRadius="2xl" shadow="md">
            <HStack justify="space-between" w="full">
                <Heading size="md">Live AI Interviewer</Heading>
                <Badge colorPalette={isConnected ? 'green' : 'gray'}>
                    {isConnected ? 'Connected' : 'Disconnected'}
                </Badge>
            </HStack>

            <Box
                h="400px"
                bg="white"
                borderRadius="xl"
                p={4}
                overflowY="auto"
                display="flex"
                flexDirection="column"
                gap={3}
                ref={scrollRef}
                border="1px solid"
                borderColor="gray.200"
            >
                {logs.length === 0 && (
                    <Text color="gray.500" textAlign="center" mt={10}>
                        Connect to start the interview. The AI will speak to you, and you can speak back.
                    </Text>
                )}
                {logs.map((log, i) => (
                    <Box
                        key={i}
                        alignSelf={log.role === 'user' ? 'flex-end' : log.role === 'ai' ? 'flex-start' : 'center'}
                        bg={log.role === 'user' ? 'brand.500' : log.role === 'ai' ? 'gray.100' : 'transparent'}
                        color={log.role === 'user' ? 'white' : log.role === 'ai' ? 'black' : 'gray.500'}
                        px={4}
                        py={2}
                        borderRadius="xl"
                        maxW="80%"
                        fontSize={log.role === 'system' ? 'xs' : 'md'}
                        fontStyle={log.role === 'system' ? 'italic' : 'normal'}
                    >
                        <span dangerouslySetInnerHTML={{ __html: log.content.split('**').map((text, idx) => idx % 2 === 1 ? `<strong>${text}</strong>` : text).join('') }} />
                    </Box>
                ))}
            </Box>

            <HStack justify="center" gap={8} pt={4}>
                {!isConnected && !isSubmitting ? (
                    <Button colorPalette="brand" size="lg" onClick={connect}>
                        <Icon as={FaPlay} mr={2} /> Connect & Start
                    </Button>
                ) : (
                    <Button colorPalette="red" size="lg" onClick={handleEndInterview} loading={isSubmitting}>
                        <Icon as={FaStop} mr={2} /> End Interview
                    </Button>
                )}

                <MotionBox
                    animate={{
                        scale: isRecording ? [1, 1.1, 1] : 1,
                    }}
                    transition={{
                        repeat: isRecording ? Infinity : 0,
                        duration: 1.5
                    }}
                >
                    <IconButton
                        aria-label="Toggle Microphone"
                        colorPalette={isRecording ? 'red' : 'gray'}
                        size="xl"
                        borderRadius="full"
                        disabled={!isConnected || isAiSpeaking}
                        onClick={isRecording ? stopRecording : startRecording}
                        variant={isRecording ? "solid" : "outline"}
                    >
                        {isRecording ? <FaMicrophone /> : <FaMicrophoneSlash />}
                    </IconButton>
                </MotionBox>
            </HStack>

            <HStack justify="center">
                {isAiSpeaking && (
                    <Text color="brand.500" fontWeight="bold" fontSize="sm">
                        AI is speaking...
                    </Text>
                )}
                {isRecording && !isAiSpeaking && (
                    <Text color="red.500" fontWeight="bold" fontSize="sm">
                        Recording... Please speak.
                    </Text>
                )}
            </HStack>
        </VStack>
    );
}
