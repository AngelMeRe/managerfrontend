import * as signalR from '@microsoft/signalr';

let connection: signalR.HubConnection | null = null;

export async function connectCommentsHub(token: string){
  if (connection && connection.state === signalR.HubConnectionState.Connected) return connection;

  const url = `${import.meta.env.VITE_API_BASE_URL}/hubs/comments`;
  const transport = import.meta.env.DEV
    ? signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling
    : signalR.HttpTransportType.LongPolling;

  connection = new signalR.HubConnectionBuilder()
    .withUrl(url, { accessTokenFactory:()=>token, transport, withCredentials:true })
    .withAutomaticReconnect()
    .build();

  await connection.start();
  return connection;
}

// Asegúrate de exportar estas funciones si las importas
export async function joinTaskGroup(taskId:number){
  if (!connection) return;
  await connection.invoke('AddToGroup', `task-${taskId}`).catch(()=>{});
}

export async function leaveTaskGroup(taskId:number){
  if (!connection) return;
  await connection.invoke('RemoveFromGroup', `task-${taskId}`).catch(()=>{});
}

export function on(event: string, handler: (...args:any[])=>void){
  connection?.on(event, handler);
}

export function off(event: string, handler: (...args:any[])=>void){
  connection?.off(event, handler);
}
