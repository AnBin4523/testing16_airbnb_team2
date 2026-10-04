import { test, expect } from '../../fixture/page-fixture';
import { AuthConstant, uniqueEmail, uniquePhone } from '../../constants/AuthConstant';

const { MSG, VALID_USER, PASSWORD_VALID } = AuthConstant;

test.describe('Đăng ký & Đăng nhập - Cybersoft Demo5', () => {
  const browserLogs: string[] = [];

  test.beforeEach(async ({ page, authPage }) => {
    browserLogs.length = 0;
    page.on('console', (m) => browserLogs.push(`[console.${m.type()}] ${m.text()}`));
    page.on('pageerror', (e) => browserLogs.push(`[pageerror] ${e.message}`));
    await authPage.open();
  });

  // Khi test fail: đính kèm log trình duyệt + URL vào report (screenshot/video/trace do config tự chụp)
  test.afterEach(async ({ page }, testInfo) => {
    if (testInfo.status !== testInfo.expectedStatus) {
      await testInfo.attach('browser-console.log', {
        body: [`URL: ${page.url()}`, ...browserLogs].join('\n'),
        contentType: 'text/plain',
      });
    }
  });

  // REGISTER
  test.describe('Register', () => {
    test('RG-01: Hiển thị Popup đăng ký khi click nút Đăng ký', async ({ authPage }) => {
      await authPage.openRegisterForm();

      await expect(authPage.registerHeading).toBeVisible();
      await expect(authPage.modalCloseBtn).toBeVisible();
    });

    test('RG-02: Đăng ký thành công với dữ liệu hợp lệ', async ({ authPage }) => {
      await authPage.register('Test User', uniqueEmail(), PASSWORD_VALID, uniquePhone());

      // App là SPA, không đổi URL. Đăng ký thành công -> tự mở popup "Đăng nhập".
      await expect(authPage.loginHeading).toBeVisible();
    });

    test('RG-03: Bỏ trống tất cả trường bắt buộc', async ({ authPage }) => {
      await authPage.openRegisterForm();
      await authPage.registerSubmitBtn.click();

      await expect(authPage.registerHeading).toBeVisible();
      await expect(authPage.messageByText(MSG.REQUIRED)).toBeVisible();
      await expect(authPage.messageByText(MSG.BIRTHDAY_REQUIRED)).toBeVisible();
    });

    test(
      'RG-04: Name chỉ chứa khoảng trắng',
      { tag: ['@known-bug', '@demo-fail'] },
      async ({ authPage }) => {
        test.fail(true, 'BUG RG-04 (High): Name = " " vẫn tạo tài khoản thành công.');

        await authPage.register(' ', uniqueEmail(), PASSWORD_VALID, uniquePhone());

        await expect(authPage.messageByText(MSG.REQUIRED)).toBeVisible();
        await expect(authPage.registerHeading).toBeVisible();
      }
    );

    test(
      'RG-05: Email sai định dạng',
      { tag: ['@known-bug', '@demo-fail'] },
      async ({ authPage }) => {
        test.fail(true, 'BUG RG-05 (High): Email "abc@gmail" vẫn đăng ký thành công.');

        await authPage.register('Test User', 'abc@gmail', PASSWORD_VALID, uniquePhone());

        await expect(authPage.fieldError(authPage.emailInput)).toBeVisible();
        await expect(authPage.registerHeading).toBeVisible();
      }
    );

    test('RG-06: Email đã tồn tại', async ({ authPage }) => {
      await authPage.register('Test User', VALID_USER.email, PASSWORD_VALID, uniquePhone());

      await expect(authPage.messageByText(MSG.EMAIL_EXISTED)).toBeVisible();
      await expect(authPage.registerHeading).toBeVisible();
    });

    test(
      'RG-07: Password ngắn hơn 8 ký tự',
      { tag: ['@known-bug', '@demo-fail'] },
      async ({ authPage }) => {
        test.fail(true, 'BUG RG-07 (High): Password "Aa@123" (< 8 ký tự) vẫn đăng ký thành công.');

        await authPage.register('Test User', uniqueEmail(), 'Aa@123', uniquePhone());

        await expect(authPage.fieldError(authPage.passwordInput)).toBeVisible();
        await expect(authPage.registerHeading).toBeVisible();
      }
    );

    test(
      'RG-08: Password không chứa chữ hoa',
      { tag: ['@known-bug', '@demo-fail'] },
      async ({ authPage }) => {
        test.fail(true, 'BUG RG-08 (High): Password "test@1234" (không có chữ hoa) vẫn đăng ký thành công.');

        await authPage.register('Test User', uniqueEmail(), 'test@1234', uniquePhone());

        await expect(authPage.fieldError(authPage.passwordInput)).toBeVisible();
        await expect(authPage.registerHeading).toBeVisible();
      }
    );

    test('RG-12: Số điện thoại chứa ký tự chữ', async ({ authPage }) => {
      await authPage.register('Test User', uniqueEmail(), PASSWORD_VALID, '09012abcde');

      await expect(authPage.fieldError(authPage.phoneInput)).toBeVisible();
      await expect(authPage.registerHeading).toBeVisible();
    });

    test('RG-13: Số điện thoại không đủ 10 số', async ({ authPage }) => {
      await authPage.register('Test User', uniqueEmail(), PASSWORD_VALID, '90123456');

      await expect(authPage.fieldError(authPage.phoneInput)).toBeVisible();
      await expect(authPage.registerHeading).toBeVisible();
    });

    test('RG-21: Đóng popup bằng nút X', async ({ authPage }) => {
      await authPage.openRegisterForm();
      await authPage.closeModal();

      await expect(authPage.modal).toBeHidden();
    });
  });

  // LOGIN
  test.describe('Login', () => {
    test('LG-01: Hiển thị Popup Đăng nhập khi click nút Đăng nhập', async ({ authPage }) => {
      await authPage.openLoginForm();

      await expect(authPage.loginHeading).toBeVisible();
      await expect(authPage.modalCloseBtn).toBeVisible();
    });

    test('LG-02: Đóng Popup Đăng nhập bằng nút X', async ({ authPage }) => {
      await authPage.openLoginForm();
      await authPage.closeModal();

      await expect(authPage.modal).toBeHidden();
    });

    test('LG-03: Đăng nhập thành công với tài khoản hợp lệ', async ({ authPage }) => {
      // Tự tạo tài khoản mới để test không phụ thuộc vào tài khoản có sẵn / file .env
      const email = uniqueEmail();
      await authPage.register('Test User', email, PASSWORD_VALID, uniquePhone());
      await expect(authPage.loginHeading).toBeVisible();

      // Popup đăng ký cũ vẫn còn trong DOM -> mở lại trang để form đăng nhập không bị trùng input
      await authPage.open();
      await authPage.login(email, PASSWORD_VALID);

      // Popup tự đóng, icon tài khoản chuyển sang Avatar ("Open user menu <tên>")
      await expect(authPage.userAvatar).toBeVisible();
      await expect(authPage.modal).toBeHidden();
    });

    test('LG-04: Bỏ trống Email và Password', async ({ authPage }) => {
      await authPage.openLoginForm();
      await authPage.loginSubmitBtn.click();

      await expect(authPage.messageByText(MSG.REQUIRED)).toBeVisible();
      await expect(authPage.userAvatar).toBeHidden();
    });

    test('LG-05: Bỏ trống Email', async ({ authPage }) => {
      await authPage.login('', VALID_USER.password);

      await expect(authPage.messageByText(MSG.REQUIRED)).toBeVisible();
      await expect(authPage.userAvatar).toBeHidden();
    });

    test('LG-06: Bỏ trống Password', async ({ authPage }) => {
      await authPage.login(VALID_USER.email, '');

      await expect(authPage.messageByText(MSG.REQUIRED)).toBeVisible();
      await expect(authPage.userAvatar).toBeHidden();
    });

    test('LG-07: Đăng nhập với Email không tồn tại', async ({ authPage }) => {
      await authPage.login('abc@gmail.com', VALID_USER.password);

      await expect(authPage.messageByText(MSG.LOGIN_FAILED)).toBeVisible();
      await expect(authPage.userAvatar).toBeHidden();
    });

    test('LG-08: Đăng nhập với Password không đúng', async ({ authPage }) => {
      await authPage.login(VALID_USER.email, 'Test@111');

      await expect(authPage.messageByText(MSG.LOGIN_FAILED)).toBeVisible();
      await expect(authPage.userAvatar).toBeHidden();
    });

    test('LG-09: Đăng nhập với cả Email và Password sai', async ({ authPage }) => {
      await authPage.login('abc@gmail.com', 'abc123');

      await expect(authPage.messageByText(MSG.LOGIN_FAILED)).toBeVisible();
      await expect(authPage.userAvatar).toBeHidden();
    });

    test('LG-10: Chuyển sang Popup Đăng ký khi click nút Đăng ký', async ({ authPage }) => {
      await authPage.openLoginForm();
      await authPage.switchToRegisterFromLogin();

      await expect(authPage.registerHeading).toBeVisible();
      await expect(authPage.loginHeading).toBeHidden();
    });
  });
});
