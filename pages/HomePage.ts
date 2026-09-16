import { Page, Locator } from '@playwright/test';
import { CommonPage } from './CommonPage';
import { HeaderComponent } from './components/HeaderComponent';

export class HomePage extends CommonPage {
  readonly header: HeaderComponent;
  readonly bannerHeading: Locator;
  readonly locationCards: Locator;
  readonly locationLabel: Locator;
  readonly whereToGoText: Locator;

  constructor(page: Page) {
    super(page);
    this.header = new HeaderComponent(page);
    this.bannerHeading = page.getByRole('heading', { name: 'Cyberbnb', level: 2 });
    this.locationCards = page.locator('a[href^="/rooms/"]');
    this.locationLabel = page.getByText('Địa điểm', { exact: true });
    this.whereToGoText = page.getByText('Bạn sắp đi đâu?', { exact: true });
  }

  async open(): Promise<void> {
    await this.goto('/');
    await this.waitForPageLoaded();
  }

  async getLocationCardCount(): Promise<number> {
    return this.locationCards.count();
  }

  async goToLocation(locationName: string): Promise<void> {
    await this.click(this.locationCards.filter({ hasText: locationName }));
  }

  async isBannerVisible(): Promise<boolean> {
    return this.isVisible(this.bannerHeading);
  }
}
