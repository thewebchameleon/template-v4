#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { generateKeyPairSync } from 'node:crypto';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'framework.json'), 'utf8'));
const [command, kind, name] = process.argv.slice(2);
let npmCli = process.platform === 'win32' ? path.join(path.dirname(spawnSync('where.exe', ['npm.cmd'], {encoding:'utf8'}).stdout.trim().split(/\r?\n/)[0]), 'node_modules/npm/bin/npm-cli.js') : null;
if (npmCli) { const prefix = spawnSync(process.execPath, [path.join(path.dirname(npmCli), 'npm-prefix.js')], {encoding:'utf8'}).stdout.trim(); const preferred = path.join(prefix, 'node_modules/npm/bin/npm-cli.js'); if (fs.existsSync(preferred)) npmCli = preferred; }
const run = (exe, args, cwd = root) => {
  if (exe === 'npm' && process.platform === 'win32') { args = [npmCli, ...args]; exe = process.execPath; }
  const result = spawnSync(exe, args, { cwd, stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status ?? 1);
};
const write = (relative, content) => {
  const target = path.resolve(root, relative);
  if (!target.startsWith(root + path.sep)) throw new Error('Target must stay in the repository.');
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content, { flag: 'wx' });
  console.log(relative);
};
switch (command) {
  case 'inspect': console.log(JSON.stringify(manifest, null, 2)); break;
  case 'validate': {
    const { default: Ajv } = await import('../src/Web/node_modules/ajv/dist/2020.js');
    const validate = new Ajv().compile(JSON.parse(fs.readFileSync(path.join(root, 'framework.schema.json'), 'utf8')));
    if (!validate(manifest)) throw new Error(JSON.stringify(validate.errors));
    const sdk = JSON.parse(fs.readFileSync(path.join(root, 'global.json'), 'utf8')).sdk.version;
    if (sdk !== manifest.toolchains.dotnet) throw new Error('SDK manifest mismatch.');
    const frontend = JSON.parse(fs.readFileSync(path.join(root, manifest.projects.Web, 'package.json'), 'utf8'));
    if (frontend.engines.node !== manifest.toolchains.node || frontend.packageManager !== `npm@${manifest.toolchains.npm}` || frontend.dependencies['@angular/core'] !== manifest.toolchains.angular || frontend.dependencies['@spartan-ng/brain'] !== manifest.toolchains.spartan) throw new Error('Frontend toolchain manifest mismatch.');
    const documentation = JSON.parse(fs.readFileSync(path.join(root, manifest.projects.Documentation, 'package.json'), 'utf8'));
    if (documentation.engines.node !== manifest.toolchains.node || documentation.packageManager !== `npm@${manifest.toolchains.npm}` || documentation.devDependencies['@docmd/core'] !== manifest.toolchains.docmd) throw new Error('Documentation toolchain manifest mismatch.');
    for (const [name, version] of Object.entries({ ...frontend.dependencies, ...frontend.devDependencies })) if (!/^\d+\.\d+\.\d+$/.test(version)) throw new Error(`Unpinned dependency: ${name}`);
    for (const [name, version] of Object.entries({ ...documentation.dependencies, ...documentation.devDependencies })) if (!/^\d+\.\d+\.\d+$/.test(version)) throw new Error(`Unpinned documentation dependency: ${name}`);
    if (fs.readFileSync(path.join(root, '.nvmrc'), 'utf8').trim() !== manifest.toolchains.node) throw new Error('Node toolchain mismatch.');
    for (const value of Object.values(manifest.projects)) if (!fs.existsSync(path.join(root, value))) throw new Error(`Missing project ${value}`);
    if (!manifest.cultures.supported.includes(manifest.cultures.default)) throw new Error('Unsupported default culture.');
    console.log('Framework manifest valid.'); break;
  }
  case 'doctor':
    for (const [exe, expected] of [['dotnet',manifest.toolchains.dotnet], ['node',manifest.toolchains.node]]) { const actual = spawnSync(exe, ['--version'], {encoding:'utf8'}); if (actual.status !== 0 || actual.stdout.trim().replace(/^v/,'') !== expected) throw new Error(`${exe} does not match ${expected}`); }
    const npmVersion = spawnSync(npmCli ? process.execPath : 'npm', npmCli ? [npmCli, '--version'] : ['--version'], {encoding:'utf8'});
    if (npmVersion.status !== 0 || npmVersion.stdout.trim() !== manifest.toolchains.npm) throw new Error(`npm does not match ${manifest.toolchains.npm}`);
    console.log(`Expected toolchains: ${JSON.stringify(manifest.toolchains)}`);
    run('dotnet', ['--version']); run('node', ['--version']); run('npm', ['--version']); run('docker', ['version']); break;
  case 'dev-init': {
    fs.mkdirSync(path.join(root, '.local/keys'), { recursive: true });
    const privatePath = path.join(root, '.local/jwt.pem');
    if (!fs.existsSync(privatePath)) {
      const keys = generateKeyPairSync('rsa', { modulusLength: 3072, privateKeyEncoding: { type: 'pkcs8', format: 'pem' }, publicKeyEncoding: { type: 'spki', format: 'pem' } });
      fs.writeFileSync(privatePath, keys.privateKey, { mode: 0o600 });
    }
    run('dotnet', ['dev-certs', 'https', '--trust']);
    run('dotnet', ['dev-certs', 'https', '--export-path', '.local/web.pem', '--format', 'Pem', '--no-password']);
    console.log('Local signing key ready. On an empty database, read the administrator bootstrap token from the API console.'); break;
  }
  case 'dev': run('node', ['tools/framework.mjs', 'dev-init']); run('dotnet', ['run', '--project', manifest.projects.AppHost]); break;
  case 'clients': run('npm', ['run', 'generate:api'], path.join(root, manifest.projects.Web)); break;
  case 'upgrade':
    console.log(`Installed framework ${manifest.frameworkVersion}. No automatic migrations are available for this initial release. Review docs/upgrades.md before changing pins.`); break;
  case 'new': {
    if (!kind || !name || !/^[A-Z][A-Za-z0-9]{1,63}$/.test(name)) throw new Error('Usage: new <kind> <PascalCaseName>');
    const app = manifest.projects.Application;
    console.log('Scaffold: review its behavior and explicitly register it before use.');
    const header = `namespace templatev4.Application.${name};\n\n`;
    if (kind === 'feature') {
      const folder = `${app}/${name}`;
      const files = [
        [`${folder}/${name}.cs`, header + `public sealed record ${name}Query : IQuery<string>, IAuthorizedRequest\n{\n    public string Permission => "${name.toLowerCase()}.read";\n}\n\npublic sealed class ${name}Handler : IHandler<${name}Query, string>\n{\n    public Task<Result<string>> Handle(${name}Query request, CancellationToken cancellationToken)\n        => Task.FromResult(Result<string>.Success("${name}"));\n}\n`],
        [`${manifest.projects.API}/${name}Endpoints.cs`, `using templatev4.Application;\nusing templatev4.Application.${name};\nnamespace templatev4.API;\n\npublic static class ${name}Endpoints\n{\n    public static RouteGroupBuilder Map${name}(this RouteGroupBuilder group)\n    {\n        group.MapGet("/${name.toLowerCase()}", async (Dispatcher<${name}Query, string> dispatcher, CancellationToken ct) => (await dispatcher.Send(new(), ct)).ToHttp()).RequireAuthorization("${name.toLowerCase()}.read").WithName("Get${name}");\n        return group;\n    }\n}\n`],
        [`${manifest.projects.Web}/src/app/features/${name.toLowerCase()}.ts`, `import { Component } from '@angular/core';\nimport { HlmCardImports } from '@spartan-ng/helm/card';\n@Component({selector:'app-${name.toLowerCase()}',imports:[HlmCardImports],template:'<section hlmCard><div hlmCardHeader><h1 hlmCardTitle>${name}</h1><p hlmCardDescription>${name} feature</p></div><div hlmCardContent></div><div hlmCardFooter></div></section>'})\nexport class ${name}Page {}\n`],
        [`${folder}/README.md`, `# ${name}\n\nThis read-only starter returns its feature name. Replace that behavior with your Application contract.\n\nRegister IHandler<${name}Query, string> with ${name}Handler, seed ${name.toLowerCase()}.read and its authorization policy, call api.Map${name}(), and add the lazy Angular route. Regenerate API clients, replace the page text with localisation keys, and add behavioral tests. For writes follow docs/user-management.md: explicit validator, transaction, domain event, outbox and Worker consumer.\n`]
      ];
      if (files.some(([file]) => fs.existsSync(path.join(root, file)))) throw new Error('Feature target already exists; no files written.');
      for (const file of files) write(...file);
      break;
    }
    const templates = {
      command: [`${app}/${name}/${name}.cs`, header + `public sealed record ${name} : ICommand<Unit>;\n\npublic sealed class ${name}Validator : IValidator<${name}>\n{\n    public Dictionary<string, string[]> Validate(${name} request) => new() { ["request"] = ["${name.toLowerCase()}.not_configured"] };\n}\n\npublic sealed class ${name}Handler : IHandler<${name}, Unit>\n{\n    public Task<Result<Unit>> Handle(${name} request, CancellationToken cancellationToken) => Task.FromResult(Result.Fail("${name.toLowerCase()}.not_configured", ErrorKind.Validation));\n}\n`],
      query: [`${app}/${name}/${name}.cs`, header + `public sealed record ${name} : IQuery<Unit>;\n\npublic sealed class ${name}Handler : IHandler<${name}, Unit>\n{\n    public Task<Result<Unit>> Handle(${name} request, CancellationToken cancellationToken) => Task.FromResult(Result.Fail("${name.toLowerCase()}.not_configured", ErrorKind.NotFound));\n}\n`],
      entity: [`${manifest.projects.Domain}/${name}.cs`, `namespace templatev4.Domain;\n\npublic sealed class ${name}\n{\n    public Guid Id { get; private set; } = Guid.NewGuid();\n    public Guid Version { get; private set; } = Guid.NewGuid();\n}\n`],
      permission: [`${app}/${name}/${name}Permissions.cs`, header + `public static class ${name}Permissions\n{\n    public const string Read = "${name.toLowerCase()}.read";\n}\n`],
      event: [`${app}/${name}/${name}.cs`, header + `public sealed record ${name}(Guid Id, string Culture) : IIntegrationEvent;\n`],
      consumer: [`${manifest.projects.Worker}/${name}Consumer.cs`, `namespace templatev4.Worker;\n\npublic sealed class ${name}Consumer(templatev4.Infrastructure.Persistence.FrameworkDb db) : templatev4.Application.IIntegrationConsumer\n{\n    public string Contract => "${name.toLowerCase()}.v1";\n    public Task Handle(templatev4.Application.MessageEnvelope message, CancellationToken cancellationToken)\n    {\n        db.Audit.Add(new() { Action = "${name.toLowerCase()}.received", SubjectId = message.Id, ActorId = message.ActorId, At = DateTimeOffset.UtcNow });\n        return Task.CompletedTask; // LocalTransport commits this with its inbox receipt.\n    }\n}\n`],
      endpoint: [`${manifest.projects.API}/${name}Endpoints.cs`, `namespace templatev4.API;\n\npublic static class ${name}Endpoints\n{\n    public static RouteGroupBuilder Map${name}(this RouteGroupBuilder group)\n    {\n        // Register explicit dispatcher-backed endpoints and permission policies here.\n        return group;\n    }\n}\n`],
      job: [`${manifest.projects.Worker}/${name}Job.cs`, `using Quartz;\nnamespace templatev4.Worker;\n\n[DisallowConcurrentExecution]\npublic sealed class ${name}Job : IJob\n{\n    public Task Execute(IJobExecutionContext context)\n    {\n        context.CancellationToken.ThrowIfCancellationRequested();\n        context.Result = "${name.toLowerCase()}.completed";\n        return Task.CompletedTask; // Read-only starter. For durable writes use the JobRun lifecycle.\n    }\n}\n`],
      email: [`${manifest.projects.Infrastructure}/EmailTemplates/${name}.json`, JSON.stringify({ Email: { Templates: { [name]: { 'en-ZA': {subject:name,body:name}, 'af-ZA': {subject:name,body:name} } } } }, null, 2) + '\n'],
      localisation: [`${manifest.projects.Web}/src/app/core/locales/${name}.ts`, `export const ${name}Translations: Record<string, [string, string]> = { '${name.toLowerCase()}.title': ['${name}', '${name}'] };\n`],
      page: [`${manifest.projects.Web}/src/app/features/${name.toLowerCase()}.ts`, `import { Component } from '@angular/core';\nimport { HlmCardImports } from '@spartan-ng/helm/card';\n@Component({selector:'app-${name.toLowerCase()}',imports:[HlmCardImports],template:'<section hlmCard><div hlmCardHeader><h1 hlmCardTitle>${name}</h1><p hlmCardDescription>Add localised page description.</p></div><div hlmCardContent></div><div hlmCardFooter></div></section>'})\nexport class ${name}Page {}\n`],
      adr: [`${manifest.adrs}/${name}.md`, `# ${name}\n\nStatus: Proposed\n\n## Context\n\n## Decision\n\n## Consequences\n\n## Enforcement and extension points\n`],
      feature: [`${app}/${name}/README.md`, `# ${name}\n\nFollow docs/user-management.md. Scaffold command, validator, handler, permission and endpoint, then register them explicitly. Add transaction/outbox and architecture tests before enabling this feature.\n`]
    };
    if (kind === 'migration') { run('dotnet', ['ef', 'migrations', 'add', name, '--project', manifest.projects.Infrastructure, '--output-dir', 'Persistence/Migrations']); break; }
    if (!templates[kind]) throw new Error(`Unknown scaffold kind: ${kind}`);
    write(...templates[kind]);
    if (kind === 'localisation') {
      const target = path.join(root, manifest.projects.Web, 'src/app/core/translations.ts');
      const current = fs.readFileSync(target, 'utf8');
      fs.writeFileSync(target, `import { ${name}Translations } from './locales/${name}';\n` + current.replace('= {', `= {\n  ...${name}Translations,`));
    }
    break;
  }
  default: console.log('templatev4 CLI: inspect | validate | doctor | dev-init | dev | clients | upgrade | new <kind> <Name>');
}
