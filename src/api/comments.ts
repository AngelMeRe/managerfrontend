import { api } from './axios';

export type Comment = {
  id: number;
  text: string;       // mapea a Content en tu entidad
  createdAt: string;  // ISO
  user: { id:number; name:string };
};

export type NewComment = { taskId:number; content:string };

//Obtener comentarios por tarea
export async function fetchCommentsByTask(taskId:number): Promise<Comment[]> {
  const r = await api.get<Comment[]>(`/api/comments/task/${taskId}`);
  return r.data;
}

//Crear comentario
export async function addComment(body: NewComment): Promise<Comment> {
  const r = await api.post<Comment>('/api/comments', body);
  return r.data;
}

// Eliminar comentario
export async function deleteComment(id:number): Promise<void> {
  await api.delete(`/api/comments/${id}`);
}
