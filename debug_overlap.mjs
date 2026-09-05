import { chromium } from 'playwright';

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1536, height: 738 } });
    await page.goto('http://localhost:5173/#home', { waitUntil: 'load' });
    await page.waitForTimeout(3000);

    const data = await page.evaluate(() => {
        const logo = document.querySelector('.logo');
        const centerWrapper = document.querySelector('nav > div:nth-child(2)');
        const ul = document.querySelector('nav ul');
        const rightWrapper = document.querySelector('nav > div:last-child');
        const langBtn = document.querySelector('nav button[aria-label="Toggle Language"]');

        const r = el => el ? JSON.parse(JSON.stringify(el.getBoundingClientRect())) : null;

        return {
            logo: r(logo),
            centerWrapper: r(centerWrapper),
            ul: r(ul),
            rightWrapper: r(rightWrapper),
            langBtn: r(langBtn),
        };
    });
    console.log(JSON.stringify(data, null, 2));
    await browser.close();
})();
