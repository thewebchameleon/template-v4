import { spawnSync } from 'node:child_process';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '..');
const commands = [
  ['node', ['tools/framework.mjs', 'validate']],
  ['dotnet', ['restore', 'templatev4.slnx', '--locked-mode']],
  ['dotnet', ['format', 'templatev4.slnx', '--verify-no-changes', '--no-restore']],
  ['dotnet', ['build', 'templatev4.slnx', '--no-restore']],
  ['dotnet', ['test', 'tests/templatev4.Tests', '--no-build']],
  ['npm', ['run', 'format:check', '--prefix', 'src/Web']],
  ['npm', ['run', 'lint', '--prefix', 'src/Web']],
  ['npm', ['run', 'build', '--prefix', 'src/Web']],
  ['npm', ['audit', '--prefix', 'src/Web', '--audit-level=moderate']]
];
const start = performance.now();
for (let [exe, args] of commands) {
  if (exe === 'npm' && process.platform === 'win32') { args = [path.join(path.dirname(process.execPath), 'node_modules/npm/bin/npm-cli.js'), ...args]; exe = process.execPath; }
  const result = spawnSync(exe, args, { cwd: root, stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
console.log(`Verified in ${Math.round((performance.now() - start) / 1000)}s.`);
