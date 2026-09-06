import assert from 'node:assert/strict';
import {resolve} from 'node:path';
import {writeFile} from 'node:fs/promises';
process.env.PLAYWRIGHT_BROWSERS_PATH=resolve('.tools/browsers');
const {chromium}=await import('@playwright/test');
const browser=await chromium.launch({headless:true,channel:'chromium',args:['--use-angle=d3d11']});
const page=await browser.newPage();
const report={timestamp:new Date().toISOString(),status:'running',checks:[]};
try{
 await page.route('**/models/pip-default.glb',async route=>{await new Promise(resolve=>setTimeout(resolve,1800));await route.abort();});
 await page.goto('http://127.0.0.1:4173/?inspect=1',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>Boolean(window.__SWITCHYARD_INSPECT__));await page.keyboard.press('Enter');
 assert.equal(await page.evaluate(()=>window.__SWITCHYARD_INSPECT__.read().state.phase),'ready');report.checks.push('Enter cannot start while models are loading');
 await page.getByRole('heading',{name:'A model missed its train.'}).waitFor();await page.keyboard.press('Enter');
 assert.equal(await page.evaluate(()=>window.__SWITCHYARD_INSPECT__.read().state.phase),'ready');report.checks.push('Failed asset blocks hidden gameplay and shows retry');
 await page.unroute('**/models/pip-default.glb');await page.getByRole('button',{name:'Retry loading local models'}).click();
 await page.getByRole('heading',{name:'Bringing the city to life'}).waitFor({state:'hidden'});
 await page.getByRole('button',{name:'LET’S RUN ↵',exact:true}).click();
 await page.waitForFunction(()=>window.__SWITCHYARD_INSPECT__.read().state.phase==='running');report.checks.push('Retry reloads local assets and permits play');
 report.status='passed';
}catch(error){report.status='failed';report.failure=String(error.stack);process.exitCode=1;}
finally{await writeFile('reports/asset-failure.json',JSON.stringify(report,null,2));await browser.close();console.log(report);}
