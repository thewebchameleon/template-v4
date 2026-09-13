import { spawnSync } from 'node:child_process';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '..');
const commands = [
  ['node', ['tools/framework.mjs', 'validate']],
  ['dotnet', ['restore', 'src/TemplateV4.slnx', '--locked-mode']],
  ['dotnet', ['format', 'src/TemplateV4.slnx', '--verify-no-changes', '--no-restore']],
  ['dotnet', ['build', 'src/TemplateV4.slnx', '--no-restore']],
  ['npm', ['run', 'format:check', '--prefix', 'src/TemplateV4.Angular']],
  ['npm', ['run', 'lint', '--prefix', 'src/TemplateV4.Angular']],
  ['npm', ['run', 'build', '--prefix', 'src/TemplateV4.Angular']],
  ['npm', ['audit', '--prefix', 'src/TemplateV4.Angular', '--audit-level=moderate']],
  ['node', ['--test', 'tools/auth-retry.test.mjs']],
  ['dotnet', ['test', 'src/TemplateV4.slnx', '--no-build']]
];
const start = performance.now();
for (let [exe, args] of commands) {
  if (exe === 'npm' && process.platform === 'win32') { args = [path.join(path.dirname(process.execPath), 'node_modules/npm/bin/npm-cli.js'), ...args]; exe = process.execPath; }
  const result = spawnSync(exe, args, { cwd: root, stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
console.log(`Verified in ${Math.round((performance.now() - start) / 1000)}s.`);
