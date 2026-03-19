const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const issues = [];

  // Login as employee
  await page.goto('http://localhost:3000/login');
  await page.waitForTimeout(2000);
  const inputs = page.locator('input');
  await inputs.nth(0).fill('luhaoy');
  await inputs.nth(1).fill('Amazon123');
  await page.locator('button').filter({ hasText: /登|Sign/ }).click();
  await page.waitForTimeout(5000);
  console.log('✅ Employee login, URL:', page.url());

  // === PAGE 1: Shop Home ===
  console.log('\n=== Shop Home ===');
  await page.screenshot({ path: 'emp-home.png', fullPage: true });

  // Check navbar elements
  const navChecks = ['首页', '兑换记录', '积分中心'];
  for (const t of navChecks) {
    const el = page.locator(`text=${t}`).first();
    const v = await el.isVisible({ timeout: 3000 }).catch(() => false);
    console.log(v ? `✅ Nav: ${t}` : `❌ Nav: ${t}`);
    if (!v) issues.push(`Nav: ${t} missing`);
  }

  // Check points chip
  const pointsChip = page.locator('text=/积分/').first();
  console.log(await pointsChip.isVisible() ? '✅ Points chip' : '❌ Points chip');

  // Check hero banner
  const hero = page.locator('text=本月精选好物');
  console.log(await hero.isVisible() ? '✅ Hero banner' : '❌ Hero banner');
  if (!(await hero.isVisible())) issues.push('Hero banner missing');

  // Check category chips
  const allCat = page.locator('text=全部').first();
  console.log(await allCat.isVisible() ? '✅ Category filter' : '❌ Category filter');

  // Check product cards
  const cards = page.locator('[class*="MuiCard"]');
  const cardCount = await cards.count();
  console.log(`✅ Product cards: ${cardCount}`);
  if (cardCount === 0) issues.push('No product cards');

  // === PAGE 2: Product Detail ===
  console.log('\n=== Product Detail ===');
  await cards.first().click();
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'emp-product-detail.png', fullPage: true });

  const pdChecks = ['首页', '积分', '库存', '立即兑换'];
  for (const t of pdChecks) {
    const el = page.locator(`text=${t}`).first();
    const v = await el.isVisible({ timeout: 2000 }).catch(() => false);
    console.log(v ? `✅ ${t}` : `❌ ${t}`);
  }

  // === PAGE 3: Confirm Redemption ===
  console.log('\n=== Confirm Redemption ===');
  const redeemBtn = page.locator('button').filter({ hasText: '立即兑换' });
  if (await redeemBtn.isVisible()) {
    await redeemBtn.click();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'emp-confirm.png', fullPage: true });

    const confirmChecks = ['请确认兑换', '商品信息', '积分明细', '应付积分', '当前积分余额', '确认兑换', '收货信息', '温馨提示'];
    for (const t of confirmChecks) {
      const el = page.locator(`text=${t}`).first();
      const v = await el.isVisible({ timeout: 2000 }).catch(() => false);
      console.log(v ? `✅ ${t}` : `❌ ${t}`);
      if (!v) issues.push(`Confirm: ${t} missing`);
    }

    // Check quantity selector
    const qtyPlus = page.locator('[data-testid="AddIcon"]').first();
    const qtyMinus = page.locator('[data-testid="RemoveIcon"]').first();
    const hasQty = (await qtyPlus.isVisible().catch(() => false)) || (await page.locator('text=数量').first().isVisible().catch(() => false));
    console.log(hasQty ? '✅ Quantity selector' : '❌ Quantity selector');

    await page.goBack();
    await page.waitForTimeout(2000);
  }

  // === PAGE 4: Redemption History ===
  console.log('\n=== Redemption History ===');
  await page.goto('http://localhost:3000/orders');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'emp-history.png', fullPage: true });

  console.log(await page.locator('text=兑换记录').first().isVisible() ? '✅ Title' : '❌ Title');
  console.log(await page.locator('text=查看您的所有积分兑换订单').first().isVisible().catch(() => false) ? '✅ Subtitle' : '❌ Subtitle');

  // Check pill tabs (design uses 待发货/已发货 not 待处理/待取货)
  const histTabs = ['全部', '待发货', '已发货', '已完成', '已取消'];
  for (const t of histTabs) {
    const el = page.locator(`text=${t}`).first();
    const v = await el.isVisible({ timeout: 2000 }).catch(() => false);
    console.log(v ? `✅ Tab: ${t}` : `❌ Tab: ${t}`);
    if (!v) issues.push(`History tab: ${t} missing`);
  }

  // Check search box
  const searchBox = page.locator('input[placeholder*="搜索"]');
  console.log(await searchBox.isVisible().catch(() => false) ? '✅ Search box' : '❌ Search box');

  // Check order cards have 查看详情
  const detailBtn = page.locator('button').filter({ hasText: '查看详情' }).first();
  if (await detailBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    console.log('✅ 查看详情 button');

    // === PAGE 5: Order Detail ===
    console.log('\n=== Order Detail ===');
    await detailBtn.click();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'emp-order-detail.png', fullPage: true });

    const odChecks = ['订单详情', '订单状态', '商品信息', '积分明细', '实付积分', '收货信息', '订单信息', '返回订单列表', '联系客服'];
    for (const t of odChecks) {
      const el = page.locator(`text=${t}`).first();
      const v = await el.isVisible({ timeout: 2000 }).catch(() => false);
      console.log(v ? `✅ ${t}` : `❌ ${t}`);
      if (!v) issues.push(`OrderDetail: ${t} missing`);
    }
  }

  // === PAGE 6: Points Center ===
  console.log('\n=== Points Center ===');
  await page.goto('http://localhost:3000/points');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'emp-points.png', fullPage: true });

  const pcChecks = ['我的可用积分', '累计获得', '累计使用', '兑换次数', '积分商城', '兑换记录', '积分规则', '帮助中心', '积分获取途径', '工龄积分', '绩效奖励', '节日福利', '特别贡献', '积分明细'];
  for (const t of pcChecks) {
    const el = page.locator(`text=${t}`).first();
    const v = await el.isVisible({ timeout: 2000 }).catch(() => false);
    console.log(v ? `✅ ${t}` : `❌ ${t}`);
    if (!v) issues.push(`PointsCenter: ${t} missing`);
  }

  // Summary
  console.log('\n=== SUMMARY ===');
  if (issues.length === 0) {
    console.log('✅ All employee pages match Pencil design!');
  } else {
    console.log(`⚠️ Found ${issues.length} issues:`);
    issues.forEach(i => console.log(`  - ${i}`));
  }

  await page.waitForTimeout(2000);
  await browser.close();
})();
