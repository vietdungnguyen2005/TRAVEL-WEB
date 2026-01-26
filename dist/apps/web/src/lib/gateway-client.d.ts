export type GatewayFetchOptions = Omit<RequestInit, "headers"> & {
    headers?: HeadersInit;
    /**
     * If true, will attach Authorization header from `access_token` cookie if present.
     * Useful for client-side calls when gateway uses Bearer JWT.
     */
    attachAccessToken?: boolean;
};
export declare function gatewayUrl(path: string): string;
export declare function gatewayFetch(path: string, options?: GatewayFetchOptions): Promise<Response>;
//# sourceMappingURL=gateway-client.d.ts.map