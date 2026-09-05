import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1536, height: 738 } });
  
  await page.goto('https://abdelrahman-portfolio-azure.vercel.app/#home', { waitUntil: 'load', timeout: 60000 });
  await page.waitForTimeout(6000); // Wait 6 seconds for Splash Screen

  await page.screenshot({ path: 'unscrolled_overlap.png' });
  await page.evaluate(() => window.scrollTo(0, 200));
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'scrolled_fixed.png' });

  await browser.close();
})();
