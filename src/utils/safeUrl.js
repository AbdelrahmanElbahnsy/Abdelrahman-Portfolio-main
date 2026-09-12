export const safeUrl = (url) => {
    if (!url || typeof url !== 'string') return null;
    let trimmed = url.trim();
    if (!trimmed) return null;

    // Block protocol-relative
    if (trimmed.startsWith('//')) return null;

    // Allow hash
    if (trimmed.startsWith('#')) return trimmed;

    // Allow path-absolute
    if (trimmed.startsWith('/')) return trimmed;

    try {
        const parsed = new URL(trimmed);
        const protocol = parsed.protocol.toLowerCase();
        const allowedProtocols = ['http:', 'https:', 'mailto:', 'tel:'];
        if (allowedProtocols.includes(protocol)) {
            return trimmed;
        }
        return null;
    } catch (err) {
        if (trimmed.includes(':')) {
            return null;
        }
        return trimmed;
    }
};
