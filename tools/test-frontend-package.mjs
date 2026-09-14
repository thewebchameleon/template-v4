import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
const root=path.resolve(import.meta.dirname,'..');
const web=path.join(root,'src/TemplateV4.Angular');
const fixture=path.join(root,'artifacts/frontend-consumer');
const [version='0.2.0',previous]=process.argv.slice(2);
fs.mkdirSync(fixture,{recursive:true});
const packageJson=JSON.parse(fs.readFileSync(path.join(web,'package.json'),'utf8'));
delete packageJson.scripts;delete packageJson.packageManager;packageJson.name='foundation-consumer';
const npmPath=process.platform==='win32'?path.join(path.dirname(spawnSync('where.exe',['npm.cmd'],{encoding:'utf8'}).stdout.trim().split(/\r?\n/)[0]),'node_modules/npm/bin/npm-cli.js'):null;
function npm(args){const result=spawnSync(npmPath?process.execPath:'npm',npmPath?[npmPath,...args]:args,{cwd:fixture,stdio:'inherit'});if(result.status!==0)throw new Error('npm '+args[0]+' failed');}
fs.writeFileSync(path.join(fixture,'angular.json'),JSON.stringify({version:1,projects:{consumer:{projectType:'application',root:'',architect:{build:{builder:'@angular/build:application',options:{browser:'main.ts',index:'index.html',tsConfig:'tsconfig.json',styles:['styles.css'],assets:[{glob:'**/*',input:'node_modules/@templatev4/foundation/assets',output:'/'},{glob:'runtime-config.json',input:'.',output:'/'}],outputPath:'dist',optimization:{scripts:true,styles:{minify:true,inlineCritical:false},fonts:false}}}}}}}));
fs.writeFileSync(path.join(fixture,'tsconfig.json'),JSON.stringify({compilerOptions:{target:'ES2022',module:'preserve',moduleResolution:'bundler',experimentalDecorators:true,skipLibCheck:true,strict:true},angularCompilerOptions:{strictTemplates:true},files:['main.ts']}));
fs.writeFileSync(path.join(fixture,'main.ts'),"import { bootstrapApplication } from '@angular/platform-browser';\nimport { App, foundationConfig } from '@templatev4/foundation';\nbootstrapApplication(App, foundationConfig());\n");
fs.writeFileSync(path.join(fixture,'index.html'),'<!doctype html><html lang="en-ZA"><head><meta charset="utf-8"><base href="/"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Consumer branding</title><script src="/theme-init.js"></script></head><body><app-root></app-root></body></html>');
fs.writeFileSync(path.join(fixture,'styles.css'),'@import "@templatev4/foundation/styles/styles.css";\n:root { --consumer-brand-name: "Retained customization"; }\n');
fs.writeFileSync(path.join(fixture,'.postcssrc.json'),'{"plugins":{"@tailwindcss/postcss":{}}}');
fs.writeFileSync(path.join(fixture,'runtime-config.json'),JSON.stringify({apiUrl:'',defaultCulture:'en-ZA',supportedCultures:['en-ZA','af-ZA']}));
const before=fs.readFileSync(path.join(fixture,'styles.css'),'utf8');
for(const release of [previous,version].filter(Boolean)){
 packageJson.dependencies['@templatev4/foundation']='file:'+path.join(root,`artifacts/packages/${release}/templatev4-foundation-${release}.tgz`).replaceAll('\\','/');
 fs.writeFileSync(path.join(fixture,'package.json'),JSON.stringify(packageJson,null,2));npm(['install','--ignore-scripts','--no-audit','--no-fund']);npm(['install',packageJson.dependencies['@templatev4/foundation'].slice(5),'--ignore-scripts','--no-audit','--no-fund']);
 const result=spawnSync(process.execPath,[path.join(fixture,'node_modules/@angular/cli/bin/ng.js'),'build'],{cwd:fixture,stdio:'inherit'});if(result.status!==0)throw new Error('Artifact Angular build failed');
 if(!fs.existsSync(path.join(fixture,'dist/browser/fonts'))||!fs.existsSync(path.join(fixture,'dist/browser/theme-init.js')))throw new Error('Missing packaged assets');
 if(fs.readFileSync(path.join(fixture,'styles.css'),'utf8')!==before)throw new Error('Consumer branding overwritten');
}
console.log('Angular tgz consumer built; package assets and application customization preserved.');
