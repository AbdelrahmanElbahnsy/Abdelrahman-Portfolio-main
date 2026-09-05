import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1536, height: 738 } });
  
  await page.goto('https://abdelrahman-portfolio-azure.vercel.app/#home', { waitUntil: 'load', timeout: 60000 });
  await page.waitForTimeout(3000); // Wait for GSAP and initial load

  // Measure at scrollY = 0
  const headerUnscrolled = await page.evaluate(() => {
      const h = document.querySelector('header');
      return h ? JSON.parse(JSON.stringify(h.getBoundingClientRect())) : null;
  });
  const heroUnscrolled = await page.evaluate(() => {
      const hero = document.querySelector('#hero');
      return hero ? JSON.parse(JSON.stringify(hero.getBoundingClientRect())) : null;
  });
  const heroContentUnscrolled = await page.evaluate(() => {
      const content = document.querySelector('.hero-grid');
      return content ? JSON.parse(JSON.stringify(content.getBoundingClientRect())) : null;
  });

  console.log('UNSCROLLED (scrollY=0):');
  console.log('Header:', headerUnscrolled);
  console.log('Hero:', heroUnscrolled);
  console.log('Hero Content:', heroContentUnscrolled);

  // Scroll down
  await page.evaluate(() => window.scrollTo(0, 100));
  await page.waitForTimeout(1000);

  const headerScrolled = await page.evaluate(() => {
      const h = document.querySelector('header');
      return h ? JSON.parse(JSON.stringify(h.getBoundingClientRect())) : null;
  });
  const heroScrolled = await page.evaluate(() => {
      const hero = document.querySelector('#hero');
      return hero ? JSON.parse(JSON.stringify(hero.getBoundingClientRect())) : null;
  });

  console.log('\nSCROLLED (scrollY=100):');
  console.log('Header:', headerScrolled);
  console.log('Hero:', heroScrolled);

  await browser.close();
})();
