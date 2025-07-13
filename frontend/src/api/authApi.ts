import api from './axios';

interface LoginRequest {
  email: string;
  password: string;
}

interface TokenRefreshRequest {
  refreshToken: string;
}

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  userId: number;
  name: string;
  email: string;
  roles: string[];
}

export const authApi = {
  /**
   * Login user with email and password
   * @param credentials User credentials
   * @returns Authentication response with tokens and user details
   */
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  /**
   * Refresh authentication tokens
   * @param refreshToken Current refresh token
   * @returns New authentication tokens
   */
  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/refresh', { refreshToken });
    return response.data;
  },

  /**
   * Logout user
   * @returns Void promise
   */
  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  }
}; 