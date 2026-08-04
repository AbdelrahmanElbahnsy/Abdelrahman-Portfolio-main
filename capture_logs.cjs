const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => {
    // Just log everything from console
    console.log(msg.text());
  });

  await page.goto('http://localhost:5174/');
  
  // wait 10 seconds for migrations to complete
  await page.waitForTimeout(10000);

  await browser.close();
})();
