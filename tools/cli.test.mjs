import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
const root = path.resolve(import.meta.dirname, '..');
test('scaffolding is deterministic, bounded and never overwrites existing work', () => {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'templatev4-cli-'));
  try {
    fs.mkdirSync(path.join(temporary, 'tools'));
    fs.copyFileSync(path.join(root, 'tools/framework.mjs'), path.join(temporary, 'tools/framework.mjs'));
    fs.copyFileSync(path.join(root, 'framework.json'), path.join(temporary, 'framework.json'));
    const run = (...args) => spawnSync(process.execPath, ['tools/framework.mjs', ...args], { cwd: temporary, encoding: 'utf8' });
    assert.equal(run('new', 'feature', 'Reports').status, 0);
    assert.ok(fs.existsSync(path.join(temporary, 'src/TemplateV4.ApiService/Endpoints/ReportsEndpoints.cs')));
    const before = fs.readFileSync(path.join(temporary, 'src/TemplateV4.Application/Reports/Reports.cs'), 'utf8');
    assert.notEqual(run('new', 'feature', 'Reports').status, 0);
    assert.equal(fs.readFileSync(path.join(temporary, 'src/TemplateV4.Application/Reports/Reports.cs'), 'utf8'), before);
    assert.notEqual(run('new', 'entity', '../Escape').status, 0);
    assert.notEqual(run('new', 'unknown', 'Example').status, 0);
    assert.equal(run('new', 'command', 'ArchiveUser').status, 0);
  } finally {
    if (!temporary.startsWith(path.join(os.tmpdir(), 'templatev4-cli-'))) throw new Error('Invalid temporary cleanup target');
    fs.rmSync(temporary, { recursive: true, force: true });
  }
});
