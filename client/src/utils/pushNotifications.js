/* Web Push helper — call registerPushNotifications() after user grants permission */

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64  = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw     = window.atob(base64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

export function isPushSupported() {
  return 'serviceWorker' in navigator && 'PushManager' in window;
}

export async function registerPushNotifications() {
  if (!isPushSupported()) return false;

  // 1. Register our dedicated push service worker
  const registration = await navigator.serviceWorker.register('/push-sw.js');

  // 2. Fetch VAPID public key from our server
  const res = await fetch('/api/push/vapid-public-key');
  if (!res.ok) throw new Error('Could not fetch VAPID key');
  const { publicKey } = await res.json();

  // 3. Subscribe via the browser's PushManager
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly:      true,
    applicationServerKey: urlBase64ToUint8Array(publicKey),
  });

  // 4. Save the subscription on the server (linked to the logged-in user)
  const saveRes = await fetch('/api/push/subscribe', {
    method:      'POST',
    headers:     { 'Content-Type': 'application/json' },
    credentials: 'include',
    body:        JSON.stringify(subscription.toJSON()),
  });
  if (!saveRes.ok) throw new Error('Could not save subscription');

  return true;
}

export async function unregisterPushNotifications() {
  if (!isPushSupported()) return;
  const reg = await navigator.serviceWorker.getRegistration('/push-sw.js');
  if (!reg) return;
  const sub = await reg.pushManager.getSubscription();
  if (!sub) return;

  await fetch('/api/push/unsubscribe', {
    method:      'DELETE',
    headers:     { 'Content-Type': 'application/json' },
    credentials: 'include',
    body:        JSON.stringify({ endpoint: sub.endpoint }),
  });
  await sub.unsubscribe();
}
