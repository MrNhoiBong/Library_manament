// src/utils/auth.js

// Tên biến key lưu trữ trong LocalStorage
const TOKEN_KEY = "library_auth_token";
const USER_ROLE_KEY = "library_user_role";

// Hàm lưu Token và Role sau khi đăng nhập thành công
export const setAuthData = (token, role) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_ROLE_KEY, role);
};

// Hàm lấy Token để đính kèm vào Header
export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

// Hàm lấy Role để phân quyền giao diện
export const getRole = () => {
  return localStorage.getItem(USER_ROLE_KEY);
};

// Hàm kiểm tra xem người dùng đã đăng nhập chưa
export const isAuthenticated = () => {
  return !!getToken();
};

// Hàm đăng xuất
export const logout = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_ROLE_KEY);
};

// Hàm kiểm tra quyền hạn
export const checkPermission = (requiredRoles) => {
  const userRole = getRole();
  if (!userRole) return false;
  // Chuyển quyền yêu cầu thành mảng và kiểm tra xem role của user có nằm trong đó không
  return requiredRoles.includes(userRole);
};
