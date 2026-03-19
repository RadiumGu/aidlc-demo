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
  await page.waitForTimeout(4000);
  console.log('✅ Employee login, URL:', page.url());

  // === PAGE 1: Shop Home ===
  console.log('\n=== Shop Home ===');
  await page.screenshot({ path: 'emp-home.png', fullPage: true });

  // Check navbar
  const navHome = page.locator('button').filter({ hasText: '首页' });
  const navOrders = page.locator('button').filter({ hasText: '兑换记录' });
  const navPoints = page.locator('button').filter({ hasText: '积分中心' });
  console.log(await navHome.isVisible() ? '✅ Nav: 首页' : '❌ Nav: 首页');
  console.log(await navOrders.isVisible() ? '✅ Nav: 兑换记录' : '❌ Nav: 兑换记录');
  console.log(await navPoints.isVisible() ? '✅ Nav: 积分中心' : '❌ Nav: 积分中心');

  // Check points chip in navbar
  const pointsChip = page.locator('text=/\\d.*积分/').first();
  console.log(await pointsChip.isVisible() ? '✅ Points chip in navbar' : '❌ Points chip missing');

  // Check hero banner
  const hero = page.locator('text=本月精选好物');
  console.log(await hero.isVisible() ? '✅ Hero banner' : '❌ Hero banner missing');
  if (!(await hero.isVisible())) issues.push('Hero banner text not visible');

  // Check category chips
  const allCat = page.locator('text=全部').first();
  console.log(await allCat.isVisible() ? '✅ Category filter' : '❌ Category filter');

  // Check product cards
  const cards = page.locator('[class*="MuiCard"]');
  const cardCount = await cards.count();
  console.log(`✅ Product cards: ${cardCount}`);
  if (cardCount === 0) issues.push('No product cards on home page');

  // Check product card has price with 积分
  const priceEl = page.locator('text=/\\d.*,?\\d+/').first();
  console.log(await priceEl.isVisible() ? '✅ Product price visible' : '❌ Product price missing');

  // Check 兑换 button on cards
  const redeemBtns = page.locator('button').filter({ hasText: '兑换' });
  console.log(await redeemBtns.first().isVisible() ? '✅ 兑换 buttons on cards' : '❌ 兑换 buttons missing');

  // === PAGE 2: Product Detail ===
  console.log('\n=== Product Detail ===');
  // Click first product card
  await cards.first().click();
  await page.waitForTimeout(3000);
  console.log('URL:', page.url());
  await page.screenshot({ path: 'emp-product-detail.png', fullPage: true });

  // Check breadcrumb
  const breadcrumb = page.locator('text=首页').first();
  console.log(await breadcrumb.isVisible() ? '✅ Breadcrumb' : '❌ Breadcrumb missing');

  // Check product name
  const prodName = page.locator('h1, h2, h3, h4, h5, h6, [class*="Typography"]').filter({ hasText: /.{3,}/ }).first();
  console.log('✅ Product detail loaded');

  // Check price
  const detailPrice = page.locator('text=/\\d.*积分/').first();
  console.log(await detailPrice.isVisible() ? '✅ Price with 积分' : '❌ Price missing');

  // Check stock
  const stock = page.locator('text=/库存/').first();
  console.log(await stock.isVisible() ? '✅ Stock info' : '❌ Stock info missing');

  // Check 立即兑换 button
  const redeemDetail = page.locator('button').filter({ hasText: '立即兑换' });
  console.log(await redeemDetail.isVisible() ? '✅ 立即兑换 button' : '❌ 立即兑换 button missing');

  // === PAGE 3: Confirm Redemption ===
  console.log('\n=== Confirm Redemption ===');
  if (await redeemDetail.isVisible()) {
    await redeemDetail.click();
    await page.waitForTimeout(3000);
    console.log('URL:', page.url());
    await page.screenshot({ path: 'emp-confirm.png', fullPage: true });

    const confirmChecks = ['请确认兑换', '商品摘要', '积分明细', '应付积分', '当前积分余额', '确认兑换'];
    for (const text of confirmChecks) {
      const el = page.locator(`text=${text}`).first();
      const v = await el.isVisible({ timeout: 2000 }).catch(() => false);
      console.log(v ? `✅ ${text}` : `❌ ${text} missing`);
      if (!v) issues.push(`Confirm page: ${text} missing`);
    }

    // Don't actually submit - go back
    await page.goBack();
    await page.waitForTimeout(2000);
  }

  // === PAGE 4: Redemption History ===
  console.log('\n=== Redemption History ===');
  await page.goto('http://localhost:3000/orders');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'emp-history.png', fullPage: true });

  const historyTitle = page.locator('text=兑换记录').first();
  console.log(await historyTitle.isVisible() ? '✅ 兑换记录 title' : '❌ 兑换记录 title missing');

  // Check tabs
  const tabChecks = ['全部', '待处理', '待取货', '已完成', '已取消'];
  for (const t of tabChecks) {
    const el = page.locator(`text=${t}`).first();
    const v = await el.isVisible({ timeout: 2000 }).catch(() => false);
    console.log(v ? `✅ Tab: ${t}` : `❌ Tab: ${t} missing`);
  }

  // Check order cards
  const orderCards = page.locator('[class*="MuiPaper"]');
  const orderCount = await orderCards.count();
  console.log(`✅ Order cards: ${orderCount}`);

  // Check 查看详情 button
  const detailBtn = page.locator('button').filter({ hasText: '查看详情' }).first();
  if (await detailBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    console.log('✅ 查看详情 button');
    
    // === PAGE 5: Order Detail ===
    console.log('\n=== Order Detail ===');
    await detailBtn.click();
    await page.waitForTimeout(3000);
    console.log('URL:', page.url());
    await page.screenshot({ path: 'emp-order-detail.png', fullPage: true });

    const orderDetailChecks = ['订单详情', '商品信息', '订单信息'];
    for (const text of orderDetailChecks) {
      const el = page.locator(`text=${text}`).first();
      const v = await el.isVisible({ timeout: 2000 }).catch(() => false);
      console.log(v ? `✅ ${text}` : `❌ ${text} missing`);
    }
  } else {
    console.log('⚠️ No orders to view detail');
  }

  // === PAGE 6: Points Center ===
  console.log('\n=== Points Center ===');
  await page.goto('http://localhost:3000/points');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'emp-points.png', fullPage: true });

  const pointsTitle = page.locator('text=/可用积分|我的/').first();
  console.log(await pointsTitle.isVisible() ? '✅ Points center title' : '❌ Points center title missing');

  // Check balance display
  const balanceDisplay = page.locator('text=/\\d{1,3}(,\\d{3})*/').first();
  console.log(await balanceDisplay.isVisible() ? '✅ Balance displayed' : '❌ Balance missing');

  // Check tabs
  const ptsTabs = ['全部', '收入', '支出'];
  for (const t of ptsTabs) {
    const el = page.locator(`[role="tab"]`).filter({ hasText: t });
    const v = await el.isVisible({ timeout: 2000 }).catch(() => false);
    console.log(v ? `✅ Tab: ${t}` : `❌ Tab: ${t} missing`);
  }

  // Summary
  console.log('\n=== SUMMARY ===');
  if (issues.length === 0) {
    console.log('✅ All employee pages working correctly!');
  } else {
    console.log(`⚠️ Found ${issues.length} issues:`);
    issues.forEach(i => console.log(`  - ${i}`));
  }

  await page.waitForTimeout(2000);
  await browser.close();
})();
