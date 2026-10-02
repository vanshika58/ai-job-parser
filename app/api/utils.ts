export function safeParseJSON(rawText: string): any {
    if (!rawText) return null;
    try {
        const cleaned = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
        return JSON.parse(cleaned);
    } catch (e) {
        console.error('JSON Parse Error:', e, 'Raw Text was:', rawText);
        return null;
    }
}