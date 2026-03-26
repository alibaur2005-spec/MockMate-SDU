'use client';

import { Box, Heading, Text, VStack, HStack, Button, Input, Icon, Badge, Separator, IconButton, Dialog, Portal } from '@chakra-ui/react';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState, useRef } from 'react';
import { toaster } from '@/components/ui/toaster';
import { FaCloudUploadAlt, FaFileAudio, FaMicrophone, FaStop, FaEye, FaTrash, FaSpinner } from 'react-icons/fa';

interface Transcription { id: string; file_name: string; created_at: string; status: 'processing' | 'completed' | 'failed'; transcription_text?: string; }

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
    const mimeTypeRef = useRef<string>('');
    const supabase = createClient();
    const [isListening, setIsListening] = useState(false);
    const [liveTranscript, setLiveTranscript] = useState('');
    const recognitionRef = useRef<any>(null);
    const [selectedTranscription, setSelectedTranscription] = useState<Transcription | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetch = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const { data } = await supabase.from('transcriptions').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
            setTranscriptions(data || []);
            setLoading(false);
        };
        fetch();
    }, []);

    const deleteTranscription = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Delete this transcription?')) return;
        const { error } = await supabase.from('transcriptions').delete().eq('id', id);
        if (error) { toaster.create({ title: 'Delete failed', description: error.message, type: 'error' }); }
        else { setTranscriptions(prev => prev.filter(t => t.id !== id)); toaster.create({ title: 'Deleted', type: 'success' }); if (selectedTranscription?.id === id) { setIsModalOpen(false); setSelectedTranscription(null); } }
    };

    const startListening = () => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) { toaster.create({ title: 'Browser not supported', type: 'error' }); return; }
        const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SR();
        recognition.continuous = true; recognition.interimResults = true; recognition.lang = 'en-US';
        recognition.onstart = () => { setIsListening(true); setLiveTranscript(''); setRecordingTime(0); timerRef.current = setInterval(() => setRecordingTime(prev => prev + 1), 1000); };
        recognition.onresult = (event: any) => { setLiveTranscript(Array.from(event.results).map((r: any) => r[0].transcript).join('')); };
        recognition.onerror = (event: any) => { if (event.error === 'network' || event.error === 'not-allowed') { toaster.create({ title: 'Error', description: event.error, type: 'error' }); stopListening(); } };
        recognition.onend = () => { if (isListening) { setIsListening(false); if (timerRef.current) clearInterval(timerRef.current); } };
        recognitionRef.current = recognition;
        recognition.start();
    };

    const stopListening = async () => {
        if (recognitionRef.current) { recognitionRef.current.stop(); setIsListening(false); if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
            if (liveTranscript.trim()) { const { data: { user } } = await supabase.auth.getUser(); if (user) { const { data } = await supabase.from('transcriptions').insert({ user_id: user.id, file_name: `Live Recording - ${new Date().toLocaleString()}`, status: 'completed', transcription_text: liveTranscript, file_url: null, completed_at: new Date().toISOString() }).select().single(); if (data) { setTranscriptions(prev => [data, ...prev]); toaster.create({ title: 'Saved', type: 'success' }); } } } }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : MediaRecorder.isTypeSupported('audio/mp4') ? 'audio/mp4' : 'audio/ogg';
            mimeTypeRef.current = mimeType;
            const mr = new MediaRecorder(stream, { mimeType }); mediaRecorderRef.current = mr; chunksRef.current = [];
            mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
            mr.onstop = async () => { const ext = mimeType.split('/')[1].split(';')[0]; const blob = new Blob(chunksRef.current, { type: mimeType }); const file = new File([blob], `recording-${new Date().toISOString()}.${ext}`, { type: mimeType }); await processFile(file); stream.getTracks().forEach(t => t.stop()); };
            mr.start(1000); setIsRecording(true); setRecordingTime(0); timerRef.current = setInterval(() => setRecordingTime(prev => prev + 1), 1000);
        } catch { toaster.create({ title: 'Microphone access denied', type: 'error' }); }
    };

    const stopRecording = () => { if (mediaRecorderRef.current && isRecording) { mediaRecorderRef.current.stop(); setIsRecording(false); if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; } } };

    const processFile = async (file: File) => {
        setUploading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setUploading(false); return; }
        const { data, error } = await supabase.from('transcriptions').insert({ user_id: user.id, file_name: file.name, status: 'processing', file_url: 'blob:local' }).select().single();
        if (error) { toaster.create({ title: 'Upload failed', description: error.message, type: 'error' }); setUploading(false); return; }
        setTranscriptions(prev => [data, ...prev]); setUploading(false); toaster.create({ title: 'Processing...', type: 'success' });
        try {
            const fd = new FormData(); fd.append('file', file);
            const response = await fetch('/api/transcribe', { method: 'POST', body: fd });
            if (!response.ok) throw new Error('Failed');
            const result = await response.json();
            const text = result.transcription || 'No text.';
            await supabase.from('transcriptions').update({ status: 'completed', transcription_text: text, completed_at: new Date().toISOString() }).eq('id', data.id);
            setTranscriptions(prev => prev.map(t => t.id === data.id ? { ...t, status: 'completed' as const, transcription_text: text } : t));
            toaster.create({ title: 'Complete', type: 'success' });
        } catch (err: any) { await supabase.from('transcriptions').update({ status: 'failed' }).eq('id', data.id); setTranscriptions(prev => prev.map(t => t.id === data.id ? { ...t, status: 'failed' as const } : t)); toaster.create({ title: 'Failed', description: err.message, type: 'error' }); }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (!file) return; if (!file.type.startsWith('audio/')) { toaster.create({ title: 'Invalid file', type: 'error' }); return; } await processFile(file); };
    const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
    const statusColor = (s: string) => s === 'completed' ? '34,197,94' : s === 'processing' ? '86,114,234' : '239,68,68';

    return (
        <VStack gap={8} align="stretch">
            <Box>
                <Heading size="2xl" fontWeight="800" letterSpacing="-0.03em" mb={2}>Audio Transcriber</Heading>
                <Text color="gray.500" fontSize="sm">Upload interview recordings to get instant AI transcriptions.</Text>
            </Box>

            {/* Upload */}
            <Box p={10} textAlign="center" borderRadius="xl" style={{ background: 'rgba(255,255,255,0.02)', border: '2px dashed rgba(255,255,255,0.08)' }}>
                <VStack gap={4}>
                    <Icon as={FaCloudUploadAlt} boxSize={12} color="gray.600" />
                    <Heading size="md" fontWeight="700">Upload or Record Audio</Heading>
                    <Text color="gray.500" fontSize="xs">Drag and drop, browse, or record directly</Text>
                    <HStack gap={3} wrap="wrap" justify="center">
                        <Button size="sm" onClick={() => fileInputRef.current?.click()} loading={uploading} disabled={isListening || isRecording} bg="white" color="#08080c" borderRadius="lg" fontWeight="600" _hover={{ bg: 'gray.200' }} px={6}>Select File</Button>
                        {!isListening && !isRecording && (
                            <>
                                <Button size="sm" variant="outline" onClick={startListening} disabled={uploading} borderColor="rgba(255,255,255,0.08)" color="gray.400" borderRadius="lg" px={6} _hover={{ bg: 'rgba(255,255,255,0.04)' }}><FaMicrophone style={{ marginRight: '6px' }} /> Live Transcribe</Button>
                                <Button size="sm" variant="outline" onClick={startRecording} disabled={uploading} borderColor="rgba(255,255,255,0.08)" color="gray.400" borderRadius="lg" px={6} _hover={{ bg: 'rgba(255,255,255,0.04)' }}><FaMicrophone style={{ marginRight: '6px' }} /> HQ Recording</Button>
                            </>
                        )}
                        {isListening && <Button size="sm" onClick={stopListening} bg="#5672ea" color="white" borderRadius="lg" px={5} _hover={{ bg: '#3f54de' }}><FaStop style={{ marginRight: '6px' }} /> Stop ({formatTime(recordingTime)})</Button>}
                        {isRecording && <Button size="sm" onClick={stopRecording} bg="#ef4444" color="white" borderRadius="lg" px={5} _hover={{ bg: '#dc2626' }}><FaStop style={{ marginRight: '6px' }} /> Stop ({formatTime(recordingTime)})</Button>}
                    </HStack>
                    {isListening && liveTranscript && (
                        <Box w="full" p={4} borderRadius="lg" mt={2} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <Text fontWeight="600" mb={1} fontSize="xs" color="gray.400">Live Transcript:</Text>
                            <Text color="gray.300" fontSize="sm">{liveTranscript}</Text>
                        </Box>
                    )}
                    <Input type="file" display="none" ref={fileInputRef} accept="audio/*" onChange={handleFileUpload} />
                </VStack>
            </Box>

            <Separator style={{ borderColor: 'rgba(255,255,255,0.05)' }} />

            {/* History */}
            <VStack align="stretch" gap={4}>
                <Heading size="md" fontWeight="700">Recent Transcriptions</Heading>
                {transcriptions.length === 0 ? <Text color="gray.600" fontSize="sm">No transcriptions yet.</Text> : (
                    <VStack gap={3} align="stretch">
                        {transcriptions.map(t => (
                            <Box key={t.id} p={5} borderRadius="xl" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }} _hover={{ borderColor: 'rgba(255,255,255,0.1)' }} transition="all 0.15s">
                                <HStack justify="space-between" w="full">
                                    <HStack>
                                        <Icon as={FaFileAudio} color="#5672ea" boxSize={4} />
                                        <VStack align="start" gap={0}>
                                            <Text fontWeight="600" fontSize="sm">{t.file_name}</Text>
                                            <Text fontSize="xs" color="gray.600">{t.created_at ? new Date(t.created_at).toLocaleString() : 'Just now'}</Text>
                                        </VStack>
                                    </HStack>
                                    <HStack gap={2}>
                                        <Badge px={2.5} py={0.5} borderRadius="full" fontSize="xs" style={{ background: `rgba(${statusColor(t.status)},0.1)`, color: `rgba(${statusColor(t.status)},1)` }}>
                                            {t.status === 'processing' && <FaSpinner style={{ display: 'inline', marginRight: '4px' }} />}{t.status.toUpperCase()}
                                        </Badge>
                                        {t.status === 'completed' && <Button size="xs" variant="outline" onClick={() => { setSelectedTranscription(t); setIsModalOpen(true); }} borderColor="rgba(255,255,255,0.08)" color="gray.400" borderRadius="lg" _hover={{ bg: 'rgba(255,255,255,0.04)' }}><FaEye style={{ marginRight: '4px' }} /> View</Button>}
                                        <IconButton size="xs" variant="ghost" color="gray.600" onClick={(e) => deleteTranscription(t.id, e)} aria-label="Delete" _hover={{ color: '#ef4444' }}><FaTrash /></IconButton>
                                    </HStack>
                                </HStack>
                            </Box>
                        ))}
                    </VStack>
                )}
            </VStack>

            <Dialog.Root open={isModalOpen} onOpenChange={(e) => setIsModalOpen(e.open)}>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content borderRadius="xl" maxW="lg" p={0} style={{ background: '#0d0d14', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <Dialog.Header p={5} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}><Dialog.Title fontSize="md" fontWeight="700">{selectedTranscription?.file_name}</Dialog.Title></Dialog.Header>
                        <Dialog.Body p={5}><Box maxHeight="60vh" overflowY="auto" whiteSpace="pre-wrap" p={4} borderRadius="lg" style={{ background: 'rgba(255,255,255,0.03)' }} color="gray.300" fontSize="sm" lineHeight="1.8"><Text>{selectedTranscription?.transcription_text}</Text></Box></Dialog.Body>
                        <Dialog.Footer p={5} style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}><Button variant="outline" onClick={() => setIsModalOpen(false)} borderColor="rgba(255,255,255,0.08)" color="gray.400" borderRadius="lg" px={5} _hover={{ bg: 'rgba(255,255,255,0.04)' }}>Close</Button></Dialog.Footer>
                        <Dialog.CloseTrigger top="2" right="2" color="gray.500" />
                    </Dialog.Content>
                </Dialog.Positioner>
            </Dialog.Root>
        </VStack>
    );
}
