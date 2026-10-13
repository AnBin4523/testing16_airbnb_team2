
import { test, expect } from '../../fixture/page-fixture';

test('Kiểm tra điều hướng đến Profile', async ({
  page,
  loggedInUser,
  userInfoPage,
}) => {
  // Fixture loggedInUser tự tạo tài khoản và đăng nhập.
  console.log('Đã đăng nhập bằng:', loggedInUser.email);

  await expect(page).toHaveURL(/\/$/);

  await userInfoPage.openFromUserMenu();

  console.log('URL Profile:', page.url());
  await expect(page).toHaveURL(/\/info-user/);
});
