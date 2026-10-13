
const { chromium } = require('@playwright/test');
const readline = require('node:readline/promises');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    await page.goto('https://demo5.cybersoft.edu.vn/');

    console.log('1. Đăng nhập trên cửa sổ Chrome vừa mở.');
    console.log('2. Mở menu người dùng.');
    console.log('3. Chọn Dashboard / Thông tin cá nhân.');
    await rl.question(
      'Khi đã mở đúng trang Profile, quay lại đây và nhấn Enter...'
    );

    console.log('\nURL hiện tại:', page.url());
    console.log('Tiêu đề:', await page.title());

    const elements = await page.locator(
      'input, button, textarea, select, a, img, [role="dialog"]'
    ).evaluateAll(nodes =>
      nodes.map(el => ({
        tag: el.tagName,
        type: el.getAttribute('type'),
        id: el.id,
        name: el.getAttribute('name'),
        placeholder: el.getAttribute('placeholder'),
        text: (
          el.innerText ||
          el.getAttribute('aria-label') ||
          el.getAttribute('alt') ||
          ''
        ).trim().slice(0, 150),
        value: el.value || '',
        href: el.getAttribute('href'),
        src: el.tagName === 'IMG' ? el.getAttribute('src') : undefined,
      }))
    );

    console.log('\n--- THÀNH PHẦN PROFILE ---');
    console.log(JSON.stringify(elements, null, 2));

    await page.screenshot({
      path: 'profile-inspection.png',
      fullPage: true,
    });

    console.log('\nĐã lưu profile-inspection.png');
  } catch (error) {
    console.error('Lỗi kiểm tra:', error);
  } finally {
    rl.close();
    await browser.close();
  }
})();
