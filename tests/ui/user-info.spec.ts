import path from 'node:path';
import { test, expect } from '../../fixture/page-fixture';
import { UserInfoConstant } from '../../constants/UserInfoConstant';

const { MSG, AVATAR_FILE } = UserInfoConstant;

test.describe('User Profile', () => {
  // Mọi test đều dùng tài khoản mới tạo (fixture loggedInUser) và bắt đầu từ trang Dashboard
  test.beforeEach(async ({ loggedInUser, userInfoPage }) => {
    await userInfoPage.openFromUserMenu();
  });

  test('TC22: Xem thông tin Profile người dùng', async ({ page, userInfoPage }) => {
    await expect(page).toHaveURL(/\/info-user/);
    await expect(userInfoPage.greeting).toHaveText('Xin chào, tôi là Test User');
    await expect(userInfoPage.avatarImage).toBeVisible();
    await expect(userInfoPage.editProfileBtn).toBeVisible();
    await expect(userInfoPage.bookedRoomsHeading).toBeVisible();
  });

  test('TC22.1: Form chỉnh sửa hồ sơ hiển thị đúng thông tin hiện tại', async ({ loggedInUser, userInfoPage }) => {
    await userInfoPage.openEditProfile();

    await expect(userInfoPage.editProfileDialog).toBeVisible();
    await expect(userInfoPage.editEmailInput).toHaveValue(loggedInUser.email);
    await expect(userInfoPage.editNameInput).toHaveValue('Test User');
    await expect(userInfoPage.editPhoneInput).not.toHaveValue('');
  });

  test('TC23: Cập nhật thông tin cá nhân thành công', async ({ userInfoPage }) => {
    const updatedName = 'Test User Updated';
    const updatedPhone = '0912345678';

    await userInfoPage.openEditProfile();
    await userInfoPage.updateProfile({ name: updatedName, phone: updatedPhone });

    await expect(userInfoPage.editProfileDialog).toBeHidden();
    await expect(userInfoPage.greeting).toHaveText(`Xin chào, tôi là ${updatedName}`);
  });

  test('TC23.1: Cập nhật riêng họ tên', async ({ userInfoPage }) => {
    const newName = 'Nguyen Van An';

    await userInfoPage.openEditProfile();
    const originalPhone = await userInfoPage.editPhoneInput.inputValue();
    const saved = await userInfoPage.updateProfileAndWait({ name: newName });

    expect(saved).toMatchObject({ name: newName, phone: originalPhone });
    await expect(userInfoPage.editProfileDialog).toBeHidden();
    await userInfoPage.reloadAndOpenEditProfile();
    await expect(userInfoPage.editNameInput).toHaveValue(newName);
    await expect(userInfoPage.editPhoneInput).toHaveValue(originalPhone);
  });

  test('TC23.2: Cập nhật riêng số điện thoại', async ({ userInfoPage }) => {
    const newPhone = '0909909990';

    await userInfoPage.openEditProfile();
    const originalName = await userInfoPage.editNameInput.inputValue();
    const saved = await userInfoPage.updateProfileAndWait({ phone: newPhone });

    expect(saved).toMatchObject({ name: originalName, phone: newPhone });
    await expect(userInfoPage.editProfileDialog).toBeHidden();
    await userInfoPage.reloadAndOpenEditProfile();
    await expect(userInfoPage.editNameInput).toHaveValue(originalName);
    await expect(userInfoPage.editPhoneInput).toHaveValue(newPhone);
  });

  test('TC23.3: Kiểm tra khi để trống họ tên', async ({ userInfoPage }) => {
    await userInfoPage.openEditProfile();
    await userInfoPage.updateProfile({ name: '' });

    await expect(userInfoPage.messageByText(MSG.NAME_REQUIRED)).toBeVisible();
    await expect(userInfoPage.editProfileDialog).toBeVisible();
  });

  test('TC23.4: Kiểm tra khi để trống số điện thoại', async ({ userInfoPage }) => {
    await userInfoPage.openEditProfile();
    await userInfoPage.updateProfile({ phone: '' });

    await expect(userInfoPage.messageByText(MSG.PHONE_REQUIRED)).toBeVisible();
    await expect(userInfoPage.editProfileDialog).toBeVisible();
  });

  test('TC23.5: Cập nhật họ tên có dấu tiếng Việt', async ({ userInfoPage }) => {
    const newName = 'Nguyễn Văn Ánh';

    await userInfoPage.openEditProfile();
    await userInfoPage.updateProfile({ name: newName });

    await expect(userInfoPage.editProfileDialog).toBeHidden();
    await expect(userInfoPage.greeting).toHaveText(`Xin chào, tôi là ${newName}`);
  });

  for (const { id, title, phone } of [
    { id: 'TC23.6', title: 'số điện thoại chứa chữ cái', phone: '09ABC12345' },
    { id: 'TC23.7', title: 'số điện thoại quá ngắn', phone: '123' },
    { id: 'TC23.8', title: 'số điện thoại quá dài', phone: '09876543210987654321' },
  ]) {
    test(`${id}: Kiểm tra ${title}`, async ({ userInfoPage }) => {
      await userInfoPage.openEditProfile();
      await userInfoPage.updateProfile({ phone });

      await expect(userInfoPage.messageByText(MSG.PHONE_INVALID)).toBeVisible();
      await expect(userInfoPage.editProfileDialog).toBeVisible();
    });
  }

  test('TC23.9: Nhấn cập nhật khi không thay đổi thông tin', async ({ userInfoPage }) => {
    await userInfoPage.openEditProfile();
    const originalName = await userInfoPage.editNameInput.inputValue();
    const originalPhone = await userInfoPage.editPhoneInput.inputValue();

    const saved = await userInfoPage.updateProfileAndWait({});

    expect(saved).toMatchObject({ name: originalName, phone: originalPhone });
    await expect(userInfoPage.editProfileDialog).toBeHidden();
    await userInfoPage.reloadAndOpenEditProfile();
    await expect(userInfoPage.editNameInput).toHaveValue(originalName);
    await expect(userInfoPage.editPhoneInput).toHaveValue(originalPhone);
  });

  test('TC23.10: Thông tin vẫn được lưu sau khi tải lại trang', async ({ userInfoPage }) => {
    const newName = 'Tran Minh Khang';
    const newPhone = '0987654321';

    await userInfoPage.openEditProfile();
    await userInfoPage.updateProfileAndWait({ name: newName, phone: newPhone });
    await expect(userInfoPage.editProfileDialog).toBeHidden();

    await userInfoPage.reloadAndOpenEditProfile();
    await expect(userInfoPage.editNameInput).toHaveValue(newName);
    await expect(userInfoPage.editPhoneInput).toHaveValue(newPhone);
  });

  test('TC24: Upload ảnh đại diện thành công', async ({ page, userInfoPage }) => {
    const oldSrc = await userInfoPage.avatarImage.getAttribute('src');

    const uploadResponse = page.waitForResponse(
      (res) => res.url().includes('/api/users/upload-avatar') && res.request().method() === 'POST'
    );
    await userInfoPage.uploadAvatar(path.resolve(AVATAR_FILE));

    expect((await uploadResponse).status()).toBe(200);
    // Thông báo chỉ hiện khoảng 3 giây sau khi API trả về
    await expect(userInfoPage.messageByText(MSG.AVATAR_SUCCESS)).toBeVisible();
    await expect(userInfoPage.avatarImage).not.toHaveAttribute('src', oldSrc ?? '');
    await expect(userInfoPage.avatarImage).toHaveAttribute('src', /\/avatar\//);
  });

  test('TC25: Đổi mật khẩu tài khoản', async () => {
    test.skip(true, 'Web chưa có chức năng đổi mật khẩu: trang Dashboard (/info-user) không có nút hoặc form đổi mật khẩu');
  });

  test('TC26: Hiển thị thông báo lỗi khi cập nhật thất bại', async ({ userInfoPage }) => {
    await userInfoPage.openEditProfile();
    await userInfoPage.updateProfile({ name: '', phone: '' });

    await expect(userInfoPage.messageByText(MSG.NAME_REQUIRED)).toBeVisible();
    await expect(userInfoPage.messageByText(MSG.PHONE_REQUIRED)).toBeVisible();
    await expect(userInfoPage.editProfileDialog).toBeVisible();
  });
});
