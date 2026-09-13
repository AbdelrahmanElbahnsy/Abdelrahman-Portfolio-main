import { chromium } from 'playwright';

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1536, height: 738 } });
    await page.goto('http://localhost:5173/#home', { waitUntil: 'load' });
    await page.waitForTimeout(3000);

    const data = await page.evaluate(() => {
        const langBtn = document.querySelector('nav button[aria-label="Toggle Language"]');
        const parent = langBtn?.parentElement;
        const rect = el => el ? JSON.parse(JSON.stringify(el.getBoundingClientRect())) : null;

        return {
            langBtn: rect(langBtn),
            parent: rect(parent),
            parentTagName: parent?.tagName,
            parentClass: parent?.className,
            navLastChild: rect(document.querySelector('nav > div:last-child')),
            childrenCount: document.querySelector('nav')?.children.length
        };
    });
    console.log(JSON.stringify(data, null, 2));
    await browser.close();
})();
