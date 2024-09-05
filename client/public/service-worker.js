// mandatory to make PWA installable
self.addEventListener("fetch", () => {});

self.addEventListener('push', (event) => {
  if (event.data && self.Notification && self.Notification.permission === 'granted') {
    const json = event.data.json()
    event.waitUntil(self.registration.showNotification(json.title, {
      body: json.body,
      icon: "/images/icon.png",
      badge: "/images/badge.png",
      vibrate: [200, 100, 200, 100, 200, 100, 200],
      data: {
        url: json.url || "/#/cd2a469ed5e3"
      }
    }))
  }
})

self.addEventListener('notificationclick', (event) => {
  if (event.notification) {
    event.notification.close()
    event.waitUntil(openUrl(event.notification));
  }
})

self.addEventListener('message', (event) => {
  if (event && event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting().then()
  }
})

async function openUrl(notification) {
  const url = (
    notification &&
    notification["data"] &&
    notification["data"]["url"] &&
    typeof notification["data"]["url"] === "string"
  ) ? notification["data"]["url"] : "/"
  const windowClients = await self.clients.matchAll({
    type: "window",
    includeUncontrolled: true,
  });
  for (let i = 0; i < windowClients.length; i++) {
    const client = windowClients[i];
    if (client.url === url && "focus" in client) {
      return client.focus();
    }
  }
  if (self.clients.openWindow) {
    return self.clients.openWindow(url);
  }
  return null;
}
