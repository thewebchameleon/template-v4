import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
const root=path.resolve(import.meta.dirname,'..');
const web=path.join(root,'src/TemplateV4.Angular');
const out=path.join(web,'dist/foundation');
// Owned Helm sources use workspace aliases during application development. Compile a
// staging tree with relative owned imports so lazy package chunks never depend on
// unpublished @spartan-ng/helm aliases in a downstream application.
const staging=path.join(root,'artifacts/foundation-package-source');
fs.mkdirSync(staging,{recursive:true});
for(const folder of ['src','libs','packaging'])fs.cpSync(path.join(web,folder),path.join(staging,folder),{recursive:true});
for(const file of ['tsconfig.json','public-api.ts'])fs.copyFileSync(path.join(web,file),path.join(staging,file));
// Package compilation needs the same module-owned source tree as the application.
for(const entry of fs.readdirSync(path.join(root,'modules/Bundled'),{withFileTypes:true})){
 if(!entry.isDirectory())continue;
 const source=path.join(root,'modules/Bundled',entry.name,'Frontend');
 if(fs.existsSync(source))fs.cpSync(source,path.join(staging,'modules/Bundled',entry.name,'Frontend'),{recursive:true});
}
fs.copyFileSync(path.join(root,'tools/discover-bundled-modules.mjs'),path.join(staging,'discover-bundled-modules.mjs'));
if(!fs.existsSync(path.join(staging,'node_modules')))fs.symlinkSync(path.join(web,'node_modules'),path.join(staging,'node_modules'),'junction');
const config=JSON.parse(fs.readFileSync(path.join(web,'tsconfig.json'),'utf8'));
const original=(target)=>{
 const relative=path.relative(staging,target);
 return relative.startsWith('modules'+path.sep)?path.join(root,relative):path.join(web,relative);
};
function rewrite(folder){for(const entry of fs.readdirSync(folder,{withFileTypes:true})){
 const target=path.join(folder,entry.name);if(entry.isDirectory())rewrite(target);
 else if(entry.name.endsWith('.ts')){const source=fs.readFileSync(target,'utf8');fs.writeFileSync(target,source.replace(/(['"])(\.[^'"\r\n]+)\1/g,(match,quote,id)=>{
   const resolved=path.resolve(path.dirname(original(target)),id);
   if(!resolved.startsWith(root+path.sep))return match;
   const staged=resolved.startsWith(path.join(root,'modules/Bundled')+path.sep)
     ?path.join(staging,path.relative(root,resolved)):path.join(staging,path.relative(web,resolved));
   let relative=path.relative(path.dirname(target),staged).replaceAll('\\','/');
   if(!relative.startsWith('.'))relative='./'+relative;
   return quote+relative+quote;
 }).replace(/(['"])(@spartan-ng\/helm\/[^'"]+)\1/g,(match,quote,id)=>{
  const owned=config.compilerOptions.paths[id]?.[0];if(!owned)throw new Error('Unknown owned component '+id);
  let relative=path.relative(path.dirname(target),path.join(staging,owned)).replaceAll('\\','/').replace(/\.ts$/,'');if(!relative.startsWith('.'))relative='./'+relative;return quote+relative+quote;
 }));}
}}
rewrite(path.join(staging,'src'));rewrite(path.join(staging,'libs'));rewrite(path.join(staging,'modules/Bundled'));
const packageConfig=JSON.parse(fs.readFileSync(path.join(staging,'packaging/ng-package.json'),'utf8'));packageConfig.dest=path.relative(path.join(staging,'packaging'),out).replaceAll('\\','/');
fs.writeFileSync(path.join(staging,'packaging/ng-package.json'),JSON.stringify(packageConfig));
const build=spawnSync(process.execPath,[path.join(web,'node_modules/ng-packagr/src/cli/main.js'),'-p','packaging/ng-package.json','-c','packaging/tsconfig.lib.json'],{cwd:staging,stdio:'inherit'});
if(build.status!==0)process.exit(build.status??1);
fs.mkdirSync(path.join(out,'styles'),{recursive:true});
for(const file of fs.readdirSync(path.join(web,'src')).filter(file=>file.endsWith('.css')))
  fs.copyFileSync(path.join(web,'src',file),path.join(out,'styles',file));
fs.appendFileSync(path.join(out,'styles/styles.css'),'\n@source "../fesm2022/**/*.mjs";\n');
fs.cpSync(path.join(web,'public/fonts'),path.join(out,'assets/fonts'),{recursive:true});
fs.copyFileSync(path.join(web,'public/theme-init.js'),path.join(out,'assets/theme-init.js'));
fs.copyFileSync(path.join(root,'THIRD-PARTY-NOTICES.md'),path.join(out,'THIRD-PARTY-NOTICES.md'));
const metadata=JSON.parse(fs.readFileSync(path.join(out,'package.json'),'utf8'));
metadata.exports['./styles/*']='./styles/*';metadata.exports['./assets/*']='./assets/*';metadata.sideEffects=['**/*.css'];
if(process.env.FOUNDATION_PACKAGE_VERSION)metadata.version=process.env.FOUNDATION_PACKAGE_VERSION;
fs.writeFileSync(path.join(out,'package.json'),JSON.stringify(metadata,null,2)+'\n');
console.log('Built Angular package with shared styles, fonts and theme initialization assets.');
