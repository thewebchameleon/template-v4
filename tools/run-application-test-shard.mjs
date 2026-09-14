import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = path.resolve(import.meta.dirname, '..');
const directory = path.join(root, 'src/TemplateV4.Application.Tests');
const shard = Number(process.argv[2]);
const shardCount = Number(process.argv[3]);
if (!Number.isInteger(shard) || !Number.isInteger(shardCount) || shard < 0 || shard >= shardCount)
  throw new Error('Usage: node tools/run-application-test-shard.mjs <zero-based-shard> <shard-count>');

const methods = [];
for (const file of fs.readdirSync(directory).filter(name => name.endsWith('.cs'))) {
  const source = fs.readFileSync(path.join(directory, file), 'utf8');
  if (!source.includes('partial class SecurityAndMessagingTests')) continue;
  const expression = /\[(?:Fact|Theory)\](?:\s*\[[^\]]+\])*\s*public\s+(?:async\s+)?(?:Task(?:<[^>\n]+>)?|ValueTask(?:<[^>\n]+>)?|void)\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(/g;
  for (const match of source.matchAll(expression)) methods.push(match[1]);
}

const unique = [...new Set(methods)].sort();
if (!unique.length) throw new Error('No SecurityAndMessagingTests methods were discovered.');
const selected = unique.filter((_, index) => index % shardCount === shard);
if (!selected.length) throw new Error(`Shard ${shard + 1}/${shardCount} is empty.`);

const filter = selected
  .map(name => `FullyQualifiedName=TemplateV4.Application.Tests.SecurityAndMessagingTests.${name}`)
  .join('|');
console.log(`Running application integration shard ${shard + 1}/${shardCount}: ${selected.length}/${unique.length} methods.`);

const result = spawnSync('dotnet', [
  'test',
  'src/TemplateV4.Application.Tests/TemplateV4.Application.Tests.csproj',
  '-c', 'Release',
  '--no-build',
  '--logger', `trx;LogFileName=application-shard-${shard + 1}.trx`,
  '--filter', filter
], { cwd: root, stdio: 'inherit', env: process.env });

if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
