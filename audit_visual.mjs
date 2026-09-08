import { chromium } from 'playwright';
import fs from 'fs';

const widths = [320, 375, 412, 430, 540, 768, 820, 1024, 1280, 1440];
const states = [
  { lang: 'en', theme: 'dark' },
  { lang: 'en', theme: 'light' },
  { lang: 'ar', theme: 'dark' },
  { lang: 'ar', theme: 'light' }
];

const sections = [
  { id: 'projects', selector: '#projects' },
  { id: 'certifications', selector: '#certifications' },
  { id: 'journey', selector: '#journey' },
  { id: 'contact', selector: '#contact' },
  { id: 'footer', selector: 'footer' }
];

async function run() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  const results = [];
  
  if (!fs.existsSync('audit_results')) {
    fs.mkdirSync('audit_results');
  }

  for (const w of widths) {
    for (const state of states) {
      console.log(`Testing ${w}px ${state.lang} ${state.theme}...`);
      await page.setViewportSize({ width: w, height: 1000 });
      await page.goto('http://localhost:5173/');
      
      await page.evaluate((s) => {
        localStorage.setItem('i18nextLng', s.lang);
        localStorage.setItem('theme', s.theme);
      }, state);
      
      await page.reload({ waitUntil: 'load' });
      
      // hide splash if any
      await page.evaluate(() => {
        const splash = document.querySelector('.splash-screen');
        if (splash) splash.style.display = 'none';
      });

      await page.waitForTimeout(3000); // Wait for animations
      
      // Floating UI check
      const floatingUI = await page.evaluate(() => {
         const els = document.querySelectorAll('.floating-nav, .theme-toggle, .lang-toggle, .scroll-top');
         let issues = [];
         els.forEach(el => {
             const rect = el.getBoundingClientRect();
             if (rect.right > window.innerWidth || rect.left < 0) {
                 issues.push(`Floating UI out of bounds: ${el.className}`);
             }
         });
         return issues;
      });

      // Section checks
      for (const sec of sections) {
        const issues = [];
        const el = await page.$(sec.selector);
        if (!el) {
          issues.push(`Section ${sec.id} not found`);
          continue;
        }
        
        // Scroll to section
        await el.scrollIntoViewIfNeeded();
        await page.waitForTimeout(200);

        const boundingBox = await el.boundingBox();
        if (boundingBox && boundingBox.width > w) {
            issues.push(`Section ${sec.id} width (${boundingBox.width}) exceeds viewport (${w})`);
        }

        // Check children overflow
        const overflowIssues = await page.evaluate((selector) => {
           const section = document.querySelector(selector);
           if (!section) return [];
           const winWidth = window.innerWidth;
           const bad = [];
           const children = section.querySelectorAll('*');
           children.forEach(child => {
               const rect = child.getBoundingClientRect();
               if (rect.right > winWidth + 2 && window.getComputedStyle(child).display !== 'none') {
                   bad.push(`Child out of bounds in ${selector}: ${child.tagName}.${child.className} (right: ${rect.right})`);
               }
           });
           return bad;
        }, sec.selector);
        
        issues.push(...overflowIssues);
        
        if (issues.length > 0) {
           const path = `audit_results/${w}_${state.lang}_${state.theme}_${sec.id}.png`;
           await el.screenshot({ path });
           results.push({ width: w, state, section: sec.id, issues, screenshot: path });
        }
      }
      
      if (floatingUI.length > 0) {
         results.push({ width: w, state, section: 'floating', issues: floatingUI });
      }
    }
  }
  
  await browser.close();
  fs.writeFileSync('audit_results/report.json', JSON.stringify(results, null, 2));
  console.log('Audit complete. Found', results.length, 'issues.');
}

run().catch(console.error);
