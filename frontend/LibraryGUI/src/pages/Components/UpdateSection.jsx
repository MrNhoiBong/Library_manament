import React, { useState, useEffect } from "react";

const API_URL = `http://${window.location.host}/api`;

const UpdateSection = () => {
    const [option, setOption] = useState("updateDocument");
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

    const loadMembercardDetails = async () => {
        if (!form.CardID || !acc || !pwd) {
            alert("Vui lòng chọn ReaderID trước");
            return;
        }
        try {
            const res = await fetch(`${API_URL}/membercardByCardID?acc=${acc}&pwd=${pwd}&CardID=${form.CardID}`);
            if (!res.ok) throw new Error("Không thể lấy thông tin thẻ");
            const data = await res.json();
            setForm(prev => ({
                ...prev,
                IssueBy: data.IssueBy || "",
                Rank: data.Rank || ""
            }));
        } catch (err) {
            console.error("Lỗi khi tải thông tin thẻ:", err);
            alert("Không thể tải dữ liệu thẻ");
        }
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const loadDocuments = async () => {
        if (!acc || !pwd) {
            alert("Vui lòng nhập tài khoản và mật khẩu thủ thư trước khi tải danh sách tài liệu.");
            return;
        }
        try {
            const res = await fetch(`${API_URL}/get-documents/?acc=${acc}&pwd=${pwd}`);
            if (!res.ok) throw new Error("Xác thực thất bại");
            const data = await res.json();
            setDocumentList(data);
        } catch (err) {
            console.error("Lỗi khi tải tài liệu:", err);
        }
    };

    const loadDocumentDetails = async () => {
        if (!form.DocID) {
            alert("Vui lòng chọn mã tài liệu.");
            return;
        }
        try {
            const res = await fetch(`${API_URL}/get-document?DocID=${form.DocID}`);
            if (!res.ok) throw new Error("Không thể lấy thông tin tài liệu");
            const data = await res.json();
            setForm(prev => ({
                ...prev,
                ISBN: data.ISBN || "",
                Title: data.Title || "",
                Author: data.Author || "",
                Publisher: data.Publisher || "",
                Publication_year: data.Publication_year?.split("T")[0] || "",
                Genre: data.Genre || "",
                Quantity: data.Quantity || "",
                Price: data.Price || "",
                Link: data.Link || "",
                Available: data.Available || "",
                Rank: data.Rank || ""
            }));
        } catch (err) {
            console.error("Lỗi khi tải thông tin tài liệu:", err);
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

    const loadReaderDetails = async () => {
        if (!acc || !pwd || !form.ReaderID) {
            alert("Vui lòng chọn ReaderID và nhập tài khoản thủ thư.");
            return;
        }
        try {
            const res = await fetch(`${API_URL}/reader?acc=${acc}&pwd=${pwd}&ReaderID=${form.ReaderID}`);
            if (!res.ok) throw new Error("Không thể lấy thông tin người đọc");
            const data = await res.json();
            setForm(prev => ({
                ...prev,
                LibrarianID: data.LibrarianID || "",
                Name: data.Name || "",
                Gender: data.Gender || "",
                Address: data.Address || "",
                Phone: data.Phone || "",
                Mail: data.Mail || "",
                CreateDate: data.CreateDate?.split("T")[0] || "",

            }));
        } catch (err) {
            console.error("Lỗi khi tải thông tin người đọc:", err);
        }
    };


    const loadOwnLibrarian = async () => {
        if (!acc || !pwd) {
            alert("Vui lòng nhập tài khoản và mật khẩu thủ thư.");
            return;
        }
        try {
            const res = await fetch(`${API_URL}/get-librarian?acc=${acc}&pwd=${pwd}`);
            if (!res.ok) {
                alert("Sai tài khoản hoặc mật khẩu.");
                return;
            }
            const data = await res.json();
            setForm(prev => ({
                ...prev,
                LibrarianID: data.LibrarianID || "",
                Full_name: data.Full_name || "",
                Gender: data.Gender || "",
                DateOfBirth: data.DateOfBirth?.split("T")[0] || "",
                Address: data.Address || "",
                phone: data.phone || "",
                CIC: data.CIC || "",
                baseSalary: data.baseSalary || "",
                reportTo: data.reportTo || "",
                Account: data.Account || "",
                Password: data.Password || ""
            }));
        } catch (error) {
            console.error("Lỗi khi lấy thông tin thủ thư:", error);
        }
    };

    const loadOrdersByReader = async (readerID) => {
        if (!acc || !pwd || !readerID) return;
        try {
            const res = await fetch(`${API_URL}/order/orderby?acc=${acc}&pwd=${pwd}&ReaderID=${readerID}`);
            if (!res.ok) throw new Error("Không thể lấy danh sách đơn hàng");
            const data = await res.json();
            setReaderOrders(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Lỗi khi tải đơn hàng của người đọc:", err);
            setReaderOrders([]);
        }
    };

    const loadOrderDetails = async () => {
        try {
            const res = await fetch(`${API_URL}/order/details?acc=${acc}&pwd=${pwd}&ReaderID=${form.OrderBy}&DocID=${form.DocID}`);
            if (!res.ok) throw new Error("Không thể lấy chi tiết đơn hàng");
            const data = await res.json();
            setForm(prev => ({
                ...prev,
                ...data
            }));
        } catch (err) {
            console.error("Lỗi khi tải chi tiết đơn hàng:", err);
        }
    };

    useEffect(() => {
        if (option === "updateMembercard" && acc && pwd) {
            loadReaders();
        }
    }, [option, acc, pwd]);


    const handleUpdate = async () => {
        setLoading(true);
        let endpoint = "";
        console.log(form);
        console.log(form.LibrarianID)

        switch (option) {
            case "updateDocument":
                endpoint = "/update-document";
                break;
            case "updateReader":
                endpoint = "/update-reader";
                break;
            case "updateLibrarian":
                endpoint = "/update-librarian";
                break;
            case "updateOrder":
                endpoint = "/update-order";
                break;
            case "updateMembercard":
                endpoint = "/update-membercard";
                break;
            default:
                setResult({ error: "Tùy chọn không hợp lệ" });
                setLoading(false);
                return;
        }

        try {
            const res = await fetch(`${API_URL}${endpoint}?acc=${acc}&pwd=${pwd}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                     Accept: "application/json",
                },
                body: JSON.stringify(form)
            });

            if (!res.ok) throw new Error("Lỗi mạng hoặc server không phản hồi");
            const data = await res.json();
            setResult(data);
        } catch (error) {
            console.error("Lỗi khi cập nhật dữ liệu:", error);
            setResult({ error: "Dữ liệu không hợp lệ hoặc lỗi khi gửi yêu cầu." });
        }

        setLoading(false);
    };

    const renderFormFields = () => {
        switch (option) {
            case "updateDocument":
                return (
                    <div className="flex flex-col gap-3">
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">🆔 Mã tài liệu (DocID)</label>
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
                                <button
                                    type="button"
                                    onClick={loadDocumentDetails}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md"
                                >
                                    🔄 Tải thông tin tài liệu
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">📘 ISBN</label>
                            <input type="text" name="ISBN" value={form.ISBN || ""} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md" />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">📖 Tiêu đề</label>
                            <input type="text" name="Title" value={form.Title || ""} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md" />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">✍️ Tác giả</label>
                            <input type="text" name="Author" value={form.Author || ""} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md" />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">🏢 Nhà xuất bản</label>
                            <input type="text" name="Publisher" value={form.Publisher || ""} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md" />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">📅 Năm xuất bản</label>
                            <input type="date" name="Publication_year" value={form.Publication_year || ""} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md" />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">📚 Thể loại</label>
                            <input type="text" name="Genre" value={form.Genre || ""} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md" />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">🔢 Số lượng</label>
                            <input type="number" name="Quantity" value={form.Quantity || ""} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md" />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">💰 Giá</label>
                            <input type="number" name="Price" value={form.Price || ""} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md" />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">🌐 Link hình ảnh</label>
                            <input
                                type="text"
                                name="Link"
                                value={form.Link || ""}
                                onChange={handleChange}
                                placeholder="https://example.com/image.jpg"
                                className="w-full p-2 border border-gray-300 rounded-md"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">📦 Sẵn có</label>
                            <input type="number" name="Available" value={form.Available || ""} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md" />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">⭐ Xếp hạng</label>
                            <input type="number" name="Rank" value={form.Rank || ""} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md" />
                        </div>
                    </div>
                );

            case "updateReader":
                return (
                    <div className="flex flex-col gap-3">
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
                                <button
                                    type="button"
                                    onClick={loadReaderDetails}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md"
                                >
                                    🔄 Tải thông tin người đọc
                                </button>

                            </div>
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">🧑‍💼 Mã thủ thư (LibrarianID)</label>
                            <input
                                type="text"
                                name="LibrarianID"
                                value={form.LibrarianID || ""}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded-md"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">👤 Tên người đọc</label>
                            <input type="text" name="Name" value={form.Name || ""} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md" />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">⚧️ Giới tính</label>
                            <input type="text" name="Gender" value={form.Gender || ""} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md" />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">🏠 Địa chỉ</label>
                            <input type="text" name="Address" value={form.Address || ""} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md" />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">📞 Số điện thoại</label>
                            <input type="text" name="Phone" value={form.Phone || ""} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md" />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">📧 Email</label>
                            <input type="text" name="Mail" value={form.Mail || ""} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md" />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">📅 Ngày cập nhập (CreateDate)</label>
                            <input
                                type="date"
                                name="CreateDate"
                                value={form.CreateDate || ""}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded-md"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">🔐 Tài khoản</label>
                            <input type="text" name="Account" value={form.Account || ""} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md" />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">🔑 Mật khẩu</label>
                            <input type="text" name="Password" value={form.Password || ""} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md" />
                        </div>
                    </div>
                );

            case "updateLibrarian":
                return (
                    <div className="space-y-4">
                        <button
                            type="button"
                            onClick={loadOwnLibrarian}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md"
                        >
                            🔄 Tải thông tin thủ thư
                        </button>

                        <div>
                            <label className="block text-gray-700 font-medium mb-1">🆔 Mã thủ thư</label>
                            <input
                                type="text"
                                name="LibrarianID"
                                value={form.LibrarianID || ""}
                                disabled
                                className="w-full p-2 border border-gray-300 rounded-md bg-gray-100"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">👤 Họ tên</label>
                            <input type="text" name="Full_name" value={form.Full_name || ""} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md" />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">⚧️ Giới tính</label>
                            <input type="text" name="Gender" value={form.Gender || ""} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md" />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">📅 Ngày sinh</label>
                            <input type="date" name="DateOfBirth" value={form.DateOfBirth || ""} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md" />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">🏠 Địa chỉ</label>
                            <input type="text" name="Address" value={form.Address || ""} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md" />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">📞 Số điện thoại</label>
                            <input type="text" name="phone" value={form.phone || ""} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md" />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">🆔 CMND/CCCD</label>
                            <input type="text" name="CIC" value={form.CIC || ""} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md" />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">💵 Lương cơ bản</label>
                            <input type="number" name="baseSalary" value={form.baseSalary || ""} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md" />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">👨‍💼 ID người quản lý</label>
                            <input type="text" name="reportTo" value={form.reportTo || ""} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md" />
                        </div>
                    </div>
                );
            case "updateOrder":
                return (
                    <div className="flex flex-col gap-3">
                        {/* ReaderID → OrderBy */}
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">👤 Người mượn (OrderBy)</label>
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
                        {/* DocID */}
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">📘 Mã tài liệu (DocID)</label>
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
                                    onChange={(e) => {
                                        handleChange(e);
                                        loadOrderDetails(e.target.value);
                                    }}
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                >
                                    <option value="">-- Chọn DocID đã mượn --</option>
                                    {readerOrders.map((order) => (
                                        <option key={order.DocID} value={order.DocID}>
                                            {order.DocID}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    type="button"
                                    onClick={loadOrderDetails}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md"
                                >
                                    🔄 Tải dữ liệu đơn hàng
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-gray-700 font-medium mb-1">📅 Ngày yêu cầu (RequestDate)</label>
                            <input
                                type="datetime-local"
                                name="RequestDate"
                                value={form.RequestDate || ""}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded-md"
                            />
                        </div>
                        {/* ApplyBy */}
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">🧑‍💼 Người duyệt đơn (ApplyBy)</label>
                            <input
                                type="text"
                                name="ApplyBy"
                                value={form.ApplyBy || ""}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded-md"
                            />
                        </div>

                        {/* ApprovedDate */}
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">✅ Ngày duyệt (ApprovedDate)</label>
                            <input
                                type="datetime-local"
                                name="ApprovedDate"
                                value={form.ApprovedDate || ""}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded-md"
                            />
                        </div>

                        {/* ReceivedDate */}
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">📦 Ngày nhận sách (ReceivedDate)</label>
                            <input
                                type="datetime-local"
                                name="ReceivedDate"
                                value={form.ReceivedDate || ""}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded-md"
                            />
                        </div>

                        {/* ReturnDate */}
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">🔙 Ngày trả sách (ReturnDate)</label>
                            <input
                                type="datetime-local"
                                name="ReturnDate"
                                value={form.ReturnDate || ""}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded-md"
                            />
                        </div>

                        {/* DeliveryDate */}
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">🚚 Ngày giao sách (DeliveryDate)</label>
                            <input
                                type="date"
                                name="DeliveryDate"
                                value={form.DeliveryDate || ""}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded-md"
                            />
                        </div>

                        {/* BorrowDay */}
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">📆 Số ngày mượn</label>
                            <input
                                type="number"
                                name="BorrowDay"
                                value={form.BorrowDay || ""}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded-md"
                            />
                        </div>

                        {/* Price */}
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">💰 Giá đơn hàng</label>
                            <input
                                type="number"
                                name="Price"
                                value={form.Price || ""}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded-md"
                            />
                        </div>

                        {/* Note */}
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">📝 Ghi chú</label>
                            <input
                                type="text"
                                name="Note"
                                value={form.Note || ""}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded-md"
                            />
                        </div>

                        {/* Address */}
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">📍 Địa chỉ nhận sách</label>
                            <input
                                type="text"
                                name="Address"
                                value={form.Address || ""}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded-md"
                            />
                        </div>

                        {/* PaymentStatus */}
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">💳 Trạng thái thanh toán</label>
                            <input
                                type="text"
                                name="PaymentStatus"
                                value={form.PaymentStatus || ""}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded-md"
                            />
                        </div>
                    </div>
                );
            case "updateMembercard":
                return (
                    <div className="flex flex-col gap-3">
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">🎫 CardID (ReaderID)</label>
                            <select
                                name="CardID"
                                value={form.CardID || ""}
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
                            <button
                                type="button"
                                onClick={loadMembercardDetails}
                                className="mt-2 px-3 py-1 bg-green-600 text-white rounded-md"
                            >
                                Tải dữ liệu thẻ
                            </button>
                        </div>

                        <div>
                            <label className="block text-gray-700 font-medium mb-1">👨‍💼 IssueBy (LibrarianID)</label>
                            <input
                                type="text"
                                name="IssueBy"
                                value={form.IssueBy || ""}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded-md"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 font-medium mb-1">⭐ Rank</label>
                            <select
                                name="Rank"
                                value={form.Rank || ""}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded-md"
                            >
                                <option value="">-- Chọn hạng thẻ --</option>
                                <option value="VIP">VIP</option>
                                <option value="Normal">Normal</option>
                            </select>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };


    return (
        <div className="p-6 bg-white rounded-2xl shadow-md">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">🟡 Update Section</h2>

            {/* Khung xác thực thủ thư */}
            <div className="mb-6 p-4 border border-yellow-300 rounded-lg bg-yellow-50">
                <h3 className="text-lg font-medium text-yellow-700 mb-2">🔐 Xác thực thủ thư</h3>
                Đang đăng nhập với tài khoản: <strong>{acc}</strong>
            </div>

            {/* Chọn loại dữ liệu cần cập nhật */}
            <div className="flex flex-col gap-3 mb-4">
                <label className="font-medium text-gray-700">Chọn loại dữ liệu cần cập nhật:</label>
                <select
                    value={option}
                    onChange={(e) => {
                        setOption(e.target.value);
                        setForm({});
                        setResult(null);
                    }}
                    className="p-2 border border-gray-300 rounded-md"
                >
                    <option value="updateDocument">📘 Update Document</option>
                    <option value="updateReader">👤 Update Reader</option>
                    <option value="updateLibrarian">🧑‍💼 Update Librarian</option>
                    <option value="updateOrder">📦 Update Order</option>
                    <option value="updateMembercard">💳 Update Membercard</option>
                </select>
            </div>

            {/* Khung nhập dữ liệu */}
            <div className="mb-4">
                {renderFormFields()}
            </div>

            {/* Nút gửi yêu cầu */}
            <button
                onClick={handleUpdate}
                disabled={loading}
                className="mt-3 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
            >
                {loading ? "Đang xử lý..." : "Cập nhật dữ liệu"}
            </button>

            {/* Kết quả */}
            <div className="mt-6 bg-gray-100 p-4 rounded-lg overflow-auto max-h-[400px]">
                <h3 className="text-lg font-medium mb-2 text-gray-700">Kết quả:</h3>
                <pre className="text-sm text-gray-800 whitespace-pre-wrap break-all">
                    {result ? JSON.stringify(result, null, 2) : "Chưa có dữ liệu"}
                </pre>
            </div>
        </div>
    );
};

export default UpdateSection;