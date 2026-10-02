/**
 * Transient server-side failures worth retrying.
 *
 * 429 is deliberately NOT here. On the Gemini free tier a 429 is
 * RESOURCE_EXHAUSTED - the daily request quota (e.g. 20/day for
 * gemini-3.6-flash) is gone. It will not clear in a couple of seconds, and
 * each retry burns another request against the same cap.
 */
const RETRYABLE_STATUSES = [500, 502, 503, 504];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** The @google/genai SDK stuffs the whole JSON error envelope into `.message`. */
function parseEnvelope(error) {
    if (!error || !error.message) return null;
    try {
        const parsed = JSON.parse(String(error.message));
        return parsed && parsed.error ? parsed.error : null;
    } catch {
        return null;
    }
}

function statusOf(error) {
    if (!error) return 0;
    if (typeof error.status === 'number') return error.status;
    const envelope = parseEnvelope(error);
    return envelope && typeof envelope.code === 'number' ? envelope.code : 0;
}

/** True when the request was rejected for quota/rate limit rather than a fault. */
function isQuotaError(error) {
    if (statusOf(error) === 429) return true;
    const envelope = parseEnvelope(error);
    return !!envelope && envelope.status === 'RESOURCE_EXHAUSTED';
}

function findDetail(envelope, typeSuffix) {
    if (!envelope || !Array.isArray(envelope.details)) return null;
    for (const detail of envelope.details) {
        if (detail && typeof detail['@type'] === 'string' && detail['@type'].endsWith(typeSuffix)) {
            return detail;
        }
    }
    return null;
}

/** Seconds Google asks us to wait, from the RetryInfo detail (e.g. "34s"). */
function retryAfterSeconds(envelope) {
    const info = findDetail(envelope, 'google.rpc.RetryInfo');
    if (!info || typeof info.retryDelay !== 'string') return 0;
    const seconds = parseInt(info.retryDelay, 10);
    return Number.isFinite(seconds) ? seconds : 0;
}

/** The specific quota that was hit, so the message can name the real limit. */
function quotaFacts(envelope) {
    const failure = findDetail(envelope, 'google.rpc.QuotaFailure');
    const violation =
        failure && Array.isArray(failure.violations) ? failure.violations[0] : null;
    if (!violation) return null;
    return {
        limit: violation.quotaValue,
        model: violation.quotaDimensions ? violation.quotaDimensions.model : undefined,
        perDay: String(violation.quotaId || '').indexOf('PerDay') !== -1,
    };
}

/**
 * Turn a @google/genai error into something worth showing a user.
 *
 * Before this, the UI alert read:
 *   Error: {"error":{"code":429,"message":"You exceeded your current quota, ...
 */
export function describeAiError(error, fallback) {
    const envelope = parseEnvelope(error);

    if (isQuotaError(error)) {
        const facts = quotaFacts(envelope);
        const wait = retryAfterSeconds(envelope);

        let message = 'Gemini API quota exceeded';
        if (facts && facts.limit) {
            const model = facts.model ? ` for ${facts.model}` : '';
            const window = facts.perDay ? '/day' : '';
            message += ` (free-tier limit: ${facts.limit} requests${window}${model})`;
        }
        message += wait
            ? `. Try again in about ${wait}s.`
            : '. Wait for the quota to reset, or enable billing on your Google AI Studio project for a higher limit.';
        return message;
    }

    if (RETRYABLE_STATUSES.indexOf(statusOf(error)) !== -1) {
        return 'The AI model is temporarily unavailable. Please try again in a moment.';
    }

    if (envelope && envelope.message) return envelope.message;

    return (error && error.message ? String(error.message) : '') || fallback;
}

/**
 * `ai.models.generateContent` with bounded retries on transient failures only.
 * gemini-flash returns 503 "experiencing high demand" fairly often; one or two
 * short retries turns most of those into a successful response. Quota errors
 * (429) fail fast instead, so a dead daily quota costs one request, not three.
 */
export async function generateContentWithRetry(ai, params, attempts = 3) {
    let lastError;

    for (let attempt = 0; attempt < attempts; attempt++) {
        try {
            return await ai.models.generateContent(params);
        } catch (error) {
            lastError = error;

            const retryable = RETRYABLE_STATUSES.indexOf(statusOf(error)) !== -1;
            if (!retryable || attempt === attempts - 1) throw error;

            const backoff = 600 * Math.pow(2, attempt); // 600ms, 1200ms
            console.warn(
                `generateContent failed with ${statusOf(error)}; retrying in ${backoff}ms (attempt ${attempt + 1}/${attempts})`
            );
            await sleep(backoff);
        }
    }

    throw lastError;
}
