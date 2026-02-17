import cors from 'cors';

function isAllowedDevOrigin(origin: string) {
    // Allow loopback.
    if (origin === 'http://localhost:3000' || origin === 'http://127.0.0.1:3000') return true;

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
            return envList.includes(origin) ? callback(null, true) : callback(new Error('Not allowed by CORS'));
        }

        // In dev, allow localhost + private LAN so you can test via Wi-Fi/LAN.
        return isAllowedDevOrigin(origin) ? callback(null, true) : callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
});
