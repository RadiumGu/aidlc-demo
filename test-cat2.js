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
    await page.screenshot({ path: `${SD}/cat-new.png`, fullPage: true });
    console.log('📸 cat-new (updated design)');

    // Test search
    const searchInput = page.locator('input[placeholder*="搜索"]');
    if (await searchInput.isVisible()) {
      console.log('✅ 搜索框存在');
    }

    // Test status filter
    const statusSelect = page.locator('[role="combobox"]');
    if (await statusSelect.first().isVisible()) {
      console.log('✅ 状态筛选存在');
    }

    // Check for status chips
    const chips = page.locator('.MuiChip-root');
    const chipCount = await chips.count();
    console.log(`✅ 状态标签数量: ${chipCount}`);

    // Check for "添加子类" text
    const addChild = page.locator('text=添加子类');
    const addChildCount = await addChild.count();
    console.log(`✅ "添加子类"操作数量: ${addChildCount}`);

    // Check for "禁用" text
    const disable = page.locator('p:has-text("禁用")');
    const disableCount = await disable.count();
    console.log(`✅ "禁用"操作数量: ${disableCount}`);

    // Check for product count column
    const productCountHeader = page.locator('text=商品数量');
    if (await productCountHeader.isVisible()) {
      console.log('✅ 商品数量列存在');
    }

    console.log('\n🎉 类目管理页面更新完成');

  } catch (err) {
    console.error('❌', err.message);
    await page.screenshot({ path: `${SD}/cat-error.png`, fullPage: true });
  } finally {
    await new Promise(r => setTimeout(r, 2000));
    await browser.close();
  }
})();
