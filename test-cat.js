const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  const SD = '/tmp/playwright-screenshots';
  try {
    await page.goto('http://localhost:3000/login');
    await page.waitForLoadState('networkidle');
    await new Promise(r => setTimeout(r, 1000));
    const inputs = page.locator('input.MuiInputBase-input');
    await inputs.nth(0).fill('admin');
    await inputs.nth(1).fill('admin123');
    await page.locator('button.MuiButton-contained').first().click();
    await page.waitForLoadState('networkidle');
    await new Promise(r => setTimeout(r, 2000));

    await page.goto('http://localhost:3000/admin/categories');
    await page.waitForLoadState('networkidle');
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: `${SD}/cat-current.png`, fullPage: true });
    console.log('📸 cat-current');

    // Expand all parent categories
    const expandBtns = page.locator('button:has(svg[data-testid="ChevronRightIcon"])');
    const count = await expandBtns.count();
    console.log(`展开按钮数量: ${count}`);
    for (let i = 0; i < count; i++) {
      await expandBtns.nth(i).click();
      await new Promise(r => setTimeout(r, 300));
    }
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: `${SD}/cat-expanded.png`, fullPage: true });
    console.log('📸 cat-expanded');

  } catch (err) {
    console.error('❌', err.message);
    await page.screenshot({ path: `${SD}/cat-error.png`, fullPage: true });
  } finally {
    await new Promise(r => setTimeout(r, 2000));
    await browser.close();
  }
})();
