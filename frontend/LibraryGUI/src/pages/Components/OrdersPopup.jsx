import React from 'react';
import { useEffect, useState } from "react";

const sampleorders = [
  {
    RequestDate: '2025-11-10T14:30:00',
    ApplyBy: 101,
    DocID: 501,
    OrderBy: 202,
    BorrowDay: 7,
    ApprovedDate: '2025-11-11T10:00:00',
    ReceivedDate: '2025-11-12T09:00:00',
    ReturnDate: '2025-11-19T09:00:00',
    Price: 150000.0,
    DeliveryDate: '2025-11-13',
    PaymentStatus: 'Paid',
    Note: 'Giao tận nơi',
    Address: '123 Đường Lê Lợi, TP.HCM',
  },
  {
    RequestDate: '2025-11-09T08:15:00',
    ApplyBy: 102,
    DocID: 502,
    OrderBy: 203,
    BorrowDay: 5,
    ApprovedDate: '2025-11-10T11:00:00',
    ReceivedDate: '2025-11-11T10:00:00',
    ReturnDate: '2025-11-16T10:00:00',
    Price: 95000.0,
    DeliveryDate: '2025-11-12',
    PaymentStatus: 'Unpaid',
    Note: '',
    Address: '456 Đường Nguyễn Trãi, Hà Nội',
  },
];

export default function OrdersPopup() {
    const [orders, setOrders] = useState(null);
    const cookies = document.cookie.split(";").reduce((acc, c) => {
            const [key, value] = c.trim().split("=");
            acc[key] = value;
            return acc;
        }, {});

    let url = window.location.host;

    useEffect(() => {
        // Gọi API để lấy dữ liệu reader
        fetch('http://'+url+'/api/order/orderby?acc='+cookies.account+'&pwd='+cookies.password) // URL API của bạn
        .then((res) => res.json())
        .then((data) => setOrders(data))
        .catch((err) => console.error("Fetch error:", err));
    }, []);

    if (!orders) {
        return <p>Đang tải thông tin người đọc...</p>;
    }

  return (
    <div className="max-w-full max-h-full overflow-auto p-6 bg-gray-50">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">📦 Danh sách đơn hàng</h1>
      <div className='overflow-y-auto pr-2 max-h-[400px]'>
        <div className="grid gap-4">
            {orders.map((order, index) => (
            <div key={index} className="bg-white shadow-md rounded-lg p-4 border border-gray-200">
                <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold text-blue-600">Đơn #{index + 1}</h2>
                <span className={`px-2 py-1 rounded text-sm font-medium ${order.PaymentStatus === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {order.PaymentStatus}
                </span>
                </div>
                <div className="text-sm text-gray-700 space-y-1">
                <p><strong>Ngày yêu cầu:</strong> {new Date(order.RequestDate).toLocaleString()}</p>
                <p><strong>Người đăng ký:</strong> {order.ApplyBy}</p>
                <p><strong>Tài liệu:</strong> {order.DocID}</p>
                <p><strong>Người đặt:</strong> {order.OrderBy}</p>
                <p><strong>Số ngày mượn:</strong> {order.BorrowDay} ngày</p>
                <p><strong>Ngày duyệt:</strong> {new Date(order.ApprovedDate).toLocaleString()}</p>
                <p><strong>Ngày nhận:</strong> {new Date(order.ReceivedDate).toLocaleString()}</p>
                <p><strong>Ngày trả:</strong> {new Date(order.ReturnDate).toLocaleString()}</p>
                <p><strong>Giá:</strong> {order.Price.toLocaleString()} VND</p>
                <p><strong>Ngày giao:</strong> {order.DeliveryDate}</p>
                <p><strong>Ghi chú:</strong> {order.Note || 'Không có'}</p>
                <p><strong>Địa chỉ:</strong> {order.Address}</p>
                </div>
            </div>
            ))}
        </div>
      </div>
    </div>
  );
}
