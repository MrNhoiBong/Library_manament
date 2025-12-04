// OrderForm.jsx
import React, { useState } from "react";

const OrderForm = ({ IdDoc, onClose}) => {
  const [formData, setFormData] = useState({
    IdDoc: IdDoc || "",
    note: "",
    borrowday: "",
    address: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let url = "http://"+window.location.host+"/api/add-order?acc="+cookies.account+"&pwd="+cookies.password;
      console.log(url)
        const res = await fetch(
        url,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            DocID: formData.IdDoc,
            Address: formData.address,
            BorrowDay: parseInt(formData.borrowday),
            Note: formData.note === "" ? null : formData.note,
          }),
        }
      );

      const data = await res.json();
      console.log(data);
    } catch (error) {
      console.error("Lỗi khi gửi API:", error);
    }

    onClose();
  };

    const cookies = document.cookie.split(";").reduce((acc, c) => {
        const [key, value] = c.trim().split("=");
        acc[key] = value;
        return acc;
    }, {});

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-full max-h-full overflow-auto bg-white p-6 rounded-lg shadow-md"
    >
      <h2 className="text-xl font-bold mb-4">Thông tin đơn hàng</h2>

      {/* IdDoc (readonly) */}
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">IdDoc</label>
        <input
          type="text"
          name="IdDoc"
          value={formData.IdDoc}
          readOnly
          className="w-full px-3 py-2 border rounded-md bg-gray-100 cursor-not-allowed"
        />
      </div>

      {/* Customer Name */}
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Ghi chú</label>
        <input
          type="text"
          name="note"
          value={formData.note}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
          
        />
      </div>

      {/* Phone */}
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Số ngày mượn</label>
        <input
          type="number"
          name="borrowday"
          value={formData.borrowday}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
          required
        />
      </div>

      {/* Address */}
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Địa chỉ</label>
        <textarea
          name="address"
          value={formData.address}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
          required
        />
      </div>

      <button
        type="submit"
        className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition"
      >
        Gửi đơn hàng
      </button>
    </form>
  );
};

export default OrderForm;
