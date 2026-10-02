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
        const jobDesc = formData.get('jobDesc');
        const file = formData.get('file');

        if (!jobDesc || !file) {
            return NextResponse.json({ success: false, error: 'Job description and resume file are required.' }, { status: 400 });
        }

        const candidateProfile = await extractResumeText(file);

        if (!candidateProfile.trim()) {
            return NextResponse.json({ success: false, error: 'Candidate profile text is empty.' }, { status: 400 });
        }

        const prompt = `You are a strict technical hiring manager and expert executive interview coach. 
    Analyze the Target Job Description and the Candidate Resume profile below. 
    Generate a comprehensive interview preparation guide containing:
    1. 3 Technical/Domain-specific questions tailored to gaps or highlights found in the resume relative to the role.
    2. 2 Behavioral / Situational questions customized to the candidate's background.

    Provide your output strictly as a JSON array of objects with no markdown code blocks or additional text, in this exact format:
    [
      {
        "category": "Technical" or "Behavioral",
        "question": "The specific interview question",
        "whyTheyAsk": "Brief explanation of what the hiring manager is evaluating",
        "suggestedApproach": "Guidance on how the candidate should structure their answer using their background"
      }
    ]

    Target Job Description:
    ${jobDesc}

    Candidate Resume Profile:
    ${candidateProfile}`;

        const response = await generateContentWithRetry(ai, {
            model: 'gemini-3.6-flash',
            contents: prompt,
        });

        const rawText = response.text || '';

        // 2. Use safeParseJSON for clean, robust parsing with fallback support
        const prepData = safeParseJSON(rawText);

        if (!prepData) {
            console.error('Failed to parse interview prep JSON from raw text:', rawText);
            // Fallback object matching your design layout if the LLM output was completely malformed
            const fallbackData = [{
                category: "General",
                question: "Parsing error or custom formatting",
                whyTheyAsk: "Formatting fallback",
                suggestedApproach: rawText
            }];
            return NextResponse.json({ success: true, data: fallbackData });
        }

        return NextResponse.json({ success: true, data: prepData });
    } catch (error) {
        console.error('Interview prep error:', error);
        return NextResponse.json({ success: false, error: describeAiError(error, 'Failed to generate interview prep.') }, { status: 500 });
    }
}