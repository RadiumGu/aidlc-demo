const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto('http://localhost:3000/login');
  await page.waitForTimeout(2000);
  const inputs = page.locator('input');
  await inputs.nth(0).fill('luhaoy');
  await inputs.nth(1).fill('Amazon123');
  await page.locator('button').filter({ hasText: /登|Sign/ }).click();
  await page.waitForTimeout(6000);
  console.log('URL:', page.url());

  // Check what text is actually on the page
  const allButtons = page.locator('button');
  const btnCount = await allButtons.count();
  console.log(`\nFound ${btnCount} buttons:`);
  for (let i = 0; i < Math.min(btnCount, 15); i++) {
    const txt = await allButtons.nth(i).textContent();
    console.log(`  Button ${i}: "${txt}"`);
  }

  // Check for specific text
  const textsToCheck = ['首页', '兑换记录', '积分中心', '本月精选好物', '全部', 'employee.nav.home', 'employee.heroTitle'];
  for (const t of textsToCheck) {
    const el = page.locator(`text=${t}`).first();
    const v = await el.isVisible({ timeout: 2000 }).catch(() => false);
    console.log(`"${t}": ${v ? 'VISIBLE' : 'NOT FOUND'}`);
  }

  await page.screenshot({ path: 'emp-home-debug.png', fullPage: true });
  await page.waitForTimeout(2000);
  await browser.close();
})();
