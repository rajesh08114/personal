// Renders public/favicon.svg into the PNG icons that iOS, Android and link previews need.
// Run with `node scripts/generate-icons.mjs` after changing the favicon.
import { readFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';

const svg = await readFile(new URL('../public/favicon.svg', import.meta.url), 'utf8');
const browser = await chromium.launch(
  process.env.PLAYWRIGHT_CHROMIUM_PATH ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH } : {},
);
const page = await browser.newPage();

async function render(file, width, height, html) {
  await page.setViewportSize({ width, height });
  await page.setContent(`<style>html,body{margin:0}</style>${html}`);
  await page.screenshot({
    path: new URL(`../public/${file}`, import.meta.url).pathname,
    omitBackground: true,
  });
}

const icon = (size, pad = 0, bg = 'transparent') =>
  `<div style="width:${size}px;height:${size}px;display:grid;place-items:center;background:${bg}"><div style="width:${size - pad * 2}px;height:${size - pad * 2}px">${svg.replace('<svg ', '<svg width="100%" height="100%" ')}</div></div>`;

await render('icon-192.png', 192, 192, icon(192));
await render('icon-512.png', 512, 512, icon(512));
// Maskable icons are cropped to a circle on Android: keep the artwork inside the 80% safe zone.
await render('icon-maskable-512.png', 512, 512, icon(512, 64, '#17111f'));
await render('apple-touch-icon.png', 180, 180, icon(180, 0, '#17111f'));
await render(
  'og-image.png',
  1200,
  630,
  `<div style="width:1200px;height:630px;background:#f4efe6;display:flex;align-items:center;gap:56px;padding:0 96px;box-sizing:border-box;font-family:Georgia,serif;color:#24201b">
     <div style="width:220px;height:220px;flex:none">${svg.replace('<svg ', '<svg width="100%" height="100%" ')}</div>
     <div><div style="font-size:84px;line-height:1">Birthday Studio</div>
     <div style="font:500 34px/1.35 system-ui,sans-serif;color:#5b5348;margin-top:24px">A personal, interactive birthday website.<br/>Your photos and words, made in minutes.</div></div>
   </div>`,
);
await browser.close();
