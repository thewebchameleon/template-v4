import fs from 'node:fs';
import path from 'node:path';

export function resolveModules(definitions, overrides = {}) {
  if (!Array.isArray(definitions) || definitions.length === 0) throw new Error('Empty module catalog.');
  const known = new Map();
  for (const definition of definitions) {
    if (!definition || !/^[a-z0-9-]+$/.test(definition.id) || typeof definition.required !== 'boolean' ||
        typeof definition.enabledByDefault !== 'boolean' || !Array.isArray(definition.dependencies) ||
        definition.dependencies.some(x => typeof x !== 'string')) throw new Error('Invalid module descriptor.');
    if (known.has(definition.id)) throw new Error(`Duplicate module ${definition.id}.`);
    known.set(definition.id, definition);
  }
  for (const [id, value] of Object.entries(overrides)) {
    if (!known.has(id)) throw new Error(`Unknown module ${id}.`);
    if (typeof value !== 'boolean') throw new Error(`Module ${id} must be a boolean.`);
  }
  const visited = new Set();
  const visiting = new Set();
  function visit(id) {
    if (visited.has(id)) return;
    if (visiting.has(id)) throw new Error(`Module dependency cycle at ${id}.`);
    visiting.add(id);
    for (const dependency of known.get(id).dependencies) {
      if (!known.has(dependency)) throw new Error(`Unknown dependency ${dependency}.`);
      visit(dependency);
    }
    visiting.delete(id);
    visited.add(id);
  }
  for (const id of known.keys()) visit(id);
  const enabled = Object.fromEntries(definitions.map(x => [x.id, Object.hasOwn(overrides, x.id) ? overrides[x.id] : x.enabledByDefault]));
  for (const definition of definitions) {
    if (definition.required && !enabled[definition.id]) throw new Error(`Required module ${definition.id} cannot be disabled.`);
    if (enabled[definition.id]) for (const dependency of definition.dependencies)
      if (!enabled[dependency]) throw new Error(`Module ${definition.id} requires ${dependency}.`);
  }
  return enabled;
}

export function inspectModules(root, manifest, preset = 'baseline') {
  if (!Object.hasOwn(manifest.modulePresets, preset)) throw new Error(`Unknown module preset ${preset}.`);
  const read = relative => {
    const absolute = path.resolve(root, relative);
    if (!absolute.startsWith(path.resolve(root) + path.sep)) throw new Error('Module path must stay in the repository.');
    return JSON.parse(fs.readFileSync(absolute, 'utf8'));
  };
  const configuration = read(manifest.modulePresets[preset]);
  if (!configuration.Modules || Object.keys(configuration).some(key => key !== 'Modules')) throw new Error('Invalid module preset.');
  const enabled = resolveModules(read(manifest.moduleCatalog), configuration.Modules);
  return { ModulesPreset: preset, Modules: enabled };
}
