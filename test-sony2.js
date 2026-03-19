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

  try {
    // Login
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

    // Go to product list first
    console.log('\n=== 从产品列表点击 Sony 商品 ===');
    await page.goto(`${BASE}/admin/products`);
    await page.waitForLoadState('networkidle');
    await sleep(2000);
    await ss('sony-01-product-list');

    // Find and click the Sony product card
    const sonyCard = page.locator('text=Sony WH-1000XM5').first();
    if (await sonyCard.isVisible()) {
      console.log('  找到 Sony 商品卡片，点击...');
      await sonyCard.click();
      await sleep(3000);
      await ss('sony-02-after-click');
      console.log('  URL:', page.url());

      // Check for error alert
      const alerts = page.locator('.MuiAlert-root');
      const alertCount = await alerts.count();
      console.log(`  Alert 数量: ${alertCount}`);
      for (let i = 0; i < alertCount; i++) {
        const text = await alerts.nth(i).textContent();
        console.log(`  Alert ${i}: ${text}`);
      }

      // Check for loading spinner
      const spinner = page.locator('.MuiCircularProgress-root');
      if (await spinner.isVisible()) {
        console.log('  ⚠️ 仍在加载中...');
      }

      // Check page content
      const bodyText = await page.locator('body').textContent();
      if (bodyText.includes('加载产品详情失败')) {
        console.log('  ❌ 页面显示: 加载产品详情失败');
      } else if (bodyText.includes('Sony WH-1000XM5')) {
        console.log('  ✅ 页面显示了 Sony 产品信息');
      } else {
        console.log('  ⚠️ 页面内容不明确');
        console.log('  前200字:', bodyText.substring(0, 200));
      }
    } else {
      console.log('  ⚠️ 产品列表中未找到 Sony 商品');
      // Check if it's on a different page or filtered out
      const allCards = page.locator('.MuiCard-root');
      const cardCount = await allCards.count();
      console.log(`  卡片总数: ${cardCount}`);
    }

    // Direct navigation test
    console.log('\n=== 直接访问 /admin/products/13 ===');
    await page.goto(`${BASE}/admin/products/13`);
    await page.waitForLoadState('networkidle');
    await sleep(3000);
    await ss('sony-03-direct-nav');

    const bodyText2 = await page.locator('body').textContent();
    if (bodyText2.includes('加载产品详情失败')) {
      console.log('  ❌ 直接访问也显示: 加载产品详情失败');
    } else if (bodyText2.includes('Sony WH-1000XM5')) {
      console.log('  ✅ 直接访问显示了 Sony 产品信息');
    }

  } catch (err) {
    console.error('❌ 测试失败:', err.message);
    await ss('error-state');
  } finally {
    await sleep(2000);
    await browser.close();
  }
})();
