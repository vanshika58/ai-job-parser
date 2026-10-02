'use client';

import { useEffect } from 'react';

export default function ErrorBoundary({
                                          error,
                                          reset,
                                      }: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Unhandled app error:', error);
    }, [error]);

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-6">
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl max-w-md w-full space-y-4 text-center">
                <h2 className="text-lg font-bold text-rose-400">Something went wrong!</h2>
                <p className="text-xs text-zinc-400">
                    {error.message || 'An unexpected error occurred while communicating with the AI service.'}
                </p>
                <button
                    onClick={() => reset()}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition"
                >
                    Try Again
                </button>
            </div>
        </div>
    );
}