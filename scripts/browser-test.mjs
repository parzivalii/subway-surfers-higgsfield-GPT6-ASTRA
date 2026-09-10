import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

process.env.PLAYWRIGHT_BROWSERS_PATH ||= resolve('.tools/browsers');
const { chromium, firefox } = await import('@playwright/test');
const browserName = process.argv.includes('--firefox') ? 'firefox' : process.env.BROWSER || 'chromium';
const offlineTest = process.argv.includes('--production') || process.env.OFFLINE === '1';
const baseURL = process.env.BASE_URL || (offlineTest ? 'http://127.0.0.1:4173' : 'http://127.0.0.1:5173');
const label = `${browserName}-${offlineTest ? 'production' : 'development'}`;
const reportDir = resolve('reports');
const screenshotDir = resolve(reportDir, 'screenshots', label);
await mkdir(screenshotDir, { recursive: true });
const report = { browser: browserName, baseURL, offlineTest, timestamp: new Date().toISOString(), viewport: { width: 1280, height: 720 }, steps: [], pageErrors: [], consoleErrors: [], externalRequests: [], screenshots: [] };
const browser = await ({ chromium, firefox }[browserName]).launch({ headless: true, ...(browserName === 'chromium' ? { channel:'chromium', args: ['--use-angle=d3d11','--disable-dev-shm-usage'] } : {}) });
report.version = browser.version();
const context = await browser.newContext({ viewport: report.viewport, acceptDownloads: true });
const page = await context.newPage();
page.setDefaultTimeout(15000);
page.on('pageerror', error => report.pageErrors.push(error.message));
page.on('console', message => { if (message.type() === 'error') report.consoleErrors.push(message.text()); });
page.on('request', request => {
  const url = request.url();
  if (/^https?:/.test(url) && new URL(url).origin !== new URL(baseURL).origin) report.externalRequests.push(url);
});
const read = () => page.evaluate(() => window.__SWITCHYARD_INSPECT__.read());
const waitState = (predicate, timeout = 15000) => page.waitForFunction(predicate, undefined, { timeout });
const phase = async (name, timeout) => {
  if(name==='running'){
    await page.waitForFunction(()=>window.__SWITCHYARD_INSPECT__.read().state.phase==='running'||Boolean(document.querySelector('.difficulty-modal')),undefined,{timeout});
    if(await page.getByRole('dialog',{name:'Choose your difficulty'}).isVisible()){
      await page.getByRole('button',{name:'Easy difficulty',exact:true}).click();
      await page.getByRole('button',{name:'Start run · Easy',exact:true}).click();
    }
  }
  return page.waitForFunction(p => window.__SWITCHYARD_INSPECT__.read().state.phase === p, name, { timeout });
};
const screenshot = async name => { const path = resolve(screenshotDir, `${name}.png`); await page.screenshot({ path, fullPage: true }); report.screenshots.push(path); };
const click = name => page.getByRole('button', { name, exact: true }).click();
const back = () => click('Back');
const home = () => click('Back to the station');
const finish = async () => { const snapshot = await read(); if (snapshot.state.phase === 'running' || snapshot.state.phase === 'countdown') await page.keyboard.press('Escape'); await phase('paused'); await click('End run & collect'); await phase('results'); };
const step = async (name, fn) => {
  const started = Date.now(); process.stdout.write(`${label}: ${name} ... `);
  try { await fn(); report.steps.push({ name, status: 'passed', durationMs: Date.now() - started }); process.stdout.write('passed\n'); }
  catch (error) { report.steps.push({ name, status: 'failed', durationMs: Date.now() - started, error: String(error.stack || error) }); process.stdout.write(`FAILED: ${error.message}\n`); await screenshot(`failure-${report.steps.length}`).catch(() => {}); throw error; }
};
const importSave = async value => {
  await click('Settings'); await click('Import save'); await page.getByPlaceholder('Paste your exported save here').fill(JSON.stringify(value));
  await click('Validate & import save'); await back();
};

