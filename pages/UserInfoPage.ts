import { Locator, Page } from '@playwright/test';
import { CommonPage } from './CommonPage';

// Trang Dashboard (/info-user): thông tin người dùng
// và danh sách "Phòng đã thuê"
export class UserInfoPage extends CommonPage {
  readonly userMenuBtn: Locator;
  readonly dashboardLink: Locator;
  readonly bookedRoomsHeading: Locator;
  readonly bookedRoomCards: Locator;
  readonly editProfileBtn: Locator;
  readonly editEmailInput: Locator;
  readonly editNameInput: Locator;
  readonly editPhoneInput: Locator;
  readonly editBirthdayInput: Locator;
  readonly editGenderSelect: Locator;
  readonly updateProfileBtn: Locator;
  readonly updateAvatarBtn: Locator;
  readonly avatarImage: Locator;

  constructor(page: Page) {
    super(page);

    this.userMenuBtn = page.getByRole('button', {
      name: /open user menu/i,
    });

    this.dashboardLink = page.getByRole('link', {
      name: 'Dashboard',
    });

    this.bookedRoomsHeading = page.getByRole('heading', {
      name: 'Phòng đã thuê',
    });

    this.bookedRoomCards = page.locator('a[href^="/room-detail/"]');

    this.editProfileBtn = page.getByRole('button', {
      name: 'Chỉnh sửa hồ sơ',
    });

    this.editEmailInput = page.getByLabel('Email', {
      exact: true,
    });

    this.editNameInput = page.getByLabel('Họ tên', {
      exact: true,
    });

    this.editPhoneInput = page.getByLabel('Số điện thoại', {
      exact: true,
    });

    this.editBirthdayInput = page.getByLabel('Ngày sinh', {
      exact: true,
    });

    this.editGenderSelect = page.getByLabel('Giới tính', {
      exact: true,
    });

    this.updateProfileBtn = page.getByRole('button', {
      name: 'Cập nhật',
      exact: true,
    });

    this.updateAvatarBtn = page.getByRole('button', {
      name: 'Cập nhật ảnh',
      exact: true,
    });

    this.avatarImage = page
      .locator('img.rounded-full.object-cover')
      .first();
  }

  async openFromUserMenu(): Promise<void> {
  await this.page.waitForLoadState('domcontentloaded');

  await this.userMenuBtn.waitFor({
    state: 'visible',
    timeout: 15_000,
  }).catch(async () => {
    throw new Error(
      `Không tìm thấy nút menu tài khoản. URL hiện tại: ${this.page.url()}`
    );
  });

  await this.userMenuBtn.click();

  await this.dashboardLink.waitFor({
    state: 'visible',
    timeout: 10_000,
  });

  await this.dashboardLink.click();

  await this.page.waitForURL('**/info-user', {
    timeout: 15_000,
  });

  await this.waitForVisible(this.bookedRoomsHeading);
}

  async openEditProfile(): Promise<void> {
    await this.click(this.editProfileBtn);
  }

  async updateProfile(data: {
    name: string;
    phone: string;
  }): Promise<void> {
    await this.editNameInput.fill(data.name);
    await this.editPhoneInput.fill(data.phone);
    await this.updateProfileBtn.click();
  }

  async uploadAvatar(filePath: string): Promise<void> {
    // Kiểm tra input file trước khi nhấn nút
    let fileInput = this.page.locator('input[type="file"]');

    if (await fileInput.count() === 0) {
      await this.updateAvatarBtn.click();

      // Kiểm tra lại sau khi nhấn nút
      fileInput = this.page.locator('input[type="file"]');
    }

    const count = await fileInput.count();

    console.log('Số lượng input file:', count);

  if (count === 0) {
    throw new Error(
      'Không tìm thấy input[type="file"] sau khi nhấn Cập nhật ảnh. ' +
      'Cần kiểm tra HTML và chức năng upload của trang.'
    );
  }

  await fileInput.first().setInputFiles(filePath);

  console.log('Đã chọn file ảnh:', filePath);
}


  bookedRoomCard(roomId: number): Locator {
    return this.page.locator(
      `a[href="/room-detail/${roomId}"]`
    );
  }
}
    
  

