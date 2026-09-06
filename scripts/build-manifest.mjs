import {readdirSync,readFileSync,writeFileSync,statSync,mkdirSync} from 'node:fs';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
const files=[];
function walk(dir){for(const name of readdirSync(dir).sort()){const path=join(dir,name);if(statSync(path).isDirectory())walk(path);else{const bytes=readFileSync(path);files.push({path:path.replaceAll('\\','/').slice(5),bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')});}}}
walk('dist');
const report={format:1,files,totalBytes:files.reduce((sum,file)=>sum+file.bytes,0),contentHash:createHash('sha256').update(JSON.stringify(files)).digest('hex')};
mkdirSync('reports',{recursive:true});
writeFileSync('reports/build-manifest.json',JSON.stringify(report,null,2)+'\n');
console.log(`${files.length} files; ${report.totalBytes} bytes; SHA-256 ${report.contentHash}`);
