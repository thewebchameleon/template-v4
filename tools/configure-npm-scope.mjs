import fs from 'node:fs';
import path from 'node:path';
const scope=process.argv[2];
if(!scope||!/^@[a-z0-9][a-z0-9-]*$/.test(scope))throw new Error('Set NPM_PACKAGE_SCOPE to the explicit lowercase GitHub owner scope.');
const file=path.resolve(import.meta.dirname,'../src/TemplateV4.Angular/dist/foundation/package.json');
const metadata=JSON.parse(fs.readFileSync(file,'utf8'));metadata.name=scope+'/foundation';
metadata.publishConfig={registry:'https://npm.pkg.github.com'};
fs.writeFileSync(file,JSON.stringify(metadata,null,2)+'\n');
