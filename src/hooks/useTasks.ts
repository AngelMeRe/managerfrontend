import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchTasks, fetchTask, createTask, updateTask, removeTask, fetchMyTasks } from '../api/tasks';
import type { Task } from '../api/tasks';

// Claves de cache consistentes
const QK = {
  all: ['tasks','all'] as const,
  mine: ['tasks','mine'] as const,
  one: (id:number)=>['task', id] as const,
};

// Lista de todas las tareas (Admin)
export function useTasks(){
  return useQuery({ queryKey: QK.all, queryFn: fetchTasks });
}

// Tareas del usuario autenticado
export function useMyTasks(){
  return useQuery({ queryKey: QK.mine, queryFn: fetchMyTasks });
}

// Obtener tarea por id
export function useTask(id:number){
  return useQuery({
    queryKey: QK.one(id),
    queryFn: ()=>fetchTask(id),
    enabled: !!id
  });
}

// Crear
export function useCreateTask(){
  const qc = useQueryClient();
  return useMutation({
    mutationFn:(b:Partial<Task>)=>createTask(b),
    onSuccess:(created)=>{
      qc.invalidateQueries({ queryKey: QK.all });
      qc.invalidateQueries({ queryKey: QK.mine });
      if (created?.id) qc.invalidateQueries({ queryKey: QK.one(created.id) });
    }
  });
}

// Actualizar
export function useUpdateTask(){
  const qc = useQueryClient();
  return useMutation({
    mutationFn:(p:{id:number; body:Partial<Task>})=>updateTask(p.id, p.body),

    onMutate: async ({ id, body }) => {
      await Promise.all([
        qc.cancelQueries({ queryKey: QK.all }),
        qc.cancelQueries({ queryKey: QK.mine }),
        qc.cancelQueries({ queryKey: QK.one(id) }),
      ]);

      const prevAll = qc.getQueryData<Task[]>(QK.all);
      const prevMine = qc.getQueryData<Task[]>(QK.mine);
      const prevOne  = qc.getQueryData<Task>(QK.one(id));

      if (prevAll) {
        qc.setQueryData<Task[]>(QK.all, prevAll.map(t => t.id===id ? { ...t, ...body } as Task : t));
      }
      if (prevMine) {
        qc.setQueryData<Task[]>(QK.mine, prevMine.map(t => t.id===id ? { ...t, ...body } as Task : t));
      }
      if (prevOne) {
        qc.setQueryData<Task>(QK.one(id), { ...prevOne, ...body } as Task);
      }

      return { prevAll, prevMine, prevOne };
    },

    onError: (_e, { id }, ctx) => {
      if (!ctx) return;
      if (ctx.prevAll)  qc.setQueryData(QK.all, ctx.prevAll);
      if (ctx.prevMine) qc.setQueryData(QK.mine, ctx.prevMine);
      if (ctx.prevOne)  qc.setQueryData(QK.one(id), ctx.prevOne);
    },

    onSettled: (_1, _2, { id }) => {
      qc.invalidateQueries({ queryKey: QK.all });
      qc.invalidateQueries({ queryKey: QK.mine });
      qc.invalidateQueries({ queryKey: QK.one(id) });
    }
  });
}

// Eliminar
export function useDeleteTask(){
  const qc = useQueryClient();
  return useMutation({
    mutationFn:(id:number)=>removeTask(id),

    onMutate: async (id:number) => {
      await Promise.all([
        qc.cancelQueries({ queryKey: QK.all }),
        qc.cancelQueries({ queryKey: QK.mine }),
      ]);

      const prevAll = qc.getQueryData<Task[]>(QK.all);
      const prevMine = qc.getQueryData<Task[]>(QK.mine);

      if (prevAll)  qc.setQueryData<Task[]>(QK.all, prevAll.filter(t=>t.id!==id));
      if (prevMine) qc.setQueryData<Task[]>(QK.mine, prevMine.filter(t=>t.id!==id));

      return { prevAll, prevMine };
    },

    onError: (_e, _id, ctx) => {
      if (!ctx) return;
      if (ctx.prevAll)  qc.setQueryData(QK.all, ctx.prevAll);
      if (ctx.prevMine) qc.setQueryData(QK.mine, ctx.prevMine);
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: QK.all });
      qc.invalidateQueries({ queryKey: QK.mine });
    }
  });
}
