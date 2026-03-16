import cors from 'cors';

function isAllowedDevOrigin(origin: string) {
    // Allow any localhost / loopback origin (any port) during development.
    // Covers http://localhost:*, http://127.0.0.1:*, http://[::1]:*
    const loopback = /^https?:\/\/(?:localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/;
    if (loopback.test(origin)) return true;

    // Allow private LAN origins on the web dev port (so you can open the site from another device).
    // - 10.0.0.0/8
    // - 172.16.0.0/12
    // - 192.168.0.0/16
    // Support both http/https just in case.
    const privateLan3000 = /^https?:\/\/(?:10\.(?:\d{1,3}\.){2}\d{1,3}|192\.168\.(?:\d{1,3}\.)\d{1,3}|172\.(?:1[6-9]|2\d|3[0-1])\.(?:\d{1,3}\.)\d{1,3}):3000$/;
    return privateLan3000.test(origin);
}

export const corsMiddleware = cors({
    origin: (origin, callback) => {
        // Allow non-browser clients (no Origin header).
        if (!origin) return callback(null, true);

        // In production, lock down to explicit origins via env.
        if (process.env.NODE_ENV === 'production') {
            const envList = (process.env.CORS_ORIGINS || '')
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean);
            if (envList.includes(origin)) return callback(null, true);
            console.warn(`[CORS] Rejected origin: ${origin}`);
            return callback(new Error('Not allowed by CORS'));
        }

        // In dev, allow localhost + private LAN so you can test via Wi-Fi/LAN.
        if (isAllowedDevOrigin(origin)) return callback(null, true);

        // In dev, log the rejected origin for debugging but don't throw
        // (just don't set CORS headers — the browser will block it).
        console.warn(`[CORS] Rejected dev origin: ${origin}`);
        return callback(null, false);
    },
    credentials: true,
});
