function isLocalHost(hostname) {
    return !hostname || hostname === 'localhost' || hostname === '127.0.0.1';
}

function originFromHeader(value) {
    if (!value) return null;

    try {
        const url = new URL(value);
        if (isLocalHost(url.hostname)) return null;
        return `${url.protocol}//${url.host}`;
    } catch {
        return null;
    }
}

/**
 * Public site URL for QR codes and share links.
 * Priority: FRONTEND_URL env → Origin/Referer → proxy headers → dev fallback.
 */
function getFrontendUrl(req) {
    if (process.env.FRONTEND_URL) {
        return process.env.FRONTEND_URL.replace(/\/$/, '');
    }

    const fromOrigin = originFromHeader(req.get('origin'));
    if (fromOrigin) return fromOrigin;

    const fromReferer = originFromHeader(req.get('referer'));
    if (fromReferer) return fromReferer;

    const forwardedHost = req.get('x-forwarded-host');
    const host = (forwardedHost?.split(',')[0] || req.get('host') || '').trim();
    const proto = (req.get('x-forwarded-proto') || req.protocol || 'http').split(',')[0].trim();
    const hostname = host.split(':')[0];

    if (host && !isLocalHost(hostname)) {
        return `${proto}://${host}`.replace(/\/$/, '');
    }

    return 'http://localhost:5173';
}

module.exports = { getFrontendUrl };
