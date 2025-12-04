import React, { useState, useEffect } from "react";

const API_URL = `http://${window.location.host}/api`;

const DeleteSection = () => {
    const [option, setOption] = useState("deleteDocument");
    const [acc, setAcc] = useState("");
    const [pwd, setPwd] = useState("");
    const [form, setForm] = useState({});
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [documentList, setDocumentList] = useState([]);
    const [readerList, setReaderList] = useState([]);
    const [readerOrders, setReaderOrders] = useState([]);

    useEffect(() => {
        const cookies = document.cookie.split(";").reduce((acc, c) => {
            const [key, value] = c.trim().split("=");
            acc[key] = value;
            return acc;
        }, {});
        if (cookies.role !== "librarian") {
            alert("Vui lòng đăng nhập bằng tài khoản thủ thư");
            window.location.href = "/login";
        } else {
            setAcc(cookies.account);
            setPwd(cookies.password);
        }
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const loadDocuments = async () => {
        if (!acc || !pwd) {
            alert("Vui lòng nhập tài khoản và mật khẩu thủ thư trước khi tải danh sách documents.");
            return;
        }
        try {
            const res = await fetch(`${API_URL}/get-documents/`);
            if (!res.ok) throw new Error("Không thể lấy danh sách tài liệu");
            const data = await res.json();
            setDocumentList(data);
        } catch (err) {
            console.error("Lỗi fetch documents:", err);
        }
    };

    const loadReaders = async () => {
        if (!acc || !pwd) {
            alert("Vui lòng nhập tài khoản và mật khẩu thủ thư trước khi tải danh sách readers.");
            return;
        }
        try {
            const res = await fetch(`${API_URL}/readers?acc=${acc}&pwd=${pwd}`);
            if (!res.ok) throw new Error("Không thể lấy danh sách người đọc");
            const data = await res.json();
            setReaderList(data);
        } catch (err) {
            console.error("Lỗi fetch readers:", err);
        }
    };

    const loadOrdersByReader = async (readerID) => {
        if (!acc || !pwd || !readerID) return;
        try {
            const res = await fetch(`${API_URL}/order/orderby?acc=${acc}&pwd=${pwd}&ReaderID=${readerID}`);
            const data = await res.json();
            setReaderOrders(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Lỗi khi tải đơn hàng:", err);
            setReaderOrders([]);
        }
    };



    const handleDelete = async () => {
        setLoading(true);
        let endpoint = "";
        switch (option) {
            case "deleteDocument":
                endpoint = "/delete-document";
                break;
            case "deleteReader":
                endpoint = "/delete-reader";
                break;
            case "deleteLibrarian":
                endpoint = "/delete-librarian";
                break;
            case "deleteOrder":
                endpoint = "/delete-order";
                break;
            case "deleteMembercard":
                endpoint = "/delete-membercard";
                break;
            default:
                setResult({ error: "Tùy chọn không hợp lệ" });
                setLoading(false);
                return;
        }

        try {
            const res = await fetch(`${API_URL}${endpoint}?acc=${acc}&pwd=${pwd}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify(form)
            });

            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(`Lỗi ${res.status}: ${errorText}`);
            }

            const data = await res.json();
            setResult(data);
        } catch (error) {
            console.error("Lỗi khi xóa:", error);
            setResult({ error: error.message || "Không thể kết nối API." });
        }

        setLoading(false);
    };

    const renderDeleteFields = () => {
        switch (option) {
            case "deleteDocument":
                return (
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={loadDocuments}
                            className="px-3 py-1 bg-green-600 text-white rounded-md"
                        >
                            Tải danh sách
                        </button>
                        <select
                            name="DocID"
                            value={form.DocID || ""}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded-md"
                        >
                            <option value="">-- Chọn DocumentID --</option>
                            {documentList.map((doc) => (
                                <option key={doc.DocID} value={doc.DocID}>
                                    {doc.DocID} - {doc.Title}
                                </option>
                            ))}
                        </select>
                    </div>
                );
            case "deleteReader":
                return (
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">🆔 Mã người đọc (ReaderID)</label>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={loadReaders}
                                className="px-3 py-1 bg-green-600 text-white rounded-md"
                            >
                                Tải danh sách
                            </button>
                            <select
                                name="ReaderID"
                                value={form.ReaderID || ""}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded-md"
                            >
                                <option value="">-- Chọn ReaderID --</option>
                                {readerList.map((r) => (
                                    <option key={r.ReaderID} value={r.ReaderID}>
                                        {r.ReaderID} - {r.Name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                );
            case "deleteLibrarian":
                return (
                    <div className="flex flex-col gap-3">
                        <label className="block text-gray-700 font-medium mb-1">🧑‍💼 Mã thủ thư (LibrarianID)</label>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={async () => {
                                    try {
                                        const res = await fetch(
                                            `${API_URL}/get-librarian?acc=${acc}&pwd=${pwd}`
                                        );
                                        if (!res.ok) throw new Error("Không thể tải thủ thư");
                                        const data = await res.json();
                                        // Gán LibrarianID vào form
                                        setForm(prev => ({
                                            ...prev,
                                            LibrarianID: data.LibrarianID
                                        }));
/*                                        alert(`Đã gán LibrarianID = ${data.LibrarianID}`);*/
                                    } catch (err) {
                                        console.error("Lỗi khi tải thủ thư:", err);
                                        alert("Sai tài khoản hoặc mật khẩu thủ thư");
                                    }
                                }}
                                className="px-3 py-1 bg-green-600 text-white rounded-md"
                            >
                                Tải thủ thư
                            </button>
                            <input
                                type="text"
                                name="LibrarianID"
                                value={form.LibrarianID || ""}
                                readOnly
                                className="w-full p-2 border border-gray-300 rounded-md bg-gray-100"
                            />
                        </div>
                    </div>
                );
            case "deleteOrder":
                return (
                    <div className="flex flex-col gap-4">
                        {/* Chọn ReaderID */}
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">👤 Người mượn (ReaderID)</label>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={loadReaders}
                                    className="px-3 py-1 bg-green-600 text-white rounded-md"
                                >
                                    Tải danh sách
                                </button>
                                <select
                                    name="OrderBy"
                                    value={form.OrderBy || ""}
                                    onChange={(e) => {
                                        handleChange(e);
                                        loadOrdersByReader(e.target.value);
                                    }}
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                >
                                    <option value="">-- Chọn ReaderID --</option>
                                    {readerList.map((r) => (
                                        <option key={r.ReaderID} value={r.ReaderID}>
                                            {r.ReaderID} - {r.Name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Chọn đơn hàng (DocID + RequestDate) */}
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">📘 Đơn hàng cần xóa</label>
                            <div className="flex gap-2">
                                <select
                                    name="selectedOrder"
                                    value={form.selectedOrder || ""}
                                    onChange={(e) => {
                                        const [docID, requestDate] = e.target.value.split("|");
                                        setForm(prev => ({
                                            ...prev,
                                            selectedOrder: e.target.value,
                                            DocID: docID,
                                            RequestDate: requestDate
                                        }));
                                    }}
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                >
                                    <option value="">-- Chọn đơn hàng --</option>
                                    {readerOrders.map((order) => {
                                        const formattedDate = order.RequestDate?.replace("T", " ").slice(0, 19);
                                        const value = `${order.DocID}|${order.RequestDate}`;
                                        return (
                                            <option key={value} value={value}>
                                                {order.DocID} - {formattedDate}
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>
                        </div>

                        {/* Hiển thị thông tin đơn hàng */}
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">📅 Ngày yêu cầu (RequestDate)</label>
                            <input
                                type="text"
                                name="RequestDate"
                                value={form.RequestDate || ""}
                                readOnly
                                className="w-full p-2 border border-gray-300 rounded-md bg-gray-100"
                            />
                        </div>
                    </div>
                );
            case "deleteMembercard":
                return (
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={loadReaders}
                            className="px-3 py-1 bg-green-600 text-white rounded-md"
                        >
                            Tải danh sách
                        </button>
                        <select
                            name="CardID"
                            value={form.CardID || ""}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded-md"
                        >
                            <option value="">-- Chọn CardID (ReaderID) --</option>
                            {readerList.map((r) => (
                                <option key={r.ReaderID} value={r.ReaderID}>
                                    {r.ReaderID} - {r.Name}
                                </option>
                            ))}
                        </select>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="p-6 bg-white rounded-2xl shadow-md">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">🗑️ Delete Section</h2>

            <div className="mb-6 p-4 border border-red-300 rounded-lg bg-red-50">
                <h3 className="text-lg font-medium text-red-700 mb-2">🔐 Xác thực thủ thư</h3>
                        Đang đăng nhập với tài khoản: <strong>{acc}</strong>
            </div>

            <div className="flex flex-col gap-3 mb-4">
                <label className="font-medium text-gray-700">Chọn loại dữ liệu cần xóa:</label>
                <select
                    value={option}
                    onChange={(e) => {
                        setOption(e.target.value);
                        setForm({});
                        setResult(null);
                    }}
                    className="p-2 border border-gray-300 rounded-md"
                >
                    <option value="deleteDocument">📘 Delete Document</option>
                    <option value="deleteReader">👤 Delete Reader</option>
                    <option value="deleteLibrarian">🧑‍💼 Delete Librarian</option>
                    <option value="deleteOrder">📦 Delete Order</option>
                    <option value="deleteMembercard">💳 Delete Membercard</option>

                </select>

                {renderDeleteFields()}

                <button
                    onClick={handleDelete}
                    disabled={loading}
                    className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition"
                >
                    {loading ? "Đang xử lý..." : "Xóa dữ liệu"}
                </button>
            </div>

            <div className="mt-4 bg-gray-100 p-4 rounded-lg overflow-auto max-h-[400px]">
                <h3 className="text-lg font-medium mb-2 text-gray-700">Kết quả:</h3>
                <pre className="text-sm text-gray-800 whitespace-pre-wrap break-all">
                    {result ? JSON.stringify(result, null, 2) : "Chưa có dữ liệu"}
                </pre>
            </div>
        </div>
    );
};

export default DeleteSection;
