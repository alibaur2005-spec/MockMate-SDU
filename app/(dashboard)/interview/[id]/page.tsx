'use client';

import { Box, Button, Heading, Text, VStack, HStack, Textarea, Badge, Spinner } from '@chakra-ui/react';
import { createClient } from '@/lib/supabase/client';
import { useRef, useState, useEffect, use } from 'react';
import { toaster } from '@/components/ui/toaster';
import { useRouter } from 'next/navigation';
import { FaCheckCircle, FaClock, FaMicrophone, FaStop } from 'react-icons/fa';

interface InterviewAttempt { id: string; status: string; started_at: string; question: { id: string; content: string; topic: string; difficulty: string }; company: { name: string }; }

export default function InterviewPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const supabase = createClient();
    const [attempt, setAttempt] = useState<InterviewAttempt | null>(null);
    const [answer, setAnswer] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const baseAnswerRef = useRef('');

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        const fetchAttempt = async () => {
            const { data, error } = await supabase.from('interview_attempts').select(`id, status, started_at, question:questions (id, content, topic, difficulty), company:companies (name)`).eq('id', id).single();
            if (error) { toaster.create({ title: 'Error loading interview', description: error.message, type: 'error' }); }
            else { const p = { ...data, question: Array.isArray(data.question) ? data.question[0] : data.question, company: Array.isArray(data.company) ? data.company[0] : data.company }; setAttempt(p as InterviewAttempt); }
            setLoading(false);
        };
        fetchAttempt();
    }, [id]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : MediaRecorder.isTypeSupported('audio/mp4') ? 'audio/mp4' : 'audio/ogg';
            const mediaRecorder = new MediaRecorder(stream, { mimeType });
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];
            baseAnswerRef.current = answer;
            mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
            mediaRecorder.onstop = async () => { const audioBlob = new Blob(chunksRef.current, { type: mimeType }); const file = new File([audioBlob], 'voice_answer.webm', { type: mimeType }); stream.getTracks().forEach(track => track.stop()); await transcribeAudio(file); };
            mediaRecorder.start();
            setIsRecording(true);
        } catch (err: any) { toaster.create({ title: 'Microphone access denied', type: 'error' }); }
    };

    const stopRecording = () => { if (mediaRecorderRef.current && isRecording) { mediaRecorderRef.current.stop(); setIsRecording(false); } };

    const transcribeAudio = async (file: File) => {
        setIsTranscribing(true);
        try {
            const formData = new FormData(); formData.append('file', file);
            const response = await fetch('/api/transcribe', { method: 'POST', body: formData });
            if (!response.ok) throw new Error('Transcription failed');
            const result = await response.json();
            if (result.transcription) { setAnswer(prev => prev + (prev && !/\s$/.test(prev) ? ' ' : '') + result.transcription); toaster.create({ title: 'Transcription added', type: 'success' }); }
            else { toaster.create({ title: 'No speech detected', type: 'info' }); }
        } catch (err: any) { toaster.create({ title: 'Transcription failed', description: err.message, type: 'error' }); }
        finally { setIsTranscribing(false); }
    };

    const handleSubmit = async () => {
        if (!answer.trim()) { toaster.create({ title: 'Please write an answer before submitting', type: 'warning' }); return; }
        if (!attempt) return;
        setSubmitting(true);
        const { error: updateError } = await supabase.from('interview_attempts').update({ answer, ended_at: new Date().toISOString(), status: 'completed' }).eq('id', id);
        if (updateError) { toaster.create({ title: 'Error saving', description: updateError.message, type: 'error' }); setSubmitting(false); return; }
        try {
            const response = await fetch('/api/evaluate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question: attempt.question, answer, company: attempt.company?.name || 'Unknown' }) });
            if (!response.ok) throw new Error('AI Evaluation failed');
            const aiResult = await response.json();
            await supabase.from('evaluations').insert({ attempt_id: attempt.id, score: aiResult.score || 0, feedback: aiResult.feedback || {}, ai_model: 'gemini-1.5-flash', review_text: aiResult.feedback?.summary || 'No summary.' });
            toaster.create({ title: 'Interview Completed', type: 'success' });
            router.push(`/reviews/${id}`);
        } catch (err: any) { toaster.create({ title: 'Evaluation error', description: err.message, type: 'warning' }); router.push(`/reviews/${id}`); }
        finally { setSubmitting(false); }
    };

    if (loading) return <VStack py={20}><Spinner size="xl" color="gray.500" /><Text mt={4} color="gray.500">Loading interview...</Text></VStack>;
    if (!attempt) return <VStack py={20}><Heading color="gray.400">Interview not found</Heading><Button mt={4} onClick={() => router.push('/companies')} variant="outline" borderColor="rgba(255,255,255,0.08)" color="gray.400">Back</Button></VStack>;

    const diffColor = attempt.question.difficulty === 'Easy' ? '34,197,94' : attempt.question.difficulty === 'Medium' ? '234,179,8' : '239,68,68';

    return (
        <HStack align="start" h={{ base: 'auto', md: 'calc(100vh - 100px)' }} gap={5} flexDir={{ base: 'column', md: 'row' }}>
            {/* Question panel */}
            <VStack flex="1" h="full" p={6} borderRadius="xl" align="stretch" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <HStack justify="space-between" mb={4}>
                    <Badge px={2.5} py={0.5} borderRadius="full" fontSize="xs" style={{ background: 'rgba(168,85,247,0.1)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.2)' }}>{attempt.company.name}</Badge>
                    <HStack color="gray.500" fontSize="xs"><FaClock /><Text ml={1}>{new Date(attempt.started_at).toLocaleTimeString()}</Text></HStack>
                </HStack>
                <VStack align="start" gap={3} flex="1">
                    <HStack>
                        <Badge px={2.5} py={0.5} borderRadius="full" fontSize="xs" style={{ background: 'rgba(86,114,234,0.08)', color: '#7b98f2' }}>{attempt.question.topic}</Badge>
                        <Badge px={2.5} py={0.5} borderRadius="full" fontSize="xs" style={{ background: `rgba(${diffColor},0.08)`, color: `rgba(${diffColor},1)` }}>{attempt.question.difficulty}</Badge>
                    </HStack>
                    <Heading size="lg" fontWeight="700" lineHeight="1.4">{attempt.question.content}</Heading>
                    <Text color="gray.500" fontSize="sm">Write your solution or record your answer.</Text>
                </VStack>
            </VStack>

            {/* Editor panel */}
            <VStack flex="1" h="full" gap={4} w="full">
                <Box w="full" flex="1" borderRadius="xl" overflow="hidden" style={{ background: '#0d0d14', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <Textarea
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        placeholder={isTranscribing ? 'Transcribing audio...' : '// Write your solution here...'}
                        h="full"
                        bg="transparent"
                        color="white"
                        fontFamily="monospace"
                        fontSize="sm"
                        border="none"
                        _focus={{ ring: 'none' }}
                        resize="none"
                        p={5}
                        disabled={isRecording || isTranscribing}
                    />
                </Box>
                <HStack w="full" justify="space-between">
                    <Button
                        onClick={isRecording ? stopRecording : startRecording}
                        disabled={submitting || isTranscribing}
                        loading={isTranscribing}
                        loadingText="Processing..."
                        borderRadius="lg"
                        fontWeight="600"
                        size="sm"
                        {...(isRecording ? { bg: '#ef4444', color: 'white', _hover: { bg: '#dc2626' } } : { variant: 'outline', borderColor: 'rgba(255,255,255,0.08)', color: 'gray.400', _hover: { bg: 'rgba(255,255,255,0.04)' } })}
                    >
                        {isRecording ? <><FaStop style={{ marginRight: '6px' }} /> Stop</> : <><FaMicrophone style={{ marginRight: '6px' }} /> Record</>}
                    </Button>
                    <HStack>
                        <Button variant="ghost" onClick={() => router.back()} color="gray.500" size="sm">Cancel</Button>
                        <Button size="sm" onClick={handleSubmit} loading={submitting} disabled={isRecording || isTranscribing} bg="white" color="#08080c" borderRadius="lg" fontWeight="700" _hover={{ bg: 'gray.200' }}>
                            <FaCheckCircle style={{ marginRight: '6px' }} /> Submit
                        </Button>
                    </HStack>
                </HStack>
            </VStack>
        </HStack>
    );
}
