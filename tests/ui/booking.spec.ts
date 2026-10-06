import { test, expect } from '../../fixture/page-fixture';
import { BookingConstant, formatBookingDate, getFutureDate } from '../../constants/BookingConstant';

const { ROOM_ID, CLEANING_FEE, MSG } = BookingConstant;

test.describe('Booking Flow', () => {
  test('TC16: Đặt phòng thành công (end-to-end flow)', async ({ page, loggedInUser, roomDetailPage }) => {
    const checkIn = getFutureDate(10);
    const checkOut = getFutureDate(13);
    const { booking } = roomDetailPage;

    await roomDetailPage.open(ROOM_ID);
    await booking.selectDates(checkIn, checkOut);
    await booking.increaseGuests(1);

    await expect(booking.checkInField).toContainText(formatBookingDate(checkIn));
    await expect(booking.checkOutField).toContainText(formatBookingDate(checkOut));
    await expect(booking.guestCount).toHaveText('2 khách');

    await booking.clickBook();
    await expect(booking.confirmDialog).toContainText(BookingConstant.confirmTitle(ROOM_ID));

    const bookingResponse = page.waitForResponse(
      (res) => res.url().includes('/api/dat-phong') && res.request().method() === 'POST'
    );
    await booking.confirmBooking();

    const response = await bookingResponse;
    expect(response.status()).toBe(201);
    expect(response.request().postDataJSON()).toMatchObject({ maPhong: String(ROOM_ID), soLuongKhach: 2 });
    await expect(roomDetailPage.messageByText(MSG.SUCCESS)).toBeVisible();
  });

  test('TC17: Validate tính toán giá chính xác', async ({ page, roomDetailPage }) => {
    const { booking } = roomDetailPage;
    const roomResponse = page.waitForResponse((res) => res.url().endsWith(`/api/phong-thue/${ROOM_ID}`));

    await roomDetailPage.open(ROOM_ID);
    const { content: room } = await (await roomResponse).json();
    const price = await booking.getPricePerNight();

    // Giá hiển thị đúng với giá phòng từ API
    expect(price).toBe(room.giaTien);

    // Mặc định 7 đêm
    expect(await booking.getNights()).toBe(7);
    expect(await booking.getSubtotal()).toBe(price * 7);
    expect(await booking.getCleaningFee()).toBe(CLEANING_FEE);
    expect(await booking.getTotal()).toBe(price * 7 + CLEANING_FEE);

    // Đổi sang 3 đêm -> tiền tính lại
    await booking.selectDates(getFutureDate(20), getFutureDate(23));
    expect(await booking.getNights()).toBe(3);
    expect(await booking.getSubtotal()).toBe(price * 3);
    expect(await booking.getTotal()).toBe(price * 3 + CLEANING_FEE);

    // Số khách không ảnh hưởng tới giá
    await booking.increaseGuests(1);
    expect(await booking.getTotal()).toBe(price * 3 + CLEANING_FEE);
  });

  test('TC18: Đặt phòng thất bại - Chưa đăng nhập', async ({ roomDetailPage }) => {
    const { booking } = roomDetailPage;

    await roomDetailPage.open(ROOM_ID);
    await booking.clickBook();

    await expect(roomDetailPage.messageByText(MSG.LOGIN_REQUIRED)).toBeVisible();
    await expect(booking.confirmDialog).toBeHidden();
  });

  test('TC19a: Đặt phòng thất bại - Không chọn được ngày trong quá khứ', async ({ roomDetailPage }) => {
    const { booking } = roomDetailPage;
    const yesterday = getFutureDate(-1);

    await roomDetailPage.open(ROOM_ID);
    const checkInBefore = await booking.getCheckInText();

    await booking.openCalendar();
    expect(await booking.isDateDisabled(yesterday)).toBeTruthy();

    // Click vào ngày đã qua không làm thay đổi ngày nhận phòng
    await booking.dayCell(yesterday).click();
    expect(await booking.getCheckInText()).toBe(checkInBefore);
  });

  test('TC19b: Đặt phòng thất bại - Ngày trả phòng trùng ngày nhận phòng', async ({ roomDetailPage }) => {
    test.fail(true, 'BUG TC19b: Chọn Nhận phòng = Trả phòng (0 đêm) vẫn đặt phòng thành công');
    const { booking } = roomDetailPage;
    const sameDay = getFutureDate(15);

    await roomDetailPage.open(ROOM_ID);
    await booking.selectDates(sameDay, sameDay);

    // Đặt phòng phải tối thiểu 1 đêm
    expect(await booking.getNights()).toBeGreaterThanOrEqual(1);
  });

  test('TC20: Xem lịch sử đặt phòng', async ({ loggedInUser, roomDetailPage, userInfoPage }) => {
    const { booking } = roomDetailPage;

    await roomDetailPage.open(ROOM_ID);
    await booking.clickBook();
    await booking.confirmBooking();
    await expect(roomDetailPage.messageByText(MSG.SUCCESS)).toBeVisible();

    await userInfoPage.openFromUserMenu();

    // Tài khoản mới chỉ có đúng 1 phòng vừa đặt
    await expect(userInfoPage.bookedRoomCard(ROOM_ID)).toBeVisible();
    await expect(userInfoPage.bookedRoomCards).toHaveCount(1);
  });

  test('TC21: Hủy đặt phòng', async () => {
    test.skip(true, 'Web chưa có chức năng hủy đặt phòng: trang Dashboard (/info-user) không có nút hủy');
  });
});
