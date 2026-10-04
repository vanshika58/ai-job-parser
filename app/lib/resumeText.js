import { getDocumentProxy, extractText } from 'unpdf';

/**
 * Pull plain text out of an uploaded resume (.pdf or .txt).
 *
 * Throws a descriptive Error when a PDF yields no text.
 */
export async function extractResumeText(file) {
    if (!file || typeof file !== 'object') return '';

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = String(file.name || '').toLowerCase();

    if (!fileName.endsWith('.pdf')) {
        return buffer.toString('utf-8');
    }

    try {
        // Convert Node buffer to Uint8Array for unpdf
        const uint8Array = new Uint8Array(buffer);

        // Load document proxy safely in serverless
        const pdf = await getDocumentProxy(uint8Array);

        // Extract text with page merging enabled
        const { text } = await extractText(pdf, { mergePages: true });

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
    }
}