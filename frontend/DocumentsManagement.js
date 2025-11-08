// src/components/DocumentsManagement.js (Sử dụng Ant Design)

import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Popconfirm,
  message,
  Tag,
} from "antd";
import { callApi } from "../utils/apiClient";
import { getRole } from "../utils/auth";
import { PlusOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";

const DocumentsManagement = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null); // null: tạo mới, object: chỉnh sửa
  const [form] = Form.useForm();

  const userRole = getRole();
  const canManage = userRole === "admin" || userRole === "librarian";

  // --- LOGIC GỌI API ---

  // Hàm 1: Lấy danh sách sách
  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const data = await callApi("/documents", "GET");

      // 💡 KIỂM TRA BẮT BUỘC: Đảm bảo dữ liệu trả về là MẢNG
      if (Array.isArray(data)) {
        setDocuments(data);
      } else {
        // Nếu API trả về đối tượng lỗi hoặc null, ta đặt state là mảng rỗng
        setDocuments([]);
      }
    } catch (error) {
      setDocuments([]);
      console.error("Lỗi lấy lại danh sách:", error);
    } finally {
      setLoading(false);
    }
  };

  // Hàm 2: Thêm/Cập nhật sách
  const handleSaveDocument = async (values) => {
    if (!canManage)
      return message.warning("Bạn không có quyền thực hiện chức năng này.");

    try {
      if (editingDoc && editingDoc.id) {
        // Cập nhật (PUT)
        await callApi(`/documents/${editingDoc.id}`, "PUT", values);
        message.success("Cập nhật sách thành công!");
      } else {
        // Thêm mới (POST)
        await callApi("/documents", "POST", values);
        message.success("Thêm sách mới thành công!");
      }

      setIsModalOpen(false);
      fetchDocuments();
    } catch (error) {
      message.error(`Thao tác thất bại: ${error.message}`);
    }
  };

  // Hàm 3: Xóa sách
  const handleDeleteDocument = async (id) => {
    if (!canManage)
      return message.warning("Bạn không có quyền thực hiện chức năng này.");

    try {
      await callApi(`/documents/${id}`, "DELETE");
      message.success("Xóa sách thành công!");
      fetchDocuments();
    } catch (error) {
      message.error(`Xóa sách thất bại: ${error.message}`);
    }
  };

  // Hàm 4: Tạo đơn hàng (Chỉ cho Reader)
  const handleCreateOrder = async (documentId) => {
    if (userRole !== "reader")
      return message.warning("Chức năng này chỉ dành cho Người đọc.");
    try {
      await callApi("/orders", "POST", { document_id: documentId });
      message.success("Tạo đơn hàng thành công! Vui lòng chờ xử lý.");
      fetchDocuments(); // Cập nhật lại số lượng có sẵn
    } catch (error) {
      message.error(`Tạo đơn thất bại: ${error.message}`);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // --- CẤU HÌNH GIAO DIỆN BẢNG ---
  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 60 },
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
      sorter: (a, b) => a.title.localeCompare(b.title),
    },
    { title: "Tác giả", dataIndex: "author", key: "author" },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      width: 100,
      render: (quantity) => (
        <Tag
          color={quantity > 5 ? "success" : quantity > 0 ? "warning" : "error"}
        >
          {quantity}
        </Tag>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      width: 250,
      render: (text, record) => (
        <div style={{ display: "flex", gap: 8 }}>
          {/* Hành động của Reader */}
          {userRole === "reader" && record.quantity > 0 && (
            <Button
              type="primary"
              size="small"
              onClick={() => handleCreateOrder(record.id)}
            >
              Đặt Mượn
            </Button>
          )}

          {/* Hành động của Admin/Librarian */}
          {canManage && (
            <>
              <Button
                size="small"
                icon={<EditOutlined />}
                onClick={() => {
                  setEditingDoc(record);
                  form.setFieldsValue(record); // Load dữ liệu vào form
                  setIsModalOpen(true);
                }}
              >
                Sửa
              </Button>
              <Popconfirm
                title="Bạn có chắc chắn muốn xóa?"
                onConfirm={() => handleDeleteDocument(record.id)}
                okText="Có"
                cancelText="Không"
              >
                <Button size="small" danger icon={<DeleteOutlined />}>
                  Xóa
                </Button>
              </Popconfirm>
            </>
          )}
        </div>
      ),
    },
  ];

  // --- LOGIC XỬ LÝ MODAL ---
  const showModal = () => {
    setEditingDoc(null);
    form.resetFields(); // Reset form cho chức năng tạo mới
    setIsModalOpen(true);
  };

  return (
    <div className="documents-management">
      <h2>Quản lý Sách</h2>

      {/* Nút Thêm sách (Chỉ hiển thị cho người có quyền quản lý) */}
      {canManage && (
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={showModal}
          style={{ marginBottom: 16 }}
        >
          Thêm Sách Mới
        </Button>
      )}

      {/* Bảng Hiển thị Dữ liệu */}
      <Table
        columns={columns}
        dataSource={documents}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
        scroll={{ x: "max-content" }}
      />

      {/* Modal Thêm/Sửa Sách */}
      <Modal
        title={editingDoc ? "Chỉnh Sửa Sách" : "Thêm Sách Mới"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null} // Không dùng footer mặc định, dùng nút trong Form
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveDocument}
          initialValues={{ quantity: 0 }}
        >
          <Form.Item
            name="title"
            label="Tiêu đề"
            rules={[{ required: true, message: "Vui lòng nhập tiêu đề!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="author"
            label="Tác giả"
            rules={[{ required: true, message: "Vui lòng nhập tác giả!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="quantity"
            label="Số lượng"
            rules={[{ required: true, message: "Vui lòng nhập số lượng!" }]}
            tooltip="Số lượng sách hiện có trong kho"
          >
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ marginRight: 8 }}>
              {editingDoc ? "Lưu Thay Đổi" : "Thêm Sách"}
            </Button>
            <Button onClick={() => setIsModalOpen(false)}>Hủy</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DocumentsManagement;
