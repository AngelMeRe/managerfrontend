export async function ensureNotifyPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission !== 'denied') {
    const res = await Notification.requestPermission();
    return res === 'granted';
  }
  return false;
}

export async function notify(title:string, options?:NotificationOptions){
  const ok = await ensureNotifyPermission();
  if (!ok) return;
  new Notification(title, options);
}