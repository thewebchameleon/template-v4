self.addEventListener('push', (event) => {
  event.waitUntil(
    (async () => {
      let data;
      try {
        data = event.data?.json();
      } catch {
        /* Display a generic notification. */
      }
      await self.registration.showNotification(
        typeof data?.title === 'string' ? data.title : 'Notifications',
        {
          body: typeof data?.body === 'string' ? data.body : 'You have a new notification',
          tag: typeof data?.tag === 'string' ? data.tag : undefined,
          data: { url: '/notifications' },
        },
      );
    })(),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    (async () => {
      const url = new URL('/notifications', self.location.origin).href;
      const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      for (const window of windows) {
        if (new URL(window.url).origin === self.location.origin) {
          await window.navigate(url);
          await window.focus();
          return;
        }
      }
      await self.clients.openWindow(url);
    })(),
  );
});
