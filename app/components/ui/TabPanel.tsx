import type { TabPanelProps } from '@/app/types';

/**
 * Keeps every tab mounted and hides the inactive ones, so per-tab local state
 * (typed job descriptions, selected files, an in-progress interview) survives
 * tab switches exactly as it did when all state lived in the page component.
 */
export function TabPanel({ active, children }: TabPanelProps) {
  return <div className={active ? '' : 'hidden'}>{children}</div>;
}
