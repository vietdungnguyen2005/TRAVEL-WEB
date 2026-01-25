import axios from 'axios';

const apiClient = axios.create({
    baseURL: process.env.API_GATEWAY_TARGET || 'http://localhost:3000',
    timeout: 10000,
});

apiClient.interceptors.request.use((config) => {
    // Gateway usually runs server-side; headers may be provided per-request.
    return config;
});

export default apiClient;
