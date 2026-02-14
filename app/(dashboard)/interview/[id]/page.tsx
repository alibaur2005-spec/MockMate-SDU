
'use client';

import { Box, Button, Container, Heading, Text, VStack, HStack, Textarea, Badge, Spinner, Card } from '@chakra-ui/react';
import { createClient } from '@/lib/supabase/client';
import { useRef, useState, useEffect, use } from 'react';
import { toaster } from '@/components/ui/toaster';
import { useRouter } from 'next/navigation';
import { FaCheckCircle, FaClock, FaMicrophone, FaStop, FaSpinner } from 'react-icons/fa';

interface InterviewAttempt {
    id: string;
    status: string;
    started_at: string;
    question: {
        id: string;
        content: string;
        topic: string;
        difficulty: string;
    };
    company: {
        name: string;
    };
}

export default function InterviewPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const supabase = createClient();

    const [attempt, setAttempt] = useState<InterviewAttempt | null>(null);
    const [answer, setAnswer] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Audio Recording State
    const [isRecording, setIsRecording] = useState(false);
    const [isTranscribing, setIsTranscribing] = useState(false); // New state for processing
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const baseAnswerRef = useRef(''); // Store existing text when recording starts

    useEffect(() => {
        const fetchAttempt = async () => {
            const { data, error } = await supabase
                .from('interview_attempts')
                .select(`
                    id,
                    status,
                    started_at,
                    question:questions (
                        id,
                        content,
                        topic,
                        difficulty
                    ),
                    company:companies (
                        name
                    )
                `)
                .eq('id', id)
                .single();

            if (error) {
                console.error('Error fetching interview:', error);
                toaster.create({
                    title: 'Error loading interview',
                    description: error.message,
                    type: 'error',
                });
            } else {
                // Handle Supabase returning arrays for single relations
                const processedData = {
                    ...data,
                    question: Array.isArray(data.question) ? data.question[0] : data.question,
                    company: Array.isArray(data.company) ? data.company[0] : data.company,
                };
                setAttempt(processedData as InterviewAttempt);
            }
            setLoading(false);
        };

        fetchAttempt();
    }, [id]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // Determine supported mime type
            const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' :
                MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' :
                    MediaRecorder.isTypeSupported('audio/mp4') ? 'audio/mp4' :
                        'audio/ogg';

            const mediaRecorder = new MediaRecorder(stream, { mimeType });
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            // Store current answer so we can append to it
            baseAnswerRef.current = answer;

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const type = mimeType;
                const audioBlob = new Blob(chunksRef.current, { type });
                // Use a generic name, the API doesn't strictly need a specific one but good for debugging
                const file = new File([audioBlob], "voice_answer.webm", { type });

                // Stop all tracks
                stream.getTracks().forEach(track => track.stop());

                // Process the file
                await transcribeAudio(file);
            };

            mediaRecorder.start();
            setIsRecording(true);

        } catch (err: any) {
            console.error(err);
            toaster.create({
                title: 'Microphone access denied',
                description: 'Please allow microphone access to record audio.',
                type: 'error',
            });
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const transcribeAudio = async (file: File) => {
        setIsTranscribing(true);
        try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await fetch('/api/transcribe', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error("Transcription failed");

            const result = await response.json();
            const transcriptionText = result.transcription || "";

            if (transcriptionText) {
                const prefix = baseAnswerRef.current;
                const spacer = (prefix && !/\s$/.test(prefix)) ? ' ' : '';
                setAnswer(prev => prev + (prev && !/\s$/.test(prev) ? ' ' : '') + transcriptionText);

                toaster.create({ title: 'Transcription added', type: 'success' });
            } else {
                toaster.create({ title: 'No speech detected', type: 'info' });
            }

        } catch (err: any) {
            console.error("Transcription error", err);
            toaster.create({ title: 'Transcription failed', description: err.message, type: 'error' });
        } finally {
            setIsTranscribing(false);
        }
    };


    const handleSubmit = async () => {
        if (!answer.trim()) {
            toaster.create({
                title: 'Empty answer',
                description: 'Please write some code or explanation before submitting.',
                type: 'warning',
            });
            return;
        }

        if (!attempt) return; // Guard clause

        setSubmitting(true);

        // 1. Update attempt status to completed locally first (or we can do it after)
        // actually better to do it after successful AI critique or parallel?
        // Let's update the answer first.
        const { error: updateError } = await supabase
            .from('interview_attempts')
            .update({
                answer: answer,
                ended_at: new Date().toISOString(),
                status: 'completed'
            })
            .eq('id', id);

        if (updateError) {
            toaster.create({
                title: 'Error saving answer',
                description: updateError.message,
                type: 'error',
            });
            setSubmitting(false);
            return;
        }

        // 2. Call Gemini AI via API Route
        try {
            const response = await fetch('/api/evaluate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question: attempt.question,
                    answer: answer,
                    company: attempt.company?.name || 'Unknown Company'
                })
            });

            if (!response.ok) throw new Error('AI Evaluation failed');

            const aiResult = await response.json();

            // 3. Save Evaluation to DB
            const { error: evalError } = await supabase
                .from('evaluations')
                .insert({
                    attempt_id: attempt.id,
                    score: aiResult.score || 0,
                    feedback: aiResult.feedback || {},
                    ai_model: 'gemini-1.5-flash',
                    review_text: aiResult.feedback?.summary || "No summary provided."
                });

            if (evalError) throw evalError;

            toaster.create({
                title: 'Interview Completed',
                description: 'Your answer has been evaluated by Gemini AI.',
                type: 'success',
            });

            router.push(`/reviews/${id}`);

        } catch (err: any) {
            console.error(err);
            toaster.create({
                title: 'Evaluation Error',
                description: err.message || 'Failed to get AI feedback. Interview is saved.', // Interview is still saved as completed
                type: 'warning',
            });
            router.push(`/reviews/${id}`); // Still redirect even if AI fails, so user isn't stuck
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <Container centerContent py={20}>
                <Spinner size="xl" />
                <Text mt={4}>Loading interview environment...</Text>
            </Container>
        );
    }

    if (!attempt) {
        return (
            <Container centerContent py={20}>
                <Heading>Interview not found</Heading>
                <Button mt={4} onClick={() => router.push('/companies')}>Back to Companies</Button>
            </Container>
        );
    }

    return (
        <Container maxW="container.xl" py={8} h="calc(100vh - 80px)">
            <HStack align="start" h="full" gap={6} flexDir={{ base: 'column', md: 'row' }}>
                {/* Left Panel: Question */}
                <VStack flex="1" h="full" bg="bg.panel" p={6} borderRadius="xl" border="1px solid" borderColor="border" boxShadow="sm" align="stretch">
                    <HStack justify="space-between" mb={4}>
                        <Badge colorPalette="purple">{attempt.company.name}</Badge>
                        <HStack color="fgMuted" fontSize="sm">
                            <FaClock />
                            <Text>Started: {new Date(attempt.started_at).toLocaleTimeString()}</Text>
                        </HStack>
                    </HStack>

                    <VStack align="start" gap={4} flex="1">
                        <HStack>
                            <Badge colorPalette="blue">{attempt.question.topic}</Badge>
                            <Badge variant="outline">{attempt.question.difficulty}</Badge>
                        </HStack>
                        <Heading size="lg">{attempt.question.content}</Heading>
                        <Text color="fgMuted">
                            Write your solution in the editor. You can write code or pseudocode.
                        </Text>
                    </VStack>
                </VStack>

                {/* Right Panel: Editor */}
                <VStack flex="1" h="full" gap={4} w="full">
                    <Box w="full" flex="1" bg="#1e1e1e" borderRadius="xl" overflow="hidden" p={1}>
                        <Textarea
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                            placeholder={isTranscribing ? "Transcribing audio..." : "// Write your solution here... or click 'Start Recording' to speak."}
                            h="full"
                            bg="transparent"
                            color="white"
                            fontFamily="monospace"
                            fontSize="md"
                            border="none"
                            _focus={{ ring: 'none' }}
                            resize="none"
                            p={4}
                            disabled={isRecording || isTranscribing}
                        />

                    </Box>
                    <HStack w="full" justify="space-between">
                        <Button
                            colorPalette={isRecording ? "red" : "blue"}
                            variant={isRecording ? "solid" : "outline"}
                            onClick={isRecording ? stopRecording : startRecording}
                            disabled={submitting || isTranscribing}
                            loading={isTranscribing}
                            loadingText="Processing..."
                        >
                            {isRecording ? (
                                <><FaStop style={{ marginRight: '8px' }} /> Stop Recording</>
                            ) : (
                                <><FaMicrophone style={{ marginRight: '8px' }} /> Record Answer</>
                            )}
                        </Button>

                        <HStack>
                            <Button variant="ghost" onClick={() => router.back()}>Cancel</Button>
                            <Button
                                colorPalette="green"
                                size="lg"
                                onClick={handleSubmit}
                                loading={submitting}
                                disabled={isRecording || isTranscribing}
                            >
                                <FaCheckCircle style={{ marginRight: '8px' }} /> Submit Solution
                            </Button>
                        </HStack>
                    </HStack>
                </VStack>
            </HStack>
        </Container>
    );
}
