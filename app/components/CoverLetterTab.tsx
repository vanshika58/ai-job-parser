'use client';

import { useState } from 'react';
import { postForm, reportRequestFailure } from '@/app/lib/api';
import type { CoverLetterResult } from '@/app/types';
import {
  CopyButton,
  EmptyState,
  FieldLabel,
  FileUploadField,
  LoadingMessage,
  Panel,
  PanelHeader,
  PrimaryButton,
  TextAreaField,
} from './ui';

export function CoverLetterTab() {
  const [jobDesc, setJobDesc] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [coverLetter, setCoverLetter] = useState<CoverLetterResult>('');
  const [loading, setLoading] = useState(false);

  const handleGenerateCoverLetter = async () => {
    if (!jobDesc.trim() || !resumeFile) return;
    setLoading(true);
    setCoverLetter('');

    try {
      const formData = new FormData();
      formData.append('jobDesc', jobDesc);
      formData.append('file', resumeFile);

      const data = await postForm<CoverLetterResult>('/api/generate-cover-letter', formData);
      setCoverLetter(data);
    } catch (err) {
      reportRequestFailure(err, 'Failed to connect to cover letter service.');
    }

    setLoading(false);
  };

  return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Panel>
          <FieldLabel>1. Target Job Description</FieldLabel>
          <TextAreaField
              rows={5}
              value={jobDesc}
              onChange={setJobDesc}
              placeholder="Paste target job description..."
          />

          <FieldLabel>2. Upload Candidate Resume (.pdf or .txt)</FieldLabel>
          <FileUploadField
              file={resumeFile}
              onFileSelect={setResumeFile}
              selectedLabel="Selected Resume"
          />

          <PrimaryButton
              onClick={handleGenerateCoverLetter}
              disabled={loading || !jobDesc.trim() || !resumeFile}
              loading={loading}
              loadingLabel="Drafting Cover Letter..."
              idleLabel="Generate Personalized Cover Letter 📝"
          />
        </Panel>

        <Panel className="relative">
          <PanelHeader
              title="Generated Cover Letter"
              bordered
              action={
                coverLetter ? (
                    <CopyButton
                        value={coverLetter}
                        idleLabel="Copy Cover Letter"
                        copiedLabel="Copied Letter!"
                    />
                ) : null
              }
          />

          <div className="flex-1 bg-zinc-950 border border-zinc-700 rounded-lg p-4 overflow-auto max-h-[420px]">
            {loading ? (
                <LoadingMessage message="Synthesizing professional letter narrative..." />
            ) : coverLetter ? (
                <div className="whitespace-pre-line text-xs text-zinc-200 leading-relaxed font-sans">
                  {coverLetter}
                </div>
            ) : (
                <EmptyState
                    message="Provide job description and resume to generate a tailored cover letter."
                    className="h-full text-center px-4"
                />
            )}
          </div>
        </Panel>
      </div>
  );
}
