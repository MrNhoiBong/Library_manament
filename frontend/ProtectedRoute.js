// frontend/src/components/ProtectedRoute.js

import React from "react";
import { Navigate } from "react-router-dom";
import { isAuthenticated, getRole } from "../utils/auth";

// Component này yêu cầu props 'requiredRoles' là một mảng,
// ví dụ: ['admin', 'librarian', 'reader']
const ProtectedRoute = ({ children, requiredRoles }) => {
  // 1. Kiểm tra đã đăng nhập chưa
  if (!isAuthenticated()) {
    // Nếu chưa đăng nhập, chuyển hướng về trang Login
    return <Navigate to="/login" replace />;
  }

  // 2. Kiểm tra quyền hạn
  const userRole = getRole();

  // Nếu vai trò của người dùng không nằm trong danh sách quyền yêu cầu
  if (!requiredRoles.includes(userRole)) {
    // Chuyển hướng người dùng về dashboard của chính họ
    alert(
      `Bạn không có quyền truy cập trang này. Đang chuyển hướng về Dashboard ${userRole}.`
    );
    return <Navigate to={`/${userRole}-dashboard`} replace />;
  }

  // 3. Nếu mọi thứ hợp lệ, hiển thị nội dung trang
  return children;
};

export default ProtectedRoute;
