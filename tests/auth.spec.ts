import { test, expect } from '@playwright/test';
import { AuthPage } from '../pages/auth.page';

test.describe('Chức năng Đăng nhập & Đăng ký - Cybersoft Demo5', () => {
  let authPage: AuthPage;

  test.beforeEach(async ({ page }) => {
    authPage = new AuthPage(page);
    await authPage.goto();
  });

  test('TC01: Đăng ký tài khoản mới thành công', async ({ page }) => {
    const randomEmail = `testuser_${Date.now()}@gmail.com`;
    
    await authPage.register(
      'Tester Auto',
      randomEmail,
      '12345678',
      '0901234567'
    );

    // Kiểm tra sau khi đăng ký thành công (thường chuyển sang trang đăng nhập hoặc hiển thị thông báo)
    await expect(page).toHaveURL(/.*login|.*danh-muc/i);
  });

  test('TC02: Đăng nhập thành công với tài khoản hợp lệ', async ({ page }) => {
    // Sử dụng thông tin tài khoản demo hoặc tài khoản vừa tạo
    await authPage.login('admin_test@gmail.com', '12345678');

    // Verify đăng nhập thành công
    await page.waitForTimeout(2000);
    await expect(authPage.userAvatar).toBeVisible();
  });

  test('TC03: Đăng nhập thất bại khi nhập sai mật khẩu', async ({ page }) => {
    await authPage.login('admin_test@gmail.com', 'sai_mat_khau');

    // Kiểm tra hệ thống vẫn ở trang đăng nhập hoặc có báo lỗi
    await expect(page).toHaveURL(/.*login/i);
  });
});