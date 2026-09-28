import { Page, Locator } from '@playwright/test';

export class AuthPage {
  readonly page: Page;

  // Nút icon (không có text) trên header - bấm vào để mở menu chứa "Đăng nhập"/"Đăng ký"
  // LƯU Ý: nếu trang có nhiều nút icon không tên, dùng .first() để tránh strict-mode error.
  // Nếu vẫn lỗi, cần thay bằng selector cụ thể hơn (ví dụ theo class/aria-label thật của nút này).
  readonly headerMenuBtn: Locator;

  // Các mục trong menu vừa mở ra
  readonly registerMenuItem: Locator;
  readonly loginMenuItem: Locator;

  // Modal chứa form (AntD Modal render với role="dialog")
  readonly modal: Locator;

  // Form Đăng ký (trong modal)
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly phoneInput: Locator;
  readonly birthdayField: Locator;
  readonly genderSelect: Locator;
  readonly registerSubmitBtn: Locator;

  // Form Đăng nhập (trong modal - dùng label thật "Email"/"Mật khẩu")
  readonly loginEmailInput: Locator;
  readonly loginPasswordInput: Locator;
  readonly loginSubmitBtn: Locator;
  readonly userAvatar: Locator;

  constructor(page: Page) {
    this.page = page;

    this.headerMenuBtn = page.getByRole('button').filter({ hasText: /^$/ }).first();
    this.registerMenuItem = page.getByRole('button', { name: 'Đăng ký' });
    this.loginMenuItem = page.getByRole('button', { name: 'Đăng nhập' });

    this.modal = page.getByRole('dialog');

    this.nameInput = page.getByRole('textbox', { name: 'Name' });
    this.emailInput = page.getByRole('textbox', { name: 'Email' });
    this.passwordInput = page.getByRole('textbox', { name: 'Password' });
    this.phoneInput = page.getByRole('textbox', { name: 'Phone number' });
    // Site có sẵn 1 textbox tên "Birthday" thật (xác nhận từ page snapshot lúc chạy test)
    this.birthdayField = this.modal.getByRole('textbox', { name: 'Birthday' });
    this.genderSelect = this.modal.getByRole('combobox', { name: 'Gender' });
    // Scope trong modal để không trùng với nút "Đăng ký" ở menu ngoài header
    this.registerSubmitBtn = this.modal.getByRole('button', { name: 'Đăng ký' });

    // Form Login dùng label thật "Email"/"Mật khẩu" làm accessible name, KHÔNG phải placeholder
    // (khác với form Register dùng "Password" tiếng Anh) - xác nhận từ page snapshot thật
    this.loginEmailInput = this.modal.getByRole('textbox', { name: 'Email' });
    this.loginPasswordInput = this.modal.getByRole('textbox', { name: 'Mật khẩu' });
    this.loginSubmitBtn = this.modal.getByRole('button', { name: 'Đăng nhập' });

    // Sau khi đăng nhập thành công, header hiện nút "Open user menu <tên>" (xác nhận từ snapshot thật)
    this.userAvatar = page.getByRole('button', { name: /open user menu/i });
  }

  async goto() {
    await this.page.goto('https://demo5.cybersoft.edu.vn/');
    // KHÔNG dùng waitForLoadState('networkidle') - trang có network activity liên tục
    // (polling/analytics) nên đôi khi không bao giờ "idle", gây timeout ngẫu nhiên (flaky).
    // Thay vào đó chờ đúng phần tử mà bước kế tiếp cần dùng - đáng tin cậy hơn nhiều.
    await this.headerMenuBtn.waitFor({ state: 'visible', timeout: 15000 });
  }

  async openRegisterForm() {
    await this.headerMenuBtn.click();
    await this.registerMenuItem.click();
    await this.nameInput.waitFor({ state: 'visible', timeout: 10000 });
  }

  async openLoginForm() {
    await this.headerMenuBtn.click();
    await this.loginMenuItem.click();
    await this.loginEmailInput.waitFor({ state: 'visible', timeout: 10000 });
  }

  async selectBirthday(day: string) {
    await this.birthdayField.click();
    await this.page.getByText(day, { exact: true }).click();
  }

  async register(
    name: string,
    email: string,
    pass: string,
    phone: string,
    birthdayDay: string = '24',
    gender: 'Nam' | 'Nữ' = 'Nữ'
  ) {
    await this.openRegisterForm();

    await this.nameInput.fill(name);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(pass);
    await this.phoneInput.fill(phone);

    await this.selectBirthday(birthdayDay);

    await this.genderSelect.click();
    await this.page.getByTitle(gender).click();

    await this.registerSubmitBtn.click();
  }

  async login(email: string, pass: string) {
    // Nếu gọi ngay sau register() thành công, app tự chuyển sang form Login sẵn rồi
    // -> chỉ mở lại form Login khi nó chưa hiển thị (gọi login() độc lập từ trang chủ, như TC02/TC03)
    const loginFormVisible = await this.loginEmailInput.isVisible().catch(() => false);
    if (!loginFormVisible) {
      await this.openLoginForm();
    }

    await this.loginEmailInput.fill(email);
    await this.loginPasswordInput.fill(pass);
    await this.loginSubmitBtn.click();
  }
}