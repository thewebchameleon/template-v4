import fs from "node:fs";
import path from "node:path";
export function scaffoldBusiness(root, name) {
  const manifestPath = fs.existsSync(path.join(root, "framework.json"))
    ? path.join(root, "framework.json")
    : path.join(import.meta.dirname, "../framework.json");
  const foundationVersion = JSON.parse(
    fs.readFileSync(manifestPath, "utf8"),
  ).frameworkVersion;
  const [major, minor] = foundationVersion.split(".").map(Number);
  const id = name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
  const folder = `modules/Private/${name}`;
  const namespace = `TemplateV4.${name}`;
  const files = new Map();
  for (const layer of ["Domain", "Application", "Infrastructure", "Api"]) {
    const references =
      layer === "Domain"
        ? ""
        : layer === "Application"
          ? `<ProjectReference Include="../Domain/${namespace}.Domain.csproj"/><ProjectReference Include="../../../../src/TemplateV4.Application/TemplateV4.Application.csproj"/>`
          : layer === "Infrastructure"
            ? `<ProjectReference Include="../Application/${namespace}.Application.csproj"/>`
            : `<ProjectReference Include="../Infrastructure/${namespace}.Infrastructure.csproj"/><ProjectReference Include="../../../../src/TemplateV4.Http/TemplateV4.Http.csproj"/>`;
    files.set(
      `${folder}/${layer}/${namespace}.${layer}.csproj`,
      `<Project Sdk="Microsoft.NET.Sdk${layer === "Api" ? ".Web" : ""}"><PropertyGroup><OutputType>Library</OutputType></PropertyGroup><ItemGroup>${references}${layer === "Infrastructure" ? '<FrameworkReference Include="Microsoft.AspNetCore.App"/>' : ""}</ItemGroup></Project>\n`,
    );
  }
  files.set(
    `${folder}/module.json`,
    JSON.stringify(
      {
        id,
        version: "0.1.0",
        foundationCompatibility: {
          min: foundationVersion,
          maxExclusive: `${major}.${minor + 1}.0`,
        },
        dependencyVersions: {},
        category: "private",
        required: false,
        enabledByDefault: false,
        runtimeConfigurable: true,
        dependencies: ["crm"],
        capabilities: [],
        host: {
          configure: `${namespace}.Api.ModuleHost.Configure`,
          map: `${namespace}.Api.ModuleHost.Map`,
          services: `${namespace}.Infrastructure.ModuleServices.Register`,
          feature: `${name[0].toLowerCase() + name.slice(1)}Feature`,
        },
      },
      null,
      2,
    ) + "\n",
  );
  files.set(
    `${folder}/Infrastructure/ModuleServices.cs`,
    `using Microsoft.Extensions.Configuration;\nusing Microsoft.Extensions.DependencyInjection;\nnamespace ${namespace}.Infrastructure;\npublic static class ModuleServices\n{\n    public static void Register(IServiceCollection services, IConfiguration configuration)\n    {\n        // Register owned providers and IMigrationContributor here.\n    }\n}\n`,
  );
  files.set(
    `${folder}/Api/ModuleHost.cs`,
    `namespace ${namespace}.Api;\npublic static class ModuleHost\n{\n    public static void Configure(WebApplicationBuilder builder) => ${namespace}.Infrastructure.ModuleServices.Register(builder.Services, builder.Configuration);\n    public static void Map(WebApplication app)\n    {\n        // Map owned, authorized and capability-gated endpoints here.\n    }\n}\n`,
  );
  files.set(
    `${folder}/Frontend/public-api.ts`,
    `import type { FoundationFeature } from '@templatev4/foundation';\nexport const ${name[0].toLowerCase() + name.slice(1)}Feature: FoundationFeature = { id: '${id}', routes: [], translations: {} };\n`,
  );
  files.set(
    `${folder}/README.md`,
    `# ${name}\n\nAutomatically discovered business starter, initially disabled in Administration. Implement owned operations, provider/HTTP registration in ModuleServices and ModuleHost, and a separate DbContext/migration history. The module.json host entries and Frontend/public-api.ts are discovered on build; no host edits are required. Reference foundation Application contracts; never query another module's tables. Generate identifiers and OpenAPI in this root. Own package metadata and generator configuration inside this module. Rebuild, run the Migrator, and enable the module in Administration after implementing and validating its operations. See documentation/docs/modules.md.\n`,
  );
  files.set(
    `${folder}/Docs/README.md`,
    `# ${name} module design\n\nDocument owned use cases, public integration contracts, persistence and disable/retention behavior here. Use PascalCase backend and test folders and lowercase/kebab-case folders inside Frontend. Follow documentation/docs/modules.md in the foundation repository.\n`,
  );
  files.set(
    `${folder}/Tests/README.md`,
    `# ${name} verification\n\nPlace behavioral tests under their owning concern or use case. Register a module-owned test project here when implementing operations. Persistence requires real PostgreSQL coverage.\n`,
  );
  for (const relative of files.keys())
    if (fs.existsSync(path.join(root, relative)))
      throw new Error("Refusing to overwrite " + relative);
  for (const [relative, content] of files) {
    const target = path.join(root, relative);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, content, { flag: "wx" });
  }
  console.log(
    `Created ${folder}; select its ID with tools/select-business-modules.mjs before building; initially disabled in Administration.`,
  );
}
