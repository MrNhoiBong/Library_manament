// src/pages/UserDashboard.js

import React from "react";
import { getRole } from "../utils/auth";
import OrderManagement from "../components/OrderManagement";
import DocumentsManagement from "../components/DocumentsManagement";

const UserDashboard = () => {
  // Lấy thông tin người dùng từ LocalStorage (hoặc State Management)
  const userRole = getRole();

  // (Optional: Bạn có thể fetch thông tin chi tiết người dùng và mức hạng ở đây)

  return (
    <div className="dashboard user-dashboard">
      <h1>Chào mừng, Reader!</h1>
      {/* Hiển thị mức hạng của người dùng */}
      <p>
        Mức hạng hiện tại của bạn:{" "}
        <strong>{localStorage.getItem("userRank") || "Basic"}</strong>
      </p>

      <hr />

      {/* Người đọc xem danh sách sách và tạo đơn hàng */}
      <h2>1. Danh sách Sách & Đặt Đơn</h2>
      <DocumentsManagement />

      <hr />

      {/* Người đọc xem đơn hàng CỦA MÌNH (OrderManagement tự động lọc) */}
      <h2>2. Tình trạng Đơn hàng của tôi</h2>
      <OrderManagement />

      {/* Nút Đăng xuất */}
      <button
        onClick={() => {
          localStorage.clear();
          window.location.href = "/login";
        }}
      >
        Đăng Xuất
      </button>
    </div>
  );
};

export default UserDashboard;
