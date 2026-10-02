'use client';

import { useState } from 'react';
import { AtsTailorTab } from './components/AtsTailorTab';
import { BulletRewriterTab } from './components/BulletRewriterTab';
import { CoverLetterTab } from './components/CoverLetterTab';
import { DataParserTab } from './components/DataParserTab';
import { InterviewTab } from './components/InterviewTab';
import { TabButton, TabPanel } from './components/ui';
import type { TabDefinition, TabId } from './types';

const TABS: TabDefinition[] = [
  { id: 'parser', label: 'Data Parser' },
  { id: 'tailor', label: 'ATS Match & Keywords 🎯' },
  { id: 'rewriter', label: 'Auto-Audit Bullets ✍️' },
  { id: 'coverletter', label: 'Cover Letter 📝' },
  { id: 'interview', label: 'Adaptive Interview 🎤' },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>('parser');
  const [globalError, setGlobalError] = useState<string | null>(null);

  return (
      <main className="min-h-screen bg-[#090a0f] text-zinc-100 p-6 md:p-12 relative overflow-x-hidden selection:bg-blue-600 selection:text-white">
        {/* Ambient background glow for high-end SaaS feel */}
        <div className="fixed inset-0 pointer-events-none flex justify-center overflow-hidden z-0">
          <div className="w-[900px] h-[450px] bg-blue-600/10 blur-[160px] rounded-full translate-y-[-50%]" />
        </div>

        <div className="max-w-6xl mx-auto space-y-8 relative z-10">

          {/* Global Error Banner (Replaces native alerts) */}
          {globalError && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center justify-between shadow-lg backdrop-blur-md animate-fadeIn">
                <span className="font-medium">⚠️ {globalError}</span>
                <button
                    onClick={() => setGlobalError(null)}
                    className="text-rose-400 hover:text-rose-200 font-bold px-2 py-1 transition"
                >
                  ✕
                </button>
              </div>
          )}

          {/* Header & Tab Navigation */}
          <div className="border-b border-zinc-800/80 pb-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-indigo-300 to-white bg-clip-text text-transparent">
                AI Job & Candidate Intelligence Platform
              </h1>
              <p className="text-zinc-400 mt-1.5 text-sm">
                Complete suite: ATS Audits, Bullet Rewrites, Cover Letters, and Adaptive Mock Interviews.
              </p>
            </div>

            <div className="flex bg-zinc-900/90 p-1.5 rounded-xl border border-zinc-800 flex-wrap gap-1 shadow-inner">
              {TABS.map((tab) => (
                  <TabButton
                      key={tab.id}
                      label={tab.label}
                      active={activeTab === tab.id}
                      onClick={() => setActiveTab(tab.id)}
                  />
              ))}
            </div>
          </div>

          {/* Feature tabs - each owns its own state; inactive ones stay mounted
            so in-progress work is not lost when switching tabs. */}
          <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-6 backdrop-blur-xl shadow-2xl">
            <TabPanel active={activeTab === 'parser'}>
              <DataParserTab />
            </TabPanel>
            <TabPanel active={activeTab === 'tailor'}>
              <AtsTailorTab />
            </TabPanel>
            <TabPanel active={activeTab === 'rewriter'}>
              <BulletRewriterTab />
            </TabPanel>
            <TabPanel active={activeTab === 'coverletter'}>
              <CoverLetterTab />
            </TabPanel>
            <TabPanel active={activeTab === 'interview'}>
              <InterviewTab />
            </TabPanel>
          </div>

        </div>
      </main>
  );
}