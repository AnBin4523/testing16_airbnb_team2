import { Locator, Page } from '@playwright/test';
import { CommonPage } from './CommonPage';

// Trang Dashboard (/info-user): thông tin người dùng + danh sách "Phòng đã thuê"
export class UserInfoPage extends CommonPage {
  readonly userMenuBtn: Locator;
  readonly dashboardLink: Locator;
  readonly bookedRoomsHeading: Locator;
  readonly bookedRoomCards: Locator;

  constructor(page: Page) {
    super(page);
    this.userMenuBtn = page.getByRole('button', { name: /open user menu/i });
    this.dashboardLink = page.getByRole('link', { name: 'Dashboard' });
    this.bookedRoomsHeading = page.getByRole('heading', { name: 'Phòng đã thuê' });
    this.bookedRoomCards = page.locator('a[href^="/room-detail/"]');
  }

  async openFromUserMenu(): Promise<void> {
    await this.click(this.userMenuBtn);
    await this.click(this.dashboardLink);
    await this.page.waitForURL(/\/info-user/);
    await this.waitForVisible(this.bookedRoomsHeading);
  }

  bookedRoomCard(roomId: number): Locator {
    return this.page.locator(`a[href="/room-detail/${roomId}"]`);
  }
}
