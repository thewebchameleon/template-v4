import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
const workspace = path.resolve(import.meta.dirname);
const generated = path.resolve(workspace, 'src/app/api');
if (!generated.startsWith(workspace + path.sep) || path.relative(workspace, generated) !== path.join('src', 'app', 'api')) throw new Error('Unexpected generated directory.');
fs.rmSync(generated, { recursive: true, force: true });
const result = spawnSync(process.execPath, [path.join(workspace, 'node_modules/ng-openapi-gen/lib/index.js')], { cwd: workspace, stdio: 'inherit' });
process.exit(result.status ?? 1);
