export const AuthConstant = {
  VALID_USER: {
    email: process.env.TEST_EMAIL ?? 'test@gmail.com',
    password: process.env.TEST_PASSWORD ?? 'Test@123',
  },
  PASSWORD_VALID: 'Test@123',
  MSG: {
    REQUIRED: 'Vui lòng không bỏ trống',
    BIRTHDAY_REQUIRED: 'Vui lòng chọn ngày sinh',
    LOGIN_FAILED: 'Email hoặc mật khẩu không đúng',
    EMAIL_EXISTED: /Email đã tồn tại/i,
  },
};

export const uniqueEmail = (): string => `testuser_${Date.now()}@gmail.com`;

export const uniquePhone = (): string =>
  '09' + Math.floor(Math.random() * 1e8).toString().padStart(8, '0');
