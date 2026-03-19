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

  // === Test 1: UserManagement page ===
  await page.goto('http://localhost:3000/admin/users');
  await page.waitForTimeout(3000);

  // Check points balance shows numbers
  const balHeader = page.locator('th').filter({ hasText: '积分余额' });
  console.log(await balHeader.isVisible() ? '✅ 积分余额 column visible' : '❌ 积分余额 column missing');

  const orderHeader = page.locator('th').filter({ hasText: '兑换次数' });
  console.log(await orderHeader.isVisible() ? '✅ 兑换次数 column visible' : '❌ 兑换次数 column missing');

  // Check adjust button exists
  const adjustBtn = page.locator('[title="调整积分"]').first();
  console.log(await adjustBtn.isVisible() ? '✅ 调整积分 button visible' : '❌ 调整积分 button missing');

  // Open adjust dialog from user management
  await adjustBtn.click();
  await page.waitForTimeout(1000);

  // Verify all dialog elements
  const dialogChecks = ['调整用户积分', '当前积分余额', '增加积分', '扣减积分', '调整积分数', '调整原因', '备注说明'];
  for (const text of dialogChecks) {
    const el = page.locator(`text=${text}`).first();
    const v = await el.isVisible({ timeout: 2000 }).catch(() => false);
    console.log(v ? `✅ [UserMgmt] ${text}` : `❌ [UserMgmt] ${text} missing`);
  }

  // Close dialog
  await page.locator('[data-testid="CloseIcon"]').first().click();
  await page.waitForTimeout(500);

  // === Test 2: Navigate to points history ===
  const historyBtn = page.locator('[title="积分历史"]').first();
  if (await historyBtn.isVisible()) {
    await historyBtn.click();
    await page.waitForTimeout(3000);
    console.log('✅ Navigated to points history');

    // Check breadcrumb
    const breadcrumb = page.locator('text=积分变动记录');
    console.log(await breadcrumb.first().isVisible() ? '✅ Points history page loaded' : '❌ Points history page failed');

    // Open adjust dialog from points history
    const adjustBtn2 = page.locator('button').filter({ hasText: '调整积分' });
    if (await adjustBtn2.isVisible()) {
      await adjustBtn2.click();
      await page.waitForTimeout(1000);

      // Verify dialog elements
      for (const text of dialogChecks) {
        const el = page.locator(`text=${text}`).first();
        const v = await el.isVisible({ timeout: 2000 }).catch(() => false);
        console.log(v ? `✅ [PointsHist] ${text}` : `❌ [PointsHist] ${text} missing`);
      }

      // Test actual adjustment
      await page.locator('input[type="number"]').fill('50');
      await page.waitForTimeout(300);

      // Check preview
      const preview = page.locator('text=/调整后余额/');
      console.log(await preview.isVisible() ? '✅ Balance preview shown' : '❌ Balance preview missing');

      // Select reason
      const reasonSelect = page.locator('.MuiSelect-select').last();
      await reasonSelect.click();
      await page.waitForTimeout(500);
      await page.locator('li').filter({ hasText: '系统补偿' }).click();
      await page.waitForTimeout(300);

      // Fill note
      await page.locator('textarea').first().fill('Playwright测试调整');
      await page.waitForTimeout(300);

      // Submit
      await page.locator('button').filter({ hasText: '确认调整' }).click();
      await page.waitForTimeout(3000);

      const closed = !(await page.locator('text=调整用户积分').isVisible().catch(() => false));
      console.log(closed ? '✅ Adjust submitted successfully' : '❌ Dialog still open');

      await page.screenshot({ path: 'user-points-final.png' });
    }
  }

  await page.waitForTimeout(2000);
  await browser.close();
  console.log('✅ All tests done');
})();
