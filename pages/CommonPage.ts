import { Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { TimeOutConstant } from '../constants/TimeOutConstant';

export class CommonPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async waitForPageLoaded(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForLoadState('networkidle', { timeout: TimeOutConstant.LONG }).catch(() => {});
  }

  async scrollToBottom(): Promise<void> {
    await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  }

  async scrollToTop(): Promise<void> {
    await this.page.evaluate(() => window.scrollTo(0, 0));
  }

  async reload(): Promise<void> {
    await this.page.reload();
    await this.waitForPageLoaded();
  }

  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }
}
