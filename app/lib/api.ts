import type { ApiResponse } from '@/app/types';

/**
 * Thrown when a route responded with `{ success: false, error }`.
 * Callers use this to distinguish a server-reported problem (show the error)
 * from a transport/parse failure (show a per-feature connection message).
 */
export class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

/** Narrows an unknown catch binding to a printable message without using `any`. */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

async function request<TData>(url: string, init: RequestInit): Promise<TData> {
  const res = await fetch(url, init);

  const contentType = res.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    const text = await res.text();
    throw new Error(`Server error (${res.status}): ${text.slice(0, 150)}`);
  }

  const payload = (await res.json()) as ApiResponse<TData>;
  if (!payload.success) {
    throw new ApiError(payload.error || 'Unknown server error');
  }

  return payload.data;
}

/** POST a JSON body and unwrap the `data` field of the API envelope. */
export function postJson<TData>(url: string, body: unknown): Promise<TData> {
  return request<TData>(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

/** POST a multipart body and unwrap the `data` field of the API envelope. */
export function postForm<TData>(url: string, formData: FormData): Promise<TData> {
  return request<TData>(url, { method: 'POST', body: formData });
}

/**
 * Single place where request failures surface to the user, preserving the
 * original behaviour: server-reported errors as "Error: ...", anything else as
 * the caller's own connection message.
 */
export function reportRequestFailure(error: unknown, connectionMessage: string): void {
  console.error(error);
  if (error instanceof ApiError) {
    alert('Error: ' + error.message);
  } else {
    alert(connectionMessage);
  }
}
