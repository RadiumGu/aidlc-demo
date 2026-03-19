const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });

  // === STEP 1: Employee creates an order with shipping info ===
  const empPage = await browser.newPage({ viewport: { width: 1440, height: 900 }, locale: 'zh-CN' });
  await empPage.goto('http://localhost:3000/login');
  await empPage.waitForTimeout(2000);
  let inputs = empPage.locator('input');
  await inputs.nth(0).fill('luhaoy');
  await inputs.nth(1).fill('Amazon123');
  await empPage.locator('button').filter({ hasText: /登|Sign/ }).click();
  await empPage.waitForTimeout(5000);
  console.log('✅ Employee logged in');

  // Go to first product and redeem
  await empPage.locator('[class*="MuiCard"]').first().click();
  await empPage.waitForTimeout(3000);
  await empPage.locator('button').filter({ hasText: '立即兑换' }).click();
  await empPage.waitForTimeout(3000);

  // Fill shipping info
  const nameInput = empPage.locator('input[placeholder*="收货人"]');
  const phoneInput = empPage.locator('input[placeholder*="联系电话"]');
  const addrInput = empPage.locator('input[placeholder*="收货地址"]');
  await nameInput.fill('李四测试');
  await phoneInput.fill('13912345678');
  await addrInput.fill('上海市浦东新区张江高科技园区');
  await empPage.locator('button').filter({ hasText: '确认兑换' }).click();
  await empPage.waitForTimeout(4000);
  console.log('✅ Order created, URL:', empPage.url());
  await empPage.close();

  // === STEP 2: Admin checks exchange records ===
  const adminPage = await browser.newPage({ viewport: { width: 1440, height: 900 }, locale: 'zh-CN' });
  await adminPage.goto('http://localhost:3000/login');
  await adminPage.waitForTimeout(2000);
  inputs = adminPage.locator('input');
  await inputs.nth(0).fill('admin');
  await inputs.nth(1).fill('admin123');
  await adminPage.locator('button').filter({ hasText: /登|Sign/ }).click();
  await adminPage.waitForTimeout(5000);
  console.log('✅ Admin logged in');

  // Navigate to exchange records
  await adminPage.goto('http://localhost:3000/admin/orders');
  await adminPage.waitForTimeout(3000);
  await adminPage.screenshot({ path: 'admin-exchange-records.png', fullPage: true });

  // Check if username is displayed (not "用户X")
  const firstRow = adminPage.locator('table tbody tr').first();
  const employeeCell = firstRow.locator('td').nth(2);
  const employeeText = await employeeCell.textContent();
  console.log('兑换员工 column text:', employeeText);
  if (employeeText && employeeText.includes('luhaoy')) {
    console.log('✅ Username displayed correctly in exchange records');
  } else {
    console.log('❌ Username not showing correctly, got:', employeeText);
  }

  // Click detail of first order
  await firstRow.locator('text=详情').click();
  await adminPage.waitForTimeout(3000);
  await adminPage.screenshot({ path: 'admin-exchange-detail.png', fullPage: true });

  // Check shipping info
  const hasName = await adminPage.locator('text=李四测试').isVisible().catch(() => false);
  const hasPhone = await adminPage.locator('text=13912345678').isVisible().catch(() => false);
  const hasAddr = await adminPage.locator('text=上海市浦东新区').isVisible().catch(() => false);
  console.log(hasName ? '✅ 收货人 displayed in admin detail' : '❌ 收货人 not in admin detail');
  console.log(hasPhone ? '✅ 联系电话 displayed in admin detail' : '❌ 联系电话 not in admin detail');
  console.log(hasAddr ? '✅ 收货地址 displayed in admin detail' : '❌ 收货地址 not in admin detail');

  // Check employee name in detail
  const hasUsername = await adminPage.locator('text=luhaoy').isVisible().catch(() => false);
  console.log(hasUsername ? '✅ Employee username in detail' : '❌ Employee username not in detail');

  await adminPage.waitForTimeout(2000);
  await browser.close();
})();
