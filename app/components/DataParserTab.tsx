'use client';

import { useState } from 'react';
import { postJson, reportRequestFailure } from '@/app/lib/api';
import type { ParsedJobData } from '@/app/types';
import {
  CopyButton,
  EmptyState,
  FieldLabel,
  LoadingMessage,
  Panel,
  PanelHeader,
  PrimaryButton,
  TextAreaField,
} from './ui';

const SAMPLE_DEVELOPER_JD =
    'Looking for a Senior Python Dev with Django, FastAPI, Docker, and AWS experience. Remote position, needs good communication. 5-7 years exp.';

export function DataParserTab() {
  const [messyData, setMessyData] = useState('');
  const [result, setResult] = useState<ParsedJobData | null>(null);
  const [loading, setLoading] = useState(false);

  const handleParse = async () => {
    if (!messyData.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      const data = await postJson<ParsedJobData>('/api/parse-job', { messyData });
      setResult(data);
    } catch (err) {
      reportRequestFailure(err, 'Failed to connect to server.');
    }

    setLoading(false);
  };

  return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Panel>
          <FieldLabel>Unstructured Applicant Data</FieldLabel>
          <div className="flex flex-wrap gap-2">
            <button
                onClick={() => setMessyData(SAMPLE_DEVELOPER_JD)}
                className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1.5 rounded-md border border-zinc-700 transition"
            >
              ⚡ Load Sample: Developer
            </button>
          </div>
          <TextAreaField
              rows={8}
              value={messyData}
              onChange={setMessyData}
              placeholder="Paste messy text here..."
              padding="p-4"
              textSize="text-sm"
          />
          <PrimaryButton
              onClick={handleParse}
              disabled={loading || !messyData.trim()}
              loading={loading}
              loadingLabel="Processing..."
              idleLabel="Extract Structured Data"
          />
        </Panel>

        <Panel className="relative">
          <PanelHeader
              title="Structured Output"
              action={
                result ? (
                    <CopyButton
                        value={JSON.stringify(result, null, 2)}
                        idleLabel="Copy JSON"
                        copiedLabel="Copied!"
                    />
                ) : null
              }
          />
          <div className="flex-1 bg-zinc-950 border border-zinc-700 rounded-lg p-4 overflow-auto max-h-[420px]">
            {loading ? (
                <LoadingMessage message="Analyzing..." />
            ) : result ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-3 text-sm">
                    <div className="bg-zinc-900 p-3 rounded-lg border border-zinc-800 flex justify-between">
                      <span className="text-zinc-400">Job Title:</span>
                      <span className="font-semibold text-zinc-100">{result.job_title}</span>
                    </div>
                    <div className="bg-zinc-900 p-3 rounded-lg border border-zinc-800 flex justify-between">
                      <span className="text-zinc-400">Experience:</span>
                      <span className="font-semibold text-emerald-400">{result.experience_level}</span>
                    </div>
                    <div className="bg-zinc-900 p-3 rounded-lg border border-zinc-800 space-y-2">
                      <span className="text-zinc-400 block text-xs">Skills:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {result.required_skills?.map((skill, i) => (
                            <span
                                key={i}
                                className="bg-blue-950 text-blue-300 border border-blue-800 px-2.5 py-1 rounded-md text-xs"
                            >
                              {skill}
                            </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
            ) : (
                <EmptyState message="Awaiting input..." />
            )}
          </div>
        </Panel>
      </div>
  );
}
