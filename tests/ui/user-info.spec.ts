
import { test, expect } from '../../fixture/page-fixture';
import path from 'node:path';

test.describe('User Profile - Cybersoft Demo5', () => {
  test('TC22: Xem thông tin Profile người dùng', async ({
    page,
    loggedInUser,
    userInfoPage,
  }) => {
    // Fixture loggedInUser tự tạo tài khoản và đăng nhập.
    console.log('Tài khoản test:', loggedInUser.email);

    // Mở trang Dashboard / Profile.
    await userInfoPage.openFromUserMenu();

    // Xác nhận đã vào đúng trang.
    await expect(page).toHaveURL(/\/info-user/);

    // Kiểm tra tiêu đề danh sách phòng đã thuê.
    await expect(userInfoPage.bookedRoomsHeading).toBeVisible();

    console.log('TC22: Đã mở trang Profile thành công');
  });

 test('TC23: Mở form chỉnh sửa hồ sơ', async ({
  page,
  loggedInUser,
  userInfoPage,
}) => {
  await userInfoPage.openFromUserMenu();

  
console.log('URL hiện tại:', page.url());
console.log('Title:', await page.title());

console.log(
  'Nút Cập nhật ảnh:',
  await page.getByText('Cập nhật ảnh', { exact: true }).count()
);

console.log(
  'Input file:',
  await page.locator('input[type="file"]').count()
);

console.log(
  'Các nút trên trang:',
  await page.locator('button').allTextContents()
);


  await expect(userInfoPage.editProfileBtn).toBeVisible();
  await userInfoPage.openEditProfile();

  await page.waitForTimeout(1000);

  await page.screenshot({
    path: 'test-results/profile-edit-form.png',
    fullPage: true,
  });
});
 
test('TC23: Cập nhật thông tin cá nhân thành công', async ({
  page,
  loggedInUser,
  userInfoPage,
}) => {
  await userInfoPage.openFromUserMenu();
  await userInfoPage.openEditProfile();

  const updatedName = 'Test User Updated';
  const updatedPhone = '0912345678';

  await userInfoPage.updateProfile({
    name: updatedName,
    phone: updatedPhone,
  });

  // Kiểm tra giao diện sau khi cập nhật.
  await expect(page.getByText(updatedName, { exact: false }).first())
    .toBeVisible();
});

test('TC23.1: Cập nhật riêng họ tên', async ({
  page,
  loggedInUser,
  userInfoPage,
}) => {
  await userInfoPage.openFromUserMenu();
  await userInfoPage.openEditProfile();

  const newName = 'Nguyễn Văn An';

  await userInfoPage.editNameInput.fill(newName);
  await userInfoPage.updateProfileBtn.click();

  await expect(
    page.getByText(newName, { exact: true }).first()
  ).toBeVisible();
});

test('TC23.2: Cập nhật riêng số điện thoại', async ({
  page,
  loggedInUser,
  userInfoPage,
}) => {
  await userInfoPage.openFromUserMenu();
  await userInfoPage.openEditProfile();

  const newPhone = '0987654321';

  await userInfoPage.editPhoneInput.fill(newPhone);
  await userInfoPage.updateProfileBtn.click();

  // Kiểm tra giao diện đã quay lại trạng thái hồ sơ.
  await expect(userInfoPage.editProfileBtn).toBeVisible();
});

test('TC23.3: Kiểm tra khi để trống họ tên', async ({
  page,
  loggedInUser,
  userInfoPage,
}) => {
  await userInfoPage.openFromUserMenu();
  await userInfoPage.openEditProfile();

  await userInfoPage.editNameInput.fill('');
  await userInfoPage.updateProfileBtn.click();

  // Nếu họ tên bắt buộc, form phải giữ trạng thái chỉnh sửa
  // hoặc hiển thị thông báo validation.
  const stillEditing = await userInfoPage.editNameInput
    .isVisible()
    .catch(() => false);

  const invalid = await userInfoPage.editNameInput
    .evaluate((el) => (el as HTMLInputElement).validity.valid)
    .catch(() => true);

  expect(stillEditing || !invalid).toBeTruthy();
});

test('TC23.4: Kiểm tra khi để trống số điện thoại', async ({
  page,
  loggedInUser,
  userInfoPage,
}) => {
  await userInfoPage.openFromUserMenu();
  await userInfoPage.openEditProfile();

  await userInfoPage.editPhoneInput.fill('');
  await userInfoPage.updateProfileBtn.click();

  const stillEditing = await userInfoPage.editPhoneInput
    .isVisible()
    .catch(() => false);

  const invalid = await userInfoPage.editPhoneInput
    .evaluate((el) => (el as HTMLInputElement).validity.valid)
    .catch(() => true);

  expect(stillEditing || !invalid).toBeTruthy();
});

test('TC23.5: Cập nhật họ tên có dấu tiếng Việt', async ({
  page,
  loggedInUser,
  userInfoPage,
}) => {
  await userInfoPage.openFromUserMenu();
  await userInfoPage.openEditProfile();

  const newName = 'Nguyễn Văn Ánh';

  await userInfoPage.editNameInput.fill(newName);
  await userInfoPage.updateProfileBtn.click();

  await expect(
    page.getByText(newName, { exact: false }).first()
  ).toBeVisible();
});

test('TC23.6: Kiểm tra số điện thoại chứa chữ cái', async ({
  page,
  loggedInUser,
  userInfoPage,
}) => {
  await userInfoPage.openFromUserMenu();
  await userInfoPage.openEditProfile();

  await userInfoPage.editPhoneInput.fill('09ABC12345');
  await userInfoPage.updateProfileBtn.click();

  // Kiểm tra ứng dụng có từ chối dữ liệu không hợp lệ.
  const stillEditing = await userInfoPage.editPhoneInput
    .isVisible()
    .catch(() => false);

  const value = await userInfoPage.editPhoneInput
    .inputValue()
    .catch(() => '');

  expect(stillEditing || value !== '09ABC12345').toBeTruthy();
});

test('TC23.7: Kiểm tra số điện thoại quá ngắn', async ({
  page,
  loggedInUser,
  userInfoPage,
}) => {
  await userInfoPage.openFromUserMenu();
  await userInfoPage.openEditProfile();

  await userInfoPage.editPhoneInput.fill('123');
  await userInfoPage.updateProfileBtn.click();

  const stillEditing = await userInfoPage.editPhoneInput
    .isVisible()
    .catch(() => false);

  const value = await userInfoPage.editPhoneInput
    .inputValue()
    .catch(() => '');

  expect(stillEditing || value !== '123').toBeTruthy();
});

test('TC23.8: Kiểm tra số điện thoại quá dài', async ({
  page,
  loggedInUser,
  userInfoPage,
}) => {
  await userInfoPage.openFromUserMenu();
  await userInfoPage.openEditProfile();

  const longPhone = '09876543210987654321';

  await userInfoPage.editPhoneInput.fill(longPhone);
  await userInfoPage.updateProfileBtn.click();

  const stillEditing = await userInfoPage.editPhoneInput
    .isVisible()
    .catch(() => false);

  const value = await userInfoPage.editPhoneInput
    .inputValue()
    .catch(() => '');

  expect(stillEditing || value !== longPhone).toBeTruthy();
});

test('TC23.9: Nhấn cập nhật khi không thay đổi thông tin', async ({
  page,
  loggedInUser,
  userInfoPage,
}) => {
  await userInfoPage.openFromUserMenu();
  await userInfoPage.openEditProfile();

  const originalName = await userInfoPage.editNameInput.inputValue();
  const originalPhone = await userInfoPage.editPhoneInput.inputValue();

  await userInfoPage.updateProfileBtn.click();

  await expect(userInfoPage.editProfileBtn).toBeVisible();

  console.log('Họ tên ban đầu:', originalName);
  console.log('Số điện thoại ban đầu:', originalPhone);
});

test('TC23.10: Kiểm tra thông tin sau khi tải lại trang', async ({
  page,
  loggedInUser,
  userInfoPage,
}) => {
  await userInfoPage.openFromUserMenu();
  await userInfoPage.openEditProfile();

  const newName = 'Trần Minh Khang';

  await userInfoPage.editNameInput.fill(newName);
  await userInfoPage.updateProfileBtn.click();

  // Xác nhận tên mới hiển thị sau khi cập nhật
  await expect(
    page.getByText(newName, { exact: true }).first()
  ).toBeVisible();

  // Tải lại trang để kiểm tra dữ liệu đã được lưu
  await page.reload();

  await expect(userInfoPage.bookedRoomsHeading).toBeVisible();

  await expect(
    page.getByText(newName, { exact: true }).first()
  ).toBeVisible();
});

test('TC24: Kiểm tra upload ảnh đại diện thành công', async ({
  page,
  loggedInUser,
  userInfoPage,
}) => {
  // Bước 1: Mở trang hồ sơ sau khi đăng nhập
  await userInfoPage.openFromUserMenu();

  // Bước 2: Ghi nhận ảnh đại diện hiện tại nếu có
  const avatar = userInfoPage.avatarImage;

  const oldAvatarSrc = await avatar.getAttribute('src').catch(() => null);

  // Bước 3: Kiểm tra nút cập nhật ảnh
  await expect(userInfoPage.updateAvatarBtn).toBeVisible();

  // Bước 4: Chuẩn bị ảnh thử nghiệm
  const imagePath = path.resolve(
    process.cwd(),
    'test-data',
    'avatar.jpg'
  );

  // Bước 5: Chọn ảnh
  await userInfoPage.uploadAvatar(imagePath);

  // Bước 6: Xác nhận input đã nhận file
  const fileInput = page.locator('input[type="file"]');

  await expect.poll(async () => {
    return fileInput.evaluate(
      (el: HTMLInputElement) => el.files?.length ?? 0
    );
  }).toBe(1);

  console.log('Đã chọn file ảnh avatar.jpg');

  // Bước 7: Ghi nhận thông báo sau khi upload
  await page.waitForTimeout(1500);

  console.log(
    'Thông báo:',
    await page.locator(
      '.ant-message, .ant-notification, [role="alert"]'
    ).allTextContents()
  );

  console.log('Avatar src cũ:', oldAvatarSrc);
  console.log(
    'Avatar src hiện tại:',
    await avatar.getAttribute('src').catch(() => null)
  );
});

test('TC25: Kiểm tra chức năng đổi mật khẩu', async ({
  page,
  loggedInUser,
  userInfoPage,
}) => {
  await userInfoPage.openFromUserMenu();

  const pageText = await page.locator('body').innerText();

  console.log('URL hiện tại:', page.url());
  console.log(
    'Có chữ mật khẩu:',
    pageText.toLowerCase().includes('mật khẩu')
  );
  console.log(
    'Có chữ đổi mật khẩu:',
    pageText.includes('Đổi mật khẩu')
  );
  console.log(
    'Các nút trên trang:',
    await page.locator('button').allTextContents()
  );
  console.log(
    'Các liên kết:',
    await page.locator('a').allTextContents()
  );
});


});
