import { api } from './axios';

export type TaskStatus = 'Pendiente' | 'En Progreso' | 'Completada';

export type Task = {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  dueDate: string;
  createdById: number;
  assignedToId: number;
};

export async function fetchTasks(): Promise<Task[]> {
  const res = await api.get<Task[]>('/api/tasks');
  return res.data; // devolver solo los datos
}

export async function createTask(body: Partial<Task>): Promise<Task> {
  const res = await api.post<Task>('/api/tasks', body);
  return res.data; // devolver solo los datos
}

export async function updateTask(id: number, body: Partial<Task>): Promise<Task> {
  const res = await api.put<Task>(`/api/tasks/${id}`, body);
  return res.data; // devolver solo los datos
}

export async function removeTask(id: number): Promise<void> {
  await api.delete(`/api/tasks/${id}`);
  return; // explícito para que la promesa sea void
}
