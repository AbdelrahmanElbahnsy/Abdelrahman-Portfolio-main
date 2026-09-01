const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const OUT_DIR = 'C:\\Users\\HP\\.gemini\\antigravity-ide\\brain\\6ff07d99-93f9-407d-bb40-94212b05f9c0\\scratch';

const viewports = [
  { width: 320, height: 800, name: 'mobile-small' },
  { width: 375, height: 812, name: 'mobile-medium' },
  { width: 390, height: 844, name: 'mobile-large' },
  { width: 430, height: 932, name: 'mobile-xl' },
  { width: 768, height: 1024, name: 'tablet' },
  { width: 1024, height: 768, name: 'tablet-landscape' },
  { width: 1280, height: 800, name: 'desktop-small' },
  { width: 1440, height: 900, name: 'desktop' },
  { width: 1920, height: 1080, name: 'desktop-large' }
];

async function runTest() {
  console.log('Starting Playwright Matrix Test...');
  const browser = await chromium.launch({ headless: true });
  
  for (const vp of viewports) {
    console.log(`\nTesting Viewport: ${vp.name} (${vp.width}x${vp.height})`);
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await context.newPage();
    
    await page.goto('http://localhost:4173/');
    
    // Wait for splash screen to disappear
    await page.waitForFunction(() => !document.querySelector('.splash-screen'), { timeout: 10000 });
    console.log(`[${vp.name}] Splash screen cleared.`);

    // Wait for page hydration
    await page.waitForTimeout(1000);

    // 1. Verify Navbar Sticky & Overlap
    const navBox = await page.locator('header').boundingBox();
    console.log(`[${vp.name}] Navbar box:`, navBox);
    
    if (navBox.y !== 0) {
      console.warn(`[${vp.name}] Navbar is NOT sticky at top=0!`);
    }

    // Scroll down to check if Navbar covers section
    await page.evaluate(() => window.scrollTo(0, 1000));
    await page.waitForTimeout(500);
    const navBoxScrolled = await page.locator('header').boundingBox();
    if (navBoxScrolled.y !== 0) {
      console.warn(`[${vp.name}] Navbar is NOT sticky after scroll! y=${navBoxScrolled.y}`);
    } else {
      console.log(`[${vp.name}] Navbar is correctly sticky at y=0 after scroll.`);
    }

    // 2. Click Skills Anchor
    await page.evaluate(() => {
      document.querySelector('a[href="#skills"]').click();
    });
    await page.waitForTimeout(1000);
    
    // Check Skills overlap
    const skillsHeader = await page.locator('#skills .section-title').boundingBox();
    const navHeight = navBoxScrolled.height;
    if (skillsHeader && skillsHeader.y < navHeight) {
      console.warn(`[${vp.name}] Navbar OVERLAPS Skills header! headerY=${skillsHeader.y}, navHeight=${navHeight}`);
    } else {
      console.log(`[${vp.name}] Navbar does not overlap Skills header. headerY=${skillsHeader?.y}`);
    }

    // 3. Verify Skills Progress Ring exists and data-driven
    const skillsCount = await page.locator('.circular-skill-item').count();
    console.log(`[${vp.name}] Found ${skillsCount} circular skills.`);
    if (skillsCount > 0) {
      const offset = await page.locator('.progress-ring-circle').first().evaluate(el => el.style.strokeDashoffset);
      console.log(`[${vp.name}] First skill strokeDashoffset: ${offset}`);
      if (!offset || offset === '339.292px' || offset === '339.292') {
         console.warn(`[${vp.name}] Skill progress animation may not have fired correctly.`);
      }
    }

    // 4. Check Certifications Swiper
    await page.evaluate(() => {
      document.querySelector('a[href="#certifications"]').click();
    });
    await page.waitForTimeout(1000);
    
    const activeSlide = await page.locator('.swiper-slide-active .skill-card');
    if (await activeSlide.isVisible()) {
      console.log(`[${vp.name}] Active certification slide is visible.`);
      const hasVerified = await page.locator('.swiper-slide-active:has-text("VERIFIED")').count();
      // wait, the text might be different based on the actual components or data. 
    }

    // Take a screenshot of the Certifications area
    const screenshotPath = path.join(OUT_DIR, `matrix_${vp.name}.png`);
    await page.screenshot({ path: screenshotPath });
    console.log(`[${vp.name}] Screenshot saved to ${screenshotPath}`);

    await context.close();
  }
  
  await browser.close();
  console.log('Matrix testing complete.');
}

runTest().catch(console.error);
