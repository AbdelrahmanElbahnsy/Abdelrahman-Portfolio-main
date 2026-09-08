import { chromium } from 'playwright';

async function verifyCasing() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:5173/');
  
  // Wait for the hero button to be present
  await page.waitForSelector('#hero-btn-cv span', { timeout: 10000 });

  const testCases = [
    "Show CV",
    "show cv",
    "SHOW CV",
    "Show Cv"
  ];

  console.log('--- STARTING VERIFICATION ---');

  for (const testText of testCases) {
    // Inject the text directly into the DOM (simulating React rendering this exact string from CMS)
    await page.evaluate((text) => {
      document.querySelector('#hero-btn-cv span').textContent = text;
    }, testText);

    // Read the VISUALLY COMPUTED text using innerText (which respects text-transform)
    const renderedText = await page.evaluate(() => {
      const el = document.querySelector('#hero-btn-cv span');
      const style = window.getComputedStyle(el);
      return {
        innerText: el.innerText,
        textTransform: style.textTransform
      };
    });

    const pass = renderedText.innerText === testText;
    
    console.log(`Test Case: "${testText}"`);
    console.log(`  Rendered innerText: "${renderedText.innerText}"`);
    console.log(`  Computed text-transform: "${renderedText.textTransform}"`);
    console.log(`  Result: ${pass ? 'PASS' : 'FAIL'}`);
    console.log('-----------------------------');
  }

  await browser.close();
}

verifyCasing().catch(console.error);
