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
        const step = parseInt(formData.get('step') || '1', 10); // 1 = initial question, 2, 3, etc. = follow-ups
        const historyJson = formData.get('history') || '[]';
        const userAnswer = formData.get('userAnswer') || '';

        if (!jobDesc || !file) {
            return NextResponse.json({ success: false, error: 'Job description and resume file are required.' }, { status: 400 });
        }

        const candidateProfile = await extractResumeText(file);

        let chatHistory = [];
        try {
            chatHistory = JSON.parse(historyJson);
        } catch {
            chatHistory = [];
        }

        let prompt = '';

        if (step === 1) {
            // First question generation
            prompt = `You are a strict, senior technical hiring manager conducting an interactive live mock interview.
      Analyze the Target Job Description and Candidate Resume profile below.
      Generate the **FIRST interview question** (start with a foundational technical or behavioral question appropriate for this level).

      Provide your output strictly as a JSON object with no markdown code blocks or additional text, in this exact format:
      {
        "questionNumber": 1,
        "difficulty": "Easy",
        "question": "The first interview question tailored to the candidate's background",
        "contextOrWhy": "Brief note on what this evaluates"
      }

      Target Job Description:
      ${jobDesc}

      Candidate Resume Profile:
      ${candidateProfile}`;
        } else {
            // Evaluate user answer and give next harder question
            prompt = `You are an expert executive interview coach and hiring manager conducting a multi-turn mock interview.
      
      Previous Interview History & Conversation:
      ${JSON.stringify(chatHistory, null, 2)}

      The candidate just submitted their answer to Question #${step - 1}:
      "${userAnswer}"

      Your task:
      1. Evaluate the user's answer objectively. Give constructive feedback, highlight strong points, point out any missing gaps, and provide an ideal bullet-point framework for how they could have answered better.
      2. Generate the **NEXT interview question** (Question #${step}). 
      - **CRITICAL**: Make this next question **noticeably harder** or more advanced than the previous one (e.g., moving from basic concepts to deep architectural trade-offs, complex edge cases, or high-pressure situational leadership).

      Provide your output strictly as a JSON object with no markdown code blocks or additional text, in this exact format:
      {
        "feedback": {
          "critique": "Detailed evaluation of the user's answer",
          "idealStructure": "Suggested framework or talking points for an elite answer"
        },
        "nextQuestion": {
          "questionNumber": ${step},
          "difficulty": "Medium" or "Hard" or "Expert",
          "question": "The harder follow-up or advanced interview question",
          "contextOrWhy": "Why this harder question is being asked now"
        }
      }

      Target Job Description:
      ${jobDesc}

      Candidate Resume Profile:
      ${candidateProfile}`;
        }

        const response = await generateContentWithRetry(ai, {
            model: 'gemini-3.6-flash',
            contents: prompt,
        });

        const rawText = response.text || '';

        // 2. Use safeParseJSON instead of manual regex and JSON.parse
        const resultData = safeParseJSON(rawText);

        if (!resultData) {
            console.error('Failed to parse interview loop JSON from raw text:', rawText);
            return NextResponse.json({ success: false, error: 'Failed to parse AI response structure.' }, { status: 500 });
        }

        return NextResponse.json({ success: true, data: resultData });
    } catch (error) {
        console.error('Interview loop error:', error);
        return NextResponse.json({ success: false, error: describeAiError(error, 'Failed to process interview step.') }, { status: 500 });
    }
}