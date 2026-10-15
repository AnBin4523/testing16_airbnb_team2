import { Locator, Page } from '@playwright/test';
import { CommonPage } from './CommonPage';

// Trang Dashboard (/info-user): thông tin người dùng, chỉnh sửa hồ sơ, ảnh đại diện
// và danh sách "Phòng đã thuê"
export class UserInfoPage extends CommonPage {
  readonly userMenuBtn: Locator;
  readonly dashboardLink: Locator;
  readonly bookedRoomsHeading: Locator;
  readonly bookedRoomCards: Locator;
  readonly greeting: Locator;
  readonly avatarImage: Locator;

  // Popup "Chỉnh sửa hồ sơ"
  readonly editProfileBtn: Locator;
  readonly editProfileDialog: Locator;
  readonly editEmailInput: Locator;
  readonly editNameInput: Locator;
  readonly editPhoneInput: Locator;
  readonly editBirthdayInput: Locator;
  readonly editGenderSelect: Locator;
  readonly updateProfileBtn: Locator;

  // Popup "Thay đổi ảnh đại diện"
  readonly updateAvatarBtn: Locator;
  readonly avatarDialog: Locator;
  readonly avatarFileInput: Locator;
  readonly uploadAvatarSubmitBtn: Locator;

  constructor(page: Page) {
    super(page);
    this.userMenuBtn = page.getByRole('button', { name: /open user menu/i });
    this.dashboardLink = page.getByRole('link', { name: 'Dashboard' });
    this.bookedRoomsHeading = page.getByRole('heading', { name: 'Phòng đã thuê' });
    this.bookedRoomCards = page.locator('a[href^="/room-detail/"]');
    this.greeting = page.getByText(/^Xin chào, tôi là /);
    this.avatarImage = page.locator('img.rounded-full.object-cover').first();

    this.editProfileBtn = page.getByRole('button', { name: 'Chỉnh sửa hồ sơ' });
    this.editProfileDialog = page.getByRole('dialog', { name: 'Chỉnh sửa hồ sơ' });
    this.editEmailInput = this.editProfileDialog.getByPlaceholder('vidu@gmail.com');
    this.editNameInput = page.getByLabel('Họ tên', { exact: true });
    this.editPhoneInput = page.getByLabel('Số điện thoại', { exact: true });
    this.editBirthdayInput = page.getByLabel('Ngày sinh', { exact: true });
    this.editGenderSelect = page.getByLabel('Giới tính', { exact: true });
    this.updateProfileBtn = page.getByRole('button', { name: 'Cập nhật', exact: true });

    this.updateAvatarBtn = page.getByRole('button', { name: 'Cập nhật ảnh', exact: true });
    this.avatarDialog = page.getByRole('dialog').filter({ hasText: 'Thay đổi ảnh đại diện' });
    this.avatarFileInput = this.avatarDialog.locator('input[type="file"]');
    this.uploadAvatarSubmitBtn = this.avatarDialog.getByRole('button', { name: 'Upload Avatar' });
  }

  async openFromUserMenu(): Promise<void> {
    await this.click(this.userMenuBtn);
    await this.click(this.dashboardLink);
    await this.page.waitForURL(/\/info-user/);
    await this.waitForVisible(this.bookedRoomsHeading);
  }

  async openEditProfile(): Promise<void> {
    await this.click(this.editProfileBtn);
    await this.waitForVisible(this.editNameInput);
  }

  async fillProfile(data: { name?: string; phone?: string }): Promise<void> {
    if (data.name !== undefined) await this.fill(this.editNameInput, data.name);
    if (data.phone !== undefined) await this.fill(this.editPhoneInput, data.phone);
  }

  async submitProfile(): Promise<void> {
    await this.click(this.updateProfileBtn);
  }

  async updateProfile(data: { name?: string; phone?: string }): Promise<void> {
    await this.fillProfile(data);
    await this.submitProfile();
  }

  // Cập nhật và chờ API lưu xong, trả về dữ liệu user mà server đã lưu
  async updateProfileAndWait(data: { name?: string; phone?: string }): Promise<Record<string, any>> {
    const saved = this.page.waitForResponse(
      (res) => /\/api\/users\/\d+$/.test(res.url()) && res.request().method() === 'PUT'
    );
    await this.updateProfile(data);
    const response = await saved;
    if (!response.ok()) throw new Error(`Cập nhật hồ sơ thất bại: ${response.status()}`);
    return (await response.json()).content;
  }

  // Form giữ dữ liệu cũ nếu mở lại ngay sau khi cập nhật, nên tải lại trang để đọc dữ liệu đã lưu
  async reloadAndOpenEditProfile(): Promise<void> {
    await this.page.reload();
    await this.waitForVisible(this.bookedRoomsHeading);
    await this.openEditProfile();
  }

  async uploadAvatar(filePath: string): Promise<void> {
    await this.click(this.updateAvatarBtn);
    await this.avatarFileInput.setInputFiles(filePath);
    await this.click(this.uploadAvatarSubmitBtn);
  }

  messageByText(text: string | RegExp): Locator {
    return this.page.getByText(text).first();
  }

  bookedRoomCard(roomId: number): Locator {
    return this.page.locator(`a[href="/room-detail/${roomId}"]`);
  }
}
