const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  const page = await context.newPage();

  const BASE = 'http://localhost:3000';
  const SD = '/tmp/playwright-screenshots';

  async function ss(name) {
    await page.screenshot({ path: `${SD}/${name}.png`, fullPage: true });
    console.log(`📸 ${name}`);
  }
  async function sleep(ms) { await new Promise(r => setTimeout(r, ms)); }

  // Listen to all network responses for /admin/products
  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('/admin/products/13') || url.includes('/products/13')) {
      console.log(`  [NET] ${response.status()} ${url}`);
      try {
        const body = await response.text();
        console.log(`  [BODY] ${body.substring(0, 300)}`);
      } catch (e) {
        console.log(`  [BODY] (could not read)`);
      }
    }
  });

  // Listen to console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`  [CONSOLE ERROR] ${msg.text()}`);
    }
  });

  page.on('pageerror', err => {
    console.log(`  [PAGE ERROR] ${err.message}`);
  });

  try {
    // Login
    console.log('=== 登录 ===');
    await page.goto(`${BASE}/login`);
    await page.waitForLoadState('networkidle');
    await sleep(1000);
    const inputs = page.locator('input.MuiInputBase-input');
    await inputs.nth(0).fill('admin');
    await inputs.nth(1).fill('admin123');
    await page.locator('button.MuiButton-contained').first().click();
    await page.waitForLoadState('networkidle');
    await sleep(2000);
    console.log('✅ 登录成功');

    // Navigate to Sony product detail
    console.log('\n=== 访问 Sony WH-1000XM5 详情 (ID=13) ===');
    await page.goto(`${BASE}/admin/products/13`);
    await page.waitForLoadState('networkidle');
    await sleep(3000);
    await ss('sony-detail');

    // Check for error
    const alert = page.locator('.MuiAlert-root');
    if (await alert.isVisible()) {
      console.log('❌ 错误:', await alert.textContent());
    }

    // Check if product loaded
    const title = page.locator('text=Sony WH-1000XM5');
    if (await title.isVisible()) {
      console.log('✅ 产品详情加载成功');
    } else {
      console.log('⚠️ 产品标题未显示');
    }

    // Also test a working product for comparison
    console.log('\n=== 对比: 访问良品铺子 (ID=22) ===');
    await page.goto(`${BASE}/admin/products/22`);
    await page.waitForLoadState('networkidle');
    await sleep(3000);
    await ss('lipinpuzi-detail');

    const alert2 = page.locator('.MuiAlert-root');
    if (await alert2.isVisible()) {
      console.log('❌ 错误:', await alert2.textContent());
    }
    const title2 = page.locator('text=良品铺子');
    if (await title2.isVisible()) {
      console.log('✅ 良品铺子加载成功');
    }

  } catch (err) {
    console.error('❌ 测试失败:', err.message);
    await ss('error-state');
  } finally {
    await sleep(2000);
    await browser.close();
  }
})();
