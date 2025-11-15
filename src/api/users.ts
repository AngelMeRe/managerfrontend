import { api } from './axios';

export type User = { id:number; name:string; email:string; role:'admin'|'user' };

//Obtener todos los usuarios solo  rpl admin
export async function fetchUsers(): Promise<User[]> {
  const r = await api.get<User[]>('/api/users'); return r.data;
}

// Crear usuario
export async function createUser(body: { name:string; email:string; role:'admin'|'user'; password:string }): Promise<User> {
  const r = await api.post<User>('/api/users', body); return r.data;
}

// Actualizar usuario
export async function updateUser(id:number, body: Partial<Pick<User,'name'|'role'>>): Promise<User> {
  const r = await api.put<User>(`/api/users/${id}`, body); return r.data;
}

// Eliminar usuario
export async function deleteUser(id:number): Promise<void> {
  await api.delete(`/api/users/${id}`);
}