import { chromium } from 'playwright';

async function run() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const viewports = [
    { name: 'mobile_320', width: 320, height: 568 },
    { name: 'mobile_375', width: 375, height: 812 },
    { name: 'mobile_412', width: 412, height: 915 },
    { name: 'mobile_430', width: 430, height: 932 },
    { name: 'tablet_768', width: 768, height: 1024 },
    { name: 'desktop_1024', width: 1024, height: 768 },
    { name: 'desktop_1440', width: 1440, height: 900 }
  ];

  const themes = [
    { lang: 'en', theme: 'dark' },
    { lang: 'en', theme: 'light' },
    { lang: 'ar', theme: 'dark' },
    { lang: 'ar', theme: 'light' }
  ];

  for (const vp of viewports) {
    for (const t of themes) {
      console.log(`Verifying ${vp.name} ${t.lang}-${t.theme}...`);
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('http://localhost:5173/');
      await page.reload({ waitUntil: 'load' });
      await page.waitForFunction(() => !document.querySelector('.splash-screen'), { timeout: 15000 });
      await page.waitForTimeout(1000);

      if (t.lang === 'ar') {
          // Click language toggle if currently EN
          await page.evaluate(() => {
              const btn = document.querySelector('button[aria-label="Toggle Language"]');
              if (btn && btn.textContent.includes('AR')) btn.click();
          });
          await page.waitForTimeout(500);
      }
      if (t.theme === 'light') {
          // Click theme toggle if currently dark (has sun icon to switch to light, or moon?)
          await page.evaluate(() => {
              const btn = document.querySelector('button[aria-label="Switch to light mode"]');
              if (btn) btn.click();
          });
          await page.waitForTimeout(500);
      }

      if (vp.name === 'mobile_375' && t.lang === 'ar') {
        await page.screenshot({ path: `visual_audit/verify_${vp.name}_${t.lang}_hero.png` });
      }

      // Test Scroll overlap on Certifications and Journey
      if (vp.name.startsWith('mobile') && t.lang === 'en' && t.theme === 'dark') {
          // Check Journey overlap
          await page.evaluate(() => {
              const el = document.getElementById('journey');
              if(el) el.scrollIntoView({ behavior: 'auto', block: 'end' });
          });
          await page.waitForTimeout(1000);
          await page.screenshot({ path: `visual_audit/verify_${vp.name}_overlap_journey.png` });
      }

      // Test Anchor navigation on Desktop
      if (vp.name === 'desktop_1440' && t.lang === 'en' && t.theme === 'dark') {
          await page.evaluate(() => {
              const links = Array.from(document.querySelectorAll('nav a'));
              const journeyLink = links.find(l => l.textContent.includes('Journey') || l.href.includes('#journey'));
              if(journeyLink) journeyLink.click();
          });
          await page.waitForTimeout(2000); // Wait for smooth scroll
          await page.screenshot({ path: `visual_audit/verify_${vp.name}_anchor_journey.png` });
      }
    }
  }

  // Test Navbar interaction explicitly
  console.log('Testing Navbar Interaction...');
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('http://localhost:5173/');
  await page.waitForFunction(() => !document.querySelector('.splash-screen'), { timeout: 15000 });
  await page.waitForTimeout(1000);
  
  // Try to open using the correct ARIA label selector
  await page.evaluate(() => {
     const btn = document.querySelector('button[aria-label="Toggle Menu"]');
     if (btn) btn.click();
  });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'visual_audit/verify_navbar_open.png' });

  await browser.close();
  console.log('Done');
}

run().catch(console.error);
