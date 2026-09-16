import { test, expect } from '../../fixture/page-fixture';

test.describe('Home page', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.open();
  });

  test('should load home page with correct title', async ({ homePage }) => {
    const title = await homePage.getTitle();
    expect(title.length).toBeGreaterThan(0);
  });

  test('should display header logo and nav links', async ({ homePage }) => {
    await expect(homePage.header.logo).toBeVisible();
    await expect(homePage.header.homeLink).toBeVisible();
  });

  test('should display banner and location listings', async ({ homePage }) => {
    expect(await homePage.isBannerVisible()).toBe(true);
    const count = await homePage.getLocationCardCount();
    expect(count).toBeGreaterThan(0);
  });

  test('should navigate to a location page', async ({ homePage, page }) => {
    await homePage.goToLocation('Hồ Chí Minh');
    await expect(page).toHaveURL(/\/rooms\/ho-chi-minh/);
  });
});
