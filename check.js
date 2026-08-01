const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({ width: 375, height: 667 });
    await page.goto('http://localhost:5174/');
    
    // Open menu
    await page.waitForSelector('button[aria-label="Toggle Menu"]');
    await page.click('button[aria-label="Toggle Menu"]');
    // Wait for GSAP animation to complete (it has duration: 0.5s)
    await new Promise(r => setTimeout(r, 1000));
    
    const result = await page.evaluate(() => {
        const links = document.querySelectorAll('.mobile-menu-footer a');
        if (!links || links.length === 0) return { error: "No links found" };
        
        const githubLink = links[0];
        const linkedinLink = links[1];
        
        const ghRect = githubLink.getBoundingClientRect();
        const ghX = ghRect.left + ghRect.width / 2;
        const ghY = ghRect.top + ghRect.height / 2;
        
        const elementOnTop = document.elementFromPoint(ghX, ghY);
        
        return {
            ghHref: githubLink.href,
            ghTopElement: {
                tagName: elementOnTop ? elementOnTop.tagName : null,
                className: elementOnTop ? elementOnTop.className : null,
                id: elementOnTop ? elementOnTop.id : null,
            },
            ghPointerEvents: window.getComputedStyle(githubLink).pointerEvents,
            ghZIndex: window.getComputedStyle(githubLink).zIndex,
            liPointerEvents: window.getComputedStyle(linkedinLink).pointerEvents,
            liZIndex: window.getComputedStyle(linkedinLink).zIndex,
        };
    });
    
    console.log(JSON.stringify(result, null, 2));
    
    // Also try to click it
    try {
        await page.click('.mobile-menu-footer a:nth-child(1)');
        console.log("Click successful on GitHub link");
    } catch (e) {
        console.log("Click failed:", e.message);
    }
    
    await browser.close();
})();
