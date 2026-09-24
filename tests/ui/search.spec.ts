import { test, expect } from '../../fixture/page-fixture';
const formatDate = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear());
  return `${day}/${month}/${year}`;
};

const getDateRange = () => {
  const checkIn = new Date();
  checkIn.setDate(checkIn.getDate() + 1);

  const checkOut = new Date(checkIn);
  checkOut.setDate(checkOut.getDate() + 7);

  return { checkIn, checkOut };
};

test.describe('Home Page - Search', () => {
  test.beforeEach(async ({ page }) => {
    // await epic('AirBnb Web');
    // await feature('Home Page');
    await page.goto('https://demo5.cybersoft.edu.vn/');
  });
   test("TC01: Verify location dropdown", async ({ homePage }) => {
    // await story("Advanced Search Function")

        // 1. Mở dropdown Location
        await homePage.search.openLocationPicker();

        // 2. Kiểm tra dropdown hiển thị
        await expect(
            homePage.search.locationDropdown
        ).toBeVisible();

        // 3. Lấy danh sách location
        const actualLocations =
            await homePage.search.getLocationOptions();

        // 4. Kiểm tra có đúng 8 location
        expect(actualLocations).toHaveLength(8);

        // 5. Kiểm tra tên các location
        const expectedLocations = [
            "Hồ Chí Minh",
            "Cần Thơ",
            "Nha Trang",
            "Hà Nội",
            "Phú Quốc",
            "Đà Nẵng",
            "Đà Lạt",
            "Phan Thiết"
        ];

        expect(actualLocations).toEqual(
            expectedLocations
        );

        // 6. Chọn Cần Thơ
       await homePage.search.selectLocation("Cần Thơ");

await expect(homePage.search.locationField)
        .toContainText("Cần Thơ");

    // Mở dropdown lại
    await homePage.search.openLocationPicker();

    // Chọn Nha Trang
    await homePage.search.selectLocation("Nha Trang");

    // Kiểm tra Cần Thơ đã bị thay thế bằng Nha Trang
    await expect(homePage.search.locationField)
        .toContainText("Nha Trang");

    // Kiểm tra Cần Thơ không còn là giá trị được chọn
    await expect(homePage.search.locationField)
        .not.toContainText("Cần Thơ");
    });

    test("TC02: Verify Logic Sidebar - 'Today'", async ({homePage}) => {
    // await story("Advanced Search Function")

    const today = new Date();
    const expectedDateStr = formatDate(today);

    // Bước 1: mở khung chọn Thời gian
    await homePage.search.openDatePicker()

    // Bước 2: click "Today" trên Sidebar
    await homePage.search.selectToday()

    // // Expected 1: ngày hôm nay được highlight trên lịch
    // const isTodaySelected = await homePage.search.isDateSelected(todayDate, 3)
    // expect(isTodaySelected).toBeTruthy()

    // Expected 2: trường Thời gian cập nhật đúng "hôm nay – hôm nay"
    const dateFieldText = await homePage.search.getDateFieldText()
    expect(dateFieldText).toContain(expectedDateStr)

    // Verify khoảng ngày là hôm nay - hôm nay (check-in = check-out)
    const expectedFullRange = `${expectedDateStr} – ${expectedDateStr}`
    expect(dateFieldText).toContain(expectedFullRange)
})

test("TC03: Verify Logic Sidebar - 'This Week'", async ({ homePage }) => {
    // await story('Advanced Search Function');
  const today = new Date();
    const expectedCheckIn = formatDate(today);

    const endOfWeek = new Date(today)
    endOfWeek.setDate(today.getDate() + (7 - today.getDay()))

   const expectedCheckOut = formatDate(endOfWeek);

    await homePage.search.openDatePicker()

    await homePage.search.selectThisWeek()

    const dateFieldText = await homePage.search.getDateFieldText()

    const expectedFullRange = `${expectedCheckIn} – ${expectedCheckOut}`

    expect(dateFieldText).toBe(expectedFullRange)
})
test("TC04: Verify Logic Sidebar - 'This Month'", async ({ homePage }) => {
    // await story('Advanced Search Function');
    const today = new Date();
    const expectedCheckIn = formatDate(today); 

    const endOfMonth = new Date(
        today.getFullYear(),
        today.getMonth() + 1,
        0
    )

    const expectedCheckOut = formatDate(endOfMonth);

    await homePage.search.openDatePicker()

    await homePage.search.selectThisMonth()

    const dateFieldText = await homePage.search.getDateFieldText()

    const expectedFullRange =
        `${expectedCheckIn} – ${expectedCheckOut}`

    expect(dateFieldText).toBe(expectedFullRange)
})
test("TC05: Verify Logic Sidebar - Days Starting Today", async ({ homePage }) => {
    // await story('Advanced Search Function');
    const numberOfDays = 5
    const today = new Date();
    const expectedCheckIn = formatDate(today);

    const endDate = new Date(today)
    endDate.setDate(today.getDate() + numberOfDays - 1)

    const expectedCheckOut = formatDate(endDate);

    await homePage.search.openDatePicker()

    await homePage.search.enterDaysStartingToday(numberOfDays)

    const dateFieldText = await homePage.search.getDateFieldText()

    const expectedFullRange =
        `${expectedCheckIn} – ${expectedCheckOut}`

    expect(dateFieldText).toBe(expectedFullRange)
})


  test('TC06: Verify default value of the check-in and check-out date fields', async ({ homePage }) => {
    // await story('Advanced Search Function');

    const { checkIn, checkOut } = getDateRange();

    await homePage.search.openDatePicker();

    const text = await homePage.search.getDateFieldText();

    expect(text).toContain(formatDate(checkIn));
    expect(text).toContain(formatDate(checkOut));
  });

  test('TC07: Verify the check-in date is greater than the check-out date', async ({ homePage }) => {
    // await story('Advanced Search Function');

    await homePage.search.openDatePicker();
    await homePage.search.selectCheckInDate('30', '8', '2026');

    const disabled = await homePage.search.isDateDisabled('29', 3);
    expect(disabled).toBeTruthy();
  });

  test('TC08: Verify past dates are disabled on the calendar', async ({ homePage }) => {
    // await story('Advanced Search Function');

    const today = new Date()
    const dateCheckIn = today.getDate().toString()
    const dateDisabled = (parseInt(dateCheckIn) - 1).toString()

    await homePage.search.openDatePicker();
    const isPastDateDisabled = await homePage.search.isDateDisabled(dateDisabled, 3)
    expect(isPastDateDisabled).toBeTruthy()
  });

  test('TC09: Verify the decrease button is disabled when the number of guests is 1', async ({ homePage }) => {
    // await story('Advanced Search Function');

    await homePage.search.openGuestPicker();
    const isDisabled = await homePage.search.isDecreaseButtonDisabled();

    expect(isDisabled).toBeTruthy();
  });

  test('TC10: Verify the number of guests is displayed correctly', async ({ homePage }) => {
    // await story('Advanced Search Function');

    const numberIncrease = 3
    const numberDecrease = 2

    await homePage.search.openGuestPicker();
    await homePage.search.increaseGuests(numberIncrease);

    let guestCount = await homePage.search.getGuestCount();
    expect(guestCount).toBe(numberIncrease);

    await homePage.search.decreaseGuests(numberDecrease);
    guestCount = await homePage.search.getGuestCount();

    expect(guestCount).toBe(numberIncrease - numberDecrease);
  });
});