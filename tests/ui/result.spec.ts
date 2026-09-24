// import { epic, feature, story } from "allure-js-commons";
import {test, expect} from "../../fixture/page-fixture";

// const formatDate = (date: Date): string => {
//   const day = String(date.getDate()).padStart(2, '0');
//   const month = String(date.getMonth() + 1).padStart(2, '0');
//   const year = String(date.getFullYear());
//   return `${day}/${month}/${year}`;
// };

const getDateRange = () => {
  const checkIn = new Date();
  checkIn.setDate(checkIn.getDate() + 1);

  const checkOut = new Date(checkIn);
  checkOut.setDate(checkOut.getDate() + 7);

  return { checkIn, checkOut };
};
test.describe("Result Page", () =>{
    test.beforeEach(async({page})=>{
        // await epic("AirBnb Web")
        // await feature("Result Page")
        await page.goto("https://demo5.cybersoft.edu.vn/rooms")
    })
    test('TC01: Verify search with empty location', async ({ homePage}) => {
        // await story('Advanced Search Function');
    
        const { checkIn, checkOut } = getDateRange();
    
        await homePage.search.openDatePicker();
        await homePage.search.selectDateRange(
          String(checkIn.getDate()),
          String(checkIn.getMonth()),
          String(checkIn.getFullYear()),
          String(checkOut.getDate()),
          String(checkOut.getMonth()),
          String(checkOut.getFullYear())
        );
    
        await homePage.search.openGuestPicker();
        await homePage.search.increaseGuests(1);
    
        await homePage.search.submitSearch();
    
        const currentUrl = await homePage.getCurrentUrl();
        expect(currentUrl).toContain('/rooms');
      });
    
    
      test('TC02: Verify search with valid information', async ({ homePage, page }) => {
        // await story('Advanced Search Function');
    
        const location = 'Cần Thơ';
        const { checkIn, checkOut } = getDateRange();
    
        await homePage.search.openLocationPicker();
        await homePage.search.selectLocation(location);
    
        await homePage.search.openDatePicker();
        await homePage.search.selectDateRange(
          String(checkIn.getDate()),
          String(checkIn.getMonth()),
          String(checkIn.getFullYear()),
          String(checkOut.getDate()),
          String(checkOut.getMonth()),
          String(checkOut.getFullYear())
        );
    
        await homePage.search.openGuestPicker();
        await homePage.search.increaseGuests(1);
    
        await homePage.search.submitSearch();
    
        await expect(page).toHaveURL(/\/rooms\/can-tho/);
      });
    test("TC03: Verify the searrch result filtered by location", async({resultPage, homePage})=>{
        // await story("Result Page Function")
        const location = "Hà Nội"
        await homePage.search.openLocationPicker()

        await homePage.search.selectLocation(location)
        
        await homePage.search.submitSearch()

        const resultURL = await resultPage.getCurrentUrl()
        expect(resultURL).toContain("/rooms/ha-noi")

        const resultText = await resultPage.getSearchResultInfo()
        expect(resultText).toContain(location)

    // Verify từng phòng trả về đều thuộc đúng địa điểm đã chọn
    const roomTexts = await resultPage.getAllRoomCardTexts()
    expect(roomTexts.length).toBeGreaterThan(0)

    for (const roomText of roomTexts) {
        expect(roomText).toContain(location)
    }
    })
test("TC04: Verify the search result filtered by date range", async({resultPage, homePage})=>{
    // await story("Result Page Function")
    const dateCheckIn = "01"
    const monthCheckIn = "9"
    const yearCheckIn = "2026"

    const dateCheckOut = "10"
    const monthCheckOut = "9"
    const yearCheckOut = "2026"

    const expectedCheckIn = "01/10/2026"
    const expectedCheckOut = "10/10/2026"

    await homePage.search.openDatePicker()
    await homePage.search.selectDateRange(dateCheckIn, monthCheckIn, yearCheckIn,
        dateCheckOut, monthCheckOut, yearCheckOut)
    await homePage.search.submitSearch()

    const resultText = await resultPage.getSearchResultInfo()
    expect(resultText).toContain(expectedCheckIn)
    expect(resultText).toContain(expectedCheckOut)
})
test("TC05: Verify the search result filtered by number of guests", async({resultPage, homePage})=>{
    // await story("Result Page Function")
    const numberOfGuests = 3
    const location = "Cần Thơ"

    await homePage.search.openLocationPicker()
    await homePage.search.selectLocation(location)

    await homePage.search.openGuestPicker()
    await homePage.search.increaseGuests(numberOfGuests)
    await homePage.search.submitSearch()

    const guestCounts = await resultPage.getAllRoomGuestCounts()

expect(guestCounts.every(count => count >= numberOfGuests)).toBeTruthy()
})
test("TC06: Verify re-search on Result Page updates results correctly", async ({homePage, resultPage}) => {
    // Bước 1: Search lần đầu từ trang chủ với địa điểm "Hà Nội"
    const firstLocation = "Hà Nội"
    await homePage.search.openLocationPicker()
    await homePage.search.selectLocation(firstLocation)
    await homePage.search.submitSearch()

    // Xác nhận đã ở đúng trang kết quả với địa điểm đầu tiên
    const firstResultText = await resultPage.getSearchResultInfo()
    expect(firstResultText).toContain(firstLocation)

    // Bước 2: NGAY TRÊN Result Page, đổi lại địa điểm khác - "Cần Thơ"
    const secondLocation = "Cần Thơ"
    await resultPage.search.openLocationPicker()
    await resultPage.search.selectLocation(secondLocation)
    await resultPage.search.submitSearch()

    // Bước 3: Verify kết quả đã cập nhật đúng theo địa điểm mới
    const secondResultUrl = await resultPage.getCurrentUrl()
    expect(secondResultUrl).toContain('/rooms/can-tho')

    const secondResultText = await resultPage.getSearchResultInfo()
    expect(secondResultText).toContain(secondLocation)
    expect(secondResultText).not.toContain(firstLocation)

    // Verify từng card đều đúng theo địa điểm MỚI
    const roomTexts = await resultPage.getAllRoomCardTexts()
    expect(roomTexts.length).toBeGreaterThan(0)

    for (const roomText of roomTexts) {
        expect(roomText).toContain(secondLocation)
    }
})
})
