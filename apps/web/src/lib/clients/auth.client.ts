import apiClient from '../api-client';
import { LoginRequest, LoginResponse } from '@travel-web/contracts';

const authClient = {
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post('/auth/login', data);
    return response.data;
  },

  async register(data: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },

  async forgotPassword(email: string): Promise<void> {
    await apiClient.post('/auth/forgot-password', { email });
  },
};

export default authClient;
