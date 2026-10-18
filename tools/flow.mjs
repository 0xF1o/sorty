// Full-flow harness: play a few items, shop, buy, next shift, abilities, tour shots.
import { chromium } from 'playwright-core';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';

const exe = path.join(os.homedir(), 'AppData/Local/ms-playwright/chromium-1060/chrome-win/chrome.exe');
const url = process.argv[2] ?? 'http://localhost:7317/';
const prefix = process.argv[3] ?? 'tools/out/flow';
fs.mkdirSync(path.dirname(prefix), { recursive: true });

const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--enable-unsafe-swiftshader', '--use-gl=angle', '--use-angle=swiftshader'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const logs = [];
page.on('console', (m) => logs.push(`[${m.type()}] ${m.text()}`));
page.on('pageerror', (e) => logs.push(`[pageerror] ${e.message}\n${e.stack ?? ''}`));

const click = (button) => page.evaluate((b) => {
  document.querySelector('canvas')?.dispatchEvent(new MouseEvent('mousedown', { button: b, bubbles: true, cancelable: true }));
}, button);
const state = () => page.evaluate(() => window.__state);
// Headless software rendering is slow: wait for real frames, not wall-clock guesses.
const frames = (n = 3) => page.evaluate((k) => new Promise((res) => {
  let i = 0;
  const tick = () => (++i >= k ? res() : requestAnimationFrame(tick));
  requestAnimationFrame(tick);
}), n);
const log = (...a) => console.log(...a);

await page.goto(url, { waitUntil: 'load' });
await page.waitForTimeout(800);
await page.click('#start');
await page.waitForTimeout(800);

// tour shot from the doorway-ish corner
await page.evaluate(() => window.__game.debugStand(0.6, 2.1, -1.2, 1.1, -2.2));
await page.waitForTimeout(250);
await page.screenshot({ path: `${prefix}-room.png` });

// empty-handed highlight attempt
await page.keyboard.press('KeyQ');
await page.waitForTimeout(150);
await page.screenshot({ path: `${prefix}-noq.png` });

// play 8 items
for (let i = 0; i < 8; i++) {
  await page.evaluate(() => window.__game.debugAimProp());
  await frames(3);
  await click(0);
  await frames(3);
  const aimed = await page.evaluate(() => window.__game.debugAimSlot());
  if (!aimed) { log('no slot at round', i, JSON.stringify(await state())); break }
  await frames(3);
  await click(2);
  await frames(3);
}
log('played', JSON.stringify(await state()));
log('LOGS: ' + (logs.length ? logs.join(' | ') : '(none)'));
await page.evaluate(() => window.__game.debugStand(0.4, 1.9, -1.3, 1.2, -2.2));
await page.waitForTimeout(200);
await page.screenshot({ path: `${prefix}-sorted.png` });

// shop
await page.evaluate(() => window.__game.debugEndShift());
await page.waitForTimeout(500);
const buyable = await page.evaluate(() => [...document.querySelectorAll('[data-buy]')].map((b) => ({ id: b.dataset.buy, disabled: b.disabled })));
log('shop', JSON.stringify(buyable));
await page.click('[data-buy="highlight"]');
await page.waitForTimeout(200);
await page.screenshot({ path: `${prefix}-shop.png` });
log('after buy', JSON.stringify(await state()));

// next shift
await page.click('#next-shift');
await page.waitForTimeout(900);
log('shift2', JSON.stringify(await state()));

// pick something up and highlight
await page.evaluate(() => window.__game.debugAimProp());
await frames(3);
await click(0);
await frames(3);
await page.evaluate(() => window.__game.debugStand(0.4, 2.0, -1.2, 1.0, -2.2));
await frames(3);
await page.keyboard.press('KeyQ');
await frames(4);
await page.screenshot({ path: `${prefix}-highlight.png` });
log('highlight', JSON.stringify(await state()));

log(logs.length ? logs.join('\n') : 'no console output');
await browser.close();
