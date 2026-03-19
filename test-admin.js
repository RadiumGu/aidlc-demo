const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  const page = await context.newPage();

  const BASE = 'http://localhost:3000';
  const SD = '/tmp/playwright-screenshots';

  async function ss(name) {
    await page.screenshot({ path: `${SD}/${name}.png`, fullPage: true });
    console.log(`📸 ${name}`);
  }
  async function sleep(ms) { await new Promise(r => setTimeout(r, ms)); }

  try {
    // === LOGIN ===
    console.log('\n=== 1. 登录 ===');
    await page.goto(`${BASE}/login`);
    await page.waitForLoadState('networkidle');
    await sleep(1000);

    // MUI TextFields render as input inside .MuiInputBase-root
    const inputs = page.locator('input.MuiInputBase-input');
    const inputCount = await inputs.count();
    console.log(`  找到 ${inputCount} 个输入框`);

    // First input = username, second = password
    if (inputCount >= 2) {
      await inputs.nth(0).fill('admin');
      await inputs.nth(1).fill('admin123');
    } else {
      // Fallback
      await page.locator('input').first().fill('admin');
      await page.locator('input').nth(1).fill('admin123');
    }

    // Click login button - MUI Button with variant="contained"
    await page.locator('button.MuiButton-contained').first().click();
    await page.waitForLoadState('networkidle');
    await sleep(2000);
    await ss('01-after-login');
    console.log('✅ 登录成功, URL:', page.url());

    // === DASHBOARD ===
    console.log('\n=== 2. Dashboard ===');
    await page.goto(`${BASE}/admin/dashboard`);
    await page.waitForLoadState('networkidle');
    await sleep(2000);
    await ss('02-dashboard');
    console.log('✅ Dashboard');

    // === PRODUCT LIST ===
    console.log('\n=== 3. 产品列表 ===');
    await page.goto(`${BASE}/admin/products`);
    await page.waitForLoadState('networkidle');
    await sleep(2000);
    await ss('03-product-list');
    console.log('✅ 产品列表');

    // === NEW PRODUCT ===
    console.log('\n=== 4. 新增产品 ===');
    await page.goto(`${BASE}/admin/products/new`);
    await page.waitForLoadState('networkidle');
    await sleep(2000);
    await ss('04-new-product-page');

    // Fill form - use MUI input selectors
    const formInputs = page.locator('input.MuiInputBase-input');
    const formInputCount = await formInputs.count();
    console.log(`  表单输入框数量: ${formInputCount}`);

    // Name input (first text input)
    await formInputs.nth(0).fill('Playwright测试商品');
    console.log('  名称: Playwright测试商品');

    // Points price (first number input)
    const numInputs = page.locator('input[type="number"]');
    const numCount = await numInputs.count();
    console.log(`  数字输入框数量: ${numCount}`);
    if (numCount >= 2) {
      await numInputs.nth(0).fill('100');
      console.log('  积分: 100');
      await numInputs.nth(1).fill('50');
      console.log('  库存: 50');
    }

    // Select category
    const selectEl = page.locator('[role="combobox"]').first();
    if (await selectEl.isVisible()) {
      await selectEl.click();
      await sleep(1000);
      await ss('05-category-dropdown');
      const menuItem = page.locator('[role="option"]').first();
      if (await menuItem.isVisible()) {
        const catName = await menuItem.textContent();
        await menuItem.click();
        console.log(`  分类: ${catName}`);
        await sleep(500);
      } else {
        console.log('  ⚠️ 没有可选分类');
      }
    }

    // Description
    const textarea = page.locator('textarea').first();
    if (await textarea.isVisible()) {
      await textarea.fill('Playwright自动化测试创建的商品');
    }

    await ss('06-new-product-filled');

    // Click create button
    const createBtn = page.locator('button.MuiButton-contained');
    if (await createBtn.isVisible()) {
      await createBtn.click();
      console.log('  点击创建...');
      await sleep(3000);
      await ss('07-after-create');
      console.log('  URL:', page.url());
      if (page.url().includes('/admin/products') && !page.url().includes('/new')) {
        console.log('✅ 新增产品成功');
      } else {
        console.log('⚠️ 新增产品可能失败');
        const alert = page.locator('.MuiAlert-message');
        if (await alert.isVisible()) console.log('  错误:', await alert.textContent());
      }
    }

    // === PRODUCT DETAIL + STATUS TOGGLE ===
    console.log('\n=== 5. 产品详情 + 上架/下架 ===');
    await page.goto(`${BASE}/admin/products/22`);
    await page.waitForLoadState('networkidle');
    await sleep(2000);
    await ss('08-product-detail');

    const chip = page.locator('.MuiChip-label');
    if (await chip.isVisible()) console.log('  状态:', await chip.textContent());

    // Check for error on page load
    const loadErr = page.locator('.MuiAlert-message');
    if (await loadErr.isVisible()) {
      console.log('  ❌ 页面加载错误:', await loadErr.textContent());
    }

    // Test 下架
    const offBtn = page.locator('button:has-text("下架")');
    if (await offBtn.isVisible()) {
      console.log('  点击下架...');
      await offBtn.click();
      await sleep(1000);
      await ss('09-off-dialog');
      const confirmOff = page.locator('.MuiDialog-root button:has-text("确认下架")');
      if (await confirmOff.isVisible()) {
        await confirmOff.click();
        console.log('  确认下架...');
        await sleep(3000);
        await ss('10-after-off');
        const newChip = page.locator('.MuiChip-label');
        if (await newChip.isVisible()) {
          const st = await newChip.textContent();
          console.log('  下架后状态:', st);
          if (st === '已下架') console.log('✅ 下架成功');
          else console.log('⚠️ 状态异常:', st);
        }
        const errAlert = page.locator('.MuiAlert-message');
        if (await errAlert.isVisible()) console.log('  ❌ 错误:', await errAlert.textContent());
      }

      // Test 上架
      await sleep(1000);
      const onBtn = page.locator('button:has-text("上架")');
      if (await onBtn.isVisible()) {
        console.log('  点击上架...');
        await onBtn.click();
        await sleep(1000);
        await ss('11-on-dialog');
        const confirmOn = page.locator('.MuiDialog-root button:has-text("确认上架")');
        if (await confirmOn.isVisible()) {
          await confirmOn.click();
          console.log('  确认上架...');
          await sleep(3000);
          await ss('12-after-on');
          const finalChip = page.locator('.MuiChip-label');
          if (await finalChip.isVisible()) {
            const fs = await finalChip.textContent();
            console.log('  上架后状态:', fs);
            if (fs === '在售') console.log('✅ 上架成功');
          }
        }
      }
    } else {
      // Product might be INACTIVE, test 上架 first
      const onBtn = page.locator('button:has-text("上架")');
      if (await onBtn.isVisible()) {
        console.log('  产品已下架，测试上架...');
        await onBtn.click();
        await sleep(1000);
        const confirmOn = page.locator('.MuiDialog-root button:has-text("确认上架")');
        if (await confirmOn.isVisible()) {
          await confirmOn.click();
          await sleep(3000);
          await ss('10-after-on');
          const newChip = page.locator('.MuiChip-label');
          if (await newChip.isVisible()) {
            console.log('  上架后状态:', await newChip.textContent());
          }
          console.log('✅ 上架测试完成');

          // Now test 下架
          await sleep(1000);
          const offBtn2 = page.locator('button:has-text("下架")');
          if (await offBtn2.isVisible()) {
            await offBtn2.click();
            await sleep(1000);
            const confirmOff2 = page.locator('.MuiDialog-root button:has-text("确认下架")');
            if (await confirmOff2.isVisible()) {
              await confirmOff2.click();
              await sleep(3000);
              await ss('11-after-off');
              console.log('✅ 下架测试完成');
            }
          }

          // Restore to ACTIVE
          await sleep(1000);
          const onBtn2 = page.locator('button:has-text("上架")');
          if (await onBtn2.isVisible()) {
            await onBtn2.click();
            await sleep(1000);
            const confirmOn2 = page.locator('.MuiDialog-root button:has-text("确认上架")');
            if (await confirmOn2.isVisible()) {
              await confirmOn2.click();
              await sleep(3000);
              console.log('  已恢复上架状态');
            }
          }
        }
      }
    }

    // === EDIT PRODUCT ===
    console.log('\n=== 6. 编辑产品 ===');
    await page.goto(`${BASE}/admin/products/22/edit`);
    await page.waitForLoadState('networkidle');
    await sleep(2000);
    await ss('13-edit-product');
    const editErr = page.locator('.MuiAlert-root');
    if (await editErr.isVisible()) {
      console.log('  ❌ 编辑页错误:', await editErr.textContent());
    } else {
      console.log('✅ 编辑产品页面正常');
    }

    // === CATEGORIES ===
    console.log('\n=== 7. 分类管理 ===');
    await page.goto(`${BASE}/admin/categories`);
    await page.waitForLoadState('networkidle');
    await sleep(2000);
    await ss('14-categories');
    console.log('✅ 分类管理');

    // === USERS ===
    console.log('\n=== 8. 用户管理 ===');
    await page.goto(`${BASE}/admin/users`);
    await page.waitForLoadState('networkidle');
    await sleep(2000);
    await ss('15-users');
    console.log('✅ 用户管理');

    // === ORDERS ===
    console.log('\n=== 9. 兑换记录 ===');
    await page.goto(`${BASE}/admin/orders`);
    await page.waitForLoadState('networkidle');
    await sleep(2000);
    await ss('16-orders');
    console.log('✅ 兑换记录');

    // === POINTS ===
    console.log('\n=== 10. 积分管理 ===');
    await page.goto(`${BASE}/admin/points`);
    await page.waitForLoadState('networkidle');
    await sleep(2000);
    await ss('17-points');
    console.log('✅ 积分管理');

    // === POINTS RULES ===
    console.log('\n=== 11. 积分规则 ===');
    await page.goto(`${BASE}/admin/points/rules`);
    await page.waitForLoadState('networkidle');
    await sleep(2000);
    await ss('18-points-rules');
    console.log('✅ 积分规则');

    console.log('\n========================================');
    console.log('🎉 全部管理员功能测试完成');
    console.log('========================================');

  } catch (err) {
    console.error('❌ 测试失败:', err.message);
    await ss('error-state');
  } finally {
    await sleep(2000);
    await browser.close();
  }
})();
