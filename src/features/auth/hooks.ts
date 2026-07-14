import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authApi } from './api';
import { useAuthStore } from './store';
import { LoginRequest, SignupRequest } from '@/types/api';

export function useLogin() {
  const setSession = useAuthStore((state) => state.setSession);
  const router = useRouter();

  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (data, variables) => {
      // In backend, /login returns { status: 'ok', session_id: '...' }
      // We synthesize a User object based on the username passed in request
      setSession(data.session_id, {
        id: data.session_id,
        username: variables.username,
        email: '',
      });
      router.push('/dashboard');
    },
  });
}

export function useSignup() {
  const setSession = useAuthStore((state) => state.setSession);
  const router = useRouter();

  return useMutation({
    mutationFn: (data: SignupRequest) => authApi.signup(data),
    onSuccess: (data, variables) => {
      // In backend, /signup returns { message: 'User created', session_id: '...' }
      setSession(data.session_id, {
        id: data.session_id,
        username: variables.username,
        email: variables.email,
      });
      router.push('/dashboard');
    },
  });
}
