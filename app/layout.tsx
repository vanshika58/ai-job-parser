import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI Career Intelligence Platform',
  description: 'Elite ATS optimization, resume bullet auditing, and adaptive mock interview loop.',
};

export default function RootLayout({
                                     children,
                                   }: {
  children: React.ReactNode;
}) {
  return (
      <html lang="en" className="dark">
      <body className="bg-[#090a0f] text-zinc-100 min-h-screen selection:bg-blue-600 selection:text-white antialiased relative overflow-x-hidden font-sans">
      {/* Ambient background glow for high-end SaaS aesthetic */}
      <div className="fixed inset-0 pointer-events-none flex justify-center overflow-hidden z-0">
        <div className="w-[1000px] h-[500px] bg-blue-600/10 blur-[180px] rounded-full translate-y-[-50%]" />
      </div>

      {/* Main Application Container */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {children}
      </div>
      </body>
      </html>
  );
}