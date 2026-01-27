"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleStart = googleStart;
exports.googleCallback = googleCallback;
const crypto_1 = require("crypto");
const prisma_1 = require("../../../lib/prisma");
const google_config_1 = require("./google.config");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function base64Url(input) {
    return input
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/g, '');
}
function sha256Base64Url(verifier) {
    // Node supports 'base64url' since v14+, but keep manual for portability.
    const hash = require('crypto').createHash('sha256').update(verifier).digest();
    return base64Url(hash);
}
function getJwtSecret() {
    const secret = process.env.JWT_SECRET;
    if (!secret)
        throw new Error('JWT_SECRET is not set');
    return secret;
}
function signAccessToken(payload) {
    const secret = getJwtSecret();
    const opts = {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    };
    return jsonwebtoken_1.default.sign(payload, secret, opts);
}
function cookieOptions() {
    const isProd = process.env.NODE_ENV === 'production';
    return {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7d
    };
}
function accessTokenCookieOptions() {
    const isProd = process.env.NODE_ENV === 'production';
    return {
        httpOnly: false,
        secure: isProd,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7d
    };
}
function getRedirectAfterLogin(req) {
    const redirect = req.query?.redirect || '/dashboard';
    // only allow relative redirects
    if (!redirect.startsWith('/'))
        return '/dashboard';
    return redirect;
}
async function googleStart(req, res) {
    const { clientId, redirectUri } = (0, google_config_1.getGoogleOauthConfig)();
    const state = base64Url((0, crypto_1.randomBytes)(32));
    const codeVerifier = base64Url((0, crypto_1.randomBytes)(32));
    const codeChallenge = sha256Base64Url(codeVerifier);
    // Store transient values in httpOnly cookies (stateless; works behind gateway)
    // Keep them short-lived.
    res.cookie('oauth_state', state, { ...cookieOptions(), maxAge: 60 * 10 }); // 10 min
    res.cookie('oauth_code_verifier', codeVerifier, { ...cookieOptions(), maxAge: 60 * 10 });
    res.cookie('oauth_redirect', getRedirectAfterLogin(req), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 10,
    });
    const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: 'openid email profile',
        state,
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
        prompt: 'select_account',
    });
    return res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
}
async function exchangeCodeForTokens(args) {
    const { clientId, clientSecret, redirectUri } = (0, google_config_1.getGoogleOauthConfig)();
    const body = new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code: args.code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
        code_verifier: args.codeVerifier,
    });
    const r = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
    });
    const json = (await r.json().catch(() => ({})));
    if (!r.ok) {
        const msg = json?.error_description || json?.error || 'token_exchange_failed';
        throw new Error(msg);
    }
    return {
        access_token: json.access_token,
        id_token: json.id_token,
    };
}
async function fetchGoogleProfile(accessToken) {
    const r = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    const json = (await r.json().catch(() => ({})));
    if (!r.ok)
        throw new Error('google_userinfo_failed');
    return {
        sub: json.sub,
        email: json.email.toLowerCase(),
        name: json.name,
        picture: json.picture,
        email_verified: json.email_verified,
    };
}
async function googleCallback(req, res) {
    try {
        const code = req.query?.code;
        const state = req.query?.state;
        if (!code || !state)
            return res.status(400).json({ message: 'Missing code/state' });
        const cookieState = req.cookies?.oauth_state;
        const codeVerifier = req.cookies?.oauth_code_verifier;
        const redirect = req.cookies?.oauth_redirect || '/dashboard';
        if (!cookieState || !codeVerifier) {
            return res.status(400).json({ message: 'OAuth cookies missing. Restart login.' });
        }
        const a = Buffer.from(state);
        const b = Buffer.from(cookieState);
        if (a.length !== b.length || !(0, crypto_1.timingSafeEqual)(a, b)) {
            return res.status(400).json({ message: 'Invalid oauth state' });
        }
        const tokens = await exchangeCodeForTokens({ code, codeVerifier });
        const profile = await fetchGoogleProfile(tokens.access_token);
        // Upsert user by email. We keep password as a random hash so local login won't work unless set.
        const passwordPlaceholder = base64Url((0, crypto_1.randomBytes)(32));
        const user = await prisma_1.prisma.user.upsert({
            where: { email: profile.email },
            update: {
                name: profile.name,
                isVerified: profile.email_verified ?? true,
            },
            create: {
                email: profile.email,
                password: passwordPlaceholder,
                name: profile.name,
                role: 'CUSTOMER',
                isVerified: profile.email_verified ?? true,
            },
            select: { id: true, email: true, name: true, role: true, isVerified: true },
        });
        const token = signAccessToken({ sub: user.id, email: user.email, role: user.role });
        // Clear transient cookies
        res.clearCookie('oauth_state', { path: '/' });
        res.clearCookie('oauth_code_verifier', { path: '/' });
        res.clearCookie('oauth_redirect', { path: '/' });
        // Web currently reads `access_token` client-side, so keep it readable (non-httpOnly)
        // but still use secure defaults for production.
        res.cookie('access_token', token, accessTokenCookieOptions());
        return res.redirect(redirect.startsWith('/') ? redirect : '/dashboard');
    }
    catch (err) {
        // eslint-disable-next-line no-console
        console.error('Google OAuth callback failed:', err);
        return res.status(500).json({ message: 'Google OAuth failed', error: err?.message });
    }
}
//# sourceMappingURL=google.controller.js.map