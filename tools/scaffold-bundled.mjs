import fs from 'node:fs';
import path from 'node:path';

export function scaffoldBundled(root, name) {
  const directory = path.join(root, 'modules/Bundled', name);
  const id = name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
  const version = JSON.parse(fs.readFileSync(path.join(root, 'framework.json'), 'utf8')).frameworkVersion;
  const namespace = `TemplateV4.Bundled.${name}`;
  const files = new Map();
  const project = (layer, references, web = false) => `<Project Sdk="Microsoft.NET.Sdk${web ? '.Web' : ''}"><PropertyGroup><OutputType>Library</OutputType><IsPackable>true</IsPackable><Version>${version}</Version></PropertyGroup><ItemGroup>${references.map(reference => `<ProjectReference Include="${reference}" />`).join('')}<Using Include="TemplateV4.SharedKernel" /></ItemGroup></Project>\n`;
  files.set(`Domain/TemplateV4.${name}.Domain.csproj`, project('Domain', []));
  files.set(`Application/TemplateV4.${name}.Application.csproj`, project('Application', [`../Domain/TemplateV4.${name}.Domain.csproj`, '../../../../src/TemplateV4.Application/TemplateV4.Application.csproj']));
  files.set(`Infrastructure/TemplateV4.${name}.Infrastructure.csproj`, project('Infrastructure', [`../Application/TemplateV4.${name}.Application.csproj`, '../../../../src/TemplateV4.Infrastructure/TemplateV4.Infrastructure.csproj']));
  files.set(`Api/TemplateV4.${name}.Api.csproj`, project('Api', [`../Infrastructure/TemplateV4.${name}.Infrastructure.csproj`, '../../../../src/TemplateV4.Http.Shared/TemplateV4.Http.Shared.csproj'], true));
  files.set('Infrastructure/ModuleServices.cs', `using Microsoft.Extensions.DependencyInjection;\nusing Microsoft.Extensions.Configuration;\nnamespace ${namespace};\npublic static class ModuleServices\n{\n    public static void Register(IServiceCollection services, IConfiguration configuration)\n    {\n        // Register handlers, owned persistence and recovery dependencies here.\n    }\n}\n`);
  files.set('Api/ModuleHost.cs', `namespace ${namespace};\npublic static class ModuleHost\n{\n    public static void Map(WebApplication app)\n    {\n        // Map authorized endpoints with OwnedByModule and RequireCapability.\n    }\n}\n`);
  files.set('Frontend/public-api.ts', `import type { FoundationFeature } from '../../../../src/TemplateV4.Angular/src/app/core/feature-extensions';\nexport const ${name[0].toLowerCase() + name.slice(1)}Feature: FoundationFeature = { id: '${id}', routes: [] };\n`);
  files.set('module.json', JSON.stringify({ id, version, category: 'foundation', required: false, enabledByDefault: false, runtimeConfigurable: true, dependencies: ['identity'], host: { services: `${namespace}.ModuleServices.Register`, map: `${namespace}.ModuleHost.Map`, feature: name[0].toLowerCase() + name.slice(1) + 'Feature' }, projects: Object.fromEntries(['Domain', 'Application', 'Infrastructure', 'Api'].map(layer => [layer, `${layer}/TemplateV4.${name}.${layer}.csproj`])) }, null, 2) + '\n');
  files.set('README.md', `# ${name}\n\nImplement the vertical slice before enabling it. Add the descriptor lifecycle fields to modules/catalog.json, declare permissions, regenerate IDs, and add a forward core activation-row migration. New owned tables and migration histories belong to this module's Infrastructure/Persistence. Keep dependencies registered while disabled. See documentation/docs/modules.md.\n`);
  if (fs.existsSync(directory)) throw new Error(`Module already exists: ${name}`);
  for (const [file, content] of files) { const target = path.join(directory, file); fs.mkdirSync(path.dirname(target), { recursive: true }); fs.writeFileSync(target, content, { flag: 'wx' }); }
  console.log(`Created modules/Bundled/${name}; finish its implementation and catalog entry before enabling it.`);
}
