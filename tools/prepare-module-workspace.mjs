import fs from 'node:fs';
import path from 'node:path';

// Module frontends share the host's pinned dependencies. Keep package export-map
// resolution intact instead of mapping npm subpaths to internal package files.
export function prepareModuleWorkspace(root) {
  const dependencies = path.join(root, 'src/TemplateV4.Angular/node_modules');
  const link = path.join(root, 'modules/node_modules');
  if (fs.existsSync(dependencies) && !fs.existsSync(link))
    fs.symlinkSync(dependencies, link, process.platform === 'win32' ? 'junction' : 'dir');
}
