import { api } from './axios';

export type LoginRequest = { email: string; password: string };
export type LoginResponse = { token: string; user: { id:number; name:string; role:'admin'|'user' } };

//funcion para iniciar sesión y mapear la respuesta del backend
export async function login(body: LoginRequest): Promise<LoginResponse> {
  const r = await api.post('/api/auth/login', body);
  const data = r.data as { token:string; role:string; userId:number; name:string };
  return {
    token: data.token,
    user: {
      id: data.userId,
      name: data.name,
      role: (data.role as string).toLowerCase() as 'admin'|'user',
    }
  };
}
