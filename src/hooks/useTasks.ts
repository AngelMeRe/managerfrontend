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

// Tareas del usuario autenticado (Usuario)
export function useMyTasks(){
  return useQuery({ queryKey: QK.mine, queryFn: fetchMyTasks });
}

// Obtener tarea por ID
export function useTask(id:number){
  return useQuery({ queryKey: QK.one(id), queryFn:()=>fetchTask(id), enabled: !!id });
}

// Crear tarea
export function useCreateTask(){
  const qc = useQueryClient();
  return useMutation({
    mutationFn:(b:Partial<Task>)=>createTask(b),
    onSuccess:(created)=>{
      // Invalida ambas listas; si el backend asigna al usuario actual, aparecerá en 'mine'
      qc.invalidateQueries({ queryKey: QK.all });
      qc.invalidateQueries({ queryKey: QK.mine });
      if (created?.id) qc.invalidateQueries({ queryKey: QK.one(created.id) });
    }
  });
}

// Actualizar tarea con optimistic update
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

      // Aplicar cambio optimista en ambas listas y detalle
      if (prevAll) {
        qc.setQueryData<Task[]>(QK.all, prevAll.map(t=>t.id===id ? { ...t, ...body } as Task : t));
      }
      if (prevMine) {
        qc.setQueryData<Task[]>(QK.mine, prevMine.map(t=>t.id===id ? { ...t, ...body } as Task : t));
      }
      if (prevOne) {
        qc.setQueryData<Task>(QK.one(id), { ...prevOne, ...body } as Task);
      }

      return { prevAll, prevMine, prevOne };
    },
    onError: (_err, { id }, ctx) => {
      // Rollback si falla
      if (!ctx) return;
      if (ctx.prevAll) qc.setQueryData(QK.all, ctx.prevAll);
      if (ctx.prevMine) qc.setQueryData(QK.mine, ctx.prevMine);
      if (ctx.prevOne) qc.setQueryData(QK.one(id), ctx.prevOne);
    },
    onSettled: (data, _err, { id }) => {
      // Sincroniza definitivamente con servidor
      qc.invalidateQueries({ queryKey: QK.all });
      qc.invalidateQueries({ queryKey: QK.mine });
      qc.invalidateQueries({ queryKey: QK.one(id) });
    }
  });
}

// Eliminar tarea
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
    onSettled: (_data, _err, id) => {
      qc.invalidateQueries({ queryKey: QK.all });
      qc.invalidateQueries({ queryKey: QK.mine });
      if (id) qc.invalidateQueries({ queryKey: QK.one(id as number) });
    }
  });
}