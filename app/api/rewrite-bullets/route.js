import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';
import { extractResumeText } from '@/app/lib/resumeText';
import { describeAiError, generateContentWithRetry } from '@/app/lib/aiRequest';
import { safeParseJSON } from '@/app/api/utils'; // 1. Import your safe parser utility

export async function POST(request) {
    try {
        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ success: false, error: 'GEMINI_API_KEY is missing in .env.local' }, { status: 500 });
        }

        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const formData = await request.formData();
        const jobRole = formData.get('jobRole') || 'Target Role';
        const file = formData.get('file');

        if (!file) {
            return NextResponse.json({ success: false, error: 'Resume file is required' }, { status: 400 });
        }

        const candidateProfile = await extractResumeText(file);

        if (!candidateProfile.trim()) {
            return NextResponse.json({ success: false, error: 'Resume text is empty.' }, { status: 400 });
        }

        const prompt = `You are an elite executive resume writer and ATS optimization expert. 
    Analyze the Candidate Resume below and identify the 3 weakest, most vague, or passive bullet points. 
    For each weak bullet point, provide an upgraded, high-impact, results-driven alternative tailored for a "${jobRole}" position.

    Provide your output strictly as a JSON array of objects with no markdown code blocks or additional text, in this exact format:
    [
      {
        "original": "The original weak bullet text found in resume",
        "improved": "The upgraded, metric-driven bullet point starting with a strong action verb"
      }
    ]

    Candidate Resume:
    ${candidateProfile}`;

        const response = await generateContentWithRetry(ai, {
            model: 'gemini-3.6-flash',
            contents: prompt,
        });

        const rawText = response.text || '';

        // 2. Use safeParseJSON for clean, robust array parsing
        const upgrades = safeParseJSON(rawText);

        if (!upgrades || !Array.isArray(upgrades)) {
            console.error('Failed to parse bullet upgrade JSON from raw text:', rawText);
            // Fallback object matching your design layout if parsing fails
            const fallbackData = [{ original: "Parsing error or no bullets isolated", improved: rawText }];
            return NextResponse.json({ success: true, data: fallbackData });
        }

        return NextResponse.json({ success: true, data: upgrades });
    } catch (error) {
        console.error('Bullet audit error:', error);
        return NextResponse.json({ success: false, error: describeAiError(error, 'Failed to audit resume bullets.') }, { status: 500 });
    }
}