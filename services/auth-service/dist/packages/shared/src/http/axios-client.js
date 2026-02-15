"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.httpClient = void 0;
exports.createAxiosClient = createAxiosClient;
const axios_1 = __importDefault(require("axios"));
function envNumber(name, fallback) {
    const raw = process.env[name];
    if (!raw)
        return fallback;
    const value = Number(raw);
    return Number.isFinite(value) ? value : fallback;
}
function getRetryConfig() {
    return {
        timeoutMs: envNumber('HTTP_TIMEOUT_MS', envNumber('AXIOS_TIMEOUT_MS', 5000)),
        retries: envNumber('HTTP_RETRIES', envNumber('AXIOS_RETRIES', 2)),
        baseDelayMs: envNumber('HTTP_RETRY_BASE_DELAY_MS', envNumber('AXIOS_RETRY_DELAY_MS', 250)),
        maxDelayMs: envNumber('HTTP_RETRY_MAX_DELAY_MS', 4000),
        retryMethods: (process.env.HTTP_RETRY_METHODS || 'GET,HEAD,OPTIONS,PUT,DELETE')
            .split(',')
            .map((x) => x.trim().toUpperCase())
            .filter(Boolean),
    };
}
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
function shouldRetry(error, retryCfg) {
    const method = (error.config?.method || 'GET').toUpperCase();
    if (!retryCfg.retryMethods.includes(method))
        return false;
    // Retry on network errors / timeouts (no response)
    if (!error.response)
        return true;
    const status = error.response.status;
    return status === 429 || (status >= 500 && status <= 599);
}
function getBackoffMs(attempt, cfg) {
    const exp = Math.min(cfg.maxDelayMs, cfg.baseDelayMs * Math.pow(2, attempt));
    const jitter = Math.floor(Math.random() * Math.min(250, exp));
    return Math.min(cfg.maxDelayMs, exp + jitter);
}
function createAxiosClient(config) {
    const retryCfg = { ...getRetryConfig(), ...(config || {}) };
    const client = axios_1.default.create({ timeout: retryCfg.timeoutMs });
    client.interceptors.response.use((res) => res, async (error) => {
        const cfg = (error.config || {});
        cfg.__retryCount = cfg.__retryCount || 0;
        if (cfg.__retryCount >= retryCfg.retries)
            throw error;
        if (!shouldRetry(error, retryCfg))
            throw error;
        const delay = getBackoffMs(cfg.__retryCount, retryCfg);
        cfg.__retryCount += 1;
        await sleep(delay);
        return client.request(cfg);
    });
    return client;
}
// Default shared client (centralized timeout + retry)
exports.httpClient = createAxiosClient();
//# sourceMappingURL=axios-client.js.map