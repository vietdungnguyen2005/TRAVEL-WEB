import { AxiosInstance } from 'axios';
export type RetryConfig = {
    timeoutMs: number;
    retries: number;
    baseDelayMs: number;
    maxDelayMs: number;
    retryMethods: string[];
};
export declare function createAxiosClient(config?: Partial<RetryConfig>): AxiosInstance;
export declare const httpClient: AxiosInstance;
//# sourceMappingURL=axios-client.d.ts.map