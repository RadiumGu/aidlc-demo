const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const PRODUCTS = [
  { id: 13, query: 'Sony WH-1000XM5 headphones product white background' },
  { id: 14, query: 'Apple AirPods Pro 2 product white background' },
  { id: 15, query: 'Anker 65W GaN charger product white background' },
  { id: 16, query: 'Xiaomi 20000mAh power bank product white background' },
  { id: 17, query: 'MUJI aroma diffuser product white background' },
  { id: 18, query: 'Dyson V12 vacuum cleaner product white background' },
  { id: 19, query: 'Logitech MX Master 3S mouse product white background' },
  { id: 20, query: 'Herman Miller Aeron chair product white background' },
  { id: 21, query: '三只松鼠坚果礼盒 product' },
  { id: 22, query: '良品铺子零食大礼包 product' },
  { id: 23, query: 'Starbucks coffee beans gift box product white background' },
  { id: 24, query: '农夫山泉NFC果汁 product' },
];

const DOWNLOAD_DIR = path.join(process.cwd(), 'product-images');

function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const get = url.startsWith('https') ? https.get : http.get;
    const doRequest = (u, redirects = 0) => {
      if (redirects > 5) return reject(new Error('Too many redirects'));
      const mod = u.startsWith('https') ? https : http;
      mod.get(u, { headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' }, timeout: 10000 }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return doRequest(res.headers.location, redirects + 1);
        }
        if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`));
        const stream = fs.createWriteStream(filepath);
        res.pipe(stream);
        stream.on('finish', () => { stream.close(); resolve(); });
        stream.on('error', reject);
      }).on('error', reject);
    };
    doRequest(url);
  });
}


(async () => {
  if (!fs.existsSync(DOWNLOAD_DIR)) fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    locale: 'en-US',
    viewport: { width: 1440, height: 900 },
  });

  const results = [];

  for (const product of PRODUCTS) {
    console.log(`\n🔍 [id=${product.id}] Searching: ${product.query}`);
    const page = await context.newPage();

    try {
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(product.query)}&tbm=isch`;
      await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(3000);

      // Grab thumbnail URLs from Google Images results
      const imgUrls = await page.evaluate(() => {
        const imgs = Array.from(document.querySelectorAll('img'));
        return imgs
          .filter(img => img.src && img.src.startsWith('http') && !img.src.includes('google') && !img.src.includes('gstatic') && img.width > 60)
          .map(img => img.src)
          .slice(0, 3);
      });

      if (imgUrls.length === 0) {
        console.log(`  ❌ No images found, trying to get data-src...`);
        // Try data-src or other attributes
        const altUrls = await page.evaluate(() => {
          const imgs = Array.from(document.querySelectorAll('img[data-src]'));
          return imgs.map(img => img.getAttribute('data-src')).filter(Boolean).slice(0, 3);
        });
        if (altUrls.length > 0) imgUrls.push(...altUrls);
      }

      if (imgUrls.length === 0) {
        console.log(`  ❌ Still no images, skipping`);
        await page.close();
        continue;
      }

      const imageUrl = imgUrls[0];
      console.log(`  📷 URL: ${imageUrl.substring(0, 100)}...`);

      // Download
      const filename = `product-${product.id}.jpg`;
      const filepath = path.join(DOWNLOAD_DIR, filename);

      try {
        await downloadImage(imageUrl, filepath);
        const stats = fs.statSync(filepath);
        if (stats.size < 1000) {
          console.log(`  ⚠️ File too small (${stats.size}B), trying next image...`);
          if (imgUrls.length > 1) {
            await downloadImage(imgUrls[1], filepath);
          }
        }
        const finalStats = fs.statSync(filepath);
        console.log(`  ✅ Downloaded: ${filename} (${(finalStats.size / 1024).toFixed(1)}KB)`);
        results.push({ id: product.id, filename });
      } catch (dlErr) {
        console.log(`  ❌ Download failed: ${dlErr.message}`);
      }
    } catch (err) {
      console.log(`  ❌ Error: ${err.message}`);
    }

    await page.close();
    await new Promise(r => setTimeout(r, 1500));
  }

  await browser.close();

  // Output results
  console.log(`\n\n✅ Downloaded ${results.length}/${PRODUCTS.length} images to ${DOWNLOAD_DIR}`);
  console.log('\nFiles:');
  results.forEach(r => console.log(`  product-${r.id}.jpg`));

  fs.writeFileSync(path.join(DOWNLOAD_DIR, 'results.json'), JSON.stringify(results, null, 2));
  console.log('\nNext steps:');
  console.log('1. docker cp product-images/. awsomeshop-product:/app/uploads/');
  console.log('2. UPDATE product_db.products SET image_url = CONCAT("/api/files/product-", id, ".jpg") WHERE id BETWEEN 13 AND 24;');
})();
