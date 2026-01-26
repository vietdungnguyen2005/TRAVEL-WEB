import { NextRequest } from 'next/server';
/**
 * Small helper to call the canonical API Gateway from Next Route Handlers.
 *
 * Contract:
 * - Uses `process.env.API_GATEWAY_URL` (fallback `http://localhost:4000`).
 * - Forwards Authorization & Cookie headers when present (best-effort).
 * - Never forwards Hop-by-hop headers.
 */
export declare function getGatewayBaseUrl(): string;
export declare function gatewayFetch(req: NextRequest | undefined, path: string, init?: RequestInit): Promise<Response>;
//# sourceMappingURL=gateway.d.ts.map