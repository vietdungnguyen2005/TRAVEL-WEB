import apiClient from '../api-client';
import { LoginRequest, LoginResponse } from '@travel-web/contracts';

export type RefreshResponse = {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    isVerified: boolean;
  };
};

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

  /**
   * Refresh access token using the httpOnly refresh_token cookie.
   * Returns new tokens (also set as cookies via Set-Cookie header).
   */
  async refresh(): Promise<RefreshResponse> {
    const response = await apiClient.post('/api/auth/refresh', {});
    return response.data;
  },

  /**
   * Logout: revoke refresh token server-side + clear cookies.
   */
  async logout(): Promise<void> {
    await apiClient.post('/api/auth/logout', {});
  },
};

export default authClient;
