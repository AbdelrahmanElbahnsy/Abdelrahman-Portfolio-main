import { chromium } from 'playwright';
async function run() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://localhost:5173/');
  
  await page.waitForFunction(() => !document.querySelector('.splash-screen'), { timeout: 15000 });
  await page.waitForTimeout(1000);
  
  // Click Journey
  await page.evaluate(() => {
     const links = Array.from(document.querySelectorAll('nav a'));
     const journeyLink = links.find(l => l.textContent.includes('Journey') || l.href.includes('#journey'));
     if(journeyLink) journeyLink.click();
  });
  
  await page.waitForTimeout(2000); // Wait for smooth scroll
  await page.screenshot({ path: 'visual_audit/scroll_test_journey.png' });
  
  await browser.close();
}
run().catch(console.error);
