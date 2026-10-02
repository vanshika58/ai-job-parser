'use client';

import { useState } from 'react';
import { postForm, reportRequestFailure } from '@/app/lib/api';
import type { BulletUpgrade } from '@/app/types';
import {
  CopyButton,
  EmptyState,
  FieldLabel,
  FileUploadField,
  LoadingMessage,
  Panel,
  PrimaryButton,
  TextInputField,
} from './ui';

export function BulletRewriterTab() {
  const [rewriteFile, setRewriteFile] = useState<File | null>(null);
  const [targetRole, setTargetRole] = useState('');
  const [bulletUpgrades, setBulletUpgrades] = useState<BulletUpgrade[]>([]);
  const [loading, setLoading] = useState(false);

  const handleAuditAndRewrite = async () => {
    if (!rewriteFile) return;
    setLoading(true);
    setBulletUpgrades([]);

    try {
      const formData = new FormData();
      formData.append('file', rewriteFile);
      formData.append('jobRole', targetRole);

      const data = await postForm<BulletUpgrade[]>('/api/rewrite-bullets', formData);
      setBulletUpgrades(data);
    } catch (err) {
      reportRequestFailure(err, 'Failed to connect to rewrite service.');
    }

    setLoading(false);
  };

  return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Panel>
          <FieldLabel>1. Target Job Role / Title</FieldLabel>
          <TextInputField
              value={targetRole}
              onChange={setTargetRole}
              placeholder="e.g. Senior Backend Engineer"
          />

          <FieldLabel>2. Upload Your Full Resume (.pdf or .txt)</FieldLabel>
          <FileUploadField
              file={rewriteFile}
              onFileSelect={setRewriteFile}
              selectedLabel="Selected Resume"
              padding="p-5"
          />

          <PrimaryButton
              onClick={handleAuditAndRewrite}
              disabled={loading || !rewriteFile}
              loading={loading}
              loadingLabel="Scanning Resume & Finding Weaknesses..."
              idleLabel="Auto-Audit & Upgrade Bullets 🚀"
          />
        </Panel>

        <Panel className="relative">
          <span className="font-semibold text-sm text-zinc-300 border-b border-zinc-800 pb-3">
            Identified Weak Points & Upgrades
          </span>
          <div className="flex-1 bg-zinc-950 border border-zinc-700 rounded-lg p-4 overflow-auto max-h-[420px] space-y-4">
            {loading ? (
                <LoadingMessage message="Analyzing work history and impact metrics..." />
            ) : bulletUpgrades.length > 0 ? (
                bulletUpgrades.map((item, index) => (
                    <div
                        key={index}
                        className="bg-zinc-900 p-3.5 rounded-lg border border-zinc-800 flex flex-col space-y-3"
                    >
                      <div>
                        <span className="text-[10px] font-semibold text-rose-400 uppercase tracking-wider block mb-1">
                          Original Weak Point
                        </span>
                        <p className="text-xs text-zinc-400 line-through">{item.original}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider block mb-1">
                          Upgraded Impact Bullet
                        </span>
                        <p className="text-xs text-zinc-100 font-medium">{item.improved}</p>
                      </div>
                      <div className="flex justify-end pt-1">
                        <CopyButton
                            value={item.improved}
                            idleLabel="Copy Upgraded Bullet"
                            copiedLabel="Copied Upgraded Bullet!"
                            variant="accent"
                        />
                      </div>
                    </div>
                ))
            ) : (
                <EmptyState
                    message="Upload your resume and click the audit button to let AI find and fix your weak bullet points."
                    className="h-full text-center px-4"
                />
            )}
          </div>
        </Panel>
      </div>
  );
}
