import {mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
process.env.PLAYWRIGHT_BROWSERS_PATH ||= resolve('.tools/browsers');
const {chromium}=await import('@playwright/test');
const duration=Number(process.env.DURATION||1200),warmup=Number(process.env.WARMUP||30),url=process.env.BASE_URL||'http://127.0.0.1:4173';
await mkdir('reports/screenshots/performance',{recursive:true});
const browser=await chromium.launch({headless:true,channel:'chromium',args:['--use-angle=d3d11','--disable-background-timer-throttling','--disable-renderer-backgrounding']});
const context=await browser.newContext({viewport:{width:1920,height:1080}}),page=await context.newPage();
const report={timestamp:new Date().toISOString(),durationTarget:duration,warmupSeconds:warmup,browser:browser.version(),viewport:{width:1920,height:1080},quality:process.argv.includes('--high')?'high':'medium',method:'Real-time automated isolated preview with UI jetpack refresh every four seconds, periodic keyboard lane changes; no accelerated clock. Repeated restarts follow continuous play.',errors:[],samples:[],restarts:[]};
page.on('pageerror',e=>report.errors.push(e.message));
const read=()=>page.evaluate(()=>window.__SWITCHYARD_INSPECT__.read());
const screenshot=async name=>page.screenshot({path:`reports/screenshots/performance/${name}.png`});
try{
 await page.goto(`${url}/?inspect=1`,{waitUntil:'networkidle'});await page.waitForFunction(()=>!!window.__SWITCHYARD_INSPECT__);
 report.graphics=await page.locator('canvas').evaluate(c=>{const gl=c.getContext('webgl2');const d=gl.getExtension('WEBGL_debug_renderer_info');return{renderer:d?gl.getParameter(d.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER),vendor:gl.getParameter(gl.VENDOR),width:c.width,height:c.height};});
 report.navigation=await page.evaluate(()=>{const n=performance.getEntriesByType('navigation')[0];return{domContentLoadedMs:n.domContentLoadedEventEnd,loadMs:n.loadEventEnd,resources:performance.getEntriesByType('resource').map(r=>({name:r.name,bytes:r.encodedBodySize}))};});
 await page.getByRole('button',{name:'Settings',exact:true}).click();if(process.argv.includes('--high'))await page.getByLabel('Graphics quality').selectOption('high');await page.getByRole('button',{name:'Developer preview',exact:true}).click();await page.getByRole('button',{name:'Start isolated preview run',exact:true}).click();await page.getByRole('button',{name:'Easy difficulty',exact:true}).click();await page.getByRole('button',{name:'Start run · Easy',exact:true}).click();
 const initialSave=(await read()).save;let start=Date.now(),sampleStart=0,nextRefresh=0,nextReport=0,frameData=[];
 await page.evaluate(()=>{window.__perfFrames=[];window.__perfEnabled=false;let last=performance.now();function frame(t){if(window.__perfEnabled)window.__perfFrames.push(t-last);last=t;requestAnimationFrame(frame);}requestAnimationFrame(frame);});
 while(!sampleStart||(Date.now()-sampleStart)/1000<duration){
  const elapsed=(Date.now()-start)/1000;
  if(elapsed>=nextRefresh){await page.locator('.preview-tools').getByRole('button',{name:'Jetpack',exact:true}).click();await page.keyboard.press(Math.floor(elapsed/4)%2?'a':'d');nextRefresh=elapsed+4;}
  if(!sampleStart&&elapsed>=warmup){sampleStart=Date.now();await page.evaluate(()=>{window.__perfEnabled=true;window.__perfFrames=[];});await screenshot('warmup-complete');}
  if(sampleStart&&elapsed>=nextReport){const probe=await read();const frames=await page.evaluate(()=>window.__perfFrames.splice(0));frameData.push(...frames);const memory=await page.evaluate(()=>performance.memory?{used:performance.memory.usedJSHeapSize,total:performance.memory.totalJSHeapSize}:null);report.samples.push({seconds:(Date.now()-sampleStart)/1000,distance:probe.state.distance,phase:probe.state.phase,worldObjects:probe.state.objects.length,...probe.renderer,memory});await writeFile('reports/performance-progress.json',JSON.stringify(report,null,2));console.log(`Elapsed ${Math.round(elapsed)}s; distance ${Math.floor(probe.state.distance)}; ${probe.renderer.calls} draws; ${probe.renderer.geometries} geometries`);nextReport=elapsed+30;}
  await page.waitForTimeout(300);
 }
 frameData.push(...await page.evaluate(()=>{window.__perfEnabled=false;return window.__perfFrames.splice(0);}));report.measuredSeconds=(Date.now()-sampleStart)/1000;const sorted=frameData.filter(f=>f>0&&Number.isFinite(f)).sort((a,b)=>a-b);const percentile=p=>sorted[Math.min(sorted.length-1,Math.floor(sorted.length*p))];report.frameTimes={count:sorted.length,p50:percentile(.5),p90:percentile(.9),p95:percentile(.95),p99:percentile(.99),max:sorted.at(-1),mean:sorted.reduce((a,b)=>a+b,0)/sorted.length,over33ms:sorted.filter(x=>x>33.34).length};await screenshot('continuous-run-complete');
 for(let i=0;i<10;i++){await page.keyboard.press('p');await page.getByRole('button',{name:'End run & collect',exact:true}).click();await page.getByRole('button',{name:/Preview again/}).click();await page.waitForTimeout(300);report.restarts.push((await read()).renderer);}
 report.saveUnchanged=JSON.stringify((await read()).save)===JSON.stringify(initialSave);report.status=report.errors.length?'failed':'completed';
}catch(e){report.status='failed';report.failure=String(e.stack);console.error(e);await screenshot('failure').catch(()=>{});}finally{await writeFile('reports/performance.json',JSON.stringify(report,null,2));await browser.close();console.log('Performance report saved:',report.status);}
