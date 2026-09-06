import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
const root = path.resolve(import.meta.dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'framework.json'), 'utf8'));
const projects = Object.values(manifest.projects).filter(value => fs.existsSync(path.join(root, value)) && fs.statSync(path.join(root, value)).isDirectory())
  .flatMap(directory => fs.readdirSync(path.join(root, directory)).filter(file => file.endsWith('.csproj')).map(file => path.join(directory, file)));
projects.push(
  'src/TemplateV4.Application.Tests/TemplateV4.Application.Tests.csproj',
  'src/TemplateV4.Ui.Tests/TemplateV4.Ui.Tests.csproj',
  'src/TemplateV4.Utility.Tests/TemplateV4.Utility.Tests.csproj'
);
let failed = false;
await Promise.all(projects.map(project => new Promise(resolve => {
  const child = spawn('dotnet', ['list', project, 'package', '--vulnerable', '--include-transitive', '--format', 'json'], { cwd: root });
  let output = ''; let errors = '';
  child.stdout.on('data', chunk => output += chunk); child.stderr.on('data', chunk => errors += chunk);
  child.on('error', error => { failed = true; console.error(error.message); resolve(); });
  child.on('close', code => {
    try {
      if (code !== 0) throw new Error(errors || output);
      const report = JSON.parse(output);
      if (report.problems?.some(problem => problem.level === 'error')) throw new Error(JSON.stringify(report.problems));
      const vulnerable = report.projects?.flatMap(item => item.frameworks ?? []).flatMap(item => [...item.topLevelPackages ?? [], ...item.transitivePackages ?? []]).filter(item => item.vulnerabilities?.length);
      if (vulnerable?.length) throw new Error(JSON.stringify(vulnerable));
      console.log(`${project}: no known vulnerabilities`);
    } catch (error) { failed = true; console.error(`${project}: ${error.message}`); }
    resolve();
  });
})));
process.exitCode = failed ? 1 : 0;
