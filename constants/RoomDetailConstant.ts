export const RoomDetailConstant = {
  ROOM_ID: 2,
  // Phòng riêng cho test bình luận, để không làm lệch số đánh giá của ROOM_ID khi chạy song song
  COMMENT_ROOM_ID: 6,
  NOT_FOUND_ROOM_ID: 999999,
  // Tên trường tiện ích trong API -> nhãn hiển thị trên web
  AMENITY_LABELS: {
    wifi: 'Wifi',
    tivi: 'Tivi',
    dieuHoa: 'Điều hòa',
    mayGiat: 'Máy giặt',
    bep: 'Bếp',
    doXe: 'Bãi đỗ xe',
    hoBoi: 'Hồ bơi',
    banUi: 'Bàn ủi',
    banLa: 'Bàn là',
  } as Record<string, string>,
  MSG: {
    LOGIN_TO_COMMENT: 'Cần đăng nhập để bình luận',
    COMMENT_SUCCESS: 'Bình luận thành công',
    LOAD_ERROR: 'Có lỗi xảy ra vui lòng thử lại',
  },
};
