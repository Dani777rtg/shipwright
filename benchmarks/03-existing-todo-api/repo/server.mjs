// Minimal task API used as the "existing system" benchmark. No dependencies.
import { createServer } from 'node:http';
import { pathToFileURL } from 'node:url';

export function createApp() {
  const tasks = new Map();
  let nextId = 1;

  const send = (res, status, body) => {
    res.writeHead(status, { 'content-type': 'application/json' });
    res.end(body === undefined ? '' : JSON.stringify(body));
  };

  const readJson = (req) => new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (c) => { data += c; });
    req.on('end', () => { try { resolve(data ? JSON.parse(data) : {}); } catch (e) { reject(e); } });
  });

  return createServer(async (req, res) => {
    const match = req.url.match(/^\/tasks(?:\/(\d+))?$/);
    if (!match) return send(res, 404, { error: 'not found' });
    const id = match[1] && Number(match[1]);
    try {
      if (req.method === 'GET' && !id) return send(res, 200, [...tasks.values()]);
      if (req.method === 'POST' && !id) {
        const { title } = await readJson(req);
        if (typeof title !== 'string' || !title.trim()) return send(res, 400, { error: 'title required' });
        const task = { id: nextId++, title: title.trim(), done: false };
        tasks.set(task.id, task);
        return send(res, 201, task);
      }
      if (!tasks.has(id)) return send(res, 404, { error: 'not found' });
      if (req.method === 'GET') return send(res, 200, tasks.get(id));
      if (req.method === 'PATCH') {
        const { done } = await readJson(req);
        if (typeof done !== 'boolean') return send(res, 400, { error: 'done must be boolean' });
        tasks.get(id).done = done;
        return send(res, 200, tasks.get(id));
      }
      if (req.method === 'DELETE') { tasks.delete(id); return send(res, 204); }
      return send(res, 405, { error: 'method not allowed' });
    } catch {
      return send(res, 400, { error: 'invalid json' });
    }
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  createApp().listen(process.env.PORT ?? 3000);
}
