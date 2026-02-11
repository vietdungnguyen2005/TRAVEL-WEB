import client from 'prom-client';
export declare const register: client.Registry<"text/plain; version=0.0.4; charset=utf-8">;
export declare const httpRequestsTotal: client.Counter<"route" | "method" | "status">;
export declare const httpRequestDurationSeconds: client.Histogram<"route" | "method" | "status">;
//# sourceMappingURL=metrics.d.ts.map