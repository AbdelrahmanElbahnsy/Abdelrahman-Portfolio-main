import { chromium } from 'playwright';

(async () => {
    const browser = await chromium.launch();
    
    const viewports = [
        { width: 1536, height: 738, name: '1536px' },
        { width: 1440, height: 900, name: '1440px' },
        { width: 1366, height: 768, name: '1366px' },
        { width: 1280, height: 800, name: '1280px' },
        { width: 1024, height: 768, name: '1024px' },
        { width: 768, height: 1024, name: '768px' },
        { width: 375, height: 812, name: 'Mobile' }
    ];

    for (const vp of viewports) {
        console.log(`\n=== Testing Viewport: ${vp.name} (${vp.width}x${vp.height}) ===`);
        const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
        
        await page.goto('http://localhost:5173/#home', { waitUntil: 'load' });
        await page.waitForTimeout(4000); // Wait for Splash Screen

        const checkLayout = async (state) => {
            console.log(`\n-- State: ${state} --`);
            
            const layout = await page.evaluate(() => {
                const nav = document.querySelector('nav');
                const header = document.querySelector('header');
                const hero = document.querySelector('#hero');
                const heroGrid = document.querySelector('.hero-grid');
                
                // desktop navigation items (center region)
                const navLinksList = document.querySelector('nav ul');
                // right region items
                const langBtn = document.querySelector('nav button[aria-label="Toggle Language"]');
                const themeBtn = document.querySelector('nav button[aria-label*="Switch to"]');
                const contactBtn = document.querySelector('nav a[href="#contact"]');
                const hamburgerBtn = document.querySelector('nav button[aria-label="Toggle Menu"]');
                
                const rect = (el) => el ? JSON.parse(JSON.stringify(el.getBoundingClientRect())) : null;
                const isVisible = (el) => {
                    if (!el) return false;
                    const r = el.getBoundingClientRect();
                    return r.width > 0 && r.height > 0 && window.getComputedStyle(el).display !== 'none';
                };

                return {
                    headerBox: rect(header),
                    heroBox: rect(hero),
                    heroGridBox: rect(heroGrid),
                    navLinksBox: rect(navLinksList),
                    langVisible: isVisible(langBtn),
                    langBox: rect(langBtn),
                    themeVisible: isVisible(themeBtn),
                    contactVisible: isVisible(contactBtn),
                    contactBox: rect(contactBtn),
                    hamburgerVisible: isVisible(hamburgerBtn),
                    windowWidth: window.innerWidth
                };
            });
            
            // Analyze overlap
            let overlapError = null;
            if (layout.navLinksBox && layout.langBox && layout.langVisible) {
                // If language button is to the left of the right edge of navLinksBox, it's overlapping
                if (layout.langBox.left < layout.navLinksBox.right) {
                    overlapError = `HORIZONTAL OVERLAP: Language button (x=${layout.langBox.left}) is overlapping Navigation Links (right=${layout.navLinksBox.right})`;
                }
            }

            // Analyze vertical overlap
            let verticalOverlap = null;
            if (layout.headerBox && layout.heroGridBox) {
                if (layout.headerBox.bottom > layout.heroGridBox.top) {
                    verticalOverlap = `VERTICAL OVERLAP: Header bottom (${layout.headerBox.bottom}) > Hero Grid top (${layout.heroGridBox.top})`;
                }
            }
            
            console.log('Result:');
            console.log(`- Horizontal Overlap: ${overlapError ? 'FAIL (' + overlapError + ')' : 'PASS (No overlap)'}`);
            console.log(`- Vertical Overlap: ${verticalOverlap ? 'FAIL (' + verticalOverlap + ')' : 'PASS (Gap: ' + (layout.heroGridBox?.top - layout.headerBox?.bottom).toFixed(1) + 'px)'}`);
            
            if (vp.width >= 1280) {
                console.log(`- Desktop items visible: Lang(${layout.langVisible}), Theme(${layout.themeVisible}), Contact(${layout.contactVisible})`);
                if (!layout.langVisible || !layout.themeVisible || !layout.contactVisible) {
                     console.log('  FAIL: Desktop items should be visible at this viewport');
                }
            } else {
                console.log(`- Hamburger visible: ${layout.hamburgerVisible}`);
                if (!layout.hamburgerVisible) {
                     console.log('  FAIL: Hamburger should be visible at this viewport');
                }
            }
        };

        // 1. Unscrolled
        await checkLayout('UNSCROLLED (scrollY=0)');
        
        // 2. Scrolled
        await page.evaluate(() => window.scrollTo(0, 200));
        await page.waitForTimeout(1000);
        await checkLayout('SCROLLED (scrollY=200)');

        await page.close();
    }
    
    await browser.close();
})();
