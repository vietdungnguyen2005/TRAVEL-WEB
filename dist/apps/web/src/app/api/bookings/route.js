import { NextResponse } from 'next/server';
import { gatewayFetch } from '@/lib/gateway';
export async function POST(request) {
    try {
        const body = await request.json();
        const upstream = await gatewayFetch(request, '/api/bookings', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(body),
        });
        const text = await upstream.text();
        return new NextResponse(text, {
            status: upstream.status,
            headers: { 'content-type': upstream.headers.get('content-type') || 'application/json' },
        });
    }
    catch (error) {
        console.error('Error creating booking:', error);
        return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
    }
}
// Get user's bookings
export async function GET(request) {
    try {
        const upstream = await gatewayFetch(request, '/api/bookings', { method: 'GET' });
        const text = await upstream.text();
        return new NextResponse(text, {
            status: upstream.status,
            headers: { 'content-type': upstream.headers.get('content-type') || 'application/json' },
        });
    }
    catch (error) {
        console.error('Error fetching bookings:', error);
        return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
    }
}
//# sourceMappingURL=route.js.map