#!/usr/bin/env node
// Where did a mission's time go? Reads the project's Claude Code transcripts (read-only) and reports active vs idle
// time, waits on the user, subagent time by type, and builder tool time by family (tests, typecheck, installs…).
// Usage (from the project root): node session-report.mjs [--since <ISO date>] [--dir <transcripts dir>]
// Default dir: ~/.claude/projects/<project path with every non-alphanumeric character replaced by "-">.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { pathToFileURL } from 'node:url';

const IDLE_MIN = 10; // a gap longer than this between two records is idle time (user away or waiting)

export const transcriptsDir = (projectRoot) => join(homedir(), '.claude', 'projects', projectRoot.replace(/[^A-Za-z0-9]/g, '-'));

const readJsonl = (p) => readFileSync(p, 'utf8').split(/\r?\n/).flatMap((l) => { try { return l ? [JSON.parse(l)] : []; } catch { return []; } });
const time = (d) => (d.timestamp ? Date.parse(d.timestamp) : null);
const minutes = (ms) => Math.round(ms / 6e3) / 10;

export function family(name, cmd = '') {
  if (!['Bash', 'PowerShell'].includes(name)) return name;
  if (/vitest|jest|pytest|go test|cargo test|mvn test|gradle\w* test|dotnet test|(npm|pnpm|yarn|bun) (run )?test/.test(cmd)) return 'tests';
  if (/\btsc\b|typecheck|mypy|pyright/.test(cmd)) return 'typecheck';
  if (/lint|eslint|ruff|clippy/.test(cmd)) return 'lint';
  if (/(npm|pnpm|yarn|bun) (i|install|add|ci)\b|pip install|uv (sync|pip)/.test(cmd)) return 'install';
  if (/docker|psql|postgres|redis-cli/.test(cmd)) return 'docker/db';
  if (/^\s*git\b/.test(cmd)) return 'git';
  return 'other shell';
}

// Wall time of each tool call: from the tool_use (assistant record) to its tool_result (user record).
export function toolTimes(records) {
  const open = new Map();
  const out = [];
  for (const d of records) {
    const content = d.message?.content;
    if (!Array.isArray(content)) continue;
    for (const c of content) {
      if (d.type === 'assistant' && c.type === 'tool_use') open.set(c.id, { t: time(d), name: c.name, cmd: String(c.input?.command ?? '') });
      if (d.type === 'user' && c.type === 'tool_result' && open.has(c.tool_use_id)) {
        const u = open.get(c.tool_use_id);
        open.delete(c.tool_use_id);
        out.push({ name: u.name, cmd: u.cmd, family: family(u.name, u.cmd), ms: time(d) - u.t });
      }
    }
  }
  return out;
}

export function activeIdle(stamps) {
  let active = 0, idle = 0;
  for (let i = 1; i < stamps.length; i++) {
    const gap = stamps[i] - stamps[i - 1];
    if (gap > IDLE_MIN * 6e4) idle += gap; else active += gap;
  }
  return { active, idle };
}

export function analyze(dir, since = null) {
  const from = since ? Date.parse(since) : 0;
  const sessions = [];
  const agents = {};
  const builderTools = {};
  for (const f of readdirSync(dir).filter((n) => n.endsWith('.jsonl'))) {
    const recs = readJsonl(join(dir, f)).filter((d) => (time(d) ?? from) >= from);
    const stamps = recs.map(time).filter(Boolean).sort((a, b) => a - b);
    if (!stamps.length) continue;
    const prompts = recs.filter((d) => d.type === 'user' && !d.isSidechain && typeof d.message?.content === 'string' && !d.message.content.startsWith('<') && !d.message.content.includes('<agent-message')).length;
    sessions.push({ id: f.slice(0, 8), start: new Date(stamps[0]).toISOString(), ...activeIdle(stamps), prompts });
    const sub = join(dir, f.replace(/\.jsonl$/, ''), 'subagents');
    if (!existsSync(sub)) continue;
    for (const m of readdirSync(sub).filter((n) => n.endsWith('.meta.json'))) {
      const meta = JSON.parse(readFileSync(join(sub, m), 'utf8'));
      const r = readJsonl(join(sub, m.replace('.meta.json', '.jsonl')));
      const st = r.map(time).filter(Boolean);
      if (!st.length || Math.min(...st) < from) continue;
      const type = meta.agentType ?? 'unknown';
      const a = (agents[type] ??= { count: 0, ms: 0 });
      a.count++; a.ms += Math.max(...st) - Math.min(...st);
      if (/builder/.test(type)) for (const t of toolTimes(r)) {
        const b = (builderTools[t.family] ??= { calls: 0, ms: 0 });
        b.calls++; b.ms += t.ms;
      }
    }
  }
  return { sessions, agents, builderTools };
}

export function render({ sessions, agents, builderTools }) {
  const active = sessions.reduce((n, s) => n + s.active, 0);
  const idle = sessions.reduce((n, s) => n + s.idle, 0);
  const lines = ['# Dónde se fue el tiempo', '', `Activo: ${minutes(active)} min · inactivo (pausas > ${IDLE_MIN} min): ${minutes(idle)} min`, '',
    '| Sesión | Inicio (UTC) | Activo (min) | Inactivo (min) | Mensajes del usuario |', '|---|---|---|---|---|',
    ...sessions.sort((a, b) => a.start.localeCompare(b.start)).map((s) => `| ${s.id} | ${s.start.slice(0, 16)} | ${minutes(s.active)} | ${minutes(s.idle)} | ${s.prompts} |`),
    '', '| Subagente | Veces | Minutos |', '|---|---|---|',
    ...Object.entries(agents).sort((a, b) => b[1].ms - a[1].ms).map(([k, v]) => `| ${k} | ${v.count} | ${minutes(v.ms)} |`)];
  const total = Object.values(builderTools).reduce((n, v) => n + v.ms, 0);
  if (total) lines.push('', '| Builders: herramienta | Llamadas | Minutos | % del tiempo en herramientas |', '|---|---|---|---|',
    ...Object.entries(builderTools).sort((a, b) => b[1].ms - a[1].ms).map(([k, v]) => `| ${k} | ${v.calls} | ${minutes(v.ms)} | ${Math.round((100 * v.ms) / total)} % |`));
  return lines.join('\n');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = process.argv.slice(2);
  const opt = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
  const dir = opt('--dir') ?? transcriptsDir(process.cwd());
  if (!existsSync(dir)) { console.error(`no transcripts at ${dir} (use --dir)`); process.exit(2); }
  console.log(render(analyze(dir, opt('--since'))));
}
