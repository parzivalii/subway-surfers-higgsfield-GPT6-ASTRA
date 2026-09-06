import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {resolve,sep,extname} from 'node:path';
const args=process.argv.slice(2),option=(name,fallback)=>{const at=args.indexOf(name);return at<0?fallback:args[at+1];};
const port=Number(option('--port','4173')),base='/'+option('--base','').replace(/^\/+|\/+$/g,'')+'/',prefix=base==='//'?'/':base;
const root=resolve('dist');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.glb':'model/gltf-binary','.wav':'audio/wav','.woff':'font/woff','.woff2':'font/woff2','.txt':'text/plain; charset=utf-8','.json':'application/json'};
await stat(resolve(root,'index.html')).catch(()=>{throw Error('Production build missing. Run npm run build first.');});
const server=createServer(async(request,response)=>{
  try{
    if(!['GET','HEAD'].includes(request.method)){response.writeHead(405);response.end();return;}
    const pathname=decodeURIComponent(new URL(request.url,'http://localhost').pathname);
    if(!pathname.startsWith(prefix)){response.writeHead(404);response.end('Not found');return;}
    const path=resolve(root,pathname.slice(prefix.length)||'index.html');
    if(!path.startsWith(root+sep)){response.writeHead(403);response.end();return;}
    const bytes=await readFile(path);response.writeHead(200,{'Content-Type':types[extname(path)]||'application/octet-stream','Content-Length':bytes.length,'Cache-Control':'no-cache'});response.end(request.method==='HEAD'?undefined:bytes);
  }catch{response.writeHead(404);response.end('Not found');}
});
server.on('error',error=>{console.error(`Could not serve build: ${error.message}`);process.exitCode=1;});
server.listen(port,'127.0.0.1',()=>console.log(`Switchyard Sprint: http://127.0.0.1:${port}${prefix}`));
