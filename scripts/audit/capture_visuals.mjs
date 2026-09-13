import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const OUT_DIR = 'visual_audit';
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR);

const viewports = [
  { width: 375, height: 812, name: 'mobile' },
  { width: 768, height: 1024, name: 'tablet' },
  { width: 1440, height: 900, name: 'desktop' }
];

const themes = [
  { lang: 'en', theme: 'dark' },
  { lang: 'ar', theme: 'light' }
];

async function run() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  console.log('Starting visual capture...');

  // 1. Navbar Interaction Test (Mobile 375px)
  console.log('Testing Navbar Interaction at 375px...');
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('http://localhost:5173/');
  await page.evaluate(() => { localStorage.setItem('i18nextLng', 'en'); localStorage.setItem('theme', 'dark'); });
  await page.reload({ waitUntil: 'load' });
  await page.waitForTimeout(3000);
  
  // Remove splash
  await page.evaluate(() => { const s = document.querySelector('.splash-screen'); if(s) s.style.display='none'; });

  await page.screenshot({ path: path.join(OUT_DIR, 'nav_01_top_closed.png') });
  
  // Open menu
  await page.evaluate(() => {
     const btn = document.querySelector('button[aria-label="Toggle menu"]') || document.querySelector('.hamburger') || document.querySelector('header button');
     if (btn) btn.click();
  });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(OUT_DIR, 'nav_02_top_open.png') });
  
  // Close menu
  await page.evaluate(() => {
     const btn = document.querySelector('button[aria-label="Toggle menu"]') || document.querySelector('.hamburger') || document.querySelector('header button');
     if (btn) btn.click();
  });
  await page.waitForTimeout(1000);
  
  // Scroll middle
  await page.evaluate(() => window.scrollTo(0, 2000));
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(OUT_DIR, 'nav_03_mid_closed.png') });
  
  // Open menu mid
  await page.evaluate(() => {
     const btn = document.querySelector('button[aria-label="Toggle menu"]') || document.querySelector('.hamburger') || document.querySelector('header button');
     if (btn) btn.click();
  });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(OUT_DIR, 'nav_04_mid_open.png') });
  
  // Close menu mid
  await page.evaluate(() => {
     const btn = document.querySelector('button[aria-label="Toggle menu"]') || document.querySelector('.hamburger') || document.querySelector('header button');
     if (btn) btn.click();
  });

  // 2. Capture Sections
  const sections = ['#hero', '#about', '#skills', '#projects', '#certifications', '#journey', '#contact', 'footer'];
  
  for (const vp of viewports) {
    for (const t of themes) {
      console.log(`Capturing ${vp.name} ${t.lang}-${t.theme}...`);
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.evaluate((state) => {
        // App uses custom visitor-preferences object
        const prefs = {
            theme: state.theme,
            language: state.lang,
            themeFingerprint: 'test',
            languageFingerprint: 'test'
        };
        localStorage.setItem('visitor-preferences', JSON.stringify(prefs));
    }, t);
      await page.reload({ waitUntil: 'load' });
      await page.evaluate(() => { const s = document.querySelector('.splash-screen'); if(s) s.style.display='none'; });
      await page.waitForTimeout(3000);
      
      // Full page screenshot for overall vibe
      await page.screenshot({ path: path.join(OUT_DIR, `${vp.name}_${t.lang}_${t.theme}_full.png`), fullPage: true });

      // Specific sections
      for (const sel of sections) {
        const el = await page.$(sel);
        if (el) {
          await el.scrollIntoViewIfNeeded();
          await page.waitForTimeout(500);
          await el.screenshot({ path: path.join(OUT_DIR, `${vp.name}_${t.lang}_${t.theme}_${sel.replace('#','')}.png`) });
        }
      }
    }
  }

  await browser.close();
  console.log('Capture complete.');
}

run().catch(console.error);
