import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';
import { extractResumeText } from '@/app/lib/resumeText';
import { describeAiError, generateContentWithRetry } from '@/app/lib/aiRequest';

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

        const prompt = `Youre an expert executive career coach and professional copywriter. 
    Write a compelling, professional, and personalized cover letter based on the Target Job Description and the Candidate Resume profile provided below.

    Guidelines for the cover letter:
    - Keep it concise, engaging, and structured with standard professional paragraphs (Salutation, Introduction connecting background to role, 2 impactful body paragraphs highlighting specific relevant achievements, and a strong Call to Action sign-off).
    - Avoid robotic corporate clichés; make it sound authentic and confident.
    - Do not use placeholders like "[Company Name]"; infer details from the job description where possible or use clean professional framing.

    Target Job Description:
    ${jobDesc}

    Candidate Resume Profile:
    ${candidateProfile}`;

        const response = await generateContentWithRetry(ai, {
            model: 'gemini-3.6-flash',
            contents: prompt,
        });

        return NextResponse.json({ success: true, data: response.text });
    } catch (error) {
        console.error('Cover letter generation error:', error);
        return NextResponse.json({ success: false, error: describeAiError(error, 'Failed to generate cover letter.') }, { status: 500 });
    }
}