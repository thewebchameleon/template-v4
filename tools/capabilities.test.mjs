import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import vm from 'node:vm';
const require = createRequire(new URL('../src/TemplateV4.Angular/package.json', import.meta.url));
const ts = require('typescript');
const rx = require('rxjs');

function harness() {
  const requests = [];
  const http = { get: url => { const response = new rx.Subject(); requests.push({ url, response }); return response; } };
  const dependencies = {
    '@angular/core': {
      Injectable: () => target => target,
      inject: token => token === 'http' ? http : { apiUrl: 'https://api.test' },
      signal: initial => { let value = initial; const signal = () => value; signal.set = next => { value = next; }; return signal; },
    },
    '@angular/common/http': { HttpClient: 'http' },
    '@angular/router': {},
    './auth': {},
    './runtime': { Runtime: 'runtime' },
    rxjs: rx,
  };
  const exports = {};
  const source = readFileSync(new URL('../src/TemplateV4.Angular/src/app/core/features.ts', import.meta.url), 'utf8');
  const compiled = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, experimentalDecorators: true } }).outputText;
  vm.runInNewContext(compiled, { exports, require: name => { assert.ok(name in dependencies, name); return dependencies[name]; } });
  return { features: new exports.Features(), requests };
}

test('capability discovery coalesces requests and refreshes on later navigation', async () => {
  const { features, requests } = harness();
  const first = features.load();
  assert.equal(features.load(), first);
  assert.equal(requests.length, 1);
  assert.equal(requests[0].url, 'https://api.test/api/v1/capabilities');
  requests[0].response.next({ 'file-storage': true });
  await first;
  assert.equal(features.enabled('file-storage'), true);
  assert.equal(features.state(), 'ready');
  assert.equal(features.enabled('support'), false);
  const refresh = features.load();
  requests[1].response.error(new Error('offline'));
  await refresh;
  assert.equal(features.enabled('file-storage'), false);
  assert.equal(features.state(), 'error');
  const retry = features.load();
  assert.equal(features.state(), 'loading');
  requests[2].response.next({ 'file-storage': false });
  await retry;
  assert.equal(features.state(), 'ready');
  assert.equal(features.enabled('file-storage'), false);
});

test('a previous actor response cannot restore stale capabilities or finish the new actor guard early', async () => {
  const { features, requests } = harness();
  const previous = features.load();
  features.reset();
  const current = features.load();
  requests[0].response.next({ 'file-storage': true });
  await Promise.resolve();
  assert.equal(features.enabled('file-storage'), false);
  requests[1].response.next({ support: true });
  await Promise.all([previous, current]);
  assert.equal(features.enabled('file-storage'), false);
  assert.equal(features.enabled('support'), true);
  assert.equal(requests.length, 2);
});
