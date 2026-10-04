import { Locator, Page, expect, test } from '@playwright/test';
import { BasePage } from './BasePage';
import { TimeOutConstant } from '../constants/TimeOutConstant';

export class AuthPage extends BasePage {
  readonly headerMenuBtn: Locator;
  readonly registerMenuItem: Locator;
  readonly loginMenuItem: Locator;
  readonly modal: Locator;
  readonly modalCloseBtn: Locator;
  readonly registerHeading: Locator;
  readonly loginHeading: Locator;

  // Form Đăng ký
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly phoneInput: Locator;
  readonly birthdayField: Locator;
  readonly genderSelect: Locator;
  readonly registerSubmitBtn: Locator;

  // Form Đăng nhập
  readonly loginEmailInput: Locator;
  readonly loginPasswordInput: Locator;
  readonly loginSubmitBtn: Locator;
  readonly loginToRegisterBtn: Locator;

  // Trạng thái đã đăng nhập
  readonly userAvatar: Locator;

  constructor(page: Page) {
    super(page);

    this.headerMenuBtn = page.getByRole('button').filter({ hasText: /^$/ }).first();
    this.registerMenuItem = page.getByRole('button', { name: 'Đăng ký' });
    this.loginMenuItem = page.getByRole('button', { name: 'Đăng nhập' });

    this.modal = page.getByRole('dialog');
    this.modalCloseBtn = this.modal.getByRole('button', { name: 'Close' });
    this.registerHeading = page.getByRole('heading', { name: 'Đăng ký tài khoản' });
    this.loginHeading = page.getByRole('heading', { name: 'Đăng nhập' });

    this.nameInput = page.getByRole('textbox', { name: 'Name' });
    this.emailInput = page.getByRole('textbox', { name: 'Email' });
    this.passwordInput = page.getByRole('textbox', { name: 'Password' });
    this.phoneInput = page.getByRole('textbox', { name: 'Phone number' });
    this.birthdayField = this.modal.getByRole('textbox', { name: 'Birthday' });
    this.genderSelect = this.modal.getByRole('combobox', { name: 'Gender' });
    this.registerSubmitBtn = this.modal.getByRole('button', { name: 'Đăng ký' });

    this.loginEmailInput = this.modal.getByRole('textbox', { name: 'Email' });
    this.loginPasswordInput = this.modal.getByRole('textbox', { name: 'Mật khẩu' });
    this.loginSubmitBtn = this.modal.getByRole('button', { name: 'Đăng nhập' });
    this.loginToRegisterBtn = this.modal.getByRole('button', { name: 'Đăng ký' });

    this.userAvatar = page.getByRole('button', { name: /open user menu/i });
  }

  // ---------------------------------------------------------------- navigation
  async open() {
    await test.step('Mở trang chủ Cyberbnb', async () => {
      await this.goto('/'); // BasePage.goto dùng baseURL trong playwright.config
      // Không dùng waitForLoadState('networkidle') vì trang polling liên tục -> flaky.
      await this.waitForVisible(this.headerMenuBtn, TimeOutConstant.LONG);
    });
  }

  async openRegisterForm() {
    await test.step('Mở popup Đăng ký (icon Tài khoản > Đăng ký)', async () => {
      await this.click(this.headerMenuBtn);
      await this.click(this.registerMenuItem);
      await this.waitForVisible(this.nameInput, TimeOutConstant.MEDIUM);
    });
  }

  async openLoginForm() {
    await test.step('Mở popup Đăng nhập (icon Tài khoản > Đăng nhập)', async () => {
      await this.click(this.headerMenuBtn);
      await this.click(this.loginMenuItem);
      await this.waitForVisible(this.loginEmailInput, TimeOutConstant.MEDIUM);
    });
  }

  async closeModal() {
    await test.step('Đóng popup bằng nút X', async () => {
      await this.click(this.modalCloseBtn);
    });
  }

  async switchToRegisterFromLogin() {
    await test.step('Click nút "Đăng ký" trong popup Đăng nhập', async () => {
      await this.click(this.loginToRegisterBtn);
    });
  }

  fieldError(input: Locator): Locator {
    return this.modal
      .locator('.ant-form-item')
      .filter({ has: input })
      .locator('.ant-form-item-explain-error');
  }

  messageByText(text: string | RegExp): Locator {
    return this.page.getByText(text).first();
  }

  // Popup antd đôi khi không nhận click khi đang chạy animation -> chọn lại cho tới khi chọn được thật.
  // Không chỉ kiểm tra value: khi rê chuột qua một ngày, antd hiện ngày đó vào ô input để xem trước
  // dù chưa chọn. Chỉ khi chọn thật thì lịch mới đóng.
  async selectBirthday(day: string) {
    const picker = this.page.locator('.ant-picker-dropdown');
    const dayCell = picker.locator('.ant-picker-cell-in-view').getByText(day, { exact: true });

    await expect(async () => {
      if (!(await dayCell.isVisible())) {
        await this.birthdayField.click();
      }
      await dayCell.click({ timeout: TimeOutConstant.SHORT });
      await expect(picker).toBeHidden({ timeout: TimeOutConstant.SHORT });
      await expect(this.birthdayField).not.toHaveValue('', { timeout: TimeOutConstant.SHORT });
    }).toPass({ timeout: TimeOutConstant.MEDIUM });
  }
  // Dropdown Gender (antd) đôi khi không nhận click khi đang chạy animation (hay gặp trên Firefox)
  // và vẫn mở, che nút Đăng ký -> chọn lại cho tới khi dropdown đóng.
  async selectGender(gender: 'Nam' | 'Nữ') {
    const dropdown = this.page.locator('.ant-select-dropdown');
    const option = dropdown.locator(`.ant-select-item-option[title="${gender}"]`);

    await expect(async () => {
      if (!(await dropdown.isVisible())) {
        await this.genderSelect.click();
      }
      await option.click({ timeout: TimeOutConstant.SHORT });
      await expect(dropdown).toBeHidden({ timeout: TimeOutConstant.SHORT });
    }).toPass({ timeout: TimeOutConstant.MEDIUM });
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

    await test.step(`Nhập thông tin đăng ký (email: ${email})`, async () => {
      await this.fill(this.nameInput, name);
      await this.fill(this.emailInput, email);
      await this.fill(this.passwordInput, pass);
      await this.fill(this.phoneInput, phone);
      await this.selectBirthday(birthdayDay);
      await this.selectGender(gender);
    });

    await test.step('Click nút Đăng ký', async () => {
      await this.click(this.registerSubmitBtn);
    });
  }

  async login(email: string, pass: string) {
    const loginFormVisible = await this.loginEmailInput.isVisible().catch(() => false);
    if (!loginFormVisible) {
      await this.openLoginForm();
    }

    await test.step(`Đăng nhập với email: ${email}`, async () => {
      await this.fill(this.loginEmailInput, email);
      await this.fill(this.loginPasswordInput, pass);
      await this.click(this.loginSubmitBtn);
    });
  }
}
