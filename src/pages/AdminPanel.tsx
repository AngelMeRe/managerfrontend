import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from '../hooks/useUsers';
import { useState } from 'react';

export default function AdminPanel(){
  const { data, isLoading } = useUsers();
  const createM = useCreateUser();
  const updateM = useUpdateUser();
  const deleteM = useDeleteUser();

  const [showNew, setShowNew] = useState(false);
  const [draft, setDraft] = useState({ name:'', email:'', role:'user' as 'user'|'admin', password:'' });

  if (isLoading) return <div className="card">Cargando…</div>;
  const users = data ?? [];

  return (
    <div className="grid" style={{gap:16}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', gap:10, flexWrap:'wrap'}}>
        <h1 style={{margin:'8px 0 16px', fontSize:28}}>Panel Administrativo</h1>
        <button onClick={()=>setShowNew(v=>!v)}>+ Agregar Usuario</button>
      </div>

      {showNew && (
        <div className="card">
          <h3 style={{marginTop:0}}>Nuevo Usuario</h3>
          {/* Grid responsive: 1 col móvil, 2 col tablet, 4 col desktop */}
          <div className="grid form-grid">
            <input className="input" placeholder="Nombre" value={draft.name}
              onChange={e=>setDraft(d=>({...d,name:e.target.value}))}/>
            <input className="input" placeholder="Email" value={draft.email}
              onChange={e=>setDraft(d=>({...d,email:e.target.value}))}/>
            <select className="select" value={draft.role}
              onChange={e=>setDraft(d=>({...d,role:e.target.value as any}))}>
              <option value="user">user</option>
              <option value="admin">admin</option>
            </select>
            <input className="input" placeholder="Contraseña" type="password" value={draft.password}
              onChange={e=>setDraft(d=>({...d,password:e.target.value}))}/>
          </div>
          <div className="toolbar" style={{marginTop:8, flexWrap:'wrap'}}>
            <button onClick={()=>{
              createM.mutate(draft, {
                onSuccess:()=>{ setShowNew(false); setDraft({name:'',email:'',role:'user',password:''}); }
              });
            }}>Crear</button>
            <button className="danger" onClick={()=>setShowNew(false)}>Cancelar</button>
          </div>
        </div>
      )}

      <div className="card">
        <h3 style={{marginTop:0}}>Gestión de Usuarios</h3>

        {/* Tabla responsiva: visible en >= 800px */}
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Nombre</th><th>Email</th><th>Rol</th><th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u=>(
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    <select
                      className="select"
                      value={u.role}
                      onChange={(e)=>updateM.mutate({ id:u.id, body:{ role: e.target.value as any } })}
                    >
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td className="td-actions">
                    <button className="danger" onClick={()=>deleteM.mutate(u.id)}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Lista “cards” para móviles: visible en < 800px */}
        <div className="list-mobile">
          {users.map(u=>(
            <div key={u.id} className="user-card">
              <div className="user-row">
                <div className="user-label">Nombre</div>
                <div className="user-value">{u.name}</div>
              </div>
              <div className="user-row">
                <div className="user-label">Email</div>
                <div className="user-value">{u.email}</div>
              </div>
              <div className="user-row">
                <div className="user-label">Rol</div>
                <div className="user-value">
                  <select
                    className="select"
                    value={u.role}
                    onChange={(e)=>updateM.mutate({ id:u.id, body:{ role: e.target.value as any } })}
                  >
                    <option value="user">user</option>
                    <option value="admin">admin</option>
                  </select>
                </div>
              </div>
              <div className="user-actions">
                <button className="danger" onClick={()=>deleteM.mutate(u.id)}>Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
