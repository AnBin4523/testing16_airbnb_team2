import { Locator, Page } from '@playwright/test';
import { CommonPage } from './CommonPage';
import { BookingComponent } from './components/BookingComponent';

export class RoomDetailPage extends CommonPage {
  readonly booking: BookingComponent;
  readonly roomTitle: Locator;

  constructor(page: Page) {
    super(page);
    this.booking = new BookingComponent(page);
    this.roomTitle = page.getByRole('heading', { level: 2 }).first();
  }

  async open(roomId: number): Promise<void> {
    await this.goto(`/room-detail/${roomId}`);
    await this.booking.waitForLoaded();
  }

  messageByText(text: string | RegExp): Locator {
    return this.page.getByText(text).first();
  }
}
