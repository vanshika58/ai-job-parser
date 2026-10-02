'use client';

import { useState } from 'react';
import { postForm, reportRequestFailure } from '@/app/lib/api';
import type {
  InterviewFeedback,
  InterviewFirstStepResponse,
  InterviewHistoryEntry,
  InterviewNextStepResponse,
  InterviewQuestion,
} from '@/app/types';
import {
  EmptyState,
  FieldLabel,
  FileUploadField,
  LoadingMessage,
  Panel,
  PrimaryButton,
  TextAreaField,
} from './ui';

const DIFFICULTY_CLASSES: Record<string, string> = {
  Easy: 'bg-emerald-950 text-emerald-300 border border-emerald-800',
  Medium: 'bg-blue-950 text-blue-300 border border-blue-800',
};
const DIFFICULTY_FALLBACK = 'bg-rose-950 text-rose-300 border border-rose-800';

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const tone = DIFFICULTY_CLASSES[difficulty] ?? DIFFICULTY_FALLBACK;
  return (
      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${tone}`}>
        Difficulty: {difficulty}
      </span>
  );
}

export function InterviewTab() {
  const [jobDesc, setJobDesc] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [currentQuestion, setCurrentQuestion] = useState<InterviewQuestion | null>(null);
  const [userAnswerInput, setUserAnswerInput] = useState('');
  const [interviewHistory, setInterviewHistory] = useState<InterviewHistoryEntry[]>([]);
  const [lastFeedback, setLastFeedback] = useState<InterviewFeedback | null>(null);
  const [loading, setLoading] = useState(false);

  /** Step 1: seed the loop with the first (easy) question. */
  const handleStartInterview = async () => {
    if (!jobDesc.trim() || !resumeFile) return;
    setLoading(true);
    setInterviewStarted(true);
    setCurrentStep(1);
    setInterviewHistory([]);
    setLastFeedback(null);
    setCurrentQuestion(null);

    try {
      const formData = new FormData();
      formData.append('jobDesc', jobDesc);
      formData.append('file', resumeFile);
      formData.append('step', '1');

      const data = await postForm<InterviewFirstStepResponse>('/api/interview-loop', formData);
      setCurrentQuestion(data);
    } catch (err) {
      reportRequestFailure(err, 'Failed to start interview loop.');
      setInterviewStarted(false);
    }

    setLoading(false);
  };

  /** Steps 2..n: submit the answer, receive feedback plus a harder question. */
  const handleSubmitAnswer = async () => {
    if (!userAnswerInput.trim() || !currentQuestion || !resumeFile) return;
    setLoading(true);

    try {
      const updatedHistory: InterviewHistoryEntry[] = [
        ...interviewHistory,
        {
          questionNumber: currentQuestion.questionNumber,
          difficulty: currentQuestion.difficulty,
          question: currentQuestion.question,
          userAnswer: userAnswerInput,
        },
      ];

      const formData = new FormData();
      formData.append('jobDesc', jobDesc);
      formData.append('file', resumeFile);
      formData.append('step', String(currentStep + 1));
      formData.append('userAnswer', userAnswerInput);
      formData.append('history', JSON.stringify(updatedHistory));

      const data = await postForm<InterviewNextStepResponse>('/api/interview-loop', formData);
      setLastFeedback(data.feedback);
      setCurrentQuestion(data.nextQuestion);
      setInterviewHistory(updatedHistory);
      setCurrentStep((prev) => prev + 1);
      setUserAnswerInput('');
    } catch (err) {
      reportRequestFailure(err, 'Failed to submit answer.');
    }

    setLoading(false);
  };

  return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Left Panel: Inputs & Answer Form */}
        <Panel>
          <FieldLabel>1. Target Job Description</FieldLabel>
          <TextAreaField
              rows={4}
              value={jobDesc}
              onChange={setJobDesc}
              placeholder="Paste target job description..."
          />

          <FieldLabel>2. Upload Candidate Resume (.pdf or .txt)</FieldLabel>
          <FileUploadField
              file={resumeFile}
              onFileSelect={setResumeFile}
              selectedLabel="Selected Resume"
              padding="p-3"
              selectedMarginTop="mt-1"
          />

          {!interviewStarted ? (
              <PrimaryButton
                  onClick={handleStartInterview}
                  disabled={loading || !jobDesc.trim() || !resumeFile}
                  loading={loading}
                  loadingLabel="Initializing Mock Interview..."
                  idleLabel="Start Mock Interview Loop 🎤"
                  textSize="text-xs"
              />
          ) : (
              <div className="space-y-3 pt-2 border-t border-zinc-800">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-blue-400">Question #{currentStep} Active</span>
                  <button
                      onClick={() => setInterviewStarted(false)}
                      className="text-zinc-500 hover:text-zinc-300 underline"
                  >
                    Restart Interview
                  </button>
                </div>
                <FieldLabel>Your Answer:</FieldLabel>
                <TextAreaField
                    rows={4}
                    value={userAnswerInput}
                    onChange={setUserAnswerInput}
                    placeholder="Type how you would answer this question..."
                />
                <PrimaryButton
                    onClick={handleSubmitAnswer}
                    disabled={loading || !userAnswerInput.trim()}
                    loading={loading}
                    loadingLabel="Evaluating & Escalating..."
                    idleLabel="Submit Answer & Get Harder Question 🚀"
                    variant="emerald"
                    textSize="text-xs"
                />
              </div>
          )}
        </Panel>

        {/* Right Panel: Live Question & Feedback Loop */}
        <Panel className="relative">
          <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
            <span className="font-semibold text-sm text-zinc-300">Live Interviewer Feed</span>
            {currentQuestion && <DifficultyBadge difficulty={currentQuestion.difficulty} />}
          </div>

          <div className="flex-1 bg-zinc-950 border border-zinc-700 rounded-lg p-4 overflow-auto max-h-[500px] space-y-4">
            {loading && !currentQuestion ? (
                <LoadingMessage message="Setting up hiring manager session..." />
            ) : currentQuestion ? (
                <div className="space-y-4">
                  {/* Current Question Card */}
                  <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800 space-y-2">
                    <span className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider block">
                      Question #{currentQuestion.questionNumber}
                    </span>
                    <h3 className="text-xs font-semibold text-zinc-100 leading-relaxed">
                      {currentQuestion.question}
                    </h3>
                    <p className="text-[11px] text-zinc-400 italic">
                      Context: {currentQuestion.contextOrWhy}
                    </p>
                  </div>

                  {/* Previous Turn Feedback Card */}
                  {lastFeedback && (
                      <div className="bg-zinc-900/80 p-4 rounded-lg border border-zinc-800 space-y-3 animate-fadeIn">
                        <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                          Feedback on Previous Answer
                        </span>
                        <div className="space-y-1">
                          <span className="text-[10px] font-semibold text-zinc-400 block">
                            Critique & Analysis:
                          </span>
                          <p className="text-xs text-zinc-200">{lastFeedback.critique}</p>
                        </div>
                        <div className="space-y-1 pt-2 border-t border-zinc-800">
                          <span className="text-[10px] font-semibold text-emerald-400 block">
                            Ideal Answer Structure:
                          </span>
                          <p className="text-xs text-zinc-300 whitespace-pre-line">
                            {lastFeedback.idealStructure}
                          </p>
                        </div>
                      </div>
                  )}
                </div>
            ) : (
                <EmptyState
                    message={'Provide your resume and job description on the left, then click "Start Mock Interview Loop" to begin.'}
                    className="h-full text-center px-4"
                />
            )}
          </div>
        </Panel>

      </div>
  );
}
