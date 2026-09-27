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
      '123456',
      '0123456789'
    );

    // App là SPA, KHÔNG đổi URL khi đăng ký/đăng nhập.
    // Đăng ký thành công -> app tự mở modal "Đăng nhập" ngay sau đó.
    await expect(page.getByRole('heading', { name: 'Đăng nhập' })).toBeVisible();
  });

  test('TC02: Đăng nhập thành công với tài khoản hợp lệ', async ({ page }) => {
    await authPage.login('ellentran0902@gmail.com', '123456');

    // Đăng nhập thành công -> header đổi thành nút "Open user menu <tên>"
    await expect(authPage.userAvatar).toBeVisible();
  });

  test('TC03: Đăng nhập thất bại khi nhập sai mật khẩu', async ({ page }) => {
    await authPage.login('ellentran0902@gmail.com', 'sai_mat_khau');

    // Đăng nhập thất bại -> nút user menu không xuất hiện
    await expect(authPage.userAvatar).not.toBeVisible();

    // TODO: xác nhận locator + nội dung message lỗi thật của app trước khi bật assertion này.
    // await expect(authPage.errorMessage).toBeVisible();
    // await expect(authPage.errorMessage).toContainText('không chính xác'); // hoặc text thật của app
  });

  test('TC04: Đăng ký thất bại khi bỏ trống họ tên', async ({ page }) => {
    await authPage.openRegisterForm();

    await authPage.emailInput.fill(`testuser_${Date.now()}@gmail.com`);
    await authPage.passwordInput.fill('123456');
    await authPage.phoneInput.fill('0123456789');
    // Cố tình bỏ trống Name rồi submit luôn
    await authPage.registerSubmitBtn.click();

    // Form không hợp lệ -> vẫn ở modal Đăng ký, KHÔNG chuyển sang màn Đăng nhập
    await expect(page.getByRole('heading', { name: 'Đăng ký tài khoản' })).toBeVisible();
  });

  test('TC05: Đăng ký thất bại với email đã tồn tại', async ({ page }) => {
    // Dùng email của tài khoản demo đã tồn tại sẵn (ellentran0902@gmail.com)
    await authPage.register('Tester Auto', 'ellentran0902@gmail.com', '123456', '0123456789');

    // Email trùng -> đăng ký thất bại, vẫn ở modal Đăng ký
    await expect(page.getByRole('heading', { name: 'Đăng ký tài khoản' })).toBeVisible();

    // TODO: xác nhận locator + nội dung message lỗi thật của app trước khi bật assertion này.
    // await expect(authPage.errorMessage).toContainText('đã tồn tại'); // hoặc text thật của app
  });

  test('TC06: Đăng nhập thất bại với email không tồn tại', async ({ page }) => {
    await authPage.login('khong_ton_tai_' + Date.now() + '@gmail.com', '123456');

    await expect(authPage.userAvatar).not.toBeVisible();
  });

  test('TC07: Đăng nhập thất bại khi bỏ trống thông tin', async ({ page }) => {
    await authPage.openLoginForm();
    // Không điền gì, submit luôn
    await authPage.loginSubmitBtn.click();

    // Vẫn ở form Login, chưa đăng nhập được
    await expect(authPage.loginEmailInput).toBeVisible();
    await expect(authPage.userAvatar).not.toBeVisible();
  });

  /**
   * TC08 & TC09: cố tình assert NGƯỢC với kết quả đúng của hệ thống, để tạo ra
   * kết quả FAIL thật khi chạy suite - phục vụ đúng yêu cầu bắt buộc của đề bài
   * "Bắt buộc: Có log, báo cáo, screenshot trả về khi test run fail". Đây không
   * phải bug của app hay của test, mà là fail có chủ đích để lấy bằng chứng
   * report/log/screenshot cho slide.
   */
  test('TC08: [Cố tình FAIL] Assert sai sau khi đăng nhập thành công', async ({ page }) => {
    await authPage.login('ellentran0902@gmail.com', '123456');

    // Đảm bảo login đã THỰC SỰ hoàn tất trước khi assert ngược.
    // (Nếu bỏ dòng này, .not.toBeVisible() có thể "false pass" ngay lập tức
    // vì avatar chưa kịp render tại thời điểm check, chứ không phải vì nó
    // biến mất - đây chính là lỗi phát hiện được ở lần chạy thật trước đó.)
    await expect(authPage.userAvatar).toBeVisible();

    // Thực tế đăng nhập THÀNH CÔNG (giống TC02), nhưng cố tình assert ngược lại
    await expect(authPage.userAvatar).not.toBeVisible();
  });

  test('TC09: [Cố tình FAIL] Assert sai sau khi đăng ký thành công', async ({ page }) => {
    const randomEmail = `testuser_${Date.now()}@gmail.com`;
    await authPage.register('Tester Auto', randomEmail, '123456', '0123456789');

    // Đăng ký thành công KHÔNG tự động đăng nhập (user vẫn cần đăng nhập thủ công
    // ở modal Đăng nhập vừa mở ra), nhưng cố tình assert userAvatar đã hiển thị
    // để tạo ra 1 kết quả FAIL thật
    await expect(authPage.userAvatar).toBeVisible();
  });

  // ===== BỔ SUNG =====

  test('TC10: Đăng ký thất bại khi mật khẩu không đủ mạnh', async ({ page }) => {
    const randomEmail = `testuser_${Date.now()}@gmail.com`;

    // TODO: xác nhận rule password thật của app (vd: tối thiểu N ký tự,
    // yêu cầu chữ hoa/số...). Ở đây giả định app yêu cầu tối thiểu 6 ký tự
    // nên dùng password ngắn hơn mức tối thiểu để trigger lỗi.
    await authPage.register('Tester Auto', randomEmail, '123', '0123456789');

    // Password không hợp lệ -> vẫn ở modal Đăng ký, KHÔNG chuyển sang Đăng nhập
    await expect(page.getByRole('heading', { name: 'Đăng ký tài khoản' })).toBeVisible();

    // TODO: bật assertion dưới sau khi có locator/text message lỗi thật.
    // await expect(authPage.errorMessage).toContainText('mật khẩu'); // hoặc text thật của app
  });

  test('TC11: Đăng xuất thành công', async ({ page }) => {
    // Đăng nhập trước để có phiên hợp lệ
    await authPage.login('ellentran0902@gmail.com', '123456');
    await expect(authPage.userAvatar).toBeVisible();

    // Menu người dùng của app hiển thị TIẾNG ANH ("Sign out"), không phải
    // "Đăng xuất" - xác nhận từ ảnh chụp thực tế của dropdown menu.
    await authPage.userAvatar.click();
    await page.getByRole('menuitem', { name: 'Sign out' }).click();

    // Đăng xuất thành công -> user menu/avatar biến mất, quay lại trạng thái chưa đăng nhập
    await expect(authPage.userAvatar).not.toBeVisible();
  });
});