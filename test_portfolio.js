import { chromium } from 'playwright';
import fs from 'fs';

const viewports = [
  { width: 320, height: 800 },
  { width: 375, height: 812 },
  { width: 390, height: 844 },
  { width: 414, height: 896 },
  { width: 768, height: 1024 },
  { width: 820, height: 1180 },
  { width: 1024, height: 768 },
  { width: 1280, height: 800 },
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 }
];

async function runTests() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  if (!fs.existsSync('./screenshots')) {
    fs.mkdirSync('./screenshots');
  }

  const url = 'http://localhost:5174/'; // Dev server port

  console.log('Waiting for dev server...');
  for (let i = 0; i < 15; i++) {
    try {
      await page.goto(url, { waitUntil: 'load', timeout: 5000 });
      break;
    } catch (e) {
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  let failed = false;

  for (const lang of ['en', 'ar']) {
    console.log(`\n--- Testing Language: ${lang.toUpperCase()} ---`);
    
    // Set language
    await page.evaluate((l) => {
      localStorage.setItem('portfolio-language', l);
      window.location.reload();
    }, lang);
    await page.waitForTimeout(2000);
    
    // Wait for splash screen to clear
    await page.waitForFunction(() => !document.querySelector('.splash-screen'), { timeout: 15000 }).catch(() => {});

    for (const vp of viewports) {
      console.log(`Testing viewport: ${vp.width}x${vp.height}...`);
      await page.setViewportSize(vp);
      await page.waitForTimeout(500);

      // 1. Check Horizontal Overflow (Global)
      const overflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });
      if (overflow) {
        console.error(`❌ [${lang}] ${vp.width}x${vp.height} - Horizontal overflow detected globally!`);
        failed = true;
      }

      // 1.b Check Hero Elements Boundaries
      const heroOverflows = await page.evaluate(() => {
        const selectors = [
          '#hero', '.hero-grid', '.hero-left', '.hero-right', '.portrait-frame', '#hero img'
        ];
        let overflows = [];
        for (const selector of selectors) {
          const els = document.querySelectorAll(selector);
          for (const el of els) {
            const rect = el.getBoundingClientRect();
            // allow 1px for subpixel rounding
            if (rect.right > window.innerWidth + 1 || rect.left < -1 || rect.width > window.innerWidth + 1) {
              overflows.push({
                selector,
                left: rect.left,
                right: rect.right,
                width: rect.width,
                windowWidth: window.innerWidth
              });
            }
          }
        }
        return overflows;
      });

      if (heroOverflows.length > 0) {
        console.error(`❌ [${lang}] ${vp.width}x${vp.height} - Hero element bounded overflow detected!`);
        console.error(heroOverflows);
        failed = true;
      } else if (!overflow) {
        console.log(`✅ [${lang}] ${vp.width}x${vp.height} - No horizontal overflow.`);
      }

      // 2. Check Icons (sample a few)
      const iconsOk = await page.evaluate(() => {
        const icons = document.querySelectorAll('i[class*="fa-"]');
        for (const icon of icons) {
          const font = window.getComputedStyle(icon).fontFamily;
          if (font.includes('Segoe UI') || font.includes('Cairo') || font.includes('Inter')) {
            return false;
          }
        }
        return true;
      });
      if (!iconsOk) {
        console.error(`❌ [${lang}] ${vp.width}x${vp.height} - Font Awesome icons are overridden by text font!`);
        failed = true;
      }

      await page.screenshot({ path: `./screenshots/${lang}_${vp.width}x${vp.height}.png` });
    }
  }

  console.log('\n--- Testing Contact Form Persistence ---');
  await page.evaluate(() => {
      localStorage.setItem('portfolio-language', 'en');
      window.location.reload();
  });
  await page.waitForTimeout(2000);
  await page.waitForFunction(() => !document.querySelector('.splash-screen'), { timeout: 15000 }).catch(() => {});

  // Scroll to contact form so inputs exist if they are lazy loaded
  await page.evaluate(() => {
    const contact = document.getElementById('contact');
    if (contact) contact.scrollIntoView();
  });
  await page.waitForTimeout(1000);
  
  const nameInput = await page.$('input[name="contact_name_field"]');
  if (nameInput) {
    await nameInput.fill('Test Name 123');
    await page.fill('input[name="contact_email_field"]', 'test@example.com');

    // Toggle language
    await page.evaluate(() => {
      const current = localStorage.getItem('portfolio-language');
      localStorage.setItem('portfolio-language', current === 'ar' ? 'en' : 'ar');
      // Actually we just click the toggle button so React re-renders without full reload
      const btn = document.querySelector('button[aria-label*="Switch Language"]');
      if (btn) btn.click();
    });
    await page.waitForTimeout(1000);

    const nameVal = await page.inputValue('input[name="contact_name_field"]');
    if (nameVal === 'Test Name 123') {
        console.log('✅ Contact form values persist after language switch.');
    } else {
        console.error('❌ Contact form values DID NOT persist after language switch.');
        failed = true;
    }
  } else {
    console.log('⚠️ Could not find contact form inputs to test persistence.');
  }

  await browser.close();
  
  if (failed) {
    console.log('\n❌ Some automated tests failed.');
    process.exit(1);
  } else {
    console.log('\n✅ All automated tests passed successfully!');
    process.exit(0);
  }
}

runTests().catch(console.error);
