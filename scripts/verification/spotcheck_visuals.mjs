import { chromium } from 'playwright';

async function run() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const viewports = [
    { name: 'phablet_540', width: 540, height: 960 },
    { name: 'tablet_820', width: 820, height: 1180 },
    { name: 'desktop_1280', width: 1280, height: 800 },
    { name: 'desktop_1920', width: 1920, height: 1080 }
  ];

  // We only need English + Dark
  const t = { lang: 'en', theme: 'dark' };

  for (const vp of viewports) {
    console.log(`Spot-checking ${vp.name}...`);
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto('http://localhost:5173/');
    
    // Set English + Dark if not already, using the UI buttons if possible
    await page.waitForFunction(() => !document.querySelector('.splash-screen'), { timeout: 15000 });
    await page.waitForTimeout(2000);

    // Full page screenshot to check max-width, overflow, and alignment
    await page.screenshot({ path: `visual_audit/spotcheck_${vp.name}_full.png`, fullPage: true });

    // Let's also grab a viewport screenshot for Hero specifically just in case fullPage stitches weirdly
    await page.screenshot({ path: `visual_audit/spotcheck_${vp.name}_hero.png` });
  }

  await browser.close();
  console.log('Done');
}

run().catch(console.error);
