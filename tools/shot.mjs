// Headless screenshot harness: node tools/shot.mjs [url] [outPrefix] [clicks]
import { chromium } from 'playwright-core';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';

const exe = path.join(os.homedir(), 'AppData/Local/ms-playwright/chromium-1060/chrome-win/chrome.exe');
const url = process.argv[2] ?? 'http://localhost:7317/';
const prefix = process.argv[3] ?? 'tools/out/shot';
const clicks = Number(process.argv[4] ?? '1');
fs.mkdirSync(path.dirname(prefix), { recursive: true });

const browser = await chromium.launch({
  executablePath: exe,
  args: ['--no-sandbox', '--enable-unsafe-swiftshader', '--use-gl=angle', '--use-angle=swiftshader'],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const logs = [];
page.on('console', (m) => logs.push(`[${m.type()}] ${m.text()}`));
page.on('pageerror', (e) => logs.push(`[pageerror] ${e.message}\n${e.stack ?? ''}`));

await page.goto(url, { waitUntil: 'load' });
await page.waitForTimeout(1000);
await page.screenshot({ path: `${prefix}-title.png` });
await page.click('#start');
await page.waitForTimeout(1500);
await page.screenshot({ path: `${prefix}-1.png` });

for (let i = 0; i < clicks; i++) {
  await page.mouse.click(640, 400);
  await page.waitForTimeout(300);
  await page.mouse.click(640, 400);
  await page.waitForTimeout(400);
  await page.keyboard.press('KeyF');
  await page.keyboard.press('KeyQ');
  await page.keyboard.down('KeyW');
  await page.waitForTimeout(500);
  await page.keyboard.up('KeyW');
  await page.mouse.move(700, 420);
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${prefix}-play${i}.png` });
}

const state = await page.evaluate(() => window.__state ?? null);
console.log('STATE', JSON.stringify(state));
console.log(logs.length ? logs.join('\n') : 'no console output');
await browser.close();
