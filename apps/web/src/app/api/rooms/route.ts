import { NextRequest, NextResponse } from 'next/server';
import { gatewayFetch } from '@/lib/gateway';

export async function GET(request: NextRequest) {
  try {
    const upstream = await gatewayFetch(request, '/api/rooms', { method: 'GET' });
    const text = await upstream.text();
    return new NextResponse(text, {
      status: upstream.status,
      headers: { 'content-type': upstream.headers.get('content-type') || 'application/json' },
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching room types:', error);
    return NextResponse.json({ error: 'Failed to fetch room types' }, { status: 500 });
  }
}
