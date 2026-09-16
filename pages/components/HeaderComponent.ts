import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export class HeaderComponent extends BasePage {
  readonly logo: Locator;
  readonly homeLink: Locator;
  readonly aboutLink: Locator;
  readonly servicesLink: Locator;
  readonly pricingLink: Locator;
  readonly contactLink: Locator;
  readonly menuButton: Locator;

  constructor(page: Page) {
    super(page);
    this.logo = page.getByRole('link', { name: 'Cyber Logo CyberSoft' });
    this.homeLink = page.getByRole('link', { name: 'Home', exact: true });
    this.aboutLink = page.getByRole('link', { name: 'About', exact: true });
    this.servicesLink = page.getByRole('link', { name: 'Services', exact: true });
    this.pricingLink = page.getByRole('link', { name: 'Pricing', exact: true });
    this.contactLink = page.getByRole('link', { name: 'Contact', exact: true });
    this.menuButton = page.getByRole('navigation').getByRole('button');
  }

  async clickLogo(): Promise<void> {
    await this.click(this.logo);
  }

  async goToAbout(): Promise<void> {
    await this.click(this.aboutLink);
  }

  async goToServices(): Promise<void> {
    await this.click(this.servicesLink);
  }
}
