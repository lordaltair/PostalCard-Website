const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '../.env') });

const DEV_FALLBACK = 'http://localhost:5173';

function normalizeUrl(url) {
    return url.replace(/\/$/, '');
}

/**
 * Public site URL for QR codes and share links.
 * Always uses FRONTEND_URL from .env — never request headers (those reflect
 * where the browser runs, e.g. localhost:5173 during dev).
 */
function getFrontendUrl() {
    const url = process.env.FRONTEND_URL?.trim();
    if (url) {
        return normalizeUrl(url);
    }

    if (process.env.NODE_ENV === 'production') {
        throw new Error(
            'FRONTEND_URL is not set. Add it to server/.env and restart PM2.'
        );
    }

    return DEV_FALLBACK;
}

module.exports = { getFrontendUrl };
