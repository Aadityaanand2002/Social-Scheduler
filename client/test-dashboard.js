import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));
  
  try {
    await page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle2' });
  } catch(e) {
    console.log('GOTO ERROR:', e.message);
  }
  
  await browser.close();
})();
