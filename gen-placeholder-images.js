const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const PRODUCTS = [
  { id: 13, name: 'Sony WH-1000XM5', emoji: '🎧', color: '#1E3A5F' },
  { id: 14, name: 'AirPods Pro 2', emoji: '🎵', color: '#4A90D9' },
  { id: 15, name: 'Anker 65W 充电器', emoji: '🔌', color: '#2ECC71' },
  { id: 16, name: '小米移动电源', emoji: '🔋', color: '#F39C12' },
  { id: 17, name: '无印良品香薰机', emoji: '🕯️', color: '#8E6B47' },
  { id: 18, name: '戴森V12吸尘器', emoji: '🧹', color: '#9B59B6' },
  { id: 19, name: 'MX Master 3S', emoji: '🖱️', color: '#34495E' },
  { id: 20, name: 'Aeron 坐垫', emoji: '🪑', color: '#16A085' },
  { id: 21, name: '三只松鼠坚果礼盒', emoji: '🥜', color: '#D35400' },
  { id: 22, name: '良品铺子零食', emoji: '🍪', color: '#C0392B' },
  { id: 23, name: '星巴克咖啡豆', emoji: '☕', color: '#006241' },
  { id: 24, name: '农夫山泉NFC果汁', emoji: '🧃', color: '#E74C3C' },
  { id: 25, name: 'API测试商品', emoji: '🧪', color: '#7F8C8D' },
  { id: 26, name: 'Playwright测试', emoji: '🎭', color: '#2C3E50' },
  { id: 27, name: '京东礼品卡', emoji: '🎁', color: '#E91E63' },
];

const OUT_DIR = path.join(process.cwd(), 'product-images');

function buildHTML(product) {
  return `<!DOCTYPE html><html><body style="margin:0;padding:0">
<div style="width:400px;height:400px;background:${product.color};display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:system-ui,sans-serif">
  <div style="font-size:96px;margin-bottom:16px">${product.emoji}</div>
  <div style="color:#fff;font-size:24px;font-weight:700;text-align:center;padding:0 24px;text-shadow:0 2px 4px rgba(0,0,0,0.3)">${product.name}</div>
</div></body></html>`;
}

(async () => {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 400, height: 400 } });

  for (const p of PRODUCTS) {
    await page.setContent(buildHTML(p));
    await page.waitForTimeout(200);
    const filepath = path.join(OUT_DIR, `product-${p.id}.png`);
    await page.screenshot({ path: filepath, clip: { x: 0, y: 0, width: 400, height: 400 } });
    const size = fs.statSync(filepath).size;
    console.log(`✅ product-${p.id}.png (${(size/1024).toFixed(1)}KB) — ${p.name}`);
  }

  await browser.close();
  console.log(`\n🎉 Generated ${PRODUCTS.length} images in ${OUT_DIR}`);
})();
