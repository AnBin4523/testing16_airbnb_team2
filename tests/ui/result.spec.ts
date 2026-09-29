import {test, expect} from "../../fixture/page-fixture";

const formatDate = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear());

    return `${day}/${month}/${year}`;
};

const getFutureDate = (days: number): Date => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date;
};

test.describe("Result Page", () =>{
    test.beforeEach(async({page})=>{
        // await epic("AirBnb Web")
        // await feature("Result Page")
        await page.goto("/")
    })
    test('TC01: Verify search with empty location', async ({ homePage, resultPage}) => {
        // await story('Advanced Search Function');
        // 29/10/2026-18/11/2026
        const checkIn = getFutureDate(30);
const checkOut = getFutureDate(50);

const dateCheckIn = String(checkIn.getDate());
const monthCheckIn = String(checkIn.getMonth());
const yearCheckIn = String(checkIn.getFullYear());

const dateCheckOut = String(checkOut.getDate());
const monthCheckOut = String(checkOut.getMonth());
const yearCheckOut = String(checkOut.getFullYear());

const expectedCheckIn = formatDate(checkIn);
const expectedCheckOut = formatDate(checkOut);
    
    

    const numberOfGuests =1
    
        await homePage.search.openDatePicker();
        
        await homePage.search.selectDateRange(dateCheckIn, monthCheckIn, yearCheckIn,
            dateCheckOut, monthCheckOut, yearCheckOut
        );
    
        await homePage.search.openGuestPicker();
        await homePage.search.increaseGuests(numberOfGuests);
    
        await homePage.search.submitSearch();
    
        const currentUrl = await resultPage.getCurrentUrl()
        expect(currentUrl).toContain('/rooms');

         const resultText = await resultPage.getSearchResultInfo()
    expect(resultText).toContain(expectedCheckIn)
    expect(resultText).toContain(expectedCheckOut)


     const roomTexts = await resultPage.getAllRoomCardTexts()
        expect(roomTexts.length).toBeGreaterThan(0)
 
      });
    
    
      test('TC02: Verify search with valid information', async ({ homePage,resultPage }) => {
        // await story('Advanced Search Function');
        // 31/12/2026-7/1/2017
    
        const location = 'Cần Thơ';

    const checkIn = getFutureDate(93);
const checkOut = getFutureDate(100);

const dateCheckIn = String(checkIn.getDate());
const monthCheckIn = String(checkIn.getMonth());
const yearCheckIn = String(checkIn.getFullYear());

const dateCheckOut = String(checkOut.getDate());
const monthCheckOut = String(checkOut.getMonth());
const yearCheckOut = String(checkOut.getFullYear());

const expectedCheckIn = formatDate(checkIn);
const expectedCheckOut = formatDate(checkOut);

    const numberOfGuests =2
    
        await homePage.search.openLocationPicker();
        await homePage.search.selectLocation(location);
    
        await homePage.search.openDatePicker();


        await homePage.search.selectDateRange(dateCheckIn, monthCheckIn, yearCheckIn,
            dateCheckOut, monthCheckOut, yearCheckOut
        );
    
        await homePage.search.openGuestPicker();
        await homePage.search.increaseGuests(numberOfGuests);
    
        await homePage.search.submitSearch();
    
       const currentUrl = await resultPage.getCurrentUrl()
       expect(currentUrl).toContain('/rooms/can-tho');

        const resultText = await resultPage.getSearchResultInfo()
         expect(resultText).toContain(location)
         expect(resultText).toContain(expectedCheckIn)
         expect(resultText).toContain(expectedCheckOut)

     const roomTexts = await resultPage.getAllRoomCardTexts()
     expect(roomTexts.length).toBeGreaterThan(0)
    for (const roomText of roomTexts) {
        expect(roomText).toContain(location)
    }

    const guestCounts = await resultPage.getAllRoomGuestCounts()
     expect(guestCounts.length).toBeGreaterThan(0)
    expect(guestCounts.every(count => count >= numberOfGuests)).toBeTruthy()
      });
    test("TC03: Verify the search result filtered by location", async({resultPage, homePage})=>{
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
    // 9/10/2026-19/10/2026
   const checkIn = getFutureDate(10);
const checkOut = getFutureDate(20);

const dateCheckIn = String(checkIn.getDate());
const monthCheckIn = String(checkIn.getMonth());
const yearCheckIn = String(checkIn.getFullYear());

const dateCheckOut = String(checkOut.getDate());
const monthCheckOut = String(checkOut.getMonth());
const yearCheckOut = String(checkOut.getFullYear());

const expectedCheckIn = formatDate(checkIn);
const expectedCheckOut = formatDate(checkOut);

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
 
        expect(guestCounts.length).toBeGreaterThan(0)
        expect(guestCounts.every(count => count >= numberOfGuests)).toBeTruthy()
})
test("TC06: Verify re-search on Result Page updates results correctly", async ({homePage, resultPage}) => {
    // Bước 1: Search lần đầu từ trang chủ với địa điểm "Hà Nội"
    const firstLocation = "Hà Nội"
    await homePage.search.openLocationPicker()
    await homePage.search.selectLocation(firstLocation)
    await homePage.search.submitSearch()

    // Xác nhận đã ở đúng trang kết quả với địa điểm đầu tiên
     await expect(resultPage.resultInfo).toContainText(firstLocation)

    // Bước 2: NGAY TRÊN Result Page, đổi lại địa điểm khác - "Cần Thơ"
    const secondLocation = "Cần Thơ"
    await resultPage.search.openLocationPicker()
    await resultPage.search.selectLocation(secondLocation)
    await resultPage.search.submitSearch()

    // Bước 3: Verify kết quả đã cập nhật đúng theo địa điểm mới
    const secondResultUrl = await resultPage.getCurrentUrl()
    expect(secondResultUrl).toContain('/rooms/can-tho')

      await expect(resultPage.resultInfo).toContainText(secondLocation)
        await expect(resultPage.resultInfo).not.toContainText(firstLocation)

    // Verify từng card đều đúng theo địa điểm MỚI
    const roomTexts = await resultPage.getAllRoomCardTexts()
    expect(roomTexts.length).toBeGreaterThan(0)
    for (const roomText of roomTexts) {
        expect(roomText).toContain(secondLocation)
    }
})
})
