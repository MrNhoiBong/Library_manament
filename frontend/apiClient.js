// src/utils/apiClient.js (File bạn nên tạo)
import { getToken, logout } from "./auth";

const BASE_URL = "http://localhost:5000/api";

export const callApi = async (endpoint, method = "GET", data = null) => {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
  };

  // Đính kèm Token nếu có
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config = {
    method,
    headers,
    body: data ? JSON.stringify(data) : null,
  };

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    const result = await response.json();

    // Xử lý lỗi 401/403 (Token hết hạn/Không có quyền)
    if (response.status === 401 || response.status === 403) {
      alert("Phiên đăng nhập đã hết hạn hoặc bạn không có quyền truy cập.");
      logout();
      window.location.href = "/login"; // Quay về trang đăng nhập
      return;
    }

    if (!response.ok) {
      throw new Error(result.message || "Lỗi API");
    }

    return result;
  } catch (error) {
    console.error("Lỗi mạng/API:", error);
    throw error;
  }
};
