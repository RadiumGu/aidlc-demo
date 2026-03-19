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
  await page.locator('button:has-text("登"), button:has-text("Sign In")').click();
  await page.waitForTimeout(3000);
  console.log('✅ Admin login OK');

  // Test 1: User Management
  await page.goto('http://localhost:3000/admin/users');
  await page.waitForTimeout(2000);
  // Check stat cards exist
  const statCards = await page.locator('text=总用户数').count();
  console.log(statCards > 0 ? '✅ User Management: stat cards present' : '❌ User Management: stat cards missing');
  // Check role filter
  const roleFilter = await page.locator('text=全部角色').count();
  console.log(roleFilter > 0 ? '✅ User Management: role filter present' : '❌ User Management: role filter missing');
  // Check table columns
  const deptCol = await page.locator('th:has-text("部门")').count();
  const ptsCol = await page.locator('th:has-text("积分余额")').count();
  const ordCol = await page.locator('th:has-text("兑换次数")').count();
  console.log(deptCol > 0 ? '✅ User Management: 部门 column' : '❌ User Management: 部门 column missing');
  console.log(ptsCol > 0 ? '✅ User Management: 积分余额 column' : '❌ User Management: 积分余额 column missing');
  console.log(ordCol > 0 ? '✅ User Management: 兑换次数 column' : '❌ User Management: 兑换次数 column missing');
  // Check action icons
  const editIcon = await page.locator('[title="编辑"]').count();
  const blockIcon = await page.locator('[title="禁用"], [title="启用"]').count();
  console.log(editIcon > 0 ? '✅ User Management: edit action' : '❌ User Management: edit action missing');
  console.log(blockIcon > 0 ? '✅ User Management: block/enable action' : '❌ User Management: block/enable action missing');

  // Test 2: Points Rule Management
  await page.goto('http://localhost:3000/admin/points');
  await page.waitForTimeout(2000);
  const ruleTitle = await page.locator('text=积分规则管理').count();
  console.log(ruleTitle > 0 ? '✅ Points Rule: title present' : '❌ Points Rule: title missing');
  const ruleStats = await page.locator('text=规则总数').count();
  console.log(ruleStats > 0 ? '✅ Points Rule: stat cards present' : '❌ Points Rule: stat cards missing');
  const ruleNameCol = await page.locator('th:has-text("规则名称")').count();
  const triggerCol = await page.locator('th:has-text("触发条件")').count();
  console.log(ruleNameCol > 0 ? '✅ Points Rule: 规则名称 column' : '❌ Points Rule: 规则名称 column missing');
  console.log(triggerCol > 0 ? '✅ Points Rule: 触发条件 column' : '❌ Points Rule: 触发条件 column missing');
  const addBtn = await page.locator('text=新增规则').count();
  console.log(addBtn > 0 ? '✅ Points Rule: 新增规则 button' : '❌ Points Rule: 新增规则 button missing');

  // Test 3: Exchange Records
  await page.goto('http://localhost:3000/admin/orders');
  await page.waitForTimeout(2000);
  const exSubtitle = await page.locator('text=查看和管理员工积分兑换订单').count();
  console.log(exSubtitle > 0 ? '✅ Exchange Records: subtitle present' : '❌ Exchange Records: subtitle missing');
  const exStats = await page.locator('text=总兑换数').count();
  console.log(exStats > 0 ? '✅ Exchange Records: stat cards present' : '❌ Exchange Records: stat cards missing');
  const statusFilter = await page.locator('text=全部状态').count();
  console.log(statusFilter > 0 ? '✅ Exchange Records: status filter present' : '❌ Exchange Records: status filter missing');
  const empCol = await page.locator('th:has-text("兑换员工")').count();
  console.log(empCol > 0 ? '✅ Exchange Records: 兑换员工 column' : '❌ Exchange Records: 兑换员工 column missing');
  const detailLink = await page.locator('text=详情').first();
  if (await detailLink.count() > 0) {
    console.log('✅ Exchange Records: 详情 text link');
  } else {
    console.log('❌ Exchange Records: 详情 text link missing');
  }

  // Test 4: Exchange Detail - click first detail link
  const detailLinks = await page.locator('td >> text=详情');
  if (await detailLinks.count() > 0) {
    await detailLinks.first().click();
    await page.waitForTimeout(2000);
    const timelineCard = await page.locator('text=状态记录').count();
    const delivCard = await page.locator('text=收货信息').count();
    const orderCard = await page.locator('text=订单信息').count();
    console.log(timelineCard > 0 ? '✅ Exchange Detail: 状态记录 card' : '❌ Exchange Detail: 状态记录 card missing');
    console.log(delivCard > 0 ? '✅ Exchange Detail: 收货信息 card' : '❌ Exchange Detail: 收货信息 card missing');
    console.log(orderCard > 0 ? '✅ Exchange Detail: 订单信息 card' : '❌ Exchange Detail: 订单信息 card missing');
  }

  // Test 5: User Points History
  await page.goto('http://localhost:3000/admin/users');
  await page.waitForTimeout(2000);
  const historyBtn = await page.locator('[title="积分历史"]').first();
  if (await historyBtn.count() > 0) {
    await historyBtn.click();
    await page.waitForTimeout(2000);
    const phStats = await page.locator('text=累计获得').count();
    console.log(phStats > 0 ? '✅ Points History: stat cards present' : '❌ Points History: stat cards missing');
    const typeFilterPH = await page.locator('text=全部类型').count();
    console.log(typeFilterPH > 0 ? '✅ Points History: type filter present' : '❌ Points History: type filter missing');
    const operatorCol = await page.locator('th:has-text("操作人")').count();
    console.log(operatorCol > 0 ? '✅ Points History: 操作人 column' : '❌ Points History: 操作人 column missing');
    const adjustBtn = await page.locator('text=调整积分').count();
    console.log(adjustBtn > 0 ? '✅ Points History: 调整积分 button' : '❌ Points History: 调整积分 button missing');
  }

  console.log('\n🎉 All page tests completed!');
  await page.waitForTimeout(3000);
  await browser.close();
})();
