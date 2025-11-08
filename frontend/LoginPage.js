// src/pages/LoginPage.js (Sử dụng Ant Design)

import React, { useState } from "react";
import { Form, Input, Button, Card, Typography, message } from "antd";
import { setAuthData } from "../utils/auth";
import { UserOutlined, LockOutlined } from "@ant-design/icons";

const { Title } = Typography;

const LoginPage = () => {
  const onFinish = async (values) => {
    // 💡 SỬA LỖI: Lấy username từ Form và gửi đi
    const { username, password } = values;

    try {
      // API Backend mong đợi trường "username"
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // 💡 GỬI USERNAME ĐI
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Lưu Token và Role khi thành công
        setAuthData(data.token, data.user.role);
        message.success(`Đăng nhập thành công! Vai trò: ${data.user.role}`);

        // Chuyển hướng
        const role = data.user.role;

        // 🚨 Lưu ý: 'librarian' và 'admin' dùng chung logic chuyển hướng.
        if (role === "reader") {
          window.location.href = "/reader-dashboard";
        } else if (role === "librarian" || role === "admin") {
          window.location.href = `/${role}-dashboard`;
        }
      } else {
        // Nếu Backend trả về 401 Unauthorized
        message.error(
          data.message || "Tên đăng nhập hoặc mật khẩu không chính xác."
        );
      }
    } catch (err) {
      message.error("Lỗi mạng: Không thể kết nối đến Backend API.");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "#f0f2f5",
      }}
    >
      <Card style={{ width: 400, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
        <Title level={3} style={{ textAlign: "center" }}>
          Hệ Thống Thư Viện
        </Title>

        <Form
          name="login_form"
          initialValues={{ remember: true }}
          onFinish={onFinish}
        >
          <Form.Item
            // 💡 SỬA TÊN FIELD TẠI ĐÂY: Dùng "username"
            name="username"
            rules={[
              { required: true, message: "Vui lòng nhập Tên đăng nhập!" },
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="Tên đăng nhập" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Vui lòng nhập Mật khẩu!" }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: "100%" }}>
              Đăng Nhập
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default LoginPage;
