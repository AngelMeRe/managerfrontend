import { api } from './axios';
export type LoginRequest = { email: string; password: string };
export type LoginResponse = { token: string; user: { id: number; name: string; role: 'admin'|'user' } };
export async function login(body: LoginRequest): Promise<LoginResponse> {
  const res = await api.post<LoginResponse>('/api/auth/login', body);
  return res.data;
}
