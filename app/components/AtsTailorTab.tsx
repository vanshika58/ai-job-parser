'use client';

import { useState } from 'react';
import { postForm, reportRequestFailure } from '@/app/lib/api';
import type { TailoredResumeReport } from '@/app/types';
import {
  CopyButton,
  EmptyState,
  FieldLabel,
  FileUploadField,
  KeywordChipList,
  MarkdownTable,
  Panel,
  PanelHeader,
  PrimaryButton,
  SpinnerLoader,
  TextAreaField,
} from './ui';

export function AtsTailorTab() {
  const [jobDesc, setJobDesc] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [tailoredResult, setTailoredResult] = useState<TailoredResumeReport | null>(null);
  const [loading, setLoading] = useState(false);

  const handleTailorResume = async () => {
    if (!jobDesc.trim() || !selectedFile) return;
    setLoading(true);
    setTailoredResult(null);

    try {
      const formData = new FormData();
      formData.append('jobDesc', jobDesc);
      formData.append('file', selectedFile);

      const data = await postForm<TailoredResumeReport>('/api/tailor-resume', formData);
      setTailoredResult(data);
    } catch (err) {
      reportRequestFailure(err, 'Failed to connect to server.');
    }

    setLoading(false);
  };

  return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
              file={selectedFile}
              onFileSelect={setSelectedFile}
              selectedLabel="Selected"
          />

          <PrimaryButton
              onClick={handleTailorResume}
              disabled={loading || !jobDesc.trim() || !selectedFile}
              loading={loading}
              loadingLabel="Running ATS Matrix Audit..."
              idleLabel="Audit Resume & Keywords"
          />
        </Panel>

        <Panel className="lg:col-span-2 relative">
          <PanelHeader
              title="ATS Match Matrix & Keyword Audit"
              bordered
              action={
                tailoredResult ? (
                    <CopyButton
                        value={tailoredResult.tableReport}
                        idleLabel="Copy Table Report"
                        copiedLabel="Copied Report!"
                    />
                ) : null
              }
          />

          <div className="flex-1 space-y-6 overflow-auto max-h-[520px] pr-1">
            {loading ? (
                <SpinnerLoader message="Evaluating candidate profile against ATS vector criteria..." />
            ) : tailoredResult ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                    <div>
                      <h4 className="text-xs font-semibold text-emerald-400 mb-2 uppercase tracking-wide">
                        ✓ Matched Keywords Found
                      </h4>
                      <KeywordChipList
                          tone="matched"
                          keywords={tailoredResult.keywords.matchedKeywords ?? []}
                          emptyMessage="No matched keywords indexed"
                      />
                    </div>

                    <div>
                      <h4 className="text-xs font-semibold text-rose-400 mb-2 uppercase tracking-wide">
                        ⚠ Missing Gaps / Keywords
                      </h4>
                      <KeywordChipList
                          tone="missing"
                          keywords={tailoredResult.keywords.missingKeywords ?? []}
                          emptyMessage="Zero critical gaps found"
                      />
                    </div>
                  </div>

                  <MarkdownTable text={tailoredResult.tableReport} />
                </div>
            ) : (
                <EmptyState
                    message="Upload your resume and paste a job description to trigger the ATS audit."
                    className="h-64"
                />
            )}
          </div>
        </Panel>
      </div>
  );
}
