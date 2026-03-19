const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  // Login as employee
  await page.goto('http://localhost:3000/login');
  await page.waitForTimeout(2000);
  const inputs = page.locator('input');
  await inputs.nth(0).fill('luhaoy');
  await inputs.nth(1).fill('Amazon123');
  await page.locator('button').filter({ hasText: /登|Sign/ }).click();
  await page.waitForTimeout(4000);
  console.log('✅ Employee login, URL:', page.url());
  await page.screenshot({ path: 'emp-01-home.png', fullPage: true });

  // Check Shop Home
  const heroText = await page.locator('text=/精选|商城|积分/').first().isVisible().catch(() => false);
  console.log(heroText ? '✅ Shop Home hero visible' : '❌ Shop Home hero missing');

  // Check product cards
  const productCards = page.locator('text=/积分|兑换/');
  const cardCount = await productCards.count();
  console.log(`✅ Found ${cardCount} product-related elements`);

  // Check navbar elements
  const navItems = ['商城', '兑换记录'];
  for (const item of navItems) {
    const el = page.locator(`text=${item}`).first();
    const v = await el.isVisible({ timeout: 2000 }).catch(() => false);
    console.log(v ? `✅ Nav: ${item}` : `❌ Nav: ${item} missing`);
  }

  // Check points display in navbar
  const pointsDisplay = page.locator('text=/\\d.*积分|积分.*\\d/').first();
  const hasPoints = await pointsDisplay.isVisible({ timeout: 2000 }).catch(() => false);
  console.log(hasPoints ? '✅ Points displayed in navbar' : '⚠️ Points not in navbar');

  // Click first product to go to detail
  const firstProduct = page.locator('[class*="card"], [class*="Card"]').first();
  const productLink = page.locator('a[href*="/product"]').first();
  if (await productLink.isVisible({ timeout: 2000 }).catch(() => false)) {
    await productLink.click();
  } else {
    // Try clicking on product name or image
    const prodName = page.locator('text=Sony').first();
    if (await prodName.isVisible({ timeout: 2000 }).catch(() => false)) {
      await prodName.click();
    }
  }
  await page.waitForTimeout(3000);
  console.log('✅ Product detail, URL:', page.url());
  await page.screenshot({ path: 'emp-02-product-detail.png', fullPage: true });

  // Check product detail elements
  const detailChecks = ['积分', '立即兑换', '加入'];
  for (const text of detailChecks) {
    const el = page.locator(`text=${text}`).first();
    const v = await el.isVisible({ timeout: 2000 }).catch(() => false);
    console.log(v ? `✅ Detail: ${text}` : `❌ Detail: ${text} missing`);
  }

  // Click 立即兑换 to go to confirm page
  const redeemBtn = page.locator('button').filter({ hasText: /立即兑换|兑换/ }).first();
  if (await redeemBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await redeemBtn.click();
    await page.waitForTimeout(3000);
    console.log('✅ Confirm page, URL:', page.url());
    await page.screenshot({ path: 'emp-03-confirm.png', fullPage: true });

    // Check confirm page elements
    const confirmChecks = ['确认兑换', '商品信息', '积分'];
    for (const text of confirmChecks) {
      const el = page.locator(`text=${text}`).first();
      const v = await el.isVisible({ timeout: 2000 }).catch(() => false);
      console.log(v ? `✅ Confirm: ${text}` : `❌ Confirm: ${text} missing`);
    }
  } else {
    console.log('⚠️ 立即兑换 button not found');
  }

  // Go to redemption history
  await page.goto('http://localhost:3000/history');
  await page.waitForTimeout(3000);
  console.log('✅ History page, URL:', page.url());
  await page.screenshot({ path: 'emp-04-history.png', fullPage: true });

  const historyChecks = ['兑换记录'];
  for (const text of historyChecks) {
    const el = page.locator(`text=${text}`).first();
    const v = await el.isVisible({ timeout: 2000 }).catch(() => false);
    console.log(v ? `✅ History: ${text}` : `❌ History: ${text} missing`);
  }

  // Go to points center
  await page.goto('http://localhost:3000/points');
  await page.waitForTimeout(3000);
  console.log('✅ Points page, URL:', page.url());
  await page.screenshot({ path: 'emp-05-points.png', fullPage: true });

  const pointsChecks = ['积分'];
  for (const text of pointsChecks) {
    const el = page.locator(`text=${text}`).first();
    const v = await el.isVisible({ timeout: 2000 }).catch(() => false);
    console.log(v ? `✅ Points: ${text}` : `❌ Points: ${text} missing`);
  }

  await page.waitForTimeout(2000);
  await browser.close();
  console.log('✅ All employee tests done');
})();
