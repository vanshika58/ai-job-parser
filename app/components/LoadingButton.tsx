'use client';

import React from 'react';

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    isLoading: boolean;
    loadingText?: string;
    children: React.ReactNode;
}

export function LoadingButton({
                                  isLoading,
                                  loadingText = 'Processing...',
                                  children,
                                  className = '',
                                  disabled,
                                  ...props
                              }: LoadingButtonProps) {
    return (
        <button
            disabled={isLoading || disabled}
            className={`relative inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 shadow-lg shadow-blue-900/30 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white disabled:opacity-70 disabled:cursor-not-allowed transform active:scale-95 ${className}`}
            {...props}
        >
            {isLoading ? (
                <span className="flex items-center gap-2.5">
          <svg className="animate-spin -ml-1 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
                    {loadingText}
        </span>
            ) : (
                children
            )}
        </button>
    );
}