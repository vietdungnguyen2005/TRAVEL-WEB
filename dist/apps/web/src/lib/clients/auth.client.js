import apiClient from '../api-client';
const authClient = {
    async login(data) {
        const response = await apiClient.post('/auth/login', data);
        return response.data;
    },
    async register(data) {
        const response = await apiClient.post('/auth/register', data);
        return response.data;
    },
    async forgotPassword(email) {
        await apiClient.post('/auth/forgot-password', { email });
    },
};
export default authClient;
//# sourceMappingURL=auth.client.js.map