import type { MarkdownTableProps, MarkdownTableRow } from '@/app/types';

/** Turns the model's pipe-delimited markdown table into typed rows. */
export function parseMarkdownTable(text: string): MarkdownTableRow[] {
  const lines = text.split('\n').filter((line) => line.includes('|'));
  const rows: MarkdownTableRow[] = [];

  for (const line of lines) {
    if (line.includes('---')) continue;
    const parts = line.split('|').map((p) => p.trim()).filter(Boolean);
    if (parts.length >= 2) {
      rows.push({ metric: parts[0], assessment: parts[1] });
    }
  }

  return rows;
}

/**
 * Renders the ATS evaluation matrix. Falls back to raw pre-formatted text when
 * the response could not be parsed into rows.
 */
export function MarkdownTable({ text }: MarkdownTableProps) {
  const rows = parseMarkdownTable(text);

  if (rows.length === 0) {
    return <div className="whitespace-pre-line text-xs font-mono text-zinc-300">{text}</div>;
  }

  return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
          <tr className="border-b border-zinc-700 bg-zinc-900 text-blue-400">
            <th className="p-3 font-semibold w-1/3">Evaluation Metric</th>
            <th className="p-3 font-semibold w-2/3">Detailed Assessment</th>
          </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800 text-zinc-200">
          {rows.map((row, index) => (
              <tr key={index} className="hover:bg-zinc-900/50 transition">
                <td className="p-3 font-medium text-zinc-300 align-top">{row.metric}</td>
                <td className="p-3 leading-relaxed align-top">
                  <div className="space-y-1.5">
                    {row.assessment.split('<br>').map((point, i) => (
                        <div key={i} className="text-zinc-300">{point}</div>
                    ))}
                  </div>
                </td>
              </tr>
          ))}
          </tbody>
        </table>
      </div>
  );
}
