import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

const source = await readFile(new URL('../src/TemplateV4.Angular/public/push-sw.js', import.meta.url), 'utf8');
function worker(windows = []) {
  const handlers = {}, notifications = [], opened = [];
  vm.runInNewContext(source, { URL, self: {
    location: { origin: 'https://app.example.test' },
    addEventListener: (name, handler) => { handlers[name] = handler; },
    registration: { showNotification: async (title, options) => { notifications.push({ title, options }); } },
    clients: { matchAll: async () => windows, openWindow: async url => { opened.push(url); } },
  } });
  return { handlers, notifications, opened };
}

test('push displays localized content and uses a stable tag, never a supplied destination', async () => {
  const { handlers, notifications } = worker();
  let pending;
  handlers.push({ data: { json: () => ({ title: 'Kennisgewings', body: 'Jy het ’n nuwe kennisgewing', tag: 'id', url: 'https://untrusted.test' }) }, waitUntil: value => { pending = value; } });
  await pending;
  assert.equal(notifications[0].title, 'Kennisgewings');
  assert.equal(notifications[0].options.body, 'Jy het ’n nuwe kennisgewing');
  assert.equal(notifications[0].options.tag, 'id');
  assert.equal(notifications[0].options.data.url, '/notifications');
});

test('malformed push still displays a generic notification', async () => {
  const { handlers, notifications } = worker();
  let pending;
  handlers.push({ data: { json: () => { throw new SyntaxError(); } }, waitUntil: value => { pending = value; } });
  await pending;
  assert.equal(notifications[0].options.body, 'You have a new notification');
});

test('notification clicks focus an existing app window or open the same-origin inbox', async () => {
  let destination, focused = false;
  for (const windows of [[], [{ url: 'https://app.example.test/me', navigate: async url => { destination = url; }, focus: async () => { focused = true; } }]]) {
    const { handlers, opened } = worker(windows);
    let pending, closed = false;
    handlers.notificationclick({ notification: { close: () => { closed = true; } }, waitUntil: value => { pending = value; } });
    await pending;
    assert.equal(closed, true);
    if (windows.length) { assert.equal(destination, 'https://app.example.test/notifications'); assert.equal(focused, true); }
    else assert.deepEqual(opened, ['https://app.example.test/notifications']);
  }
});
