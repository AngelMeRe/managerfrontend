import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchUsers, createUser, updateUser, deleteUser } from '../api/users';
import type { User } from '../api/users';

export function useUsers(){
  return useQuery({ queryKey:['users'], queryFn: fetchUsers });
}

export function useCreateUser(){
  const qc = useQueryClient();
  return useMutation({
    mutationFn:(b:{name:string;email:string;role:'admin'|'user';password:string})=>createUser(b),
    onSuccess:(_created)=>{
      qc.invalidateQueries({ queryKey:['users'] });
    }
  });
}

// Optimistic update para edición
export function useUpdateUser(){
  const qc = useQueryClient();
  return useMutation({
    mutationFn:(p:{id:number; body: Partial<Pick<User,'name'|'role'|'email'>>})=>updateUser(p.id, p.body),
    onMutate: async ({ id, body }) => {
      await qc.cancelQueries({ queryKey:['users'] });
      const prev = qc.getQueryData<User[]>(['users']);
      if (prev){
        qc.setQueryData<User[]>(['users'], prev.map(u=>u.id===id ? { ...u, ...body } : u));
      }
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(['users'], ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey:['users'] });
    }
  });
}

export function useDeleteUser(){
  const qc = useQueryClient();
  return useMutation({
    mutationFn:(id:number)=>deleteUser(id),
    onMutate: async (id:number) => {
      await qc.cancelQueries({ queryKey:['users'] });
      const prev = qc.getQueryData<User[]>(['users']);
      if (prev){
        qc.setQueryData<User[]>(['users'], prev.filter(u=>u.id!==id));
      }
      return { prev };
    },
    onError: (_e,_v, ctx)=>{ if (ctx?.prev) qc.setQueryData(['users'], ctx.prev); },
    onSettled: ()=> qc.invalidateQueries({ queryKey:['users'] })
  });
}