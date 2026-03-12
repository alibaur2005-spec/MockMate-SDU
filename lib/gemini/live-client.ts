import { useState, useEffect, useRef, useCallback } from 'react';

// Interfaces for structured data
export interface LiveClientConfig {
    systemInstruction?: string;
}

export function useGeminiLiveClient(config?: LiveClientConfig) {
    const [isConnected, setIsConnected] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isAiSpeaking, setIsAiSpeaking] = useState(false);
    const [logs, setLogs] = useState<{ role: string, type: string, content: string }[]>([]);

    const wsRef = useRef<WebSocket | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const audioStreamRef = useRef<MediaStream | null>(null);
    const audioNodeRef = useRef<AudioWorkletNode | null>(null);
    const nextPlayTimeRef = useRef<number>(0);

    // Audio Playback
    const playPcmAudio = useCallback((base64Data: string) => {
        if (!audioContextRef.current) return;
        const ctx = audioContextRef.current;

        // Ensure context is running
        if (ctx.state === 'suspended') {
            ctx.resume();
        }

        try {
            // Decode Base64
            const binaryString = window.atob(base64Data);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }

            // Convert to Int16, safely handling odd lengths
            const int16Array = new Int16Array(bytes.buffer, 0, Math.floor(bytes.length / 2));

            // Gemini Audio out is PCM 24kHz
            const audioBuffer = ctx.createBuffer(1, int16Array.length, 24000);
            const channelData = audioBuffer.getChannelData(0);

            // Convert to Float32
            for (let i = 0; i < int16Array.length; i++) {
                channelData[i] = int16Array[i] / 32768.0;
            }

            const source = ctx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(ctx.destination);

            // Scheduling logic to prevent overlapping chunks
            const currentTime = ctx.currentTime;

            // If the queue is empty or behind current time, reset to slightly ahead
            if (nextPlayTimeRef.current < currentTime) {
                nextPlayTimeRef.current = currentTime + 0.05;
            }

            source.start(nextPlayTimeRef.current);
            nextPlayTimeRef.current += audioBuffer.duration;

            setIsAiSpeaking(true);

            source.onended = () => {
                // If this is the last chunk, mark as not speaking
                if (ctx.currentTime >= nextPlayTimeRef.current - 0.1) {
                    setIsAiSpeaking(false);
                }
            };
        } catch (e) {
            console.error("Error playing audio chunk", e);
        }
    }, []);

    const handleServerContent = useCallback((response: any) => {
        if (response.serverContent?.modelTurn?.parts) {
            const parts = response.serverContent.modelTurn.parts;
            for (const part of parts) {
                if (part.text) {
                    setLogs(prev => [...prev, { role: 'ai', type: 'text', content: part.text }]);
                }
                if (part.inlineData && part.inlineData.mimeType.startsWith('audio/')) {
                    playPcmAudio(part.inlineData.data);
                }
            }
        }
    }, [playPcmAudio]);

    const connect = useCallback(async () => {
        try {
            // Initialize AudioContext early on user gesture
            if (!audioContextRef.current) {
                const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
                audioContextRef.current = new AudioContextClass({ sampleRate: 16000 });
            }
            if (audioContextRef.current.state === 'suspended') {
                await audioContextRef.current.resume();
            }

            setLogs(prev => [...prev, { role: 'system', type: 'status', content: 'Fetching token...' }]);
            const res = await fetch('/api/gemini-token');
            const data = await res.json();

            if (!data.token) {
                throw new Error(data.error || 'Failed to get gemini token');
            }

            const HOST = 'generativelanguage.googleapis.com';
            const WS_URL = `wss://${HOST}/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${data.token}`;

            wsRef.current = new WebSocket(WS_URL);

            wsRef.current.onopen = () => {
                setLogs(prev => [...prev, { role: 'system', type: 'status', content: 'WebSocket connected. Sending setup message...' }]);

                // Send Setup Message
                const setupMessage = {
                    setup: {
                        model: "models/gemini-2.5-flash-native-audio-latest",
                        generationConfig: {
                            responseModalities: ["AUDIO"],
                            speechConfig: {
                                voiceConfig: {
                                    prebuiltVoiceConfig: {
                                        voiceName: "Aoede" // Pick voice
                                    }
                                }
                            }
                        },
                        systemInstruction: {
                            parts: [{
                                text: config?.systemInstruction || "You are an expert technical interviewer. Ask challenging questions and evaluate my responses critically."
                            }]
                        }
                    }
                };

                wsRef.current?.send(JSON.stringify(setupMessage));
                setIsConnected(true);
            };

            wsRef.current.onmessage = async (event) => {
                try {
                    let textData = event.data;
                    if (event.data instanceof Blob) {
                        textData = await event.data.text();
                    }
                    const response = JSON.parse(textData);
                    if (response.setupComplete) {
                        setLogs(prev => [...prev, { role: 'system', type: 'status', content: 'Setup complete. Ready.' }]);

                        // Automatically say "Hello" to kick off the AI's first question
                        const msg = {
                            clientContent: {
                                turns: [{
                                    role: "user",
                                    parts: [{ text: "Hello! I am ready to start the interview." }]
                                }],
                                turnComplete: true
                            }
                        };
                        wsRef.current?.send(JSON.stringify(msg));
                    } else if (response.serverContent) {
                        handleServerContent(response);
                    }
                } catch (e) {
                    console.error("Failed to parse message", e);
                }
            };

            wsRef.current.onclose = (event) => {
                console.log("WebSocket closed. Code:", event.code, "Reason:", event.reason);
                setIsConnected(false);
                setLogs(prev => [...prev, { role: 'system', type: 'status', content: `Disconnected. (${event.code} - ${event.reason})` }]);
            };

            wsRef.current.onerror = (e) => {
                console.error("WebSocket Error:", e);
                setLogs(prev => [...prev, { role: 'system', type: 'error', content: 'WebSocket Error occurred' }]);
            };

        } catch (error: any) {
            console.error('Connection Error', error);
            setLogs(prev => [...prev, { role: 'system', type: 'error', content: error.message }]);
        }
    }, [config, handleServerContent]);

    const stopRecording = useCallback(() => {
        if (audioNodeRef.current) {
            audioNodeRef.current.disconnect();
            audioNodeRef.current = null;
        }
        if (audioStreamRef.current) {
            audioStreamRef.current.getTracks().forEach(t => t.stop());
            audioStreamRef.current = null;
        }
        setIsRecording(false);
        setLogs(prev => [...prev, { role: 'system', type: 'status', content: 'Microphone off.' }]);
    }, []);

    const disconnect = useCallback(() => {
        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }
        stopRecording();

        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
        nextPlayTimeRef.current = 0;
        setIsConnected(false);
    }, [stopRecording]);

    // Helper to convert Int16Array to Base64
    const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    };

    const startRecording = useCallback(async () => {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
            console.error("Cannot start recording, not connected");
            return;
        }

        try {
            if (!audioContextRef.current) {
                const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
                audioContextRef.current = new AudioContextClass({ sampleRate: 16000 });
            }
            if (audioContextRef.current.state === 'suspended') {
                await audioContextRef.current.resume();
            }

            await audioContextRef.current.audioWorklet.addModule('/worklets/audio-processor.js');

            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    channelCount: 1,
                    echoCancellation: true,
                    autoGainControl: true,
                    noiseSuppression: true
                }
            });
            audioStreamRef.current = stream;

            const source = audioContextRef.current.createMediaStreamSource(stream);
            const workletNode = new AudioWorkletNode(audioContextRef.current, 'audio-recorder-worklet');
            audioNodeRef.current = workletNode;

            workletNode.port.onmessage = (event) => {
                if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                    const base64Audio = arrayBufferToBase64(event.data);

                    const msg = {
                        clientContent: {
                            turns: [{
                                role: "user",
                                parts: [{
                                    inlineData: {
                                        mimeType: "audio/pcm;rate=16000",
                                        data: base64Audio
                                    }
                                }]
                            }],
                            turnComplete: true // True implies continuous turn or block? Actually for real-time streaming realtimeMessage is often used depending on v1alpha schema.
                        }
                    };

                    // Actually, for real-time Bidi stream, we construct clientContent realtimeInput
                    const realtimeMsg = {
                        realtimeInput: {
                            mediaChunks: [{
                                mimeType: "audio/pcm;rate=16000",
                                data: base64Audio
                            }]
                        }
                    };

                    wsRef.current.send(JSON.stringify(realtimeMsg));
                }
            };

            source.connect(workletNode);
            workletNode.connect(audioContextRef.current.destination); // Required to keep worklet alive in some browsers

            setIsRecording(true);
            setLogs(prev => [...prev, { role: 'system', type: 'status', content: 'Microphone on. Listening...' }]);

        } catch (err) {
            console.error("Error accessing microphone:", err);
            setLogs(prev => [...prev, { role: 'system', type: 'error', content: 'Failed to access microphone' }]);
        }
    }, []);

    const sendTextMessage = useCallback((text: string) => {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

        const msg = {
            clientContent: {
                turns: [{
                    role: "user",
                    parts: [{ text }]
                }],
                turnComplete: true
            }
        };

        wsRef.current.send(JSON.stringify(msg));
        setLogs(prev => [...prev, { role: 'user', type: 'text', content: text }]);
    }, []);

    useEffect(() => {
        return () => {
            disconnect();
        };
    }, [disconnect]);

    return {
        isConnected,
        isRecording,
        isAiSpeaking,
        logs,
        connect,
        disconnect,
        startRecording,
        stopRecording,
        sendTextMessage
    };
}
