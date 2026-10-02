'use client';

import { cx } from '@/app/lib/cx';
import type {
  FieldLabelProps,
  FileUploadFieldProps,
  TextAreaFieldProps,
  TextInputFieldProps,
} from '@/app/types';

const INPUT_BASE =
    'w-full bg-zinc-950 border border-zinc-700 rounded-lg focus:outline-none focus:border-blue-500 text-zinc-200';

export function FieldLabel({ children }: FieldLabelProps) {
  return <label className="font-semibold text-sm text-zinc-300">{children}</label>;
}

/**
 * Padding and text size are separate props rather than an appended className,
 * because Tailwind utility conflicts resolve by stylesheet order, not by the
 * order classes appear in the attribute.
 */
export function TextAreaField({
                                value,
                                onChange,
                                placeholder,
                                rows,
                                padding = 'p-3',
                                textSize = 'text-xs',
                              }: TextAreaFieldProps) {
  return (
      <textarea
          rows={rows}
          className={cx(INPUT_BASE, padding, textSize, 'resize-none')}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
      />
  );
}

export function TextInputField({
                                 value,
                                 onChange,
                                 placeholder,
                                 padding = 'p-3',
                                 textSize = 'text-xs',
                               }: TextInputFieldProps) {
  return (
      <input
          type="text"
          className={cx(INPUT_BASE, padding, textSize)}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
      />
  );
}

/**
 * Dashed drop-zone styled file picker. Replaces the four duplicated
 * `onChange={(e) => { if (e.target.files && e.target.files[0]) ... }}` blocks.
 */
export function FileUploadField({
                                  file,
                                  onFileSelect,
                                  selectedLabel,
                                  accept = '.pdf,.txt',
                                  padding = 'p-4',
                                  selectedMarginTop = 'mt-2',
                                }: FileUploadFieldProps) {
  return (
      <div
          className={cx(
              'border-2 border-dashed border-zinc-700 rounded-lg text-center bg-zinc-950 hover:border-blue-500 transition cursor-pointer',
              padding,
          )}
      >
        <input
            type="file"
            accept={accept}
            onChange={(e) => {
              const picked = e.target.files?.[0];
              if (picked) onFileSelect(picked);
            }}
            className="w-full text-xs text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
        />
        {file && (
            <p className={cx('text-xs text-emerald-400 font-medium', selectedMarginTop)}>
              {selectedLabel}: {file.name}
            </p>
        )}
      </div>
  );
}
