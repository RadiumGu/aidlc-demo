const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, locale: 'zh-CN' });

  // Login
  await page.goto('http://localhost:3000/login');
  await page.waitForTimeout(2000);
  const inputs = page.locator('input');
  await inputs.nth(0).fill('luhaoy');
  await inputs.nth(1).fill('Amazon123');
  await page.locator('button').filter({ hasText: /登|Sign/ }).click();
  await page.waitForTimeout(5000);
  console.log('✅ Logged in');

  // Go to first product
  const cards = page.locator('[class*="MuiCard"]');
  await cards.first().click();
  await page.waitForTimeout(3000);

  // Click 立即兑换
  await page.locator('button').filter({ hasText: '立即兑换' }).click();
  await page.waitForTimeout(3000);
  console.log('URL:', page.url());
  await page.screenshot({ path: 'emp-confirm-shipping.png', fullPage: true });

  // Check shipping form fields exist
  const nameField = page.locator('label:has-text("收货人")').first();
  const phoneField = page.locator('label:has-text("联系电话")').first();
  const addrField = page.locator('label:has-text("收货地址")').first();

  console.log(await nameField.isVisible() ? '✅ 收货人 field' : '❌ 收货人 field missing');
  console.log(await phoneField.isVisible() ? '✅ 联系电话 field' : '❌ 联系电话 field missing');
  console.log(await addrField.isVisible() ? '✅ 收货地址 field' : '❌ 收货地址 field missing');

  // Fill in shipping info
  const allInputs = page.locator('input');
  const inputCount = await allInputs.count();
  console.log(`Found ${inputCount} inputs`);

  // Find the shipping inputs (after the search bar inputs)
  const nameInput = page.locator('input[placeholder*="收货人"]');
  const phoneInput = page.locator('input[placeholder*="联系电话"]');
  const addrInput = page.locator('input[placeholder*="收货地址"]');

  if (await nameInput.isVisible()) {
    await nameInput.fill('张三');
    console.log('✅ Filled 收货人');
  }
  if (await phoneInput.isVisible()) {
    await phoneInput.fill('13800138000');
    console.log('✅ Filled 联系电话');
  }
  if (await addrInput.isVisible()) {
    await addrInput.fill('北京市海淀区中关村软件园 A 座 305');
    console.log('✅ Filled 收货地址');
  }

  await page.screenshot({ path: 'emp-confirm-filled.png', fullPage: true });

  // Try to submit without filling (test validation)
  // Actually let's submit with the filled data
  const confirmBtn = page.locator('button').filter({ hasText: '确认兑换' });
  if (await confirmBtn.isEnabled()) {
    await confirmBtn.click();
    await page.waitForTimeout(4000);
    console.log('After submit URL:', page.url());

    if (page.url().includes('/orders')) {
      console.log('✅ Order created successfully, redirected to orders');

      // Check the latest order detail for shipping info
      const detailBtn = page.locator('button').filter({ hasText: '查看详情' }).first();
      if (await detailBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await detailBtn.click();
        await page.waitForTimeout(3000);
        await page.screenshot({ path: 'emp-order-with-shipping.png', fullPage: true });

        // Check shipping info displayed
        const hasName = await page.locator('text=张三').isVisible().catch(() => false);
        const hasPhone = await page.locator('text=13800138000').isVisible().catch(() => false);
        const hasAddr = await page.locator('text=北京市海淀区').isVisible().catch(() => false);
        console.log(hasName ? '✅ 收货人 displayed in order detail' : '❌ 收货人 not in order detail');
        console.log(hasPhone ? '✅ 联系电话 displayed in order detail' : '❌ 联系电话 not in order detail');
        console.log(hasAddr ? '✅ 收货地址 displayed in order detail' : '❌ 收货地址 not in order detail');
      }
    } else {
      console.log('❌ Not redirected to orders, URL:', page.url());
      await page.screenshot({ path: 'emp-confirm-error.png', fullPage: true });
    }
  }

  await page.waitForTimeout(2000);
  await browser.close();
})();
