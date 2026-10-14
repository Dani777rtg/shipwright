import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../server.mjs';

let server;
let base;
before(async () => {
  server = createApp().listen(0);
  await new Promise((r) => server.once('listening', r));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(() => server.close());

const call = (method, path, body) => fetch(base + path, {
  method, headers: { 'content-type': 'application/json' }, body: body && JSON.stringify(body),
});

test('create, list, complete and delete a task', async () => {
  const created = await (await call('POST', '/tasks', { title: ' Comprar pan ' })).json();
  assert.equal(created.title, 'Comprar pan');
  assert.equal((await (await call('GET', '/tasks')).json()).length, 1);
  assert.equal((await (await call('PATCH', `/tasks/${created.id}`, { done: true })).json()).done, true);
  assert.equal((await call('DELETE', `/tasks/${created.id}`)).status, 204);
  assert.equal((await call('GET', `/tasks/${created.id}`)).status, 404);
});

test('validation errors', async () => {
  assert.equal((await call('POST', '/tasks', { title: '' })).status, 400);
  const t = await (await call('POST', '/tasks', { title: 'x' })).json();
  assert.equal((await call('PATCH', `/tasks/${t.id}`, { done: 'yes' })).status, 400);
  assert.equal((await call('GET', '/nope')).status, 404);
});
