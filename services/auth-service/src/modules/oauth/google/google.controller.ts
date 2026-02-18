import { createHash, randomBytes, timingSafeEqual } from 'crypto';
import { prisma } from '../../../lib/prisma';
import { getGoogleOauthConfig } from './google.config';
import jwt from 'jsonwebtoken';
import type { SignOptions } from 'jsonwebtoken';
import type { Request, Response } from 'express';

function base64Url(input: Buffer) {
    return input
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/g, '');
}

function sha256Base64Url(verifier: string) {
    // Node supports 'base64url' since v14+, but keep manual for portability.
    const hash = createHash('sha256').update(verifier).digest();
    return base64Url(hash);
}

function getJwtSecret() {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET is not set');
    return secret;
}

function signAccessToken(payload: { sub: string; email: string; role: string }) {
    const secret = getJwtSecret();
    const opts: SignOptions = {
        expiresIn: (process.env.JWT_EXPIRES_IN as SignOptions['expiresIn']) || '7d',
    };
    return jwt.sign(payload, secret, opts);
}

function cookieOptions() {
    const isProd = process.env.NODE_ENV === 'production';
    return {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax' as const,
        path: '/',
        // Express expects milliseconds for maxAge.
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7d
    };
}

function getRedirectAfterLogin(req: Request) {
    const redirect = (req.query?.redirect as string | undefined) || '/dashboard';
    // only allow relative redirects
    if (!redirect.startsWith('/')) return '/dashboard';
    return redirect;
}

function getWebAppUrl() {
    // This should point to the Next.js app origin (NOT the API gateway).
    // Example: http://localhost:3000 or http://192.168.1.43:3000
    const raw = process.env.WEB_APP_URL;
    if (!raw) return undefined;
    return raw.endsWith('/') ? raw.slice(0, -1) : raw;
}

function toWebOauthLandingUrl(args: { token: string; redirect: string }) {
    const web = getWebAppUrl();
    if (!web) return '/dashboard';

    const redirectPath = args.redirect.startsWith('/') ? args.redirect : '/dashboard';
    const url = new URL(`${web}/auth/oauth/callback`);
    url.searchParams.set('token', args.token);
    url.searchParams.set('redirect', redirectPath);
    return url.toString();
}

export async function googleStart(req: Request, res: Response) {
    const { clientId, redirectUri } = getGoogleOauthConfig();

    const state = base64Url(randomBytes(32));
    const codeVerifier = base64Url(randomBytes(32));
    const codeChallenge = sha256Base64Url(codeVerifier);

    // Store transient values in httpOnly cookies (stateless; works behind gateway)
    // Keep them short-lived.
    // NOTE: Express expects milliseconds for maxAge.
    res.cookie('oauth_state', state, { ...cookieOptions(), maxAge: 10 * 60 * 1000 }); // 10 min
    res.cookie('oauth_code_verifier', codeVerifier, { ...cookieOptions(), maxAge: 10 * 60 * 1000 });
    res.cookie('oauth_redirect', getRedirectAfterLogin(req), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 10 * 60 * 1000,
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

async function exchangeCodeForTokens(args: {
    code: string;
    codeVerifier: string;
}) {
    const { clientId, clientSecret, redirectUri } = getGoogleOauthConfig();

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

    const json = (await r.json().catch(() => ({}))) as Record<string, unknown>;
    if (!r.ok) {
        const msg =
            (json['error_description'] as string | undefined) ||
            (json['error'] as string | undefined) ||
            'token_exchange_failed';
        throw new Error(msg);
    }

    return {
        access_token: json['access_token'] as string,
        id_token: json['id_token'] as string | undefined,
    };
}

async function fetchGoogleProfile(accessToken: string) {
    const r = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    const json = (await r.json().catch(() => ({}))) as Record<string, unknown>;
    if (!r.ok) throw new Error('google_userinfo_failed');
    return {
        sub: json['sub'] as string,
        email: String(json['email']).toLowerCase(),
        name: (json['name'] as string | undefined) ?? undefined,
        picture: (json['picture'] as string | undefined) ?? undefined,
        email_verified: (json['email_verified'] as boolean | undefined) ?? undefined,
    };
}

export async function googleCallback(req: Request, res: Response) {
    try {
        const code = req.query?.code as string | undefined;
        const state = req.query?.state as string | undefined;
        if (!code || !state) return res.status(400).json({ message: 'Missing code/state' });

        const cookieState = req.cookies?.oauth_state as string | undefined;
        const codeVerifier = req.cookies?.oauth_code_verifier as string | undefined;
        const redirect = (req.cookies?.oauth_redirect as string | undefined) || '/dashboard';

        if (!cookieState || !codeVerifier) {
            return res.status(400).json({ message: 'OAuth cookies missing. Restart login.' });
        }

        const a = Buffer.from(state);
        const b = Buffer.from(cookieState);
        if (a.length !== b.length || !timingSafeEqual(a, b)) {
            return res.status(400).json({ message: 'Invalid oauth state' });
        }

        const tokens = await exchangeCodeForTokens({ code, codeVerifier });
        const profile = await fetchGoogleProfile(tokens.access_token);

        // Upsert user by email. We keep password as a random hash so local login won't work unless set.
        const passwordPlaceholder = base64Url(randomBytes(32));

        const user = await prisma.user.upsert({
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

        // In local dev, the OAuth callback executes on the gateway origin (localhost:4000).
        // Browsers won't let that response set cookies for the web origin (192.168.x.x:3000).
        // So we bounce through a tiny web page that stores the token on the web origin.
        return res.redirect(
            toWebOauthLandingUrl({
                token,
                redirect: redirect.startsWith('/') ? redirect : '/dashboard',
            })
        );
    } catch (err) {
        console.error('Google OAuth callback failed:', err);
        const message = err instanceof Error ? err.message : 'unknown_error';
        return res.status(500).json({ message: 'Google OAuth failed', error: message });
    }
}
