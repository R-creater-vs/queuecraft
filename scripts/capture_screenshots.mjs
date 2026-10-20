import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_DIR = path.resolve(__dirname, '../dist');
const SCREENSHOTS_DOCS = path.resolve(__dirname, '../docs/screenshots');
const SCREENSHOTS_ARTIFACTS = path.resolve(__dirname, '../artifacts');

fs.mkdirSync(SCREENSHOTS_DOCS, { recursive: true });
fs.mkdirSync(SCREENSHOTS_ARTIFACTS, { recursive: true });

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
};

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/') reqPath = '/index.html';
  const filePath = path.join(DIST_DIR, reqPath);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  } else {
    const fallback = path.join(DIST_DIR, 'index.html');
    res.writeHead(200, { 'Content-Type': 'text/html' });
    fs.createReadStream(fallback).pipe(res);
  }
});

const PORT = 5194;
server.listen(PORT, async () => {
  console.log(`HTTP Server running at http://localhost:${PORT}`);

  try {
    const playwrightPath = 'D:/Ran/ASCEND/node_modules/playwright/index.js';
    const pwModule = await import(pathToFileURL(playwrightPath).href);
    const chromium = pwModule.default?.chromium || pwModule.chromium;

    const browser = await chromium.launch({
      headless: true,
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    });

    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(`http://localhost:${PORT}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    const screenshots = [
      {
        name: '01-service-theatre-gantt.png',
        setup: async () => {
          // Tab is Service Theatre
          await page.waitForTimeout(300);
        },
      },
      {
        name: '02-visitor-receipt-inspector.png',
        setup: async () => {
          // Select visitor 5 or 6 in inspector
          const select = page.locator('select').nth(1);
          if (await select.count() > 0) {
            await select.selectOption({ index: 4 });
          }
          await page.waitForTimeout(300);
        },
      },
      {
        name: '03-who-waited-longer-kpis.png',
        setup: async () => {
          const tab = page.locator('header button:has-text("Who Waited Longer?")');
          await tab.click();
          await page.waitForTimeout(300);
        },
      },
      {
        name: '04-matched-transfers-table.png',
        setup: async () => {
          // Click "Waited Longer (" filter
          const filterBtn = page.locator('button:has-text("Waited Longer (")');
          if (await filterBtn.count() > 0) {
            await filterBtn.click();
          }
          await page.waitForTimeout(300);
        },
      },
      {
        name: '05-arrival-wave-breakdown.png',
        setup: async () => {
          // Reset to All filter
          const filterAll = page.locator('button:has-text("All (")');
          if (await filterAll.count() > 0) {
            await filterAll.click();
          }
          await page.waitForTimeout(300);
        },
      },
      {
        name: '06-schedule-board-budget.png',
        setup: async () => {
          const tab = page.locator('header button:has-text("Schedule Board")');
          await tab.click();
          await page.waitForTimeout(300);
        },
      },
      {
        name: '07-budget-frontier-scatter.png',
        setup: async () => {
          const tab = page.locator('header button:has-text("Budget Frontier")');
          await tab.click();
          await page.waitForTimeout(300);
        },
      },
      {
        name: '08-scenario-notebook-ledger.png',
        setup: async () => {
          const tab = page.locator('header button:has-text("Scenario Notebook")');
          await tab.click();
          await page.waitForTimeout(300);
        },
      },
    ];

    for (const s of screenshots) {
      console.log(`Capturing ${s.name}...`);
      await s.setup();
      const docsFile = path.join(SCREENSHOTS_DOCS, s.name);
      const artFile = path.join(SCREENSHOTS_ARTIFACTS, s.name);
      await page.screenshot({ path: docsFile, fullPage: false });
      fs.copyFileSync(docsFile, artFile);
      console.log(`Saved: ${docsFile}`);
    }

    await browser.close();
    console.log('All 8 screenshots captured successfully!');
  } catch (err) {
    console.error('Error during screenshot capture:', err);
  } finally {
    server.close();
    process.exit(0);
  }
});
