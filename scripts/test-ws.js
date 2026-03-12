const WebSocket = require('ws');

async function testConnection() {
    const fetch = (await import('node-fetch')).default;
    require('dotenv').config({ path: '.env' });
    const token = process.env.GEMINI_API_KEY;

    if (!token) {
        console.error("No API key");
        return;
    }

    const HOST = 'generativelanguage.googleapis.com';
    const WS_URL = `wss://${HOST}/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${token}`;

    const ws = new WebSocket(WS_URL);

    ws.on('open', () => {
        console.log("Connected. Sending setup message...");
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
                        text: "You are an expert technical interviewer."
                    }]
                }
            }
        };
        ws.send(JSON.stringify(setupMessage));
    });

    ws.on('message', (data) => {
        console.log("Received:", data.toString());
    });

    ws.on('close', (code, reason) => {
        console.log(`Disconnected. Code: ${code}, Reason: ${reason}`);
    });

    ws.on('error', (err) => {
        console.error("Error:", err);
    });
}

testConnection();
