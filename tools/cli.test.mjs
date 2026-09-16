import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { resolveModules, inspectModules, generateModuleIds } from './modules.mjs';
const root = path.resolve(import.meta.dirname, '..');
test('scaffolding is deterministic, bounded and never overwrites existing work', () => {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'templatev4-cli-'));
  try {
    fs.mkdirSync(path.join(temporary, 'tools'));
    fs.copyFileSync(path.join(root, 'tools/framework.mjs'), path.join(temporary, 'tools/framework.mjs'));
    fs.copyFileSync(path.join(root, 'framework.json'), path.join(temporary, 'framework.json'));
    fs.mkdirSync(path.join(temporary, 'modules'));
    fs.copyFileSync(path.join(root, 'modules/catalog.json'), path.join(temporary, 'modules/catalog.json'));
    const run = (...args) => spawnSync(process.execPath, ['tools/framework.mjs', ...args], { cwd: temporary, encoding: 'utf8' });
    assert.equal(run('new', 'feature', 'Reports', '--module', 'support').status, 0);
    assert.ok(fs.existsSync(path.join(temporary, 'src/TemplateV4.Http/Support/ReportsEndpoints.cs')));
    assert.notEqual(run('new', 'feature', 'Unowned').status, 0);
    assert.equal(JSON.parse(fs.readFileSync(path.join(temporary, 'modules/scaffolds/reports.feature.json'), 'utf8')).module, 'support');
    const before = fs.readFileSync(path.join(temporary, 'src/TemplateV4.Application/Support/Reports/Reports.cs'), 'utf8');
    assert.notEqual(run('new', 'feature', 'Reports', '--module', 'support').status, 0);
    assert.equal(fs.readFileSync(path.join(temporary, 'src/TemplateV4.Application/Support/Reports/Reports.cs'), 'utf8'), before);
    assert.notEqual(run('new', 'entity', '../Escape').status, 0);
    assert.notEqual(run('new', 'unknown', 'Example').status, 0);
    assert.equal(run('new', 'command', 'ArchiveUser').status, 0);
    assert.equal(run('new', 'module', 'Invoices').status, 0);
    assert.ok(fs.existsSync(path.join(temporary, 'src/TemplateV4.Infrastructure/Invoices/InvoicesRegistration.cs')));
    assert.ok(fs.existsSync(path.join(temporary, 'src/TemplateV4.Application/Invoices/InvoicesPermissions.cs')));
    assert.match(fs.readFileSync(path.join(temporary, 'src/TemplateV4.Http/Invoices/InvoicesEndpoints.cs'), 'utf8'), /RequireCapability\("invoices"\)/);
    assert.equal(JSON.parse(fs.readFileSync(path.join(temporary, 'modules/scaffolds/invoices.json'), 'utf8')).enabledByDefault, false);
    assert.notEqual(run('new', 'module', 'Invoices').status, 0);
    const permissionPath = path.join(temporary, 'src/TemplateV4.Application/Support/ExistingPermissions.cs');
    fs.writeFileSync(permissionPath, 'existing permission declarations');
    assert.notEqual(run('new', 'feature', 'Existing', '--module', 'support').status, 0);
    assert.equal(fs.readFileSync(permissionPath, 'utf8'), 'existing permission declarations');
    assert.equal(fs.existsSync(path.join(temporary, 'src/TemplateV4.Application/Support/Existing/Existing.cs')), false);
  } finally {
    if (!temporary.startsWith(path.join(os.tmpdir(), 'templatev4-cli-'))) throw new Error('Invalid temporary cleanup target');
    fs.rmSync(temporary, { recursive: true, force: true });
  }
});

test('capability graphs reject unknown references, cycles and required runtime switches; generated IDs are current', () => {
  const core = { id: 'identity', required: true, enabledByDefault: true, dependencies: [] };
  assert.throws(() => resolveModules([{ ...core, runtimeConfigurable: true }]));
  assert.throws(() => resolveModules([{ ...core, capabilities: [{ id: 'reports', requires: ['missing'] }] }]));
  assert.throws(() => resolveModules([{ ...core, capabilities: [{ id: 'reports', requires: ['charts'] }, { id: 'charts', requires: ['reports'] }] }]));
  assert.throws(() => resolveModules([{ ...core, capabilities: [{ id: 'identity', requires: [] }] }]));
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'framework.json'), 'utf8'));
  generateModuleIds(root, manifest, true);
});

test('module catalog validates dependencies, required modules and every shipped preset', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'framework.json'), 'utf8'));
  for (const preset of Object.keys(manifest.modulePresets)) assert.equal(inspectModules(root, manifest, preset).Modules.identity, true);
  assert.equal(inspectModules(root, manifest, 'minimal').Modules['file-storage'], false);
  assert.throws(() => inspectModules(root, manifest, '../escape'));
  const core = { id: 'identity', required: true, enabledByDefault: true, dependencies: [] };
  assert.throws(() => resolveModules([core], { identity: false }));
  assert.throws(() => resolveModules([core], { billing: true }));
  assert.throws(() => resolveModules([core], { identity: 'true' }));
  assert.throws(() => resolveModules([core, core]));
  assert.throws(() => resolveModules([{ ...core, dependencies: ['missing'] }]));
  assert.throws(() => resolveModules([{ ...core, dependencies: ['identity'] }]));
  assert.throws(() => resolveModules([core, { id: 'reports', required: false, enabledByDefault: true, dependencies: ['disabled'] }, { id: 'disabled', required: false, enabledByDefault: false, dependencies: [] }]));
});
