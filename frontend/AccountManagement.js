// src/components/AccountManagement.js (Sử dụng Ant Design)

import React, { useState, useEffect } from "react";
import {
  Tabs,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Popconfirm,
  message,
  Tag,
} from "antd";
import { callApi } from "../utils/apiClient";
import { getRole } from "../utils/auth";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";

const { Option } = Select;
const { TabPane } = Tabs;

const AccountManagement = () => {
  const userRole = getRole();
  const isAdmin = userRole === "admin";

  const [readers, setReaders] = useState([]);
  const [librarians, setLibrarians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [upgradeForm] = Form.useForm();
  const [currentActionType, setCurrentActionType] = useState("reader"); // 'reader' hoặc 'librarian'
  const [currentReaderId, setCurrentReaderId] = useState(null);

  // --- LOGIC GỌI API ---
  const fetchAccounts = async () => {
    setLoading(true);
    try {
      // Lấy Readers (Admin/Librarian)
      const readerData = await callApi("/users", "GET");
      setReaders(readerData);

      // Lấy Librarians (Chỉ Admin)
      if (isAdmin) {
        const librarianData = await callApi("/admin/librarians", "GET");
        setLibrarians(librarianData);
      }
    } catch (error) {
      message.error("Lỗi khi lấy danh sách tài khoản.");
    } finally {
      setLoading(false);
    }
  };

  // Xóa tài khoản
  const handleDeleteAccount = async (id, roleType) => {
    try {
      if (roleType === "reader") {
        await callApi(`/users/${id}`, "DELETE"); // DELETE /api/users/:id
        message.success("Xóa tài khoản Reader thành công.");
        fetchAccounts();
      } else if (roleType === "librarian" && isAdmin) {
        await callApi(`/admin/librarian/${id}`, "DELETE"); // DELETE /api/admin/librarian/:id
        message.success("Xóa Thủ thư thành công.");
        fetchAccounts();
      }
    } catch (error) {
      message.error(`Xóa tài khoản thất bại: ${error.message}`);
    }
  };

  // Tạo tài khoản (Reader hoặc Librarian)
  const handleCreateAccount = async (values) => {
    const { role, ...accountData } = values;
    try {
      if (role === "reader") {
        // POST /api/users
        await callApi("/users", "POST", accountData);
      } else if (role === "librarian") {
        // POST /api/admin/librarian
        await callApi("/admin/librarian", "POST", accountData);
      }
      message.success(`Tạo tài khoản ${role} thành công.`);
      setIsModalOpen(false);
      fetchAccounts();
    } catch (error) {
      message.error(`Tạo tài khoản thất bại: ${error.message}`);
    }
  };

  // Nâng cấp hạng Reader
  const handleUpgradeRank = async (values) => {
    try {
      await callApi(`/users/upgrade/${currentReaderId}`, "PUT", values);
      message.success("Nâng cấp hạng Reader thành công.");
      setIsUpgradeModalOpen(false);
      fetchAccounts();
    } catch (error) {
      message.error(`Nâng cấp hạng thất bại: ${error.message}`);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, [isAdmin]);

  // --- CẤU HÌNH BẢNG ---

  const readerColumns = [
    { title: "Tên", dataIndex: "name", key: "name" },
    { title: "Email", dataIndex: "email", key: "email" },
    {
      title: "Hạng",
      dataIndex: "rank",
      key: "rank",
      render: (rank) => (
        <Tag color={rank === "VIP" ? "gold" : "blue"}>{rank}</Tag>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      render: (text, record) => (
        <div style={{ display: "flex", gap: 8 }}>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              setCurrentReaderId(record.id);
              upgradeForm.setFieldsValue({ newRank: record.rank });
              setIsUpgradeModalOpen(true);
            }}
          >
            Nâng Hạng
          </Button>
          <Popconfirm
            title="Xác nhận xóa tài khoản Reader này?"
            onConfirm={() => handleDeleteAccount(record.id, "reader")}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button size="small" danger icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  const librarianColumns = [
    { title: "Tên", dataIndex: "name", key: "name" },
    { title: "Email", dataIndex: "email", key: "email" },
    {
      title: "Hành động",
      key: "action",
      render: (text, record) => (
        <Popconfirm
          title="Xác nhận xóa Thủ thư này?"
          onConfirm={() => handleDeleteAccount(record.id, "librarian")}
          okText="Xóa"
          cancelText="Hủy"
        >
          <Button size="small" danger icon={<DeleteOutlined />}>
            Xóa
          </Button>
        </Popconfirm>
      ),
    },
  ];

  // --- GIAO DIỆN ---
  return (
    <div className="account-management">
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => {
          setCurrentActionType("reader"); // Mặc định tạo Reader
          form.resetFields();
          setIsModalOpen(true);
        }}
        style={{ marginBottom: 16 }}
      >
        + Thêm Tài khoản Reader
      </Button>
      {isAdmin && (
        <Button
          type="dashed"
          icon={<PlusOutlined />}
          onClick={() => {
            setCurrentActionType("librarian");
            form.resetFields();
            setIsModalOpen(true);
          }}
          style={{ marginBottom: 16, marginLeft: 10 }}
        >
          + Thêm Thủ thư
        </Button>
      )}

      <Tabs defaultActiveKey="readers">
        <TabPane tab="Quản lý Người đọc (Reader)" key="readers">
          <Table
            columns={readerColumns}
            dataSource={readers}
            rowKey="id"
            loading={loading}
          />
        </TabPane>
        {isAdmin && (
          <TabPane tab="Quản lý Thủ thư" key="librarians">
            <Table
              columns={librarianColumns}
              dataSource={librarians}
              rowKey="id"
              loading={loading}
            />
          </TabPane>
        )}
      </Tabs>

      {/* Modal Tạo tài khoản mới */}
      <Modal
        title={`Tạo tài khoản ${currentActionType}`}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateAccount}
          initialValues={{ role: currentActionType }}
        >
          <Form.Item hidden name="role" />
          <Form.Item name="name" label="Tên" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, type: "email" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[{ required: true, min: 6 }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Tạo Tài Khoản
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Nâng cấp Hạng Reader */}
      <Modal
        title="Nâng Cấp Hạng Reader"
        open={isUpgradeModalOpen}
        onCancel={() => setIsUpgradeModalOpen(false)}
        footer={null}
      >
        <Form form={upgradeForm} layout="vertical" onFinish={handleUpgradeRank}>
          <Form.Item
            name="newRank"
            label="Mức Hạng Mới"
            rules={[{ required: true }]}
          >
            <Select>
              <Option value="Basic">Basic</Option>
              <Option value="Premium">Premium</Option>
              <Option value="VIP">VIP</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Xác Nhận Nâng Cấp
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AccountManagement;
