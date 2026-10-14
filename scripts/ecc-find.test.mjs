import { test } from 'node:test';
import assert from 'node:assert/strict';
import { find } from './ecc-find.mjs';

const items = [
  { path: 'agents/security-reviewer.md', phases: ['verify'], summary: 'Security review of code' },
  { path: 'skills/django-security', phases: ['stack'], summary: 'Django security best practices' },
  { path: 'agents/a11y-architect.md', phases: ['architect'], summary: 'Accessibility audits' },
  { path: 'agents/ruby-reviewer.md', phases: ['stack'], summary: 'Ruby security review', pending: true },
];

test('find searches every phase, puts the current phase first, skips pending items', () => {
  assert.deepEqual(find(items, ['SECURITY'], 'stack').map((i) => i.path), ['skills/django-security', 'agents/security-reviewer.md']);
  assert.deepEqual(find(items, ['security', 'review'], 'architect').map((i) => i.path), ['agents/security-reviewer.md']);
  assert.deepEqual(find(items, ['nothing']), []);
});
