// Proves: items can be taken off a shelf again, the slot frees up, and nothing pays twice.
import { chromium } from 'playwright-core';
import os from 'node:os';
import path from 'node:path';

const exe = path.join(os.homedir(), 'AppData/Local/ms-playwright/chromium-1060/chrome-win/chrome.exe');
const url = process.argv[2] ?? 'http://localhost:7405/';
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--enable-unsafe-swiftshader', '--use-gl=angle', '--use-angle=swiftshader'] });
const page = await browser.newPage({ viewport: { width: 1100, height: 720 } });
const errs = [];
page.on('pageerror', (e) => errs.push(e.message));

const frames = (n = 3) => page.evaluate((k) => new Promise((res) => {
  let i = 0;
  const tick = () => (++i >= k ? res() : requestAnimationFrame(tick));
  requestAnimationFrame(tick);
}), n);
const click = (button) => page.evaluate((b) => {
  document.querySelector('canvas')?.dispatchEvent(new MouseEvent('mousedown', { button: b, bubbles: true, cancelable: true }));
}, button);
const state = () => page.evaluate(() => window.__state);

await page.goto(url, { waitUntil: 'load' });
await page.waitForTimeout(700);
await page.click('#start');
await page.waitForTimeout(800);

await page.evaluate(() => window.__game.debugAimProp());
await frames(3); await click(0); await frames(3);
const id = (await state()).bag[0];
await page.evaluate(() => window.__game.debugAimSlot());
await frames(3); await click(2); await frames(3);
const placed = await state();
console.log('placed   ', id, 'money', placed.money, 'filled', placed.filled, 'bag', placed.bag.length);

// take it back off the shelf
const taken = await page.evaluate(() => window.__game.debugAimPlaced());
await frames(3); await click(0); await frames(3);
const after = await state();
console.log('taken    ', taken, 'filled', after.filled, 'bag', JSON.stringify(after.bag), 'pickup', after.dbg);

await page.evaluate(() => window.__game.debugAimSlot());
await frames(3); await click(2); await frames(3);
const again = await state();
console.log('re-placed', 'money', again.money, 'filled', again.filled, 'paid', again.dbg);

console.log('double pay guarded:', again.money === placed.money);
console.log('errors:', errs.length ? errs.join(' | ') : 'none');
await browser.close();
