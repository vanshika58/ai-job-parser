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

        if (!jobDesc) {
            return NextResponse.json({ success: false, error: 'Job description is required' }, { status: 400 });
        }

        let candidateProfile = '';

        if (file && typeof file === 'object') {
            candidateProfile = await extractResumeText(file);
        }

        if (!candidateProfile || !candidateProfile.trim()) {
            return NextResponse.json({ success: false, error: 'Candidate profile or PDF content is empty.' }, { status: 400 });
        }

        const prompt = `You are an expert technical recruiter and ATS engine. 
    Analyze the Target Job Description and the Candidate Profile/Resume.

    Provide your analysis in TWO sections separated strictly by the marker "---KEYWORD_SECTION---":

    SECTION 1: A markdown table containing:
    | Evaluation Metric | Detailed Assessment |
    | :--- | :--- |
    | **1. Match Score (%)** | [Score as integer percentage e.g. 75%] |
    | **2. Current Strengths** | [Key existing strengths matching role] |
    | **3. Skills to Learn / Gaps** | [Missing concepts or technologies] |
    | **4. Best-Fit Current Role** | [Exact job title candidate qualifies for now] |
    | **5. Actionable Tailored Advice** | [Bullet points for resume optimization] |

    ---KEYWORD_SECTION---
    SECTION 2: Provide JSON only (no markdown code blocks) representing keywords in this exact format:
    {
      "matchedKeywords": ["keyword1", "keyword2"],
      "missingKeywords": ["keyword3", "keyword4"]
    }

    Target Job Description:
    ${jobDesc}

    Candidate Profile:
    ${candidateProfile}`;

        const response = await generateContentWithRetry(ai, {
            model: 'gemini-3.6-flash',
            contents: prompt,
        });

        const rawText = response.text || '';
        const parts = rawText.split('---KEYWORD_SECTION---');

        let tableData = parts[0] ? parts[0].trim() : rawText;
        let keywordData = { matchedKeywords: [], missingKeywords: [] };

        if (parts[1]) {
            // 2. Use safeParseJSON for clean, robust extraction of the keyword JSON
            const parsedKeywords = safeParseJSON(parts[1]);
            if (parsedKeywords) {
                keywordData = parsedKeywords;
            } else {
                console.error('Failed to parse keyword JSON payload from text:', parts[1]);
            }
        }

        return NextResponse.json({
            success: true,
            data: {
                tableReport: tableData,
                keywords: keywordData
            }
        });
    } catch (error) {
        console.error('Tailoring error:', error);
        return NextResponse.json({ success: false, error: describeAiError(error, 'Failed to process request.') }, { status: 500 });
    }
}