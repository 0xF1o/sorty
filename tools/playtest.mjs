// Scripted end-to-end playtest: pick up items and place them, without moving the mouse
// (synthetic mousedown events so pointer-lock look doesn't drift the aim).
import { chromium } from 'playwright-core';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';

const exe = path.join(os.homedir(), 'AppData/Local/ms-playwright/chromium-1060/chrome-win/chrome.exe');
const url = process.argv[2] ?? 'http://localhost:7317/';
const prefix = process.argv[3] ?? 'tools/out/play';
const rounds = Number(process.argv[4] ?? '8');
fs.mkdirSync(path.dirname(prefix), { recursive: true });

const browser = await chromium.launch({
  executablePath: exe,
  args: ['--no-sandbox', '--enable-unsafe-swiftshader', '--use-gl=angle', '--use-angle=swiftshader'],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const logs = [];
page.on('console', (m) => logs.push(`[${m.type()}] ${m.text()}`));
page.on('pageerror', (e) => logs.push(`[pageerror] ${e.message}\n${e.stack ?? ''}`));

const click = (button) =>
  page.evaluate((b) => {
    const c = document.querySelector('canvas');
    c?.dispatchEvent(new MouseEvent('mousedown', { button: b, bubbles: true, cancelable: true }));
  }, button);
const state = () => page.evaluate(() => window.__state);
const log = (...a) => console.log(...a);

await page.goto(url, { waitUntil: 'load' });
await page.waitForTimeout(900);
await page.click('#start');
await page.waitForTimeout(900);
log('start ', JSON.stringify(await state()));

let picked = 0;
let placed = 0;
for (let i = 0; i < rounds; i++) {
  const before = await state();
  const id = await page.evaluate(() => window.__game.debugAimProp());
  await page.waitForTimeout(80);
  await click(0);
  await page.waitForTimeout(80);
  const afterPick = await state();
  if (afterPick.bag.length > before.bag.length) picked++;
  else log('  pickup failed for', id, JSON.stringify(afterPick));

  if (afterPick.bag.length > 0) {
    const aimed = await page.evaluate(() => window.__game.debugAimSlot());
    if (!aimed) { log('  no matching slot found for', afterPick.bag[0]); break }
    await page.waitForTimeout(80);
    await click(2);
    await page.waitForTimeout(80);
    const afterPlace = await state();
    if (afterPlace.filled > afterPick.filled) placed++;
    else log('  place failed:', JSON.stringify({ before: afterPick, after: afterPlace }));
  }
}

await page.keyboard.press('KeyQ');
await page.waitForTimeout(400);
await page.screenshot({ path: `${prefix}-mid.png` });
log('after ', JSON.stringify(await state()));
log(`picked ${picked}/${rounds}, placed ${placed}/${rounds}`);

// sprint to the end of the shift to exercise the shop and results screens
await page.evaluate(() => { window.__game.debugEndShift?.() });
await page.waitForTimeout(600);
await page.screenshot({ path: `${prefix}-shop.png` });
const shopText = await page.evaluate(() => document.querySelector('#overlay')?.textContent?.slice(0, 400));
log('shop  ', JSON.stringify(shopText));

log(logs.length ? logs.join('\n') : 'no console output');
await browser.close();
