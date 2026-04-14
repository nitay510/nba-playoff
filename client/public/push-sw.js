/* Push Notification Service Worker */

self.addEventListener('push', (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (_) {}

  const title   = data.title || 'NBA Playoff Bets';
  const options = {
    body:    data.body  || 'יש לך הימורים למלא!',
    icon:    '/logo192.png',
    badge:   '/logo192.png',
    dir:     'rtl',
    lang:    'he',
    vibrate: [200, 100, 200],
    data:    { url: data.url || '/home' },
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/home';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Focus existing tab if open
      for (const client of clientList) {
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open a new tab
      if (clients.openWindow) return clients.openWindow(targetUrl);
    })
  );
});
