// src/pages/LibrarianDashboard.js (Sử dụng Ant Design)

import React, { useState } from "react";
import { Layout, Menu, Button, theme, notification } from "antd";
import {
  BookOutlined,
  UserOutlined,
  FileTextOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import AccountManagement from "../components/AccountManagement";
import DocumentsManagement from "../components/DocumentsManagement";
import OrderManagement from "../components/OrderManagement";

const { Header, Content, Sider } = Layout;

const LibrarianDashboard = ({ userRole }) => {
  const isAdmin = userRole === "admin";
  const [activeTab, setActiveTab] = useState("documents");

  // Ánh xạ các chức năng sang Menu Item
  const menuItems = [
    { key: "documents", icon: <BookOutlined />, label: "Quản lý Sách" },
    { key: "orders", icon: <FileTextOutlined />, label: "Quản lý Đơn hàng" },
    {
      key: "accounts",
      icon: <UserOutlined />,
      label: isAdmin ? "QL Người dùng & Thủ thư" : "QL Người dùng",
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "documents":
        return <DocumentsManagement />;
      case "orders":
        return <OrderManagement />;
      case "accounts":
        return <AccountManagement />;
      default:
        return null;
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    notification.info({
      message: "Đã đăng xuất",
      description: "Bạn sẽ được chuyển hướng đến trang đăng nhập.",
    });
    setTimeout(() => {
      window.location.href = "/login";
    }, 1000);
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider collapsible collapsed={false} style={{ background: "#001529" }}>
        <div
          className="logo"
          style={{
            height: 32,
            margin: 16,
            background: "rgba(255, 255, 255, 0.2)",
            color: "white",
            textAlign: "center",
            lineHeight: "32px",
          }}
        >
          {isAdmin ? "ADMIN" : "THỦ THƯ"}
        </div>
        <Menu
          theme="dark"
          defaultSelectedKeys={["documents"]}
          mode="inline"
          items={menuItems}
          onClick={(e) => setActiveTab(e.key)}
        />
      </Sider>
      <Layout className="site-layout">
        <Header
          style={{
            padding: 0,
            background: "#fff",
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
          }}
        >
          <span style={{ marginRight: 20 }}>
            Xin chào, **{userRole.toUpperCase()}**
          </span>
          <Button
            type="text"
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            style={{ marginRight: 15 }}
          >
            Đăng Xuất
          </Button>
        </Header>
        <Content style={{ margin: "24px 16px 0", overflow: "initial" }}>
          <div
            style={{
              padding: 24,
              minHeight: 800,
              background: "#fff",
              borderRadius: 8,
            }}
          >
            {renderContent()}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default LibrarianDashboard;
