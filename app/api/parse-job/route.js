import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';
import { describeAiError, generateContentWithRetry } from '@/app/lib/aiRequest';
import { safeParseJSON } from '@/app/api/utils'; // Import your safe parser utility

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(request) {
    try {
        const { messyData } = await request.json();

        if (!messyData) {
            return NextResponse.json({ success: false, error: 'No data provided' }, { status: 400 });
        }

        const prompt = `You are an expert AI data extraction engine. Parse the following messy candidate or job description text and return a valid JSON object containing these exact keys: "job_title", "required_skills" (array of strings), "experience_level", "experience_years" (if available), and any other relevant metadata found. 

    IMPORTANT: Return ONLY valid raw JSON. Do not include markdown code blocks like \`\`\`json, do not include explanations, and do not include any text outside of the JSON braces.

    Messy Data to Parse:
    ${messyData}`;

        const response = await generateContentWithRetry(ai, {
            model: 'gemini-3.6-flash',
            contents: prompt,
        });

        const resultText = response.text || '';
        console.log("Raw AI Output:", resultText);

        // Use safeParseJSON instead of manual regex matching and JSON.parse
        const parsedData = safeParseJSON(resultText);

        if (!parsedData) {
            return NextResponse.json({ success: false, error: 'Failed to parse AI response structure.' }, { status: 500 });
        }

        return NextResponse.json({ success: true, data: parsedData });
    } catch (error) {
        console.error('Parsing error:', error);
        return NextResponse.json({ success: false, error: describeAiError(error, 'Failed to process AI response.') }, { status: 500 });
    }
}