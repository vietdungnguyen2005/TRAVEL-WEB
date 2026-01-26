import cors from 'cors';
const whitelist = [
    'http://localhost:3000', // Add your frontend URL here
];
export const corsMiddleware = cors({
    origin: (origin, callback) => {
        if (!origin || whitelist.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
});
//# sourceMappingURL=cors.middleware.js.map