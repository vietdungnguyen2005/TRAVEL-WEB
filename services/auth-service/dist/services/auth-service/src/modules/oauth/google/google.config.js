"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGoogleOauthConfig = getGoogleOauthConfig;
function required(name) {
    const v = process.env[name];
    if (!v)
        throw new Error(`${name} is not set`);
    return v;
}
function getGoogleOauthConfig() {
    return {
        clientId: required('GOOGLE_CLIENT_ID'),
        clientSecret: required('GOOGLE_CLIENT_SECRET'),
        // Example (gateway): http://localhost:4000/api/auth/oauth/google/callback
        redirectUri: required('GOOGLE_REDIRECT_URI'),
        // Used to derive cookie domain/secure behavior if needed
        nodeEnv: process.env.NODE_ENV || 'development',
    };
}
//# sourceMappingURL=google.config.js.map