//hooks para obtener, crear y borrar comentarios
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchCommentsByTask, addComment, deleteComment } from '../api/comments';


//obtener comentarios de una tarea
export function useComments(taskId:number){
  return useQuery({
    queryKey: ['comments', taskId],
    queryFn: ()=>fetchCommentsByTask(taskId),
    enabled: !!taskId
  });
}

//crear un nuevo comentario
export function useAddComment(taskId:number){
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (b:{ content:string })=>addComment({ taskId, content:b.content }),
    onSuccess: ()=>{
      qc.invalidateQueries({ queryKey:['comments', taskId] });
    }
  });
}

//borrar comentario
export function useDeleteComment(taskId:number){
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id:number)=>deleteComment(id),
    onSuccess: ()=>{
      qc.invalidateQueries({ queryKey:['comments', taskId] });
    }
  });
}
