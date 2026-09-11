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
  case 'modules': {
    const { inspectModules } = await import('./modules.mjs');
    console.log(JSON.stringify(inspectModules(root, manifest, kind ?? 'baseline'), null, 2));
    break;
  }
  case 'validate': {
    const { default: Ajv } = await import('../src/TemplateV4.Angular/node_modules/ajv/dist/2020.js');
    const validate = new Ajv().compile(JSON.parse(fs.readFileSync(path.join(root, 'framework.schema.json'), 'utf8')));
    if (!validate(manifest)) throw new Error(JSON.stringify(validate.errors));
    const { inspectModules } = await import('./modules.mjs');
    for (const preset of Object.keys(manifest.modulePresets)) inspectModules(root, manifest, preset);
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
    console.log(`Installed framework ${manifest.frameworkVersion}. No automatic migrations are available for this initial release. Review documentation/docs/upgrades.md before changing pins.`); break;
  case 'new': {
    if (!kind || !name || !/^[A-Z][A-Za-z0-9]{1,63}$/.test(name)) throw new Error('Usage: new <kind> <PascalCaseName>');
    const app = manifest.projects.Application;
    console.log('Scaffold: review its behavior and explicitly register it before use.');
    const header = `using TemplateV4.SharedKernel;\n\nnamespace TemplateV4.Application.${name};\n\n`;
    if (kind === 'feature' || kind === 'module') {
      const folder = `${app}/${name}`;
      const files = [
        [`${folder}/${name}.cs`, header + `public sealed record ${name}Query : IQuery<string>, IAuthorizedRequest\n{\n    public string Permission => "${name.toLowerCase()}.read";\n}\n\npublic sealed class ${name}Handler : IHandler<${name}Query, string>\n{\n    public Task<Result<string>> Handle(${name}Query request, CancellationToken cancellationToken)\n        => Task.FromResult(Result<string>.Success("${name}"));\n}\n`],
        [`${manifest.projects.API}/Endpoints/${name}Endpoints.cs`, `using TemplateV4.Application;\nusing TemplateV4.Application.${name};\nusing TemplateV4.SharedKernel;\n\nnamespace TemplateV4.ApiService.Endpoints;\n\npublic static class ${name}Endpoints\n{\n    public static RouteGroupBuilder Map${name}(this RouteGroupBuilder group)\n    {\n        group.MapGet("/${name.toLowerCase()}", async (Dispatcher<${name}Query, string> dispatcher, CancellationToken ct) => (await dispatcher.Send(new(), ct)).ToHttp()).RequireAuthorization("${name.toLowerCase()}.read").WithName("Get${name}");\n        return group;\n    }\n}\n`],
        [`${manifest.projects.Web}/src/app/features/${name.toLowerCase()}.ts`, `import { Component } from '@angular/core';\nimport { WorkspaceUi } from '../shared/workspace';\n@Component({selector:'app-${name.toLowerCase()}',imports:[WorkspaceUi],template:'<app-page-header title="${name.toLowerCase()}.title" description="${name.toLowerCase()}.description" /><section hlmCard><div hlmCardHeader><h2 hlmCardTitle>${name}</h2></div><div hlmCardContent></div></section>'})\nexport class ${name}Page {}\n`],
        [`${folder}/README.md`, `# ${name}\n\nThis read-only starter returns its feature name. Replace that behavior with your Application contract.\n\nRegister IHandler<${name}Query, string> with ${name}Handler, seed ${name.toLowerCase()}.read and its authorization policy, call api.Map${name}(), and add the lazy Angular route. Regenerate API clients, replace the page text with localisation keys, and add behavioral tests. For writes follow documentation/docs/user-management.md: explicit validator, transaction, domain event, outbox and BackgroundWorker consumer.\n`]
      ];
      if (kind === 'module') {
        files[1][1] = files[1][1].replace('.RequireAuthorization(', `.RequireModule("${name.toLowerCase()}").RequireAuthorization(`);
        files.push(
          [`modules/scaffolds/${name.toLowerCase()}.json`, JSON.stringify({ id: name.toLowerCase(), required: false, enabledByDefault: false, dependencies: ['identity'] }, null, 2) + '\n'],
          [`${manifest.projects.Domain}/${name}/README.md`, `# ${name} domain\n\nOwn business invariants here. Keep this layer BCL-only.\n`],
          [`${manifest.projects.Infrastructure}/${name}/README.md`, `# ${name} infrastructure\n\nOwn focused persistence, provider adapters and explicit registration here. Do not access other module tables directly.\n`],
          [`${manifest.projects.Worker}/${name}/README.md`, `# ${name} worker\n\nOwn scheduling and consumers here. Define disable/drain behavior before registering a job.\n`],
          [`${manifest.documentation}/modules/${name.toLowerCase()}.md`, `# ${name}\n\nStatus: Scaffold, disabled and unregistered.\n\nReview modules/scaffolds/${name.toLowerCase()}.json and explicitly merge its descriptor into modules/catalog.json after implementing the slice. Register handlers and permissions, gate endpoints with RequireModule, and guard UI routes with moduleGuard. Define settings, migration ownership, retention, event contracts and disable behavior. Add focused behavioral tests before activation.\n`],
        );
      }
      if (files.some(([file]) => fs.existsSync(path.join(root, file)))) throw new Error('Feature target already exists; no files written.');
      for (const file of files) write(...file);
      break;
    }
    const templates = {
      command: [`${app}/${name}/${name}.cs`, header + `public sealed record ${name} : ICommand<Unit>;\n\npublic sealed class ${name}Validator : IValidator<${name}>\n{\n    public Dictionary<string, string[]> Validate(${name} request) => new() { ["request"] = ["${name.toLowerCase()}.not_configured"] };\n}\n\npublic sealed class ${name}Handler : IHandler<${name}, Unit>\n{\n    public Task<Result<Unit>> Handle(${name} request, CancellationToken cancellationToken) => Task.FromResult(Result.Fail("${name.toLowerCase()}.not_configured", ErrorKind.Validation));\n}\n`],
      query: [`${app}/${name}/${name}.cs`, header + `public sealed record ${name} : IQuery<Unit>;\n\npublic sealed class ${name}Handler : IHandler<${name}, Unit>\n{\n    public Task<Result<Unit>> Handle(${name} request, CancellationToken cancellationToken) => Task.FromResult(Result.Fail("${name.toLowerCase()}.not_configured", ErrorKind.NotFound));\n}\n`],
      entity: [`${manifest.projects.Domain}/${name}.cs`, `namespace TemplateV4.Domain;\n\npublic sealed class ${name}\n{\n    public Guid Id { get; private set; } = Guid.NewGuid();\n    public Guid Version { get; private set; } = Guid.NewGuid();\n}\n`],
      permission: [`${app}/${name}/${name}Permissions.cs`, header + `public static class ${name}Permissions\n{\n    public const string Read = "${name.toLowerCase()}.read";\n}\n`],
      event: [`${app}/${name}/${name}.cs`, header + `public sealed record ${name}(Guid Id, string Culture) : IIntegrationEvent;\n`],
      consumer: [`${manifest.projects.Worker}/${name}Consumer.cs`, `using TemplateV4.SharedKernel;\n\nnamespace TemplateV4.BackgroundWorker;\n\npublic sealed class ${name}Consumer(TemplateV4.Infrastructure.Persistence.FrameworkDb db) : IIntegrationConsumer\n{\n    public string Contract => "${name.toLowerCase()}.v1";\n    public Task Handle(MessageEnvelope message, CancellationToken cancellationToken)\n    {\n        db.Audit.Add(new() { Action = "${name.toLowerCase()}.received", SubjectId = message.Id, ActorId = message.ActorId, At = DateTimeOffset.UtcNow });\n        return Task.CompletedTask; // LocalTransport commits this with its inbox receipt.\n    }\n}\n`],
      endpoint: [`${manifest.projects.API}/Endpoints/${name}Endpoints.cs`, `namespace TemplateV4.ApiService.Endpoints;\n\npublic static class ${name}Endpoints\n{\n    public static RouteGroupBuilder Map${name}(this RouteGroupBuilder group)\n    {\n        // Register explicit dispatcher-backed endpoints and permission policies here.\n        return group;\n    }\n}\n`],
      job: [`${manifest.projects.Worker}/${name}Job.cs`, `using Quartz;\nnamespace TemplateV4.BackgroundWorker;\n\n[DisallowConcurrentExecution]\npublic sealed class ${name}Job : IJob\n{\n    public ValueTask Execute(IJobExecutionContext context, CancellationToken cancellationToken)\n    {\n        cancellationToken.ThrowIfCancellationRequested();\n        context.Result = "${name.toLowerCase()}.completed";\n        return ValueTask.CompletedTask; // Read-only starter. For durable writes use the JobRun lifecycle.\n    }\n}\n`],
      email: [`${manifest.projects.Infrastructure}/EmailTemplates/${name}.json`, JSON.stringify({ Email: { Templates: { [name]: { 'en-ZA': {subject:name,body:name}, 'af-ZA': {subject:name,body:name} } } } }, null, 2) + '\n'],
      localisation: [`${manifest.projects.Web}/src/app/core/locales/${name}.ts`, `export const ${name}Translations: Record<string, [string, string]> = { '${name.toLowerCase()}.title': ['${name}', '${name}'] };\n`],
      page: [`${manifest.projects.Web}/src/app/features/${name.toLowerCase()}.ts`, `import { Component } from '@angular/core';\nimport { WorkspaceUi } from '../shared/workspace';\n@Component({selector:'app-${name.toLowerCase()}',imports:[WorkspaceUi],template:'<app-page-header title="${name.toLowerCase()}.title" description="${name.toLowerCase()}.description" /><section hlmCard><div hlmCardHeader><h2 hlmCardTitle>{{ \"${name.toLowerCase()}.title\" | t }}</h2></div><div hlmCardContent></div></section>'})\nexport class ${name}Page {}\n`],
      adr: [`${manifest.adrs}/${name}.md`, `# ${name}\n\nStatus: Proposed\n\n## Context\n\n## Decision\n\n## Consequences\n\n## Enforcement and extension points\n`],
      feature: [`${app}/${name}/README.md`, `# ${name}\n\nFollow documentation/docs/user-management.md. Scaffold command, validator, handler, permission and endpoint, then register them explicitly. Add transaction/outbox and architecture tests before enabling this feature.\n`]
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
  default: console.log('templatev4 CLI: inspect | modules [baseline|minimal] | validate | doctor | dev-init | dev | clients | upgrade | new <kind|module> <Name>');
}
