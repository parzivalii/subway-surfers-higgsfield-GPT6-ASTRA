import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
const files=[];
function walk(dir){for(const f of readdirSync(dir)){const p=join(dir,f);if(statSync(p).isDirectory())walk(p);else if(!p.endsWith('sw.js'))files.push(p.replaceAll('\\','/').replace(/^dist\//,''));}}
walk('dist');
const version=createHash('sha256').update(files.map(f=>createHash('sha256').update(readFileSync(join('dist',f))).digest('hex')).join('')).digest('hex').slice(0,12);
const source=`const CACHE='switchyard-${version}';const FILES=${JSON.stringify(files)};
self.addEventListener('install',event=>event.waitUntil((async()=>{const cache=await caches.open(CACHE);await cache.addAll(FILES.map(f=>new URL(f,self.registration.scope).href));await self.skipWaiting();})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{for(const k of await caches.keys())if(k.startsWith('switchyard-')&&k!==CACHE)await caches.delete(k);await self.clients.claim();for(const c of await self.clients.matchAll())c.postMessage({type:'OFFLINE_READY',version:CACHE});})()));
self.addEventListener('message',event=>{if(event.data?.type==='CHECK_CACHE')event.waitUntil((async()=>{const cache=await caches.open(CACHE);let complete=true;for(const f of FILES)if(!await cache.match(new URL(f,self.registration.scope).href)){complete=false;break;}event.source?.postMessage({type:complete?'OFFLINE_READY':'OFFLINE_ERROR',version:CACHE});})());});
self.addEventListener('fetch',event=>{const request=event.request;if(request.method!=='GET'||new URL(request.url).origin!==self.location.origin)return;event.respondWith((async()=>{const cache=await caches.open(CACHE);const hit=await cache.match(request,{ignoreSearch:true,ignoreVary:true});if(hit)return hit;try{return await fetch(request);}catch(error){if(request.mode==='navigate')return await cache.match(new URL('index.html',self.registration.scope).href);throw error;}})());});`;
writeFileSync('dist/sw.js',source);
console.log(`Offline manifest ${version}: ${files.length} files, ${(files.reduce((n,f)=>n+statSync(join('dist',f)).size,0)/1048576).toFixed(2)} MiB.`);
