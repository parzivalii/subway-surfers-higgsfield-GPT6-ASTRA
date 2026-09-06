import assert from 'node:assert/strict';
import {resolve} from 'node:path';
import {writeFile} from 'node:fs/promises';
process.env.PLAYWRIGHT_BROWSERS_PATH=resolve('.tools/browsers');
const {chromium}=await import('@playwright/test');
const browser=await chromium.launch({headless:true,channel:'chromium',args:['--use-angle=d3d11']});
const context=await browser.newContext(),page=await context.newPage();
const report={url:'http://127.0.0.1:4174/sprint/',timestamp:new Date().toISOString(),errors:[],status:'running'};
page.on('pageerror',e=>report.errors.push(e.message));
page.on('requestfailed',r=>report.errors.push(`${r.url()}: ${r.failure()?.errorText}`));
try{
 await page.goto(`${report.url}?inspect=1`);await page.getByText('OFFLINE READY',{exact:true}).waitFor();
 await page.getByRole('button',{name:'LET’S RUN ↵',exact:true}).click();await page.keyboard.press('a');
 assert.equal(await page.evaluate(()=>window.__SWITCHYARD_INSPECT__.read().state.player.targetLane),-1);
 await context.setOffline(true);await page.reload({waitUntil:'domcontentloaded'});
 await page.getByText('OFFLINE READY',{exact:true}).waitFor();
 await page.getByRole('button',{name:'LET’S RUN ↵',exact:true}).click();await page.keyboard.press('d');
 assert.equal(await page.evaluate(()=>window.__SWITCHYARD_INSPECT__.read().state.player.targetLane),1);
 assert.deepEqual(report.errors,[]);report.status='passed';
}catch(error){report.status='failed';report.failure=String(error.stack);process.exitCode=1;}
finally{await writeFile('reports/static-subpath.json',JSON.stringify(report,null,2));await browser.close();console.log(report);}
