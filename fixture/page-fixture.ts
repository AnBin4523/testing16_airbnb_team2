import { test as base, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { ResultPage } from '../pages/ResultPage';
import { AuthPage } from '../pages/AuthPage';
import { RoomDetailPage } from '../pages/RoomDetailPage';
import { UserInfoPage } from '../pages/UserInfoPage';
import { AuthConstant, uniqueEmail, uniquePhone } from '../constants/AuthConstant';
import { ApiConstant } from '../constants/BookingConstant';

type TestUser = { email: string; password: string };

type PageFixtures = {
  homePage: HomePage;
  resultPage: ResultPage;
  authPage: AuthPage;
  roomDetailPage: RoomDetailPage;
  userInfoPage: UserInfoPage;
  // Tài khoản mới (tạo qua API) đã đăng nhập sẵn trên trình duyệt
  loggedInUser: TestUser;
};

export const test = base.extend<PageFixtures>({
  homePage: async ({ page }, use) => {
    const homePage = new HomePage(page);
    await use(homePage);
  },
  resultPage: async ({ page }, use) => {
    const resultPage = new ResultPage(page);
    await use(resultPage);
  },
  authPage: async ({ page }, use) => {
    const authPage = new AuthPage(page);
    await use(authPage);
  },
  roomDetailPage: async ({ page }, use) => {
    const roomDetailPage = new RoomDetailPage(page);
    await use(roomDetailPage);
  },
  userInfoPage: async ({ page }, use) => {
    const userInfoPage = new UserInfoPage(page);
    await use(userInfoPage);
  },
  loggedInUser: async ({ request, authPage }, use) => {
    const user = { email: uniqueEmail(), password: AuthConstant.PASSWORD_VALID };
    const response = await request.post(`${ApiConstant.BASE_URL}/auth/signup`, {
      headers: { tokenCybersoft: ApiConstant.TOKEN_CYBERSOFT },
      data: {
        name: 'Test User',
        email: user.email,
        password: user.password,
        phone: uniquePhone(),
        birthday: '01/01/2000',
        gender: true,
        role: 'USER',
      },
    });
    expect(response.ok(), `Tạo tài khoản test thất bại: ${await response.text()}`).toBeTruthy();

    await authPage.open();
    await authPage.login(user.email, user.password);
    await expect(authPage.userAvatar).toBeVisible();
    await use(user);
  },
});

export { expect } from '@playwright/test';
