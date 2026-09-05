import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1536, height: 738 } });
  
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  await page.goto('https://abdelrahman-portfolio-azure.vercel.app/#contact', { waitUntil: 'load', timeout: 60000 });
  await page.waitForTimeout(2000);

  const langBtn = await page.$('button:has(.fa-globe)');
  if (langBtn) {
      await langBtn.click();
      console.log('Switched language!');
      await page.waitForTimeout(2000);
  } else {
      console.log('Lang btn not found');
  }

  const contactGrid = await page.$('.contact-grid');
  if (contactGrid) {
      const box = await contactGrid.boundingBox();
      console.log('Contact Grid:', box);
  } else {
      console.log('Contact Grid NOT FOUND (CRASHED?)');
  }

  await browser.close();
})();
