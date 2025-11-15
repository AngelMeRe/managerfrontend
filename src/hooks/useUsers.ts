// Hooks para administración de usuarios
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchUsers, createUser, updateUser, deleteUser } from '../api/users';
import type { User } from '../api/users';


// Lista
export function useUsers(){
  return useQuery({ queryKey:['users'], queryFn: fetchUsers });
}

// Crear
export function useCreateUser(){
  const qc = useQueryClient();
  return useMutation({
    mutationFn:(b:{name:string;email:string;role:'admin'|'user';password:string})=>createUser(b),
    onSuccess:()=>qc.invalidateQueries({ queryKey:['users'] })
  });
}

// Actualizar 
export function useUpdateUser(){
  const qc = useQueryClient();
  return useMutation({
    mutationFn:(p:{id:number; body: Partial<Pick<User,'name'|'role'>>})=>updateUser(p.id, p.body),
    onSuccess:()=>qc.invalidateQueries({ queryKey:['users'] })
  });
}

// Eliminar
export function useDeleteUser(){
  const qc = useQueryClient();
  return useMutation({
    mutationFn:(id:number)=>deleteUser(id),
    onSuccess:()=>qc.invalidateQueries({ queryKey:['users'] })
  });
}