import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST() {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;
    const refreshToken = cookieStore.get('refresh_token')?.value;

    // Call auth-service logout endpoint to revoke refresh token in DB.
    // Send the refreshToken in the request body because the gateway strips
    // Set-Cookie / Cookie headers between services.
    const gatewayUrl = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:4000';
    try {
        await fetch(`${gatewayUrl}/api/auth/logout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                // Also forward the cookie header so the auth-service can read
                // the refresh_token cookie directly if it prefers.
                ...(refreshToken ? { Cookie: `refresh_token=${refreshToken}` } : {}),
            },
            body: JSON.stringify({
                // Send via body as well — the auth-service accepts both cookie and body.
                ...(refreshToken ? { refreshToken } : {}),
            }),
        });
    } catch {
        // Gateway might be down — still clear cookies locally
    }

    // Clear all auth-related cookies from the Next.js response
    const response = NextResponse.json({ success: true });
    response.cookies.set('access_token', '', { path: '/', maxAge: 0 });
    response.cookies.set('refresh_token', '', { path: '/', maxAge: 0 });
    return response;
}
