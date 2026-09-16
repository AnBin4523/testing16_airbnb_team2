import { Page, Locator } from '@playwright/test';
import { highlight } from './utils/highlight';
import { TimeOutConstant } from '../constants/TimeOutConstant';

export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(path: string = '/'): Promise<void> {
    await this.page.goto(path);
  }

  locator(selector: string): Locator {
    return this.page.locator(selector);
  }

  async click(locator: Locator): Promise<void> {
    await highlight(locator);
    await locator.click();
  }

  async fill(locator: Locator, text: string): Promise<void> {
    await highlight(locator);
    await locator.fill(text);
  }

  async getText(locator: Locator): Promise<string> {
    await highlight(locator);
    return (await locator.textContent())?.trim() ?? '';
  }

  async isVisible(locator: Locator): Promise<boolean> {
    return locator.isVisible();
  }

  async waitForVisible(locator: Locator, timeout: number = TimeOutConstant.MEDIUM): Promise<void> {
    await locator.waitFor({ state: 'visible', timeout });
  }

  async getTitle(): Promise<string> {
    return this.page.title();
  }
}
