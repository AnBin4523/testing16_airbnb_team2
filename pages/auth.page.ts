import { Page, Locator, expect } from '@playwright/test';

export class AuthPage {
  readonly page: Page;
  
  // Locators cho Đăng ký (Register)
  readonly registerNavBtn: Locator;
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly phoneInput: Locator;
  readonly registerSubmitBtn: Locator;

  // Locators cho Đăng nhập (Login)
  readonly loginNavBtn: Locator;
  readonly loginEmailInput: Locator;
  readonly loginPasswordInput: Locator;
  readonly loginSubmitBtn: Locator;
  readonly userAvatar: Locator;

  constructor(page: Page) {
    this.page = page;

    // Định vị các element trên demo5.cybersoft.edu.vn
    this.registerNavBtn = page.locator('text=Đăng ký');
    this.nameInput = page.locator('input[name="name"], input[placeholder*="tên"]');
    this.emailInput = page.locator('input[name="email"]');
    this.passwordInput = page.locator('input[name="password"]');
    this.phoneInput = page.locator('input[name="phone"]');
    this.registerSubmitBtn = page.locator('button[type="submit"]:has-text("Đăng ký")');

    this.loginNavBtn = page.locator('text=Đăng nhập');
    this.loginEmailInput = page.locator('input[name="email"]');
    this.loginPasswordInput = page.locator('input[name="password"]');
    this.loginSubmitBtn = page.locator('button[type="submit"]:has-text("Đăng nhập")');
    this.userAvatar = page.locator('.ant-avatar, .user-info, text=Đăng xuất');
  }

  async goto() {
    await this.page.goto('https://demo5.cybersoft.edu.vn/');
  }

  async register(name: string, email: string, pass: string, phone: string) {
    await this.registerNavBtn.click();
    await this.nameInput.fill(name);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(pass);
    await this.phoneInput.fill(phone);
    await this.registerSubmitBtn.click();
  }

  async login(email: string, pass: string) {
    await this.loginNavBtn.click();
    await this.loginEmailInput.fill(email);
    await this.loginPasswordInput.fill(pass);
    await this.loginSubmitBtn.click();
  }
}