// Smoke test: play all three shifts, shop between them, reach the results screen.
import { chromium } from 'playwright-core';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';

const exe = path.join(os.homedir(), 'AppData/Local/ms-playwright/chromium-1060/chrome-win/chrome.exe');
const url = process.argv[2] ?? 'http://localhost:7410/';
const prefix = process.argv[3] ?? 'tools/out/run';
fs.mkdirSync(path.dirname(prefix), { recursive: true });

const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--enable-unsafe-swiftshader', '--use-gl=angle', '--use-angle=swiftshader'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const logs = [];
page.on('pageerror', (e) => logs.push(`[pageerror] ${e.message}`));
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
await page.waitForTimeout(700);

for (let shift = 0; shift < 3; shift++) {
  const before = await state();
  for (let i = 0; i < 6; i++) {
    await page.evaluate(() => window.__game.debugAimProp());
    await frames(3);
    await click(0);
    await frames(3);
    if (!(await page.evaluate(() => window.__game.debugAimSlot()))) break;
    await frames(3);
    await click(2);
    await frames(3);
  }
  const played = await state();
  console.log(`shift ${shift + 1}: shelves ${before.shelves} slots ${before.slots} props ${before.props} overflow ${before.overflow} -> money ${played.money} filled ${played.filled} overflow ${played.overflow}`);

  await page.evaluate(() => window.__game.debugEndShift());
  await page.waitForTimeout(500);
  console.log(`  after end: phase ${(await state()).phase} shelves ${(await state()).shelves} props ${(await state()).props}`);
  await page.screenshot({ path: `${prefix}-shop${shift + 1}.png` });
  if (shift < 2) { await page.click('#next-shift'); await page.waitForTimeout(700) }
}

console.log('final', JSON.stringify(await state()));
await page.screenshot({ path: `${prefix}-results.png` });
await page.click('#restart');
await page.waitForTimeout(800);
console.log('restart ok, phase', (await state()).phase, 'money', (await state()).money);
console.log(logs.length ? logs.join('\n') : 'no page errors');
await browser.close();
