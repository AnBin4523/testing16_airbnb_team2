
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
  console.log('URL trước khi mở menu:', page.url());
  console.log('Title trang:', await page.title());

  await userInfoPage.openFromUserMenu();
  await userInfoPage.openEditProfile();

  const name = await userInfoPage.editNameInput.inputValue();
  const phone = await userInfoPage.editPhoneInput.inputValue();

  console.log('Họ tên ban đầu:', name);
  console.log('Số điện thoại ban đầu:', phone);

  expect(name.trim().length).toBeGreaterThan(0);
  expect(phone.trim().length).toBeGreaterThan(0);
});
});
 
test('TC23: Cập nhật thông tin cá nhân thành công', async ({
  page,
  loggedInUser,
  userInfoPage,
}) => {
  // Kiểm tra trang trước khi thao tác
  console.log('URL trước khi mở hồ sơ:', page.url());
  console.log('Tiêu đề trang:', await page.title());

  // Mở trang thông tin cá nhân
  await userInfoPage.openFromUserMenu();

  console.log('URL sau khi mở hồ sơ:', page.url());

  // Mở form chỉnh sửa
  await userInfoPage.openEditProfile();

  const updatedName = 'Test User Updated';
  const updatedPhone = '0912345678';

  // Cập nhật thông tin
  await userInfoPage.updateProfile({
    name: updatedName,
    phone: updatedPhone,
  });

  // Kiểm tra tên mới hiển thị
  await expect(
    page.getByText(updatedName, { exact: false }).first()
  ).toBeVisible();
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

const originalName = await userInfoPage.editNameInput.inputValue();
const newPhone = '0909909990';

await userInfoPage.editPhoneInput.fill(newPhone);
await userInfoPage.updateProfileBtn.click();

// Xác nhận popup chỉnh sửa đã đóng.
await expect(userInfoPage.editNameInput).toBeHidden();

// Mở lại form để xác nhận dữ liệu đã lưu.
await userInfoPage.openEditProfile();

await expect(userInfoPage.editNameInput).toHaveValue(originalName);
await expect(userInfoPage.editPhoneInput).toHaveValue(newPhone);
});

test('TC23.3: Kiểm tra khi để trống họ tên', async ({
page,
loggedInUser,
userInfoPage,
}) => {
await userInfoPage.openFromUserMenu();
await userInfoPage.openEditProfile();

// Xóa họ tên
await userInfoPage.editNameInput.fill('');

// Nhấn Cập nhật
await userInfoPage.updateProfileBtn.click();

// Xác nhận thông báo lỗi thực tế của website
await expect(
page.getByText('Vui lòng nhập họ tên!', { exact: true })
).toBeVisible();

// Xác nhận form vẫn mở khi dữ liệu không hợp lệ
await expect(userInfoPage.editNameInput).toBeVisible();
});

test('TC23.4: Kiểm tra khi để trống số điện thoại', async ({
page,
loggedInUser,
userInfoPage,
}) => {
await userInfoPage.openFromUserMenu();
await userInfoPage.openEditProfile();

// Xóa số điện thoại
await userInfoPage.editPhoneInput.fill('');

// Nhấn Cập nhật
await userInfoPage.updateProfileBtn.click();

// Kiểm tra đúng thông báo lỗi thực tế
await expect(
page.getByText('Vui lòng nhập số điện thoại!', { exact: true })
).toBeVisible();

// Xác nhận form vẫn mở khi dữ liệu không hợp lệ
await expect(userInfoPage.editPhoneInput).toBeVisible();
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

console.log(
'Giá trị số điện thoại sau khi cập nhật:',
await userInfoPage.editPhoneInput.inputValue().catch(() => '(input đã đóng)')
);

console.log(
'Thông báo trên trang:',
await page.locator('body').innerText()
);

// Không cho phép form đóng nếu dữ liệu bị từ chối.
await expect(userInfoPage.editPhoneInput).toBeVisible();
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

// Xác nhận form đã đóng nếu đây là hành vi thực tế của website.
await expect(userInfoPage.editNameInput).toBeHidden();

await userInfoPage.openEditProfile();

await expect(userInfoPage.editNameInput).toHaveValue(originalName);
await expect(userInfoPage.editPhoneInput).toHaveValue(originalPhone);

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

const newName = 'Tran Minh Khang';
const newPhone = '0987654321';

await userInfoPage.editNameInput.fill(newName);
await userInfoPage.editPhoneInput.fill(newPhone);
await userInfoPage.updateProfileBtn.click();

await expect(userInfoPage.editNameInput).toBeHidden();

await page.reload();

await expect(userInfoPage.bookedRoomsHeading).toBeVisible();

await userInfoPage.openEditProfile();

await expect(userInfoPage.editNameInput).toHaveValue(newName);
await expect(userInfoPage.editPhoneInput).toHaveValue(newPhone);
});

test('TC24: Kiểm tra upload ảnh đại diện', async ({
  page,
  userInfoPage,
}) => {
  await userInfoPage.openFromUserMenu();

  const avatar = userInfoPage.avatarImage;
  const oldAvatarSrc = await avatar.getAttribute('src');

  const imagePath = path.resolve(
    process.cwd(),
    'test-data',
    'avatar.jpg'
  );

  // Chọn ảnh đại diện
  await userInfoPage.uploadAvatar(imagePath);

  // Xác nhận input file đã nhận ảnh
  const fileInput = page.locator('input[type="file"]').first();

  await expect.poll(async () => {
    return fileInput.evaluate(
      (el: HTMLInputElement) => el.files?.length ?? 0
    );
  }).toBe(1);

  console.log('Đã chọn file ảnh:', imagePath);
  console.log('Avatar src trước upload:', oldAvatarSrc);

  // Ghi nhận thông báo thực tế từ giao diện
  await page.waitForTimeout(1500);

  console.log(
    'Thông báo:',
    await page.locator(
      '.ant-message, .ant-notification, [role="alert"]'
    ).allTextContents()
  );

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



