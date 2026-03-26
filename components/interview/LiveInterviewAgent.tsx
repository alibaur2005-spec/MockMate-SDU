'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Button, VStack, HStack, Text, Heading, Badge, IconButton, Icon, Flex } from '@chakra-ui/react';
import { FaMicrophone, FaMicrophoneSlash, FaPlay, FaStop, FaVideo, FaVideoSlash } from 'react-icons/fa';
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
        stopRecording,
        getAnalyserNode
    } = useGeminiLiveClient({ systemInstruction: systemPrompt });

    const [isClient, setIsClient] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [cameraActive, setCameraActive] = useState(false);

    const videoRef = useRef<HTMLVideoElement>(null);
    const cameraStreamRef = useRef<MediaStream | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animFrameRef = useRef<number>(0);
    const smoothLevelRef = useRef<number>(0);
    const timeRef = useRef<number>(0);

    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        setIsClient(true);
    }, []);

    // --- Camera ---
    const startCamera = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 640, height: 480, facingMode: 'user' }
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            cameraStreamRef.current = stream;
            setCameraActive(true);
        } catch (err) {
            console.error('Camera access denied:', err);
            toaster.create({
                title: 'Camera unavailable',
                description: 'Interview will continue without video.',
                type: 'warning',
            });
        }
    }, []);

    const stopCamera = useCallback(() => {
        if (cameraStreamRef.current) {
            cameraStreamRef.current.getTracks().forEach(t => t.stop());
            cameraStreamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setCameraActive(false);
    }, []);

    // --- Connect (camera + websocket) ---
    const handleConnect = useCallback(async () => {
        await startCamera();
        await connect();
    }, [startCamera, connect]);

    // --- AI Visualizer animation ---
    useEffect(() => {
        if (!isClient) return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;

        const resizeCanvas = () => {
            const parent = canvas.parentElement;
            if (!parent) return;
            const rect = parent.getBoundingClientRect();
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            canvas.style.width = rect.width + 'px';
            canvas.style.height = rect.height + 'px';
        };

        resizeCanvas();
        const resizeObserver = new ResizeObserver(resizeCanvas);
        if (canvas.parentElement) resizeObserver.observe(canvas.parentElement);

        const animate = () => {
            const w = canvas.width / dpr;
            const h = canvas.height / dpr;

            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.clearRect(0, 0, w, h);

            // Audio data
            const analyser = getAnalyserNode();
            const bufferLength = analyser?.frequencyBinCount || 128;
            const dataArray = new Uint8Array(bufferLength);
            if (analyser) {
                analyser.getByteFrequencyData(dataArray);
            }

            const avgLevel = analyser
                ? dataArray.reduce((sum, v) => sum + v, 0) / bufferLength / 255
                : 0;

            // Smooth the level for fluid motion
            smoothLevelRef.current += (avgLevel - smoothLevelRef.current) * 0.12;
            const level = smoothLevelRef.current;

            const cx = w / 2;
            const cy = h / 2;
            const baseR = Math.min(w, h) * 0.17;
            timeRef.current += 0.015;
            const t = timeRef.current;

            // --- Outer glow rings ---
            for (let i = 5; i >= 0; i--) {
                const breathe = Math.sin(t * 0.8 + i * 0.6) * 0.03;
                const r = baseR * (1.4 + i * 0.28 + level * (i + 1) * 0.35 + breathe);
                const alpha = Math.max(0, 0.035 + level * 0.1 - i * 0.012);

                ctx.beginPath();
                ctx.arc(cx, cy, r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(86, 114, 234, ${alpha})`;
                ctx.fill();
            }

            // --- Main blob with frequency distortion ---
            const segments = 128;
            ctx.beginPath();
            for (let i = 0; i <= segments; i++) {
                const angle = (i / segments) * Math.PI * 2;
                const di = Math.floor((i % segments) / segments * bufferLength);
                const freqAmp = dataArray[di] / 255;
                const wave =
                    Math.sin(angle * 3 + t * 2) * 0.035 +
                    Math.sin(angle * 5 - t * 1.4) * 0.02 +
                    Math.sin(angle * 2 + t * 0.7) * 0.015;
                const r = baseR * (1 + freqAmp * 0.22 + wave + level * 0.12);

                const x = cx + Math.cos(angle) * r;
                const y = cy + Math.sin(angle) * r;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();

            const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, baseR * 1.4);
            grad.addColorStop(0, `rgba(150, 180, 255, ${0.9 + level * 0.1})`);
            grad.addColorStop(0.45, `rgba(86, 114, 234, ${0.8 + level * 0.15})`);
            grad.addColorStop(0.8, `rgba(50, 90, 220, ${0.5 + level * 0.3})`);
            grad.addColorStop(1, `rgba(26, 177, 181, ${0.2 + level * 0.4})`);
            ctx.fillStyle = grad;
            ctx.fill();

            // --- Inner specular highlight ---
            const innerGrad = ctx.createRadialGradient(
                cx - baseR * 0.15, cy - baseR * 0.25, baseR * 0.05,
                cx, cy, baseR * 0.65
            );
            innerGrad.addColorStop(0, `rgba(255, 255, 255, ${0.22 + level * 0.12})`);
            innerGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.beginPath();
            ctx.arc(cx, cy, baseR * 0.65, 0, Math.PI * 2);
            ctx.fillStyle = innerGrad;
            ctx.fill();

            animFrameRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            cancelAnimationFrame(animFrameRef.current);
            resizeObserver.disconnect();
        };
    }, [isClient, getAnalyserNode]);

    // --- End interview ---
    const handleEndInterview = async () => {
        disconnect();
        stopCamera();

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
                    question: { content: questionPrompt || 'General Interview', topic: 'General', difficulty: 'Medium' },
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
                title: 'Error saving interview',
                description: error.message,
                type: 'error',
            });
            setIsSubmitting(false);
        }
    };

    // Cleanup camera on unmount
    useEffect(() => {
        return () => {
            stopCamera();
        };
    }, [stopCamera]);

    if (!isClient) return null;

    return (
        <VStack gap={5} align="stretch" w="full" maxW="5xl" mx="auto">
            {/* Header */}
            <HStack justify="space-between" w="full">
                <Heading size="md">Live AI Interview</Heading>
                <HStack gap={3}>
                    {companyName && (
                        <Badge colorPalette="purple" variant="surface">{companyName}</Badge>
                    )}
                    <Badge colorPalette={isConnected ? 'green' : 'gray'} variant="solid">
                        {isConnected ? 'Live' : 'Offline'}
                    </Badge>
                </HStack>
            </HStack>

            {/* Main view: AI visualizer + User camera */}
            <Flex
                gap={4}
                w="full"
                direction={{ base: 'column', md: 'row' }}
                h={{ base: 'auto', md: '420px' }}
            >
                {/* AI Visualizer Panel */}
                <Box
                    flex={1}
                    bg="gray.900"
                    borderRadius="2xl"
                    overflow="hidden"
                    position="relative"
                    minH={{ base: '260px', md: 'auto' }}
                >
                    <canvas
                        ref={canvasRef}
                        style={{ position: 'absolute', top: 0, left: 0 }}
                    />
                    <Text
                        position="absolute"
                        bottom={3}
                        left={3}
                        color="white"
                        fontSize="xs"
                        fontWeight="bold"
                        bg="blackAlpha.600"
                        px={3}
                        py={1}
                        borderRadius="full"
                    >
                        AI Interviewer
                    </Text>
                    {isAiSpeaking && (
                        <Badge
                            position="absolute"
                            top={3}
                            right={3}
                            colorPalette="green"
                            variant="solid"
                            fontSize="xs"
                        >
                            Speaking...
                        </Badge>
                    )}
                </Box>

                {/* User Camera Panel */}
                <Box
                    flex={1}
                    bg="gray.900"
                    borderRadius="2xl"
                    overflow="hidden"
                    position="relative"
                    minH={{ base: '260px', md: 'auto' }}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                >
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transform: 'scaleX(-1)',
                            display: cameraActive ? 'block' : 'none'
                        }}
                    />
                    {!cameraActive && (
                        <VStack color="gray.500">
                            <Icon as={FaVideoSlash} boxSize={10} />
                            <Text fontSize="sm">Camera off</Text>
                        </VStack>
                    )}
                    <Text
                        position="absolute"
                        bottom={3}
                        left={3}
                        color="white"
                        fontSize="xs"
                        fontWeight="bold"
                        bg="blackAlpha.600"
                        px={3}
                        py={1}
                        borderRadius="full"
                    >
                        You
                    </Text>
                    {isRecording && (
                        <HStack
                            position="absolute"
                            top={3}
                            right={3}
                            bg="blackAlpha.600"
                            px={3}
                            py={1}
                            borderRadius="full"
                            gap={2}
                        >
                            <MotionBox
                                w="8px"
                                h="8px"
                                bg="red.500"
                                borderRadius="full"
                                animate={{ opacity: [1, 0.3, 1] }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" } as any}
                            />
                            <Text color="red.300" fontSize="xs" fontWeight="bold">REC</Text>
                        </HStack>
                    )}
                </Box>
            </Flex>

            {/* Controls */}
            <HStack justify="center" gap={4} py={2}>
                {!isConnected && !isSubmitting ? (
                    <Button
                        colorPalette="brand"
                        size="lg"
                        onClick={handleConnect}
                        borderRadius="full"
                        px={8}
                    >
                        <Icon as={FaPlay} mr={2} /> Start Interview
                    </Button>
                ) : (
                    <Button
                        colorPalette="red"
                        size="lg"
                        onClick={handleEndInterview}
                        loading={isSubmitting}
                        borderRadius="full"
                        px={8}
                    >
                        <Icon as={FaStop} mr={2} /> End Interview
                    </Button>
                )}

                <IconButton
                    aria-label="Toggle Microphone"
                    colorPalette={isRecording ? 'red' : 'gray'}
                    size="xl"
                    borderRadius="full"
                    disabled={!isConnected || isAiSpeaking}
                    onClick={isRecording ? stopRecording : startRecording}
                    variant={isRecording ? 'solid' : 'outline'}
                >
                    {isRecording ? <FaMicrophone /> : <FaMicrophoneSlash />}
                </IconButton>

                <IconButton
                    aria-label="Toggle Camera"
                    colorPalette={cameraActive ? 'blue' : 'gray'}
                    size="lg"
                    borderRadius="full"
                    onClick={cameraActive ? stopCamera : startCamera}
                    variant={cameraActive ? 'solid' : 'outline'}
                >
                    {cameraActive ? <FaVideo /> : <FaVideoSlash />}
                </IconButton>
            </HStack>

            {/* Status */}
            <HStack justify="center" minH="24px">
                {isAiSpeaking && (
                    <Text color="brand.400" fontWeight="semibold" fontSize="sm">
                        AI is speaking...
                    </Text>
                )}
                {isRecording && !isAiSpeaking && (
                    <Text color="red.400" fontWeight="semibold" fontSize="sm">
                        Listening... Speak now
                    </Text>
                )}
                {isConnected && !isRecording && !isAiSpeaking && (
                    <Text color="gray.500" fontSize="sm">
                        Press the microphone button to speak
                    </Text>
                )}
            </HStack>
        </VStack>
    );
}
