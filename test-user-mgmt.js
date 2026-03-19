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

  // Go to user management
  await page.goto('http://localhost:3000/admin/users');
  await page.waitForTimeout(3000);

  // Check points balance column shows numbers (not just '-')
  const balanceCells = page.locator('td').filter({ hasText: /^\d[\d,]*$/ });
  const balCount = await balanceCells.count();
  console.log(`✅ Found ${balCount} cells with numeric values (balance/count)`);

  // Check for 积分余额 header
  const balHeader = page.locator('text=积分余额');
  if (await balHeader.isVisible()) console.log('✅ 积分余额 column header visible');

  // Check for 兑换次数 header
  const orderHeader = page.locator('text=兑换次数');
  if (await orderHeader.isVisible()) console.log('✅ 兑换次数 column header visible');

  // Take screenshot of user list
  await page.screenshot({ path: 'user-mgmt-list.png' });
  console.log('✅ User list screenshot saved');

  // Find the adjust points button (TollIcon) and click it
  const adjustBtn = page.locator('[title="调整积分"]').first();
  if (await adjustBtn.isVisible()) {
    await adjustBtn.click();
    await page.waitForTimeout(1000);
    console.log('✅ Adjust points dialog opened');

    // Check dialog elements
    const checks = ['调整用户积分', '手动增加或扣减用户积分余额', '当前积分余额', '调整类型', '增加积分', '扣减积分', '调整积分数', '调整原因', '备注说明', '确认调整'];
    for (const text of checks) {
      const el = page.locator(`text=${text}`).first();
      const visible = await el.isVisible({ timeout: 2000 }).catch(() => false);
      console.log(visible ? `✅ ${text} visible` : `❌ ${text} NOT visible`);
    }

    // Take screenshot of dialog
    await page.screenshot({ path: 'user-mgmt-adjust.png' });
    console.log('✅ Adjust dialog screenshot saved');

    // Test: fill in adjust form and submit
    // Click 增加积分 (should already be selected)
    await page.locator('input[type="number"]').fill('100');
    await page.waitForTimeout(500);

    // Check preview text
    const preview = page.locator('text=/调整后余额/');
    if (await preview.isVisible()) console.log('✅ Balance preview visible');

    // Select reason
    const reasonSelect = page.locator('.MuiSelect-select').last();
    await reasonSelect.click();
    await page.waitForTimeout(500);
    await page.locator('li').filter({ hasText: '活动补发' }).click();
    await page.waitForTimeout(500);

    // Fill note
    const noteField = page.locator('textarea').first();
    await noteField.fill('测试调整积分');
    await page.waitForTimeout(500);

    // Click confirm
    const confirmBtn = page.locator('button').filter({ hasText: '确认调整' });
    await confirmBtn.click();
    await page.waitForTimeout(3000);

    // Check dialog closed
    const dialogStillOpen = await page.locator('text=调整用户积分').isVisible().catch(() => false);
    console.log(dialogStillOpen ? '❌ Dialog still open after submit' : '✅ Dialog closed after successful adjust');

    await page.screenshot({ path: 'user-mgmt-after-adjust.png' });
    console.log('✅ After adjust screenshot saved');
  } else {
    console.log('❌ Adjust points button not found');
  }

  await page.waitForTimeout(2000);
  await browser.close();
  console.log('✅ All checks done');
})();
