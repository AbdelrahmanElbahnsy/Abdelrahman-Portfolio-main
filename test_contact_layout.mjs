import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1536, height: 738 } });
  
  await page.goto('https://abdelrahman-portfolio-azure.vercel.app/#contact', { waitUntil: 'load', timeout: 60000 });
  await page.waitForTimeout(3000);

  const elements = [
      { name: 'Contact Section', selector: '#contact' },
      { name: 'Header', selector: '#contact .section-header' },
      { name: 'Contact Grid', selector: '#contact .contact-grid' },
      { name: 'Opp Section', selector: '#contact .opportunity-section-full' },
      { name: 'Footer', selector: 'footer' }
  ];

  for (const el of elements) {
      const handle = await page.$(el.selector);
      if (handle) {
          const box = await handle.boundingBox();
          const visibility = await handle.isVisible();
          console.log(el.name, box, 'Visible:', visibility);
      } else {
          console.log(el.name, 'NOT FOUND');
      }
  }

  await browser.close();
})();
