
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || "");

const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: "You are an expert technical interviewer. Evaluate the candidate's answer based on the question provided. Return the result in rigid JSON format with the following structure: { score: number (0-100), feedback: { summary: string, strengths: string[], improvements: string[] } }."
});

export async function POST(req: Request) {
    if (!apiKey) {
        return NextResponse.json({ error: "Gemini API Key not configured" }, { status: 500 });
    }

    try {
        const { question, answer, company } = await req.json();

        const prompt = `
      Company: ${company}
      Question: ${question.content}
      Topic: ${question.topic}
      Difficulty: ${question.difficulty}
      
      Candidate Answer:
      ${answer}
      
      Evaluate this answer. Be critical but constructive.
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean up markdown code blocks if present to parse JSON
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

        try {
            const jsonResponse = JSON.parse(cleanText);
            return NextResponse.json(jsonResponse);
        } catch (parseError) {
            console.error("Failed to parse JSON:", text);
            return NextResponse.json({ error: "Failed to parse AI response", raw: text }, { status: 500 });
        }

    } catch (error: any) {
        console.error("AI Evaluation Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
