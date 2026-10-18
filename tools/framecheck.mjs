// Verifies that host-injected frames are blocked, hidden and removed, and the game still boots.
import { chromium } from 'playwright-core';
import os from 'node:os';
import path from 'node:path';

const exe = path.join(os.homedir(), 'AppData/Local/ms-playwright/chromium-1060/chrome-win/chrome.exe');
const url = process.argv[2] ?? 'http://localhost:7404/';
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--enable-unsafe-swiftshader', '--use-gl=angle', '--use-angle=swiftshader'] });
const page = await browser.newPage({ viewport: { width: 1000, height: 700 } });
const errs = [];
page.on('pageerror', (e) => errs.push(e.message));

await page.goto(url, { waitUntil: 'load' });
await page.waitForTimeout(800);

// simulate a hostile injector: inline-styled, full-screen, pinned on top
await page.evaluate(() => {
  document.body.insertAdjacentHTML('beforeend', '<iframe src="https://example.com/" style="position:fixed;inset:0;width:100%;height:100%;opacity:1!important;z-index:99999"></iframe>');
});
await page.waitForTimeout(200);
const afterInject = await page.evaluate(() => document.querySelectorAll('iframe').length);

await page.click('#start');
await page.waitForTimeout(900);
const state = await page.evaluate(() => window.__state);

console.log('iframes after inject (want 0):', afterInject);
console.log('game phase (want shift):', state?.phase, 'shelves:', state?.shelves, 'props:', state?.props);
console.log('page errors:', errs.length ? errs.join(' | ') : 'none');
await browser.close();
