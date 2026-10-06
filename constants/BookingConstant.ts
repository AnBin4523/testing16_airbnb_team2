export const BookingConstant = {
  ROOM_ID: 1,
  CLEANING_FEE: 8,
  MSG: {
    SUCCESS: 'Thêm mới thành công!',
    LOGIN_REQUIRED: 'Vui lòng đăng nhập để tiếp tục đặt phòng.',
    MAX_GUEST: 'Đã đạt tới số khách tối đa!',
  },
  confirmTitle: (roomId: number) => `Bạn có chắc muốn đặt phòng #${roomId} này?`,
};

// API backend của web demo. tokenCybersoft là token public mà front-end gửi kèm mọi request.
export const ApiConstant = {
  BASE_URL: 'https://airbnbnew.cybersoft.edu.vn/api',
  TOKEN_CYBERSOFT:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0ZW5Mb3AiOiJNTE9wcy9DbG91ZCBDeWJlclNvZnQiLCJIZXRIYW5TdHJpbmciOiIwNC8xMC8yMDM0IiwiSGV0SGFuVGltZSI6IjIwNDM1MzI4MDAwMDAiLCJuYmYiOjE3MTQ3NTkyMDAsImV4cCI6MjA0MzY4NDAwMH0.oBi62xOr5Ikoz8mXXdV2bknwAn-DF1BL00BfmqqsxF0',
};

export const getFutureDate = (days: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

// Định dạng ngày như ô Nhận phòng / Trả phòng: dd-mm-yyyy
export const formatBookingDate = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}-${month}-${date.getFullYear()}`;
};
