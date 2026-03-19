const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  // Login as admin
  await page.goto('http://localhost:3000/login');
  await page.waitForTimeout(2000);
  const inputs = page.locator('input');
  await inputs.nth(0).fill('admin');
  await inputs.nth(1).fill('admin123');
  await page.locator('button').filter({ hasText: /登|Sign/ }).click();
  await page.waitForTimeout(3000);
  console.log('✅ Admin login OK');

  // Go to exchange records
  await page.goto('http://localhost:3000/admin/orders');
  await page.waitForTimeout(2000);

  // Click first order detail link
  const detailLink = page.locator('text=详情').first();
  if (await detailLink.isVisible()) {
    await detailLink.click();
    await page.waitForTimeout(2000);
    console.log('✅ Navigated to exchange detail');

    // Click 修改状态 button
    const editBtn = page.locator('button').filter({ hasText: '修改状态' });
    if (await editBtn.isVisible()) {
      await editBtn.click();
      await page.waitForTimeout(1000);
      console.log('✅ Dialog opened');

      // Check dialog header has order number
      const orderNum = page.locator('text=/EX\\d+/');
      if (await orderNum.first().isVisible()) {
        console.log('✅ Order number in dialog header');
      } else {
        console.log('❌ Missing order number in dialog header');
      }

      // Check fields
      const checks = ['当前状态', '目标状态', '快递公司', '快递单号', '备注说明', '确认修改'];
      for (const text of checks) {
        const el = page.locator(`text=${text}`).first();
        const visible = await el.isVisible({ timeout: 3000 }).catch(() => false);
        console.log(visible ? `✅ ${text} visible` : `❌ ${text} NOT visible`);
      }

      // Take screenshot
      await page.screenshot({ path: 'shipping-dialog.png', fullPage: false });
      console.log('✅ Screenshot saved');
    } else {
      console.log('⚠️ 修改状态 button not visible (order may be completed/cancelled)');
      await page.screenshot({ path: 'shipping-dialog-nobutton.png', fullPage: false });
    }
  } else {
    console.log('⚠️ No orders found');
  }

  await page.waitForTimeout(2000);
  await browser.close();
  console.log('✅ All checks done');
})();
