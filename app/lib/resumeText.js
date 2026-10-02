import { createRequire } from 'module';

const require = createRequire(import.meta.url);

// pdf-parse v2 is CJS and exports a PDFParse class - it is NOT a callable
// default export the way v1 was. Calling the module directly throws
// "pdfParse is not a function".
const { PDFParse } = require('pdf-parse');

/**
 * Pull plain text out of an uploaded resume (.pdf or .txt).
 *
 * Throws a descriptive Error when a PDF yields no text. The previous code
 * caught the parse failure and fell back to `buffer.toString('utf-8')`, which
 * fed the raw "%PDF-1.4 ..." bytes to the model as if they were the resume -
 * producing confident analysis of binary garbage instead of a visible error.
 */
export async function extractResumeText(file) {
    if (!file || typeof file !== 'object') return '';

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = String(file.name || '').toLowerCase();

    if (!fileName.endsWith('.pdf')) {
        return buffer.toString('utf-8');
    }

    const parser = new PDFParse({ data: new Uint8Array(buffer) });

    try {
        const result = await parser.getText();

        // Prefer joining per-page text: result.text interleaves "-- 1 of 3 --"
        // page markers that would otherwise land in the prompt.
        const text = Array.isArray(result.pages) && result.pages.length
            ? result.pages.map((page) => page.text).join('\n')
            : result.text;

        if (!text || !text.trim()) {
            throw new Error(
                'No text could be extracted from this PDF. It may be a scanned image or have no text layer - try uploading a .txt version.'
            );
        }

        return text;
    } catch (error) {
        console.error('PDF text extraction failed:', error);
        throw new Error(
            error && error.message && error.message.startsWith('No text could be extracted')
                ? error.message
                : 'Could not read this PDF (it may be corrupt, encrypted, or password-protected). Try uploading a .txt version.'
        );
    } finally {
        await parser.destroy().catch(() => {});
    }
}
