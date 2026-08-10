import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`PAGE ERROR: "${msg.text()}"`);
    }
  });

  page.on('pageerror', exception => {
    console.log(`UNCAUGHT EXCEPTION: "${exception}"`);
  });

  page.on('response', response => {
    if (!response.ok()) {
      console.log(`NETWORK ERROR: ${response.url()} ${response.status()}`);
    }
  });

  console.log('Navigating to https://abdelrahman-portfolio-azure.vercel.app ...');
  await page.goto('https://abdelrahman-portfolio-azure.vercel.app', { waitUntil: 'networkidle' });
  
  console.log('Done waiting. Checking content...');
  const bodyHTML = await page.innerHTML('body');
  console.log('Body length:', bodyHTML.length);
  if (bodyHTML.length < 500) {
      console.log('Body HTML is very small, possibly blank.');
  }

  await browser.close();
})();
