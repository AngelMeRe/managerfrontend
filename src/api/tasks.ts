import { api } from './axios';

export type TaskStatus = 'Pendiente'|'En Progreso'|'Completada';
export type SimpleUser = { id:number; name:string };
export type Task = {
  id:number;
  title:string;
  description:string;
  status: TaskStatus;
  dueDate: string;
  assignedTo?: SimpleUser|null;
  createdBy?: SimpleUser|null;
};

//obtener todas las tareas
export async function fetchTasks(): Promise<Task[]> {
  const r = await api.get<Task[]>('/api/tasks'); return r.data;
}

//bbtener una tarea por ID
export async function fetchTask(id:number): Promise<Task> {
  const r = await api.get<Task>(`/api/tasks/${id}`); return r.data;
}

//crear tarea
export async function createTask(body: Partial<Task>): Promise<Task> {
  const r = await api.post<Task>('/api/tasks', body); return r.data;
}

//actualizar tareas
export async function updateTask(id:number, body: Partial<Task>): Promise<Task> {
  const r = await api.put<Task>(`/api/tasks/${id}`, body); return r.data;
}

//eliminar tareas
export async function removeTask(id:number): Promise<void> {
  await api.delete(`/api/tasks/${id}`);
}

//solo tareas del usuario 
export async function fetchMyTasks(): Promise<Task[]> {
  const r = await api.get<Task[]>('/api/tasks/mine'); 
  return r.data;
}