try {
  await step('Initial local load, genuine renderer, title and responsive layout', async () => {
    const before = Date.now(); await page.goto(`${baseURL}/?inspect=1`, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => Boolean(window.__SWITCHYARD_INSPECT__));
    assert.equal((await read()).error, ''); assert.equal(await page.locator('canvas').count(), 1);
    report.initialLoadMs = Date.now() - before;
    report.graphics = await page.locator('canvas').evaluate(canvas => {
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl'); if (!gl) return {};
      const extension = gl.getExtension('WEBGL_debug_renderer_info');
      return { renderer: extension ? gl.getParameter(extension.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER), vendor: extension ? gl.getParameter(extension.UNMASKED_VENDOR_WEBGL) : gl.getParameter(gl.VENDOR), width: canvas.width, height: canvas.height };
    });
    await screenshot('title-1280');
    for (const width of [1920, 2560]) {
      await page.setViewportSize({ width, height: 1080 }); await page.waitForTimeout(200);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      await screenshot(`title-${width}`);
    }
    await page.setViewportSize(report.viewport);
  });

  await step('Fresh player tutorial early exit does not grant completion', async () => {
    await click('First time here? Learn the moves ↗'); await phase('running'); await finish();
    assert.equal((await read()).save.tutorialComplete, false); assert.equal((await read()).save.statistics.runs, 0); await home();
  });

  await step('Interactive tutorial, one-press lanes, airborne movement, down input, board and results', async () => {
    await click('First time here? Learn the moves ↗'); await phase('running');
    await page.keyboard.press('a');
    await waitState(() => window.__SWITCHYARD_INSPECT__.read().state.distance >= 44);
    await page.keyboard.press('d'); await page.keyboard.press('d');
    assert.equal((await read()).state.player.targetLane, 1);
    await page.keyboard.down('a'); await page.keyboard.down('a');
    assert.equal((await read()).state.player.targetLane, 0); await page.keyboard.up('a');
    await page.keyboard.press('d');
    await waitState(() => window.__SWITCHYARD_INSPECT__.read().state.distance >= 90);
    await page.keyboard.press('w'); await page.keyboard.press('a'); await page.waitForTimeout(120);
    assert.ok((await read()).state.player.y > 0); assert.equal((await read()).state.player.targetLane, 0);
    await page.keyboard.press('s'); { const afterDown=(await read()).state.player; assert.ok(afterDown.vy < 0 || afterDown.grounded, 'Down initiates fast descent or has already landed'); }
    await waitState(() => window.__SWITCHYARD_INSPECT__.read().state.player.grounded);
    await page.keyboard.press('s'); await page.keyboard.press('Space');
    assert.ok((await read()).state.effects.board > 0); await screenshot('tutorial-gameplay');
    await phase('results', 30000);
    const save = (await read()).save; assert.equal(save.tutorialComplete, true); assert.equal(save.statistics.runs, 0); assert.equal(save.boardCharges, 3);
    await screenshot('tutorial-results'); await home();
  });

  await step('Normal run pause, frozen timers, countdown, crash, paid revive and results/restart', async () => {
    await page.keyboard.press('Enter'); await phase('running'); await page.keyboard.press('Space');
    await page.keyboard.press('p'); await phase('paused'); const paused = await read(); await page.waitForTimeout(350); const still = await read();
    assert.equal(still.state.distance, paused.state.distance); assert.equal(still.state.effects.board, paused.state.effects.board);
    await page.keyboard.press('p'); await phase('countdown'); await phase('running', 5000);
    await screenshot('gameplay');
    await phase('caught', 90000); const before = await read(); await screenshot('caught');
    await page.getByRole('button', { name: /^Revive ·/ }).click(); await phase('countdown'); await phase('running', 5000);
    assert.equal((await read()).save.tokens, before.save.tokens - 1); assert.equal((await read()).state.revives, 1);
    await finish(); await screenshot('results'); const settled = (await read()).save; assert.equal(settled.statistics.runs, 1); assert.equal(settled.highScores.length, 1);
    await page.getByRole('button', { name: /Run again/ }).click(); await phase('running');
    await finish(); assert.equal((await read()).save.statistics.runs, 2); await home();
    await page.reload({ waitUntil: 'networkidle' }); await page.waitForFunction(() => Boolean(window.__SWITCHYARD_INSPECT__));
    assert.equal((await read()).save.statistics.runs, 2);
  });

  await step('Save import, all five characters and all ten outfits are usable through menus', async () => {
    const actual = (await read()).save;
    // An explicit import through the real UI prepares inventory; each unlock/equip is an actual UI transaction.
    await importSave({ ...actual, coins: 5000, tokens: 10, headstarts: 2, boardCharges: 30 });
    await click('Crew');
    for (const [id, name] of [['pip', 'Pip'], ['rumi', 'Rumi'], ['tavi', 'Tavi'], ['jett', 'Jett'], ['nori', 'Nori']]) {
      await page.locator('.character-tabs button').filter({ hasText: name }).click();
      if (id !== 'pip') await page.getByRole('button', { name: new RegExp(`^Unlock ${name}`) }).click();
      let equip = page.getByRole('button', { name: 'Equip this look', exact: true }); if (await equip.count()) await equip.click();
      assert.equal((await read()).save.equipped.outfit, `${id}-default`);
      await screenshot(`crew-${id}-default`);
      await page.locator('.outfit-options button').nth(1).click(); await page.getByRole('button', { name: /^Unlock outfit/ }).click();
      await click('Equip this look'); assert.equal((await read()).save.equipped.outfit, `${id}-alt`);
      await screenshot(`crew-${id}-alt`);
    }
    assert.equal((await read()).save.unlocked.characters.length, 5); assert.equal((await read()).save.unlocked.outfits.length, 10); await back();
  });

  await step('Both boards, supplies and all twelve duration upgrades transact and persist', async () => {
    await click('Boards'); await screenshot('board-tide');
    await page.locator('.board-tabs button').filter({ hasText: 'Ember' }).click(); await page.getByRole('button', { name: /^Unlock · 180/ }).click(); await click('Equip board');
    assert.equal((await read()).save.equipped.board, 'ember'); await screenshot('board-ember');
    const charges = (await read()).save.boardCharges; await click('Get 3 charges · 30 coins'); assert.equal((await read()).save.boardCharges, charges + 3); await back();
    await click('Shop');
    for (const name of ['Coin magnet duration', 'Jetpack duration', 'Super-jump shoes duration', 'Score boost duration']) {
      const card = page.locator('.shop-card').filter({ has: page.getByRole('heading', { name, exact: true }) });
      for (let level = 0; level < 3; level++) await card.getByRole('button').click();
      assert.equal(await card.getByRole('button').isDisabled(), true);
    }
    assert.ok(Object.values((await read()).save.upgrades).every(level => level === 3)); await screenshot('shop-upgrades'); await back();
    await page.reload({ waitUntil: 'networkidle' }); await page.waitForFunction(() => Boolean(window.__SWITCHYARD_INSPECT__));
    assert.equal((await read()).save.equipped.outfit, 'nori-alt'); assert.equal((await read()).save.equipped.board, 'ember');
  });

  await step('Missions, box reward exactly once, achievements, records and local challenge', async () => {
    await click('Missions'); await screenshot('missions');
    if ((await read()).save.boxes.length) { const before = (await read()).save.boxes.length; await click('Open reward box'); assert.equal((await read()).save.boxes.length, before - 1); }
    await click('View achievements'); assert.equal(await page.locator('.achievement').count(), 14); await screenshot('achievements'); await back();
    await click('Records'); assert.ok(await page.locator('tbody tr').count() > 0); await screenshot('records'); await back();
    await click('Local challenges'); assert.equal(await page.locator('.challenge').count(), 3); await screenshot('challenges');
    await page.getByRole('button', { name: 'Run this route', exact: true }).first().click(); await phase('running');
    assert.equal((await read()).state.seed, 17329); assert.equal((await read()).state.mode, 'challenge'); await finish(); await home();
  });

  await step('Settings, keyboard rebind, reset defaults, export/import validation, and reset cancel', async () => {
    await click('Settings'); await page.getByLabel('Graphics quality').selectOption('low');
    await page.getByLabel('Music volume').fill('0.2'); await page.getByLabel('Effects volume').fill('0.4');
    await page.getByLabel(/Reduced motion/).check(); await page.getByLabel(/Camera shake/).uncheck();
    assert.equal((await read()).save.settings.quality, 'low'); await page.getByRole('main').getByRole('button', {name:'Keyboard controls',exact:true}).click();
    await page.locator('.controls-list > div').first().getByRole('button', { name: 'Rebind' }).click(); await page.keyboard.press('j');
    assert.deepEqual((await read()).save.settings.bindings.left, ['KeyJ']); await screenshot('controls'); await back();
    await page.keyboard.press('Enter'); await phase('running'); await page.keyboard.press('j'); assert.equal((await read()).state.player.targetLane, -1); await finish(); await home();
    await click('Settings'); await page.getByRole('main').getByRole('button', {name:'Keyboard controls',exact:true}).click(); await click('Restore default bindings'); assert.deepEqual((await read()).save.settings.bindings.left, ['KeyA', 'ArrowLeft']); await back();
    await click('Settings'); const downloadPromise = page.waitForEvent('download'); await click('Export save'); const download = await downloadPromise; await download.saveAs(resolve(reportDir, `${label}-export.json`));
    await click('Import save'); await page.getByPlaceholder('Paste your exported save here').fill('{broken'); const before = (await read()).save;
    await click('Validate & import save'); assert.deepEqual((await read()).save, before);
    await click('Reset progress'); await click('Keep my progress'); assert.deepEqual((await read()).save, before);
    await screenshot('settings'); await back();
  });

  await step('Isolated preview overlap, repeat pickup, pause/expiry and no normal save changes', async () => {
    const before = (await read()).save;
    await click('Settings'); await click('Developer preview'); await page.getByLabel('Character', { exact: true }).selectOption('pip');
    await page.getByLabel('Outfit', { exact: true }).selectOption('pip-alt'); await page.getByLabel('Board', { exact: true }).selectOption('tide');
    await page.getByLabel('Power-up', { exact: true }).selectOption('jetpack'); await click('Start isolated preview run'); await phase('running');
    for (const name of ['Coin magnet', 'Super-jump shoes', 'Score boost']) await page.locator('.preview-tools').getByRole('button', { name, exact: true }).click();
    let state = (await read()).state; for (const key of ['magnet', 'jetpack', 'shoes', 'multiplier']) assert.ok(state.effects[key] > 0);
    await screenshot('preview-overlap'); await page.keyboard.press('p'); await phase('paused'); const paused = (await read()).state.effects; await page.waitForTimeout(400);
    assert.deepEqual((await read()).state.effects, paused); assert.equal(await page.getByRole('button', { name: 'Settings', exact: true }).count(), 0);
    await page.keyboard.press('p'); await phase('running', 5000);
    await page.locator('.preview-tools').getByRole('button', { name: 'Coin magnet', exact: true }).click();
    assert.ok((await read()).state.effects.magnet > 18);
    await waitState(() => window.__SWITCHYARD_INSPECT__.read().state.effects.jetpack === 0, 25000);
    // A natural hazard may end a preview after flight; either outcome remains isolated.
    state = (await read()).state;
    if (state.phase === 'running') { await page.keyboard.press('Space'); assert.ok((await read()).state.effects.board > 0); await finish(); }
    else if (state.phase === 'caught') { await click('Finish & collect rewards'); await phase('results'); }
    assert.deepEqual((await read()).save, before);
    await page.keyboard.press('Enter'); await phase('running'); assert.equal((await read()).state.preview, true);
    await finish(); await home(); assert.deepEqual((await read()).save, before);
  });

  await step('Focus loss, graphics context recovery, credits and fullscreen control', async () => {
    await page.keyboard.press('Enter'); await phase('running');
    await page.evaluate(()=>window.dispatchEvent(new Event('blur'))); await phase('paused');
    const paused=(await read()).state.distance; await page.waitForTimeout(250); assert.equal((await read()).state.distance,paused);
    await click('Resume run ↵'); await phase('countdown'); await phase('running',5000);
    await finish(); await home();
    await page.locator('canvas').evaluate(canvas=>canvas.getContext('webgl2').getExtension('WEBGL_lose_context').loseContext());
    await page.getByText(/Graphics paused/).waitFor(); await screenshot('context-loss');
    await page.getByRole('button',{name:/Reload/}).click();
    await page.waitForFunction(()=>Boolean(window.__SWITCHYARD_INSPECT__)); assert.equal((await read()).error,'');
    await click('Settings'); await click('Credits & asset information'); await page.getByText(/Sunline Shuffle/).waitFor(); await screenshot('credits'); await back();
    await click('Settings'); await click('Toggle fullscreen');
    const fullscreen=await page.evaluate(()=>Boolean(document.fullscreenElement));
    report.fullscreenEntered=fullscreen;
    if(fullscreen)await click('Toggle fullscreen');
    else await page.getByText(/Fullscreen is unavailable/).waitFor();
    await back();
  });

  await step('Confirmed reset, corrupted storage recovery and unavailable storage session', async () => {
    await click('Settings'); await click('Reset progress'); await click('Yes, reset local progress');
    assert.equal((await read()).save.statistics.runs, 0); assert.equal((await read()).save.coins, 0); await back();
    await page.evaluate(() => localStorage.setItem('switchyard-sprint-save', '{broken'));
    await page.reload({ waitUntil: 'networkidle' }); await page.waitForFunction(() => Boolean(window.__SWITCHYARD_INSPECT__));
    await click('Settings'); await page.getByText(/saved data could not be read/).waitFor(); await back();
    await page.addInitScript(() => { Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('Disabled in browser verification', 'SecurityError'); } }); });
    await page.reload({ waitUntil: 'networkidle' }); await page.waitForFunction(() => Boolean(window.__SWITCHYARD_INSPECT__));
    await click('Settings'); await page.getByText(/Browser storage is unavailable/).waitFor(); await back();
    await page.keyboard.press('Enter'); await phase('running'); await finish(); assert.equal((await read()).save.statistics.runs, 1); await home();
  });

  if (offlineTest) await step('Complete cache, actual offline reload and keyboard play', async () => {
    await page.getByText('OFFLINE READY', { exact: true }).waitFor({ timeout: 30000 });
    report.offlineCache = await page.evaluate(async () => { const keys = await caches.keys(); const items = []; for (const key of keys) { const cache = await caches.open(key); items.push({ key, files: (await cache.keys()).map(r => r.url) }); } return items; });
    assert.ok(report.offlineCache.some(cache => cache.files.length > 5));
    await context.setOffline(true); await page.reload({ waitUntil: 'domcontentloaded' }); await page.waitForFunction(() => Boolean(window.__SWITCHYARD_INSPECT__));
    await page.locator('.loading').waitFor({state:'hidden'});
    await page.keyboard.press('Enter'); await phase('running'); await page.keyboard.press('a'); assert.equal((await read()).state.player.targetLane, -1);
    await screenshot('offline-gameplay'); await finish(); await home(); await context.setOffline(false);
  });

  await step('No uncaught runtime errors or external runtime dependencies', async () => {
    assert.deepEqual(report.pageErrors, []); assert.deepEqual(report.externalRequests, []);
    assert.deepEqual(report.consoleErrors.filter(message => !message.includes('favicon.ico')), []);
  });
  report.status = 'passed';
} catch (error) {
  report.status = 'failed'; report.failure = String(error.stack || error); process.exitCode = 1;
} finally {
  await writeFile(resolve(reportDir, `browser-${label}.json`), JSON.stringify(report, null, 2));
  await browser.close();
  console.log(`Saved reports/browser-${label}.json (${report.status}).`);
}
