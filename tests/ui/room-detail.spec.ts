import { test, expect } from '../../fixture/page-fixture';
import { BookingConstant } from '../../constants/BookingConstant';
import { RoomDetailConstant } from '../../constants/RoomDetailConstant';

const { ROOM_ID, COMMENT_ROOM_ID, NOT_FOUND_ROOM_ID, AMENITY_LABELS, MSG } = RoomDetailConstant;

test.describe('Room Details', () => {
  test('RD-01: Hiển thị đúng thông tin phòng theo dữ liệu API', async ({ roomDetailPage }) => {
    const { room } = await roomDetailPage.openWithApiData(ROOM_ID);

    await expect(roomDetailPage.roomTitle).toHaveText(room.tenPhong);
    await expect(roomDetailPage.roomInfo).toContainText(`${room.khach} Khách`);
    await expect(roomDetailPage.roomInfo).toContainText(`${room.phongNgu} Phòng ngủ`);
    await expect(roomDetailPage.roomInfo).toContainText(`${room.giuong} giường`);
    await expect(roomDetailPage.roomInfo).toContainText(`${room.phongTam} Phòng tắm`);
    expect(await roomDetailPage.booking.getPricePerNight()).toBe(room.giaTien);
  });

  test('RD-02: Hiển thị hình ảnh của phòng', async ({ roomDetailPage }) => {
    const { room } = await roomDetailPage.openWithApiData(ROOM_ID);

    await expect(roomDetailPage.roomImages.first()).toBeVisible();
    await expect(roomDetailPage.roomImages.first()).toHaveAttribute('src', room.hinhAnh);
  });

  test('RD-03: Hiển thị đúng các tiện ích của phòng', async ({ roomDetailPage }) => {
    const { room } = await roomDetailPage.openWithApiData(ROOM_ID);
    const labels = await roomDetailPage.getAmenityLabels();

    // "Bàn là" được kiểm tra riêng ở RD-04 (bug)
    for (const [field, label] of Object.entries(AMENITY_LABELS).filter(([field]) => field !== 'banLa')) {
      expect(labels.includes(label), `Tiện ích "${label}" (${field}=${room[field]})`).toBe(room[field]);
    }
  });

  test('RD-04: Hiển thị tiện ích "Bàn là" khi phòng có bàn là', async ({ roomDetailPage }) => {
    test.fail(true, 'BUG RD-04: API trả banLa = true nhưng trang không hiển thị tiện ích "Bàn là"');
    const { room } = await roomDetailPage.openWithApiData(ROOM_ID);
    expect(room.banLa, 'Phòng dùng để test phải có bàn là').toBe(true);

    expect(await roomDetailPage.getAmenityLabels()).toContain(AMENITY_LABELS.banLa);
  });

  test('RD-05: Số lượng và điểm đánh giá trung bình đúng theo bình luận', async ({ roomDetailPage }) => {
    const { comments } = await roomDetailPage.openWithApiData(ROOM_ID);
    const average = comments.reduce((sum, c) => sum + c.saoBinhLuan, 0) / comments.length;

    expect(await roomDetailPage.getRatingCount()).toBe(comments.length);
    expect(await roomDetailPage.getRatingAverage()).toBeCloseTo(average, 1);
  });

  test('RD-06: Click địa điểm chuyển tới trang danh sách phòng của địa điểm đó', async ({ page, roomDetailPage }) => {
    await roomDetailPage.open(ROOM_ID);
    await roomDetailPage.click(roomDetailPage.locationLink);

    await expect(page).toHaveURL(/\/rooms\/ho-chi-minh$/);
  });

  test('RD-07: Không thể chọn vượt quá số khách tối đa của phòng', async ({ roomDetailPage }) => {
    const { room } = await roomDetailPage.openWithApiData(ROOM_ID);
    const { booking } = roomDetailPage;

    await booking.increaseGuests(room.khach + 1);

    expect(await booking.getGuestCount()).toBe(room.khach);
    await expect(roomDetailPage.messageByText(BookingConstant.MSG.MAX_GUEST)).toBeVisible();
  });

  test('RD-08: Chưa đăng nhập thì không thể bình luận', async ({ roomDetailPage }) => {
    await roomDetailPage.open(ROOM_ID);

    await expect(roomDetailPage.loginToCommentMessage).toBeVisible();
    await expect(roomDetailPage.commentBox).toBeHidden();
  });

  test('RD-09: Bình luận và đánh giá thành công', async ({ page, loggedInUser, roomDetailPage }) => {
    const content = `Auto test bình luận ${Date.now()}`;
    await roomDetailPage.open(COMMENT_ROOM_ID);
    const countBefore = await roomDetailPage.getRatingCount();

    const commentResponse = page.waitForResponse(
      (res) => res.url().includes('/api/binh-luan') && res.request().method() === 'POST'
    );
    await roomDetailPage.postComment(content, 4);

    const response = await commentResponse;
    expect(response.status()).toBe(201);
    expect(response.request().postDataJSON()).toMatchObject({ noiDung: content, saoBinhLuan: 4 });
    await expect(roomDetailPage.messageByText(MSG.COMMENT_SUCCESS)).toBeVisible();
    await expect(page.getByText(content)).toBeVisible();
    await expect(roomDetailPage.commentBox).toHaveValue('');
    // Có thể có người khác bình luận cùng lúc nên chỉ kiểm tra tăng ít nhất 1
    await expect.poll(() => roomDetailPage.getRatingCount()).toBeGreaterThanOrEqual(countBefore + 1);
  });

  test('RD-10: Không gửi bình luận khi nội dung trống', async ({ page, loggedInUser, roomDetailPage }) => {
    const postedComments: string[] = [];
    page.on('request', (req) => {
      if (req.url().includes('/api/binh-luan') && req.method() === 'POST') postedComments.push(req.url());
    });
    await roomDetailPage.open(COMMENT_ROOM_ID);

    await roomDetailPage.click(roomDetailPage.ratingStars.nth(4));
    await roomDetailPage.click(roomDetailPage.submitCommentBtn);

    // Đợi đủ lâu để nếu có request thì đã được gửi đi
    await page.waitForTimeout(2_000);
    expect(postedComments).toHaveLength(0);
    await expect(roomDetailPage.messageByText(MSG.COMMENT_SUCCESS)).toBeHidden();
  });

  test('RD-11: Hiển thị thông báo lỗi khi phòng không tồn tại', async ({ roomDetailPage }) => {
    await roomDetailPage.goto(`/room-detail/${NOT_FOUND_ROOM_ID}`);

    await expect(roomDetailPage.loadErrorMessage).toBeVisible();
    await expect(roomDetailPage.booking.bookBtn).toBeHidden();
  });
});
