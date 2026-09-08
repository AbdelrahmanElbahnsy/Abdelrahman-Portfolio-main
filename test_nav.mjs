import { chromium } from 'playwright';
async function run() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('http://localhost:5173/');
  
  console.log("Waiting for splash screen...");
  await page.waitForFunction(() => !document.querySelector('.splash-screen'), { timeout: 15000 });
  await page.waitForTimeout(2000); // Wait for hero to animate
  
  await page.screenshot({ path: 'visual_audit/nav_fix_1_closed.png' });
  
  // Find hamburger
  await page.evaluate(() => {
     const btn = document.querySelector('.hamburger-react') || document.querySelector('button[aria-label="Toggle menu"]');
     if (btn) btn.click();
  });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'visual_audit/nav_fix_2_open.png' });
  
  await page.evaluate(() => {
     const btn = document.querySelector('.hamburger-react') || document.querySelector('button[aria-label="Toggle menu"]');
     if (btn) btn.click();
  });
  await page.waitForTimeout(1000);
  
  await page.evaluate(() => window.scrollTo(0, 1500));
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'visual_audit/nav_fix_3_scroll.png' });
  
  await page.evaluate(() => {
     const btn = document.querySelector('.hamburger-react') || document.querySelector('button[aria-label="Toggle menu"]');
     if (btn) btn.click();
  });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'visual_audit/nav_fix_4_scroll_open.png' });
  
  await browser.close();
  console.log("Done");
}
run().catch(console.error);
