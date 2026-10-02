import type { KeywordChipListProps } from '@/app/types';

const TONE_CLASSES: Record<KeywordChipListProps['tone'], string> = {
  matched: 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60',
  missing: 'bg-rose-950/80 text-rose-300 border border-rose-800/60',
};

/** Chip cloud used for matched / missing ATS keywords. */
export function KeywordChipList({ keywords, emptyMessage, tone }: KeywordChipListProps) {
  return (
      <div className="flex flex-wrap gap-1.5">
        {keywords.length > 0 ? (
            keywords.map((kw, i) => (
                <span key={i} className={`${TONE_CLASSES[tone]} px-2 py-0.5 rounded text-[11px]`}>
                  {kw}
                </span>
            ))
        ) : (
            <span className="text-zinc-500 text-xs italic">{emptyMessage}</span>
        )}
      </div>
  );
}
