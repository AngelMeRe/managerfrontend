import { useEffect, useMemo, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useComments, useAddComment, useDeleteComment } from '../hooks/useComments';
import { connectCommentsHub, joinTaskGroup, leaveTaskGroup, on, off } from '../realtime/comments';
import { notify } from '../lib/notify';

export default function CommentThread({ taskId }:{ taskId:number }){
  //consulta de comentarios
  const { data, isLoading } = useComments(taskId);
  const addM = useAddComment(taskId);
  const delM = useDeleteComment(taskId);
  const qc = useQueryClient();
  const [text, setText] = useState('');

  const me = useMemo(()=>{
    try { return JSON.parse(localStorage.getItem('user') || 'null') as { id?:number; name?:string } | null; }
    catch { return null; }
  }, []);
  const myId = me?.id;

  const handlerRef = useRef<((payload:any)=>void) | null>(null);

  useEffect(()=>{
    let active = true;
    const token = localStorage.getItem('accessToken') || '';

    (async ()=>{
      await connectCommentsHub(token);
      await joinTaskGroup(taskId);

      const handler = (payload:any)=>{
        if (!active) return;
        notify('Nuevo comentario', { body: `${payload?.user?.name ?? 'Usuario'}: ${payload?.text ?? ''}`, tag:`task-${taskId}` });
        qc.invalidateQueries({ queryKey:['comments', taskId] });
      };

      handlerRef.current = handler;
      on('commentAdded', handler);
    })();

    return ()=>{
      active = false;
      if (handlerRef.current) off('commentAdded', handlerRef.current);
      leaveTaskGroup(taskId);
    };
  }, [taskId, qc]);

  if (isLoading) return <div className="card">Cargando comentarios…</div>;
  const list = data ?? [];

  return (
    <div className="card" style={{marginTop:16}}>
      <h3 style={{marginTop:0}}>Comentarios</h3>

      <div style={{display:'flex', gap:12, alignItems:'start', marginBottom:12}}>
        <textarea
          className="input"
          placeholder="Escribe un comentario…"
          style={{flex:1, minHeight:64}}
          value={text}
          onChange={e=>setText(e.target.value)}
          onKeyDown={(e)=>{
            if (e.key === 'Enter' && !e.shiftKey){
              e.preventDefault();
              const content = text.trim();
              if (!content) return;
              addM.mutate({ content }, { onSuccess:()=>setText('') });
            }
          }}
        />
        <button
          onClick={()=>{
            const content = text.trim();
            if (!content) return;
            addM.mutate({ content }, { onSuccess:()=>setText('') });
          }}
          disabled={addM.isPending}
        >
          {addM.isPending ? 'Enviando…' : 'Comentar'}
        </button>
      </div>

      <ul style={{listStyle:'none', padding:0, margin:0, display:'flex', flexDirection:'column', gap:10}}>
        {list.map(c=>(
          <li key={c.id} style={{display:'flex', gap:12, alignItems:'start'}}>
            <div style={{
              width:36, height:36, borderRadius:9999,
              background:'#0b3b2f', color:'#34d399',
              display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700
            }}>
              {c.user.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div style={{flex:1}}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline'}}>
                <div style={{fontWeight:600}}>{c.user.name}</div>
                <div style={{color:'var(--muted)', fontSize:12}}>
                  {new Date(c.createdAt).toLocaleString()}
                </div>
              </div>
              <div style={{whiteSpace:'pre-wrap', marginTop:4}}>{c.text}</div>
              {(myId && myId === c.user.id) && (
                <div style={{marginTop:6}}>
                  <button className="danger"
                    onClick={()=>delM.mutate(c.id)}
                    disabled={delM.isPending}
                  >
                    Eliminar
                  </button>
                </div>
              )}
            </div>
          </li>
        ))}
        {list.length === 0 && (
          <li style={{color:'var(--muted)'}}>Aún no hay comentarios.</li>
        )}
      </ul>
    </div>
  );
}