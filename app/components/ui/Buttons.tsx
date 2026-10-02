'use client';

import { useEffect, useRef, useState } from 'react';
import { cx } from '@/app/lib/cx';
import type {
  ButtonVariant,
  CopyButtonProps,
  CopyButtonVariant,
  PrimaryButtonProps,
  TabButtonProps,
} from '@/app/types';

const PRIMARY_VARIANTS: Record<ButtonVariant, string> = {
  blue: 'bg-blue-600 hover:bg-blue-700',
  emerald: 'bg-emerald-600 hover:bg-emerald-700',
};

/** Distinct, non-overlapping skins so Tailwind utilities never collide. */
const COPY_VARIANTS: Record<CopyButtonVariant, string> = {
  chip: 'text-xs bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded text-zinc-300 transition',
  accent:
      'text-[11px] bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 border border-blue-800/50 px-2.5 py-1 rounded transition',
};

/** Full-width call-to-action with the shared loading/disabled treatment. */
export function PrimaryButton({
                                onClick,
                                disabled = false,
                                loading = false,
                                loadingLabel,
                                idleLabel,
                                variant = 'blue',
                                textSize,
                              }: PrimaryButtonProps) {
  return (
      <button
          onClick={onClick}
          disabled={disabled}
          className={cx(
              'w-full py-3 font-medium rounded-lg transition disabled:bg-zinc-800',
              PRIMARY_VARIANTS[variant],
              textSize,
          )}
      >
        {loading ? loadingLabel : idleLabel}
      </button>
  );
}

/**
 * Copy-to-clipboard button that owns its own state, so the tabs no longer share
 * one global `copied` flag.
 *
 * The clipboard write is awaited rather than fire-and-forget: it can reject
 * (denied permission, unfocused document, insecure origin), and the original
 * inline handler both surfaced that as an unhandled rejection and still
 * reported "Copied!" when nothing had been copied.
 */
export function CopyButton({
                             value,
                             idleLabel,
                             copiedLabel,
                             failedLabel = 'Copy failed',
                             variant = 'chip',
                           }: CopyButtonProps) {
  const [status, setStatus] = useState<'idle' | 'copied' | 'failed'>('idle');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const flash = (next: 'copied' | 'failed') => {
    if (!mountedRef.current) return;
    setStatus(next);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (mountedRef.current) setStatus('idle');
    }, 2000);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      flash('copied');
    } catch (err) {
      console.error('Clipboard write failed:', err);
      flash('failed');
    }
  };

  const label = status === 'copied' ? copiedLabel : status === 'failed' ? failedLabel : idleLabel;

  return (
      <button onClick={handleCopy} className={COPY_VARIANTS[variant]}>
        {label}
      </button>
  );
}

export function TabButton({ label, active, onClick }: TabButtonProps) {
  return (
      <button
          onClick={onClick}
          className={cx(
              'px-3 py-2 rounded-md text-xs font-semibold transition',
              active ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:text-white',
          )}
      >
        {label}
      </button>
  );
}
