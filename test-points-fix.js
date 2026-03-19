const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  const page = await context.newPage();

  // Login as admin
  await page.goto('http://localhost:3000/login');
  await page.waitForTimeout(2000);
  const inputs = await page.locator('input').all();
  await inputs[0].fill('admin');
  await inputs[1].fill('admin123');
  await page.locator('button').filter({ hasText: /登|Sign/ }).click();
  await page.waitForTimeout(3000);
  console.log('✅ Admin login OK');

  // Go to points rule management
  await page.goto('http://localhost:3000/admin/points');
  await page.waitForTimeout(2000);

  // Test 1: Check 覆盖员工 shows a number, not '-'
  const coveredText = await page.locator('text=覆盖员工').locator('..').locator('..').textContent();
  const hasNumber = /\d+/.test(coveredText || '');
  console.log(hasNumber ? '✅ 覆盖员工 shows a number' : '❌ 覆盖员工 still shows -');

  // Test 2: Click edit on the 2nd rule (入职周年奖励)
  const editLinks = await page.locator('td >> text=编辑').all();
  console.log(`Found ${editLinks.length} edit links`);
  
  if (editLinks.length >= 2) {
    await editLinks[1].click(); // Click edit on 2nd rule
    await page.waitForTimeout(1000);
    
    // Check dialog opened with rule name
    const dialogTitle = await page.locator('text=编辑规则 - 入职周年奖励').count();
    console.log(dialogTitle > 0 ? '✅ Edit dialog opens for 入职周年奖励' : '❌ Edit dialog did not open');
    
    // Check the amount field has value
    const amountInput = page.locator('input[type="number"]');
    const val = await amountInput.inputValue();
    console.log(val === '1000' ? '✅ Amount field shows 1000' : `❌ Amount field shows: ${val}`);
    
    // Change amount and save
    await amountInput.fill('1500');
    await page.locator('button:has-text("保存")').click();
    await page.waitForTimeout(1000);
    
    // Verify the table updated
    const updatedRow = await page.locator('td:has-text("1,500")').count();
    console.log(updatedRow > 0 ? '✅ Rule amount updated to 1,500' : '❌ Rule amount not updated');
  }

  // Test 3: Click edit on the 1st rule (每月基础积分) - this one saves to backend
  if (editLinks.length >= 1) {
    await editLinks[0].click();
    await page.waitForTimeout(1000);
    const dialogTitle2 = await page.locator('text=编辑规则 - 每月基础积分').count();
    console.log(dialogTitle2 > 0 ? '✅ Edit dialog opens for 每月基础积分' : '❌ Edit dialog did not open for 每月基础积分');
    await page.locator('button:has-text("取消")').click();
  }

  console.log('\n🎉 Points rule fix tests completed!');
  await page.waitForTimeout(2000);
  await browser.close();
})();
