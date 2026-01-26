import axios from 'axios';
const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_GATEWAY_URL,
    timeout: 10000, // 10 seconds timeout
});
// Request interceptor to add auth token
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
        config.headers = {
            ...(config.headers || {}),
            Authorization: `Bearer ${token}`,
        };
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});
// Response interceptor to handle errors
apiClient.interceptors.response.use((response) => response, (error) => {
    if (error.response) {
        // Handle known errors (e.g., 401 Unauthorized, 403 Forbidden, etc.)
        if (error.response.status === 401) {
            // Handle unauthorized error (e.g., redirect to login)
            console.error('Unauthorized access - redirecting to login.');
        }
    }
    else if (error.request) {
        // Handle network errors
        console.error('Network error - please check your connection.');
    }
    else {
        console.error('Error:', error.message);
    }
    return Promise.reject(error);
});
export default apiClient;
//# sourceMappingURL=api-client.js.map