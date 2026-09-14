import path from 'node:path';
import { spawn } from 'node:child_process';

const root = path.resolve(import.meta.dirname, '..');
const child = spawn(
  'dotnet',
  ['list', 'src/TemplateV4.slnx', 'package', '--vulnerable', '--include-transitive', '--format', 'json'],
  { cwd: root }
);

let output = '';
let errors = '';
child.stdout.on('data', chunk => output += chunk);
child.stderr.on('data', chunk => errors += chunk);

child.on('error', error => {
  console.error(error.message);
  process.exitCode = 1;
});

child.on('close', code => {
  if (code !== 0) {
    console.error(errors || output);
    process.exitCode = 1;
    return;
  }

  try {
    const report = JSON.parse(output);
    const problems = (report.problems ?? []).filter(problem => {
      const project = problem.project ?? '';
      const text = problem.text ?? '';
      return !(project.endsWith('.esproj') && text.includes('package.config'));
    });
    if (problems.some(problem => problem.level === 'error'))
      throw new Error(JSON.stringify(problems));

    const projects = (report.projects ?? []).filter(project => (project.path ?? '').endsWith('.csproj'));
    const vulnerable = projects.flatMap(project =>
      (project.frameworks ?? []).flatMap(framework =>
        [...(framework.topLevelPackages ?? []), ...(framework.transitivePackages ?? [])]
          .filter(item => item.vulnerabilities?.length)
          .map(item => ({ project: project.path ?? project.name, framework: framework.framework, ...item }))
      )
    );

    if (vulnerable.length) throw new Error(JSON.stringify(vulnerable));
    console.log(`NuGet audit passed for ${projects.length} package-reference projects.`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
});
