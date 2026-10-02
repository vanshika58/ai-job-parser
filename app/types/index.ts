/**
 * Shared data models for the AI Job & Candidate Intelligence Platform.
 * Every API response shape, domain model and non-trivial prop contract lives here.
 */

/* ------------------------------------------------------------------ *
 * Navigation
 * ------------------------------------------------------------------ */

export type TabId = 'parser' | 'tailor' | 'rewriter' | 'coverletter' | 'interview';

export interface TabDefinition {
  id: TabId;
  label: string;
}

/* ------------------------------------------------------------------ *
 * Generic API envelope (every route returns this shape)
 * ------------------------------------------------------------------ */

export interface ApiSuccess<TData> {
  success: true;
  data: TData;
}

export interface ApiFailure {
  success: false;
  error?: string;
}

export type ApiResponse<TData> = ApiSuccess<TData> | ApiFailure;

/* ------------------------------------------------------------------ *
 * JSON primitives (used for the open-ended parser payload)
 * ------------------------------------------------------------------ */

export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

/* ------------------------------------------------------------------ *
 * POST /api/parse-job
 * ------------------------------------------------------------------ */

/**
 * The parser prompt guarantees these keys, but explicitly allows the model to
 * append "any other relevant metadata found" - hence the JsonValue index signature
 * instead of `any`.
 */
export interface ParsedJobData {
  job_title?: string;
  required_skills?: string[];
  experience_level?: string;
  experience_years?: string | number;
  [key: string]: JsonValue | undefined;
}

/* ------------------------------------------------------------------ *
 * POST /api/tailor-resume
 * ------------------------------------------------------------------ */

export interface KeywordAudit {
  matchedKeywords: string[];
  missingKeywords: string[];
}

export interface TailoredResumeReport {
  /** Raw markdown table emitted by the model (section 1 of the response). */
  tableReport: string;
  keywords: KeywordAudit;
}

/** One parsed row of the markdown ATS report. */
export interface MarkdownTableRow {
  metric: string;
  assessment: string;
}

/* ------------------------------------------------------------------ *
 * POST /api/rewrite-bullets
 * ------------------------------------------------------------------ */

export interface BulletUpgrade {
  original: string;
  improved: string;
}

/* ------------------------------------------------------------------ *
 * POST /api/generate-cover-letter
 * ------------------------------------------------------------------ */

export type CoverLetterResult = string;

/* ------------------------------------------------------------------ *
 * POST /api/interview-loop
 * ------------------------------------------------------------------ */

/** The prompt asks for Easy | Medium | Hard | Expert, but the model is free-form. */
export type InterviewDifficulty = string;

export interface InterviewQuestion {
  questionNumber: number;
  difficulty: InterviewDifficulty;
  question: string;
  contextOrWhy: string;
}

export interface InterviewFeedback {
  critique: string;
  idealStructure: string;
}

export interface InterviewHistoryEntry {
  questionNumber: number;
  difficulty: InterviewDifficulty;
  question: string;
  userAnswer: string;
}

/** Step 1 of the loop returns the first question directly. */
export type InterviewFirstStepResponse = InterviewQuestion;

/** Steps 2..n return feedback on the previous answer plus a harder question. */
export interface InterviewNextStepResponse {
  feedback: InterviewFeedback;
  nextQuestion: InterviewQuestion;
}

/* ------------------------------------------------------------------ *
 * Shared UI prop contracts
 * ------------------------------------------------------------------ */

export type ButtonVariant = 'blue' | 'emerald';

export interface TabButtonProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

export interface TabPanelProps {
  active: boolean;
  children: React.ReactNode;
}

export interface PanelProps {
  children: React.ReactNode;
  className?: string;
}

export interface PanelHeaderProps {
  title: string;
  /** Right-aligned slot, typically a CopyButton. */
  action?: React.ReactNode;
  /** Adds the `border-b border-zinc-800 pb-3` separator used by most tabs. */
  bordered?: boolean;
}

export interface FieldLabelProps {
  children: React.ReactNode;
}

export interface TextAreaFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  rows: number;
  /** Tailwind padding utility, kept as its own prop to avoid class conflicts. */
  padding?: string;
  /** Tailwind font-size utility, kept as its own prop to avoid class conflicts. */
  textSize?: string;
}

export interface TextInputFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  padding?: string;
  textSize?: string;
}

export interface FileUploadFieldProps {
  file: File | null;
  onFileSelect: (file: File) => void;
  /** Copy shown once a file is picked, e.g. "Selected Resume". */
  selectedLabel: string;
  accept?: string;
  padding?: string;
  selectedMarginTop?: string;
}

export interface PrimaryButtonProps {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  loadingLabel: string;
  idleLabel: string;
  variant?: ButtonVariant;
  textSize?: string;
}

export type CopyButtonVariant = 'chip' | 'accent';

export interface CopyButtonProps {
  value: string;
  idleLabel: string;
  copiedLabel: string;
  /** Shown briefly when the clipboard write is rejected. */
  failedLabel?: string;
  variant?: CopyButtonVariant;
}

export interface LoadingMessageProps {
  message: string;
  className?: string;
}

export interface SpinnerLoaderProps {
  message: string;
  className?: string;
}

export interface EmptyStateProps {
  message: string;
  className?: string;
}

export interface KeywordChipListProps {
  keywords: string[];
  emptyMessage: string;
  tone: 'matched' | 'missing';
}

export interface MarkdownTableProps {
  text: string;
}
