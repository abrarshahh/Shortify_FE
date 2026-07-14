import api from '@/lib/axios';
import { LoginRequest, LoginResponse, SignupRequest, SignupResponse } from '@/types/api';

export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const res = await api.post<LoginResponse>('/login', data);
    return res.data;
  },

  signup: async (data: SignupRequest): Promise<SignupResponse> => {
    const res = await api.post<SignupResponse>('/signup', data);
    return res.data;
  },
};
