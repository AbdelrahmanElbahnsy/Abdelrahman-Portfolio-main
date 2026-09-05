import { chromium } from 'playwright';

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1536, height: 738 } });
    await page.goto('http://localhost:5173/#home', { waitUntil: 'load' });
    await page.waitForTimeout(3000);

    // Screenshot scrolled hero state
    await page.evaluate(() => window.scrollTo(0, 200));
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'C:/Users/HP/.gemini/antigravity-ide/brain/f633f97e-9267-450d-ae3d-86ae79d321c7/scratch/hero_scrolled.png' });

    // Click on a navigation anchor (e.g. Journey)
    const journeyLink = await page.$('nav a[href="#journey"]');
    if (journeyLink) {
        await journeyLink.click();
        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'C:/Users/HP/.gemini/antigravity-ide/brain/f633f97e-9267-450d-ae3d-86ae79d321c7/scratch/journey_anchor.png' });
    }

    // Click on Contact
    const contactLink = await page.$('nav a[href="#contact"]');
    if (contactLink) {
        await contactLink.click();
        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'C:/Users/HP/.gemini/antigravity-ide/brain/f633f97e-9267-450d-ae3d-86ae79d321c7/scratch/contact_anchor.png' });
    }

    await browser.close();
})();
