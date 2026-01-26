"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const apiClient = axios_1.default.create({
    baseURL: process.env.API_GATEWAY_TARGET || 'http://localhost:3000',
    timeout: 10000,
});
apiClient.interceptors.request.use((config) => {
    // Gateway usually runs server-side; headers may be provided per-request.
    return config;
});
exports.default = apiClient;
//# sourceMappingURL=api-client.js.map