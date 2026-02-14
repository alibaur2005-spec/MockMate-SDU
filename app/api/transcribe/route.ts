
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || "");

// Using Flash for fast transcription
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export const maxDuration = 60; // Increase timeout to 60 seconds for Vercel

export async function POST(req: Request) {
    if (!apiKey) {
        console.error("Gemini API Key is missing in environment variables");
        return NextResponse.json({ error: "Gemini API Key not configured" }, { status: 500 });
    }

    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            console.error("No file found in formData");
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        console.log("Transcribe Request:", {
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            apiKeyPresent: !!apiKey
        });

        const arrayBuffer = await file.arrayBuffer();
        const base64Data = Buffer.from(arrayBuffer).toString("base64");

        const result = await model.generateContent([
            {
                inlineData: {
                    mimeType: file.type || "audio/mp3",
                    data: base64Data
                }
            },
            { text: "Transcribe the following audio file verbatim. Output ONLY the spoken text. Do not include any headers, explanations, or conversational filler like 'Here is the transcription'. If the audio is silent or unintelligible, return an empty string." },
        ]);

        const response = await result.response;
        const text = response.text();

        return NextResponse.json({ transcription: text });

    } catch (error: any) {
        console.error("Transcription Error Details:", {
            message: error.message,
            stack: error.stack,
            cause: error.cause,
            name: error.name
        });
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
