//Hooks para manejar tareas 
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchTasks, fetchTask, createTask, updateTask, removeTask, fetchMyTasks } from '../api/tasks';
import type { Task } from '../api/tasks';

// Lista de todas las tareas
export function useTasks(){
  return useQuery({ queryKey:['tasks'], queryFn: fetchTasks });
}

// Tareas del usuario autenticado
export function useMyTasks(){
  return useQuery({ queryKey:['tasks','mine'], queryFn: fetchMyTasks });
}

// Obtener tarea por ID
export function useTask(id:number){
  return useQuery({ queryKey:['task', id], queryFn:()=>fetchTask(id), enabled: !!id });
}

// Crear tarea
export function useCreateTask(){
  const qc = useQueryClient();
  return useMutation({
    mutationFn:(b:Partial<Task>)=>createTask(b),
    onSuccess:()=>{
      qc.invalidateQueries({ queryKey:['tasks'] });
      qc.invalidateQueries({ queryKey:['tasks','mine'] });
    }
  });
}

// Actualizar tarea
export function useUpdateTask(){
  const qc = useQueryClient();
  return useMutation({
    mutationFn:(p:{id:number; body:Partial<Task>})=>updateTask(p.id, p.body),
    onSuccess:(_, vars)=>{
      qc.invalidateQueries({ queryKey:['tasks'] });
      qc.invalidateQueries({ queryKey:['tasks','mine'] });
      qc.invalidateQueries({ queryKey:['task', vars.id] });
    }
  });
}

// Eliminar tarea
export function useDeleteTask(){
  const qc = useQueryClient();
  return useMutation({
    mutationFn:(id:number)=>removeTask(id),
    onSuccess:()=>{
      qc.invalidateQueries({ queryKey:['tasks'] });
      qc.invalidateQueries({ queryKey:['tasks','mine'] });
    }
  });
}