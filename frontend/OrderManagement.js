// src/components/OrderManagement.js (Sử dụng Ant Design)

import React, { useState, useEffect } from "react";
import { Table, Button, Popconfirm, message, Tag, Select } from "antd";
import { callApi } from "../utils/apiClient";
import { getRole } from "../utils/auth";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";

const { Option } = Select;

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const userRole = getRole();
  const isManager = userRole === "admin" || userRole === "librarian";

  // Các trạng thái đơn hàng hợp lệ
  const STATUSES = [
    { value: "Pending", color: "blue" },
    { value: "Packed", color: "processing" },
    { value: "Shipped", color: "orange" },
    { value: "Received", color: "purple" },
    { value: "Completed", color: "success" },
    { value: "Cancelled", color: "error" },
  ];

  // --- LOGIC GỌI API ---

  // Hàm 1: Lấy danh sách đơn hàng phù hợp với vai trò
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const endpoint = isManager ? "/orders" : "/orders/my"; // GET /api/orders hoặc /api/orders/my
      const data = await callApi(endpoint, "GET");
      setOrders(data);
    } catch (error) {
      message.error("Lỗi khi lấy danh sách đơn hàng.");
    } finally {
      setLoading(false);
    }
  };

  // Hàm 2: Cập nhật trạng thái đơn hàng (Chỉ cho Admin/Librarian)
  const handleUpdateStatus = async (orderId, newStatus) => {
    if (!isManager)
      return message.warning("Bạn không có quyền cập nhật trạng thái.");
    try {
      await callApi(`/orders/status/${orderId}`, "PUT", { status: newStatus });
      message.success(
        `Cập nhật trạng thái đơn hàng ID ${orderId} thành ${newStatus} thành công.`
      );
      fetchOrders();
    } catch (error) {
      message.error(`Cập nhật trạng thái thất bại: ${error.message}`);
    }
  };

  // Hàm 3: Xóa đơn hàng (Chỉ cho Admin/Librarian)
  const handleDeleteOrder = async (orderId) => {
    if (!isManager) return message.warning("Bạn không có quyền xóa đơn hàng.");
    try {
      await callApi(`/orders/${orderId}`, "DELETE");
      message.success("Xóa đơn hàng thành công và đã hoàn lại sách.");
      fetchOrders();
    } catch (error) {
      message.error(`Xóa đơn hàng thất bại: ${error.message}`);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [isManager]);

  // --- CẤU HÌNH GIAO DIỆN BẢNG ---

  const baseColumns = [
    { title: "ID", dataIndex: "id", key: "id", width: 60 },
    ...(isManager
      ? [{ title: "Người Đặt", dataIndex: "reader_name", key: "reader_name" }]
      : []), // Chỉ hiển thị cho Quản trị
    { title: "Sách", dataIndex: "title", key: "title" },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const statusInfo = STATUSES.find((s) => s.value === status);
        return (
          <Tag color={statusInfo ? statusInfo.color : "default"}>{status}</Tag>
        );
      },
    },
    {
      title: "Ngày Đặt",
      dataIndex: "order_date",
      key: "order_date",
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Hạn Trả",
      dataIndex: "due_date",
      key: "due_date",
      render: (date) => new Date(date).toLocaleDateString(),
    },
  ];

  const actionColumn = {
    title: "Hành động",
    key: "action",
    width: 150,
    render: (text, record) =>
      isManager ? ( // Hành động của Admin/Librarian
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Select
            defaultValue={record.status}
            onChange={(value) => handleUpdateStatus(record.id, value)}
            style={{ width: 100 }}
            disabled={
              record.status === "Completed" || record.status === "Cancelled"
            }
          >
            {STATUSES.map((s) => (
              <Option key={s.value} value={s.value}>
                {s.value}
              </Option>
            ))}
          </Select>

          <Popconfirm
            title="Xóa đơn hàng này?"
            onConfirm={() => handleDeleteOrder(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button danger size="small">
              Xóa
            </Button>
          </Popconfirm>
        </div>
      ) : // Hành động của Reader (Chỉ xem)
      record.status === "Pending" ? (
        <Tag color="warning">Đang chờ</Tag>
      ) : record.status === "Completed" ? (
        <Tag color="success" icon={<CheckCircleOutlined />}>
          Hoàn tất
        </Tag>
      ) : (
        <Tag color="processing">{record.status}</Tag>
      ),
  };

  const columns = [...baseColumns, actionColumn];

  return (
    <div className="order-management">
      <h2>{isManager ? "Quản lý Tất Cả Đơn Hàng" : "Đơn Hàng Của Tôi"}</h2>

      <Table
        columns={columns}
        dataSource={orders}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 8 }}
      />
    </div>
  );
};

export default OrderManagement;
