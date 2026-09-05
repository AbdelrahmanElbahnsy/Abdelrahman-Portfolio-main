import { chromium } from 'playwright';

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1536, height: 738 } });
    await page.goto('http://localhost:5173/#home', { waitUntil: 'load' });
    await page.waitForTimeout(3000);

    const widths = await page.evaluate(() => {
        return {
            logo: document.querySelector('.logo')?.getBoundingClientRect().width,
            links: document.querySelector('nav ul')?.getBoundingClientRect().width,
            actions: document.querySelector('nav > div:last-child')?.getBoundingClientRect().width,
            navInternal: document.querySelector('nav')?.getBoundingClientRect().width,
        };
    });
    console.log(widths);
    await browser.close();
})();
