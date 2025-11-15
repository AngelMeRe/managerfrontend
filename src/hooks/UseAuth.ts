//Hook para manejar el login del usuario
import { useMutation } from '@tanstack/react-query';
import { login } from '../api/auth';
import type { LoginRequest, LoginResponse } from '../api/auth';

export function useLogin() {
  return useMutation<LoginResponse, any, LoginRequest>({
    mutationFn: login,
    onSuccess: (payload) => {
      //Guarda sesión en el navegador
      localStorage.setItem('accessToken', payload.token);
      localStorage.setItem('user', JSON.stringify(payload.user));
      window.dispatchEvent(new StorageEvent('storage', { key: 'user' }));
      console.log('LOGIN OK', payload);
    },
    onError: (err) => {
      const status = err?.response?.status;
      const data = err?.response?.data;
      console.error('LOGIN ERROR', status, data || err?.message);
    }
  });
}
