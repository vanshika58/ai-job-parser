import { cx } from '@/app/lib/cx';
import type { PanelHeaderProps, PanelProps } from '@/app/types';

/** The dark card wrapper shared by every input/output column. */
export function Panel({ children, className }: PanelProps) {
  return (
      <div
          className={cx(
              'flex flex-col space-y-4 bg-zinc-900/50 p-5 rounded-xl border border-zinc-800',
              className,
          )}
      >
        {children}
      </div>
  );
}

/** Panel title row with an optional right-aligned action slot. */
export function PanelHeader({ title, action, bordered = false }: PanelHeaderProps) {
  return (
      <div
          className={cx(
              'flex justify-between items-center',
              bordered && 'border-b border-zinc-800 pb-3',
          )}
      >
        <span className="font-semibold text-sm text-zinc-300">{title}</span>
        {action}
      </div>
  );
}
