import api from '../services/api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  displayName: string;
  email: string;
  password: string;
}

export interface VerifyOtpRequest {
  email: string;
  code: string;
}

export interface AuthResponse {
  message: string;
  user: {
    id: number;
    username: string;
    displayName: string;
    email: string;
    avatar: string;
  };
  token: string;
}

export interface RegisterResponse {
  message: string;
  email: string;
}

export const authApi = {
  login: (data: LoginRequest) =>
    api.post<AuthResponse>('/auth/login', data),

  register: (data: RegisterRequest) =>
    api.post<RegisterResponse>('/auth/register', data),

  verifyOtp: (data: VerifyOtpRequest) =>
    api.post<AuthResponse>('/auth/verify-otp', data),

  resendOtp: (email: string) =>
    api.post<{ message: string }>('/auth/resend-otp', { email }),
};
