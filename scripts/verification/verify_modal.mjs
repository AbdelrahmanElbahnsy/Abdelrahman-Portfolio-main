import { chromium } from 'playwright';

const VIEWPORTS = [
  { name: '320', width: 320, height: 568 },
  { name: '375', width: 375, height: 667 },
  { name: '412', width: 412, height: 915 },
  { name: '430', width: 430, height: 932 },
  { name: '540', width: 540, height: 960 },
  { name: '768', width: 768, height: 1024 },
  { name: '1024', width: 1024, height: 768 },
  { name: '1440', width: 1440, height: 900 },
];

async function run() {
  const browser = await chromium.launch();
  const results = [];

  for (const vp of VIEWPORTS) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });

    console.log(`\n=== Testing ${vp.name}px ===`);
    await page.goto('http://localhost:5173/', { waitUntil: 'load', timeout: 15000 });
    await page.waitForFunction(() => !document.querySelector('.splash-screen'), { timeout: 15000 });
    await page.waitForTimeout(2000);

    // Scroll to projects section
    await page.evaluate(() => {
      const section = document.getElementById('projects');
      if (section) section.scrollIntoView({ behavior: 'instant' });
    });
    await page.waitForTimeout(1000);

    // Find a "View Details" button and click it
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button, a'));
      const btn = buttons.find(b => b.textContent && b.textContent.includes('View Details'));
      if (btn) {
        btn.click();
      } else {
        const card = document.querySelector('[class*="project"]');
        if (card) card.click();
      }
    });
    await page.waitForTimeout(500);

    // Check if a modal appeared (role=dialog or the ProjectModal overlay)
    const modal = await page.$('[role="dialog"]');
    if (!modal) {
      console.log(`  No modal detected at ${vp.name}px`);
      await page.screenshot({ path: `visual_audit/modal_${vp.name}_no_modal.png` });
      await page.close();
      continue;
    }

    // Screenshot the modal state
    await page.screenshot({ path: `visual_audit/modal_${vp.name}_open.png` });

    // Measure the modal inner container position
    const metrics = await page.evaluate(() => {
      const overlay = document.querySelector('[role="dialog"]');
      const modalInner = overlay ? overlay.querySelector('div > div') : null;
      if (!modalInner) return null;

      const rect = modalInner.getBoundingClientRect();
      const vpH = window.innerHeight;
      const vpW = window.innerWidth;
      const style = window.getComputedStyle(modalInner);

      // Check close button
      const closeBtn = modalInner.querySelector('button[aria-label="Close modal"]');
      const closeBtnRect = closeBtn ? closeBtn.getBoundingClientRect() : null;

      // Check scrollable area
      const scrollArea = modalInner.querySelector('.overflow-y-auto') || modalInner.lastElementChild;
      const scrollAreaStyle = scrollArea ? window.getComputedStyle(scrollArea) : null;

      return {
        modalTop: rect.top,
        modalBottom: rect.bottom,
        modalHeight: rect.height,
        modalWidth: rect.width,
        viewportHeight: vpH,
        viewportWidth: vpW,
        maxHeight: style.maxHeight,
        overflowY: style.overflowY,
        display: style.display,
        flexDirection: style.flexDirection,
        closeBtnVisible: closeBtnRect ? (closeBtnRect.top >= 0 && closeBtnRect.bottom <= vpH) : false,
        closeBtnTop: closeBtnRect?.top,
        closeBtnBottom: closeBtnRect?.bottom,
        scrollAreaOverflow: scrollAreaStyle?.overflowY,
        scrollAreaMinHeight: scrollAreaStyle?.minHeight,
        fitsInViewport: rect.top >= 0 && rect.bottom <= vpH,
      };
    });

    if (metrics) {
      const pass = metrics.fitsInViewport && metrics.closeBtnVisible;
      console.log(`  Modal top: ${metrics.modalTop.toFixed(1)}, bottom: ${metrics.modalBottom.toFixed(1)}`);
      console.log(`  Modal height: ${metrics.modalHeight.toFixed(1)} / Viewport: ${metrics.viewportHeight}`);
      console.log(`  max-height: ${metrics.maxHeight}`);
      console.log(`  display: ${metrics.display}, flex-direction: ${metrics.flexDirection}`);
      console.log(`  overflow-y: ${metrics.overflowY}`);
      console.log(`  Close btn visible: ${metrics.closeBtnVisible} (top: ${metrics.closeBtnTop?.toFixed(1)}, bottom: ${metrics.closeBtnBottom?.toFixed(1)})`);
      console.log(`  Scroll area overflow-y: ${metrics.scrollAreaOverflow}`);
      console.log(`  Scroll area min-height: ${metrics.scrollAreaMinHeight}`);
      console.log(`  Fits in viewport: ${metrics.fitsInViewport}`);
      console.log(`  RESULT: ${pass ? 'PASS' : 'FAIL'}`);
      results.push({ viewport: vp.name, ...metrics, pass });
    }

    // Try scrolling inside the modal content area
    const scrolled = await page.evaluate(() => {
      const scrollArea = document.querySelector('[role="dialog"] .overflow-y-auto, [role="dialog"] .overscroll-contain');
      if (!scrollArea) return { found: false };
      const before = scrollArea.scrollTop;
      scrollArea.scrollTop = scrollArea.scrollHeight;
      const after = scrollArea.scrollTop;
      return { found: true, scrollBefore: before, scrollAfter: after, scrollHeight: scrollArea.scrollHeight, clientHeight: scrollArea.clientHeight, canScroll: after > before };
    });
    console.log(`  Internal scroll: found=${scrolled.found}, canScroll=${scrolled.canScroll}, scrollHeight=${scrolled.scrollHeight}, clientHeight=${scrolled.clientHeight}`);

    // Screenshot after scroll
    await page.screenshot({ path: `visual_audit/modal_${vp.name}_scrolled.png` });

    // Test close via X
    await page.evaluate(() => {
      const btn = document.querySelector('[aria-label="Close modal"]');
      if (btn) btn.click();
    });
    await page.waitForTimeout(300);
    const modalGone = !(await page.$('[role="dialog"]'));
    console.log(`  Close via X: ${modalGone ? 'SUCCESS' : 'FAILED'}`);

    await page.close();
  }

  console.log('\n\n=== SUMMARY ===');
  for (const r of results) {
    console.log(`${r.viewport}px: ${r.pass ? 'PASS' : 'FAIL'} | modal ${r.modalHeight.toFixed(0)}px / viewport ${r.viewportHeight}px | close visible: ${r.closeBtnVisible} | fits: ${r.fitsInViewport}`);
  }

  await browser.close();
}

run().catch(console.error);
