import assert from 'node:assert/strict';
import {resolve} from 'node:path';
import {mkdir,writeFile} from 'node:fs/promises';
process.env.PLAYWRIGHT_BROWSERS_PATH ||= resolve('.tools/browsers');
const {chromium,firefox}=await import('@playwright/test');
const browserName=process.argv.includes('--firefox')?'firefox':'chromium';
const browser=await ({chromium,firefox}[browserName]).launch({headless:true,...(browserName==='chromium'?{channel:'chromium',args:['--use-angle=d3d11']}:{})});
const context=await browser.newContext({viewport:{width:1280,height:720}}),page=await context.newPage();
const report={timestamp:new Date().toISOString(),browser:browserName,checks:[],errors:[],externalRequests:[],status:'running'};
page.on('pageerror',e=>report.errors.push(e.message));
page.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1:4173')&&!r.url().startsWith('blob:')&&!r.url().startsWith('data:'))report.externalRequests.push(r.url());});
const read=()=>page.evaluate(()=>window.__SWITCHYARD_INSPECT__.read());
const click=name=>page.getByRole('button',{name,exact:true}).click();
const dialog=()=>page.getByRole('dialog',{name:'Choose your difficulty'});
const waitPhase=phase=>page.waitForFunction(p=>window.__SWITCHYARD_INSPECT__.read().state.phase===p,phase);
const shot=async name=>page.screenshot({path:`reports/screenshots/difficulty-${browserName}/${name}.png`});
const end=async()=>{if((await read()).state.phase==='caught')await click('Finish & collect rewards');else{await page.keyboard.press('p');await click('End run & collect');}await waitPhase('results');};
try{
  await mkdir(`reports/screenshots/difficulty-${browserName}`,{recursive:true});
  await page.goto('http://127.0.0.1:4173/?inspect=1',{waitUntil:'networkidle'});
  await page.getByText('OFFLINE READY',{exact:true}).waitFor();
  await shot('title-1280');
  const bounds=await page.locator('.difficulty-select').boundingBox(),playBounds=await page.locator('.play-button').boundingBox();
  assert.ok(bounds.y>=playBounds.y+playBounds.height);report.checks.push('Difficulty selector appears below Let’s Run');
  for(const viewport of [{width:1280,height:720},{width:1920,height:1080},{width:2560,height:1080}]){
    await page.setViewportSize(viewport);
    const boxes=await page.evaluate(()=>{const a=document.querySelector('.home-mission').getBoundingClientRect(),b=document.querySelector('.bottom-nav').getBoundingClientRect();return{a:a.bottom,b:b.top,overflow:document.documentElement.scrollWidth>innerWidth};});
    assert.equal(boxes.overflow,false);assert.ok(boxes.a<boxes.b,`Home mission overlaps navigation at ${viewport.width}`);
  }
  await page.setViewportSize({width:1280,height:720});
  await click('LET’S RUN ↵');await dialog().waitFor();assert.equal((await read()).state.phase,'ready');
  assert.equal(await page.getByRole('button',{name:'Start run',exact:true}).isEnabled(),false);
  await page.keyboard.press('Escape');assert.equal(await dialog().isVisible(),false);
  await page.keyboard.press('Enter');await dialog().waitFor();
  await page.keyboard.press('Shift+Tab');assert.equal(await page.evaluate(()=>document.activeElement.textContent.trim()),'Back');
  await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.getAttribute('aria-label')),'Easy difficulty');
  await shot('difficulty-selector');await page.keyboard.press('Escape');
  report.checks.push('Fresh run requires choice; Escape cancels; keyboard focus wraps');
  for(const [label,min,max] of [['Easy',12,26],['Normal',16,29],['Hard',20,32],['Impossible',26,36]]){
    await click('LET’S RUN ↵');await click(label+' difficulty');await shot('selected-'+label.toLowerCase());await click('Start run · '+label);await waitPhase('running');
    let probe=await read();assert.equal(probe.state.difficulty,label.toLowerCase());assert.ok(probe.state.speed>=min&&probe.state.speed<=max);assert.ok(probe.state.objects.length>0);
    await page.keyboard.press('a');await page.keyboard.press('w');await shot('gameplay-'+label.toLowerCase());
    await end();assert.equal((await read()).save.highScores.at(-1).difficulty!==undefined,true);
    await page.getByRole('button',{name:/^Run again/}).click();await waitPhase('running');assert.equal(await dialog().isVisible(),false);assert.equal((await read()).state.difficulty,label.toLowerCase());
    await end();await click('Back to the station');report.checks.push(label+': actual speed, keyboard movement, results, restart without prompt');
  }
  await click('Local challenges');await page.getByRole('button',{name:'Run this route',exact:true}).first().click();await click('Hard difficulty');await click('Start run · Hard');await waitPhase('running');
  const challenge=(await read()).state;await end();await page.getByRole('button',{name:/^Run again/}).click();await waitPhase('running');let probe=await read();assert.equal(probe.state.mode,'challenge');assert.equal(probe.state.seed,challenge.seed);assert.equal(probe.state.difficulty,'hard');await end();await click('Back to the station');report.checks.push('Challenge restart preserves seed, mode and difficulty');
  await page.reload({waitUntil:'networkidle'});probe=await read();assert.ok(probe.save.highScores.some(s=>s.difficulty==='impossible'));await click('Records');assert.ok(await page.getByRole('cell',{name:'Impossible',exact:true}).count());await click('Back');report.checks.push('Difficulty labels persist after reload and render in records');
  await context.setOffline(true);await page.reload({waitUntil:'domcontentloaded'});await page.getByText('OFFLINE READY',{exact:true}).waitFor();await click('LET’S RUN ↵');await click('Impossible difficulty');await click('Start run · Impossible');await waitPhase('running');assert.equal((await read()).state.difficulty,'impossible');await shot('offline-impossible');report.checks.push('New difficulty selection and play work after actual offline reload');
  assert.deepEqual(report.errors,[]);assert.deepEqual(report.externalRequests,[]);report.status='passed';
}catch(error){report.status='failed';report.failure=String(error.stack);process.exitCode=1;await shot('failure').catch(()=>{});}
finally{await writeFile(`reports/difficulty-${browserName}.json`,JSON.stringify(report,null,2));await browser.close();console.log(report);}
