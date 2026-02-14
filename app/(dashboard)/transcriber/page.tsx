'use client';

import { Box, Container, Heading, Text, VStack, HStack, Button, Input, Icon, Table, Badge, Progress, Card, Separator, IconButton, Dialog, Portal } from '@chakra-ui/react';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState, useRef } from 'react';
import { toaster } from '@/components/ui/toaster';
import { FaCloudUploadAlt, FaFileAudio, FaCheck, FaTimes, FaSpinner, FaMicrophone, FaStop, FaEye, FaTrash } from 'react-icons/fa';


interface Transcription {
    id: string;
    file_name: string;
    created_at: string;
    status: 'processing' | 'completed' | 'failed';
    transcription_text?: string;
}

export default function TranscriberPage() {
    const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const mimeTypeRef = useRef<string>(''); // Store the actual mime type used
    const supabase = createClient();

    // Web Speech API State
    const [isListening, setIsListening] = useState(false);
    const [liveTranscript, setLiveTranscript] = useState('');
    const recognitionRef = useRef<any>(null); // Use any for SpeechRecognition to avoid type issues

    const [selectedTranscription, setSelectedTranscription] = useState<Transcription | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = (transcription: Transcription) => {
        setSelectedTranscription(transcription);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedTranscription(null);
    };



    useEffect(() => {
        const fetchTranscriptions = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('transcriptions')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching transcriptions:', error);
            } else {
                setTranscriptions(data || []);
            }
            setLoading(false);
        };

        fetchTranscriptions();
    }, []);

    const deleteTranscription = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this transcription?')) return;

        const { error } = await supabase.from('transcriptions').delete().eq('id', id);

        if (error) {
            toaster.create({ title: 'Delete failed', description: error.message, type: 'error' });
        } else {
            setTranscriptions(prev => prev.filter(t => t.id !== id));
            toaster.create({ title: 'Transcription deleted', type: 'success' });
            if (selectedTranscription?.id === id) {
                closeModal();
            }
        }
    };



    const startListening = () => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            toaster.create({
                title: 'Browser not supported',
                description: 'Your browser does not support Web Speech API. Please use Chrome or Edge.',
                type: 'error',
            });
            return;
        }

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            setIsListening(true);
            setLiveTranscript('');
            setRecordingTime(0);
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        };

        recognition.onresult = (event: any) => {
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    // Can handle interim results if needed
                }
            }
            // For simplicity in this demo, accessing the latest result efficiently
            // Actually, let's just grab the full text content if we can, or accumulate.
            // A robust way for simple transcription:
            const currentTranscript = Array.from(event.results)
                .map((result: any) => result[0].transcript)
                .join('');
            setLiveTranscript(currentTranscript);
        };

        recognition.onerror = (event: any) => {
            if (event.error === 'network') {
                toaster.create({
                    title: 'Connection Error',
                    description: 'Browser speech service unreachable. Please try the "High Quality Recording" option.',
                    type: 'error'
                });
                stopListening();
            } else if (event.error === 'not-allowed') {
                toaster.create({ title: 'Microphone denied', type: 'error' });
                stopListening();
            } else {
                console.error('Speech recognition error', event.error);
            }
        };

        recognition.onend = () => {
            // If stopped manually, isListening will be false. 
            // If stopped automatically (silence), we might want to restart or just finish.
            // For now, let's treat it as finished.
            if (isListening) {
                // It stopped unexpectedly (maybe silence), but we treat it as done? 
                // Or we can auto-restart. Let's simplfy: stop UI.
                setIsListening(false);
                if (timerRef.current) clearInterval(timerRef.current);
            }
        };

        recognitionRef.current = recognition;
        recognition.start();
    };

    const stopListening = async () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            setIsListening(false);
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }

            // Save the transcript to DB
            if (liveTranscript.trim()) {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const { data, error } = await supabase.from('transcriptions').insert({
                        user_id: user.id,
                        file_name: `Live Recording - ${new Date().toLocaleString()}`,
                        status: 'completed',
                        transcription_text: liveTranscript,
                        file_url: null, // No audio file for live text
                        completed_at: new Date().toISOString()
                    }).select().single();

                    if (!error && data) {
                        setTranscriptions(prev => [data, ...prev]);
                        toaster.create({ title: 'Transcription saved', type: 'success' });
                    }
                }
            }
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // Determine supported mime type
            const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' :
                MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' :
                    MediaRecorder.isTypeSupported('audio/mp4') ? 'audio/mp4' :
                        'audio/ogg';

            mimeTypeRef.current = mimeType;
            const mediaRecorder = new MediaRecorder(stream, { mimeType });
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const type = mimeTypeRef.current || 'audio/webm';
                const ext = type.split('/')[1].split(';')[0];
                const audioBlob = new Blob(chunksRef.current, { type });
                const file = new File([audioBlob], `recording-${new Date().toISOString()}.${ext}`, { type });

                await processFile(file);

                // Stop all tracks
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start(1000); // Collect chunks every second
            setIsRecording(true);
            setRecordingTime(0);
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);

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
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }
    };



    const processFile = async (file: File) => {
        setUploading(true);
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            setUploading(false);
            return;
        }

        // 1. Create record in DB
        const { data, error } = await supabase
            .from('transcriptions')
            .insert({
                user_id: user.id,
                file_name: file.name,
                status: 'processing',
                file_url: 'blob:local',
            })
            .select()
            .single();

        if (error) {
            toaster.create({ title: 'Upload failed', description: error.message, type: 'error' });
            setUploading(false);
            return;
        }

        // 2. Add to list immediately
        setTranscriptions(prev => [data, ...prev]);
        setUploading(false);
        toaster.create({ title: 'Processing started', description: 'Sending to Gemini AI...', type: 'success' });

        // 3. Call Gemini AI
        try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await fetch('/api/transcribe', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error("Transcription failed");

            const result = await response.json();
            const transcriptionText = result.transcription || "No text generated.";

            const { error: updateError } = await supabase
                .from('transcriptions')
                .update({
                    status: 'completed',
                    transcription_text: transcriptionText,
                    completed_at: new Date().toISOString()
                })
                .eq('id', data.id);

            if (!updateError) {
                // UPDATE LOCAL STATE IMMEDIATELY
                setTranscriptions(prev => prev.map(t =>
                    t.id === data.id
                        ? { ...t, status: 'completed', transcription_text: transcriptionText, completed_at: new Date().toISOString() }
                        : t
                ));

                toaster.create({ title: 'Transcription complete', type: 'success' });
            }
        } catch (err: any) {
            console.error(err);
            await supabase.from('transcriptions').update({ status: 'failed' }).eq('id', data.id);

            // UPDATE LOCAL STATE IMMEDIATELY (Failed)
            setTranscriptions(prev => prev.map(t =>
                t.id === data.id ? { ...t, status: 'failed' } : t
            ));

            toaster.create({ title: 'Transcription failed', description: err.message, type: 'error' });
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('audio/')) {
            toaster.create({
                title: 'Invalid file type',
                description: 'Please upload an audio file.',
                type: 'error',
            });
            return;
        }
        await processFile(file);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <Container maxW="container.xl" py={8}>
            <VStack gap={8} align="stretch">
                <Box>
                    <Heading size="2xl" mb={2}>Audio Transcriber</Heading>
                    <Text color="fgMuted" fontSize="lg">Upload interview recordings to get instant AI transcriptions.</Text>
                </Box>

                {/* Upload Area */}
                <Card.Root variant="elevated" borderStyle="dashed" borderWidth="2px" borderColor="border">
                    <Card.Body py={16} px={6} textAlign="center">
                        <VStack gap={4}>
                            <Icon as={FaCloudUploadAlt} boxSize={16} color="brand.500" />
                            <Heading size="lg">Upload or Record Audio</Heading>
                            <Text color="fgMuted">Drag and drop, browse, or record directly</Text>

                            <HStack gap={4} wrap="wrap">
                                <Button
                                    size="lg"
                                    colorPalette="brand"
                                    onClick={() => fileInputRef.current?.click()}
                                    loading={uploading}
                                    disabled={isListening || isRecording}
                                    px={10}
                                >
                                    Select File
                                </Button>

                                {!isListening && !isRecording && (
                                    <>
                                        <Button
                                            size="lg"
                                            colorPalette="blue"
                                            variant="outline"
                                            onClick={startListening}
                                            disabled={uploading}
                                            px={10}
                                        >
                                            <FaMicrophone style={{ marginRight: '8px' }} /> Live Transcribe
                                        </Button>
                                        <Button
                                            size="lg"
                                            colorPalette="red"
                                            variant="outline"
                                            onClick={startRecording}
                                            disabled={uploading}
                                            px={10}
                                        >
                                            <FaMicrophone style={{ marginRight: '8px' }} /> High Quality Recording
                                        </Button>
                                    </>
                                )}

                                {isListening && (
                                    <Button
                                        size="lg"
                                        colorPalette="blue"
                                        onClick={stopListening}
                                    >
                                        <FaStop style={{ marginRight: '8px' }} /> Stop Live ({formatTime(recordingTime)})
                                    </Button>
                                )}

                                {isRecording && (
                                    <Button
                                        size="lg"
                                        colorPalette="red"
                                        onClick={stopRecording}
                                    >
                                        <FaStop style={{ marginRight: '8px' }} /> Stop Recording ({formatTime(recordingTime)})
                                    </Button>
                                )}
                            </HStack>

                            {isListening && liveTranscript && (
                                <Box w="full" p={4} bg="gray.50" borderRadius="md" border="1px solid" borderColor="gray.200" mt={4}>
                                    <Text fontWeight="bold" mb={2}>Live Transcript:</Text>
                                    <Text color="gray.700">{liveTranscript}</Text>
                                </Box>
                            )}

                            <Input
                                type="file"
                                display="none"
                                ref={fileInputRef}
                                accept="audio/*"
                                onChange={handleFileUpload}
                            />
                        </VStack>
                    </Card.Body>
                </Card.Root>

                <Separator />

                {/* History */}
                <VStack align="stretch" gap={4}>
                    <Heading size="lg">Recent Transcriptions</Heading>

                    {transcriptions.length === 0 ? (
                        <Text color="fgMuted">No transcriptions yet.</Text>
                    ) : (
                        <VStack gap={4} align="stretch">
                            {transcriptions.map((t) => (
                                <Card.Root key={t.id} variant="elevated">
                                    <Card.Body p={6}>
                                        <VStack align="stretch" gap={4}>
                                            <HStack justify="space-between">
                                                <HStack>
                                                    <Icon as={FaFileAudio} color="blue.500" />
                                                    <VStack align="start" gap={0}>
                                                        <Text fontWeight="medium">{t.file_name}</Text>
                                                        <Text fontSize="xs" color="fgMuted">
                                                            {t.created_at ? new Date(t.created_at).toLocaleString() : 'Just now'}
                                                        </Text>
                                                    </VStack>
                                                </HStack>
                                                <HStack alignItems="center" gap={2}>
                                                    <Badge
                                                        colorPalette={
                                                            t.status === 'completed' ? 'green' :
                                                                t.status === 'processing' ? 'blue' : 'red'
                                                        }
                                                        size="md"
                                                    >
                                                        {t.status === 'processing' && <FaSpinner className="animate-spin" style={{ display: 'inline', marginRight: '4px' }} />}
                                                        {t.status.toUpperCase()}
                                                    </Badge>

                                                    {t.status === 'completed' && (
                                                        <Button size="sm" variant="surface" onClick={() => openModal(t)} px={6}>
                                                            <FaEye style={{ marginRight: '4px' }} /> View
                                                        </Button>
                                                    )}
                                                    <IconButton
                                                        size="sm"
                                                        variant="ghost"
                                                        colorPalette="red"
                                                        onClick={(e) => deleteTranscription(t.id, e)}
                                                        aria-label="Delete transcription"
                                                    >
                                                        <FaTrash />
                                                    </IconButton>
                                                </HStack>
                                            </HStack>
                                        </VStack>
                                    </Card.Body>
                                </Card.Root>
                            ))}
                        </VStack>
                    )}
                </VStack>
            </VStack>

            <Dialog.Root open={isModalOpen} onOpenChange={(e) => setIsModalOpen(e.open)}>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content bg="gray.900" color="white" borderRadius="xl" maxW="lg" p={0}>
                        <Dialog.Header p={6} borderBottomWidth="1px" borderColor="gray.800">
                            <Dialog.Title fontSize="lg" fontWeight="bold">{selectedTranscription?.file_name}</Dialog.Title>
                        </Dialog.Header>
                        <Dialog.Body p={6}>
                            <Box maxHeight="60vh" overflowY="auto" whiteSpace="pre-wrap" p={4} bg="gray.800" borderRadius="md" color="gray.200">
                                <Text>{selectedTranscription?.transcription_text}</Text>
                            </Box>
                        </Dialog.Body>
                        <Dialog.Footer p={6} borderTopWidth="1px" borderColor="gray.800">
                            <Button variant="outline" onClick={closeModal} borderColor="gray.700" color="white" _hover={{ bg: "gray.800" }}>Close</Button>
                        </Dialog.Footer>
                        <Dialog.CloseTrigger top="2" right="2" color="gray.400" />
                    </Dialog.Content>
                </Dialog.Positioner>
            </Dialog.Root>
        </Container>
    );
}


