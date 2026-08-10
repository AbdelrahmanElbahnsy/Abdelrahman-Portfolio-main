import { test, expect } from '@playwright/test';

const viewports = [
  { width: 320, height: 800, name: 'Mobile XS' },
  { width: 360, height: 800, name: 'Mobile S' },
  { width: 375, height: 812, name: 'Mobile M' },
  { width: 390, height: 844, name: 'Mobile L' },
  { width: 414, height: 896, name: 'Mobile XL' },
  { width: 768, height: 1024, name: 'Tablet' },
  { width: 1024, height: 768, name: 'Laptop' },
  { width: 1440, height: 900, name: 'Desktop' },
  { width: 1920, height: 1080, name: 'Monitor' }
];

const variants = [
  { lang: 'en', theme: 'dark' },
  { lang: 'en', theme: 'light' },
  { lang: 'ar', theme: 'dark' },
  { lang: 'ar', theme: 'light' }
];

test.describe('Responsive Layout Audit', () => {
  for (const vp of viewports) {
    for (const v of variants) {
      test(`Audit: ${vp.name} (${vp.width}px) - ${v.lang.toUpperCase()} - ${v.theme}`, async ({ page }) => {
        // 1. Setup Viewport & Navigate
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await page.goto('http://localhost:5174/');
        
        // 2. Setup Theme & Lang
        await page.evaluate(({ lang, theme }) => {
          localStorage.setItem('i18nextLng', lang);
          localStorage.setItem('theme', theme);
        }, v);
        await page.reload({ waitUntil: 'load' });
        
        // Wait for Splash intro to finish and main content to load
        // The splash screen exits automatically when content is ready. We can wait for the page wrapper to be visible
        await page.waitForSelector('.page-wrapper', { state: 'visible', timeout: 15000 });
        
        // Wait for Splash intro to finish and main content to load completely (Splash is ~3s)
        await page.waitForTimeout(5000);

        // 3. Check Splash Screen (If it's still somehow in DOM, or check the hero)
        // Since Splash is gone, let's just make sure the page scrollWidth is not > innerWidth
        
        const layoutMetrics = await page.evaluate(() => {
          return {
            scrollWidth: document.documentElement.scrollWidth,
            innerWidth: window.innerWidth,
            hasGlobalOverflowHidden: window.getComputedStyle(document.body).overflowX === 'hidden'
          };
        });
        
        expect(layoutMetrics.hasGlobalOverflowHidden, 'Body should not have overflow-x: hidden').toBe(false);
        
        if (layoutMetrics.scrollWidth > layoutMetrics.innerWidth) {
          // If there is overflow, find out which elements are causing it
          const overflowingElements = await page.evaluate(() => {
            const width = window.innerWidth;
            const elements = document.querySelectorAll('*');
            const bad = [];
            elements.forEach(el => {
              const rect = el.getBoundingClientRect();
              if (rect.right > width + 2 && rect.width > 0 && window.getComputedStyle(el).display !== 'none') {
                bad.push({
                  tag: el.tagName,
                  className: el.className,
                  right: rect.right,
                  text: el.textContent?.substring(0, 30)
                });
              }
            });
            return bad;
          });
          console.error(`Overflow found at ${vp.width}px! Offenders:`, overflowingElements);
          throw new Error(`Page scrollWidth (${layoutMetrics.scrollWidth}) exceeds viewport (${layoutMetrics.innerWidth}) on ${vp.name}`);
        }
        
        // 4. Specific Component Checks
        // Hero Image constraints
        const heroImg = await page.$('.image-frame img');
        if (heroImg) {
          const rect = await heroImg.boundingBox();
          if (rect) {
            expect(rect.width).toBeLessThanOrEqual(vp.width);
            expect(rect.x).toBeGreaterThanOrEqual(0);
          }
        }
        
        // Certifications Card
        const activeCert = await page.$('.certs-3d-swiper .swiper-slide-active .cert-slide, .certs-3d-swiper .swiper-slide-active > div');
        if (activeCert) {
          const rect = await activeCert.boundingBox();
          if (rect) {
             expect(rect.width).toBeLessThanOrEqual(vp.width);
             expect(rect.x).toBeGreaterThanOrEqual(0);
          }
        }
        
        // Take a screenshot for visual review
        await page.screenshot({ path: `screenshots/${vp.name}_${vp.width}px_${v.lang}_${v.theme}.png`, fullPage: true });
      });
    }
  }
});
