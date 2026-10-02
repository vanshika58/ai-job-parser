import { cx } from '@/app/lib/cx';
import type { EmptyStateProps, LoadingMessageProps, SpinnerLoaderProps } from '@/app/types';

/** Centered pulsing text used while a request is in flight. */
export function LoadingMessage({ message, className }: LoadingMessageProps) {
  return (
      <div
          className={cx(
              'flex items-center justify-center text-zinc-500 animate-pulse text-sm',
              className ?? 'h-full',
          )}
      >
        {message}
      </div>
  );
}

/** Spinner + caption variant used by the ATS audit panel. */
export function SpinnerLoader({ message, className }: SpinnerLoaderProps) {
  return (
      <div
          className={cx(
              'flex flex-col items-center justify-center text-zinc-500 animate-pulse text-sm space-y-2',
              className ?? 'h-64',
          )}
      >
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <span>{message}</span>
      </div>
  );
}

/** Centered placeholder shown before the first result arrives. */
export function EmptyState({ message, className }: EmptyStateProps) {
  return (
      <div
          className={cx(
              'flex items-center justify-center text-zinc-600 text-sm',
              className ?? 'h-full',
          )}
      >
        {message}
      </div>
  );
}
