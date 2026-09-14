import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import vm from 'node:vm';
const require = createRequire(new URL('../src/TemplateV4.Angular/package.json', import.meta.url));
const ts = require('typescript');
function signal(value) {
  const result = () => value;
  result.set = next => { value = next; };
  result.update = work => { value = work(value); };
  return result;
}
class HttpErrorResponse extends Error { constructor(status) { super('request failed'); this.status = status; } }
class Resource {
  value = signal(null); state = signal('loading'); refreshing = signal(false); refreshError = signal(false);
  async load(work) {
    try { this.value.set(await work()); this.state.set('ready'); this.refreshError.set(false); return true; }
    catch { this.refreshError.set(true); return false; }
  }
}
function harness(file, name, api) {
  const features = { enabled: () => true, reset: () => {}, load: async () => {} };
  const tokens = { api, features, contributions: [], toast: { success: () => {} } };
  const dependencies = {
    '@angular/core': { Component: () => target => target, inject: token => { assert.ok(token in tokens, token); return tokens[token]; }, signal },
    '@angular/common': {}, '@angular/common/http': { HttpErrorResponse }, '@spartan-ng/helm/dialog': { HlmDialogImports: [] },
    '@ng-icons/core': { provideIcons: () => ({}) }, '@ng-icons/lucide': {},
    '../core/features': { Features: 'features' }, '../core/feature-extensions': { FOUNDATION_FEATURES: 'contributions' },
    '../core/notifications': { Notifications: 'toast' }, '../core/workspace-api': { WorkspaceApi: 'api' },
    '../shared/workspace': { Resource, WorkspaceUi: [] }, './my-files-settings-editor': { MyFilesSettingsEditor: class {} },
  };
  const exports = {};
  const source = readFileSync(new URL(`../src/TemplateV4.Angular/src/app/features/${file}.ts`, import.meta.url), 'utf8');
  const compiled = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, experimentalDecorators: true } }).outputText;
  vm.runInNewContext(compiled, { exports, require: id => { assert.ok(id in dependencies, id); return dependencies[id]; } });
  return new exports[name]();
}
const activation = (version = 'first') => ({ id: 'support', enabled: true, available: true, version, enableBlockers: [], disableBlockers: [] });

test('activation loading is independent of file settings and stale saves reload the current version', async () => {
  const paths = [], versions = [];
  let row = activation();
  const page = harness('modules', 'ModulesPage', {
    get: async path => { paths.push(path); assert.equal(path, 'administration/modules/activation'); return [row]; },
    post: async (_path, body) => {
      versions.push(body.version);
      if (versions.length === 1) { row = activation('other-admin'); throw new HttpErrorResponse(409); }
      return row = { ...row, enabled: body.enabled };
    },
  });
  await page.reload(); await page.save(page.data.value()[0], false);
  assert.equal(page.conflict(), true); assert.equal(page.enabled.support, true);
  await page.save(page.data.value()[0], false);
  assert.deepEqual(versions, ['first', 'other-admin']); assert.equal(page.enabled.support, false);
});

test('known disable blockers prevent posting an invalid activation change', async () => {
  const page = harness('modules', 'ModulesPage', { post: () => assert.fail('invalid change posted') });
  await page.save({ ...activation(), disableBlockers: ['invoicing'] }, false);
});

test('demo cancellation sends no request; enabling sends proof once and clears it', async () => {
  const requests = [];
  let settings = { demoMode: false, slowUploadMode: false, version: 'first', demoExpiryMinutes: 60 };
  const editor = harness('my-files-settings-editor', 'MyFilesSettingsEditor', {
    get: async () => settings,
    post: async (_path, body) => { requests.push(body); settings = { ...settings, demoMode: body.demoMode, version: 'saved' }; return settings; },
  });
  await editor.load(); editor.demoMode = true; editor.toggleDemo(true); editor.password = 'not-submitted'; editor.close();
  assert.equal(requests.length, 0); assert.equal(editor.password, ''); assert.equal(editor.data.value().demoMode, false);
  assert.equal(editor.demoMode, false);
  editor.toggleDemo(true); editor.password = 'test-proof'; await editor.enableDemo();
  assert.equal(requests.length, 1); assert.equal(requests[0].password, 'test-proof');
  assert.equal(editor.password, ''); assert.equal(editor.confirming(), false);
  assert.equal(editor.data.value().demoMode, true);
});

test('failed demo proof leaves activation unchanged and a stale settings version reloads without retrying', async () => {
  let status = 403, calls = 0;
  let settings = { demoMode: false, slowUploadMode: false, version: 'first' };
  const editor = harness('my-files-settings-editor', 'MyFilesSettingsEditor', {
    get: async () => settings,
    post: async () => { calls++; throw new HttpErrorResponse(status); },
  });
  await editor.load(); editor.demoMode = true; editor.toggleDemo(true); editor.password = 'wrong'; await editor.enableDemo();
  assert.equal(editor.data.value().demoMode, false); assert.equal(editor.failed(), true); assert.equal(editor.password, '');
  assert.equal(editor.demoMode, false);
  status = 409; settings = { ...settings, version: 'other-admin' };
  editor.password = 'test-proof'; await editor.enableDemo();
  assert.equal(calls, 2); assert.equal(editor.conflict(), true); assert.equal(editor.confirming(), false);
  assert.equal(editor.data.value().version, 'other-admin');
});
