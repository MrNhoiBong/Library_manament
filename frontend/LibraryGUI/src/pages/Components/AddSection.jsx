import React, { useState, useEffect } from "react";

const API_URL = `http://${window.location.host}/api`;

const AddSection = () => {
    const [option, setOption] = useState("addDocument");
    const [acc, setAcc] = useState("");
    const [pwd, setPwd] = useState("");
    const [form, setForm] = useState({});
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [documentList, setDocumentList] = useState([]);
    const [readerList, setReaderList] = useState([]);

    const loadReaders = async () => {
        try {
            const res = await fetch(`${API_URL}/readers?acc=${acc}&pwd=${pwd}`);
            if (!res.ok) throw new Error("Không thể tải danh sách Reader");
            const data = await res.json();
            setReaderList(data);
        } catch (err) {
            console.error("Lỗi khi tải Reader:", err);
        }
    };

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


    const handleAdd = async () => {
        setLoading(true);
        let endpoint = "";
        switch (option) {
            case "addDocument":
                endpoint = "/add-doc";
                break;
            case "addReader":
                endpoint = "/add-reader";
                break;
            case "addLibrarian":
                endpoint = "/add-librarian";
                break;
            case "addOrder":
                endpoint = "/add-order";
                break;
            case "addMembercard":   // ✅ thêm mới
                endpoint = "/add-membercard";
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

            if (!res.ok) throw new Error("Lỗi mạng hoặc server không phản hồi");
            const data = await res.json();
            setResult(data);
        } catch (error) {
            console.error("Lỗi khi thêm dữ liệu:", error);
            setResult({ error: "Dữ liệu không hợp lệ hoặc lỗi khi gửi yêu cầu." });
        }

        setLoading(false);
    };

    const renderFormFields = () => {
        switch (option) {
            case "addDocument":
                return (
                    <div className="flex flex-col gap-3">
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">📘 ISBN</label>
                            <input
                                type="text"
                                name="ISBN"
                                value={form.ISBN || ""}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded-md"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 font-medium mb-1">📖 Tiêu đề</label>
                            <input
                                type="text"
                                name="Title"
                                value={form.Title || ""}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded-md"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 font-medium mb-1">✍️ Tác giả</label>
                            <input
                                type="text"
                                name="Author"
                                value={form.Author || ""}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded-md"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 font-medium mb-1">🏢 Nhà xuất bản</label>
                            <input
                                type="text"
                                name="Publisher"
                                value={form.Publisher || ""}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded-md"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 font-medium mb-1">📅 Năm xuất bản</label>
                            <input
                                type="date"
                                name="Publication_year"
                                value={form.Publication_year || ""}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded-md"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 font-medium mb-1">📚 Thể loại</label>
                            <input
                                type="text"
                                name="Genre"
                                value={form.Genre || ""}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded-md"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 font-medium mb-1">🔢 Số lượng</label>
                            <input
                                type="number"
                                name="Quantity"
                                value={form.Quantity || ""}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded-md"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 font-medium mb-1">💰 Giá</label>
                            <input
                                type="number"
                                name="Price"
                                value={form.Price || ""}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded-md"
                            />
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
                            <input
                                type="number"
                                name="Available"
                                value={form.Available || ""}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded-md"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 font-medium mb-1">⭐ Xếp hạng</label>
                            <input
                                type="number"
                                name="Rank"
                                value={form.Rank || ""}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded-md"
                            />
                        </div>
                    </div>
                );
            case "addReader":
                return (
                    <div className="flex flex-col gap-3">
                        <label className="block text-gray-700 font-medium mb-1">🧑‍💼 ID thủ thư</label>
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
/*                                        alert(`Đã tải LibrarianID: ${data.LibrarianID}`);*/
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
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">👤 Tên người đọc</label>
                            <input
                                type="text"
                                name="Name"
                                value={form.Name || ""}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded-md"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">⚧️ Giới tính</label>
                            <input
                                type="text"
                                name="Gender"
                                value={form.Gender || ""}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded-md"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">🏠 Địa chỉ</label>
                            <input
                                type="text"
                                name="Address"
                                value={form.Address || ""}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded-md"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">📞 Số điện thoại</label>
                            <input
                                type="text"
                                name="Phone"
                                value={form.Phone || ""}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded-md"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">📧 Email</label>
                            <input
                                type="text"
                                name="Mail"
                                value={form.Mail || ""}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded-md"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">📅 Ngày tạo</label>
                            <input
                                type="date"
                                name="CreateDate"
                                value={form.CreateDate || ""}
                                onChange={handleChange}
                                placeholder="YYYY-MM-DD"
                                className="w-full p-2 border border-gray-300 rounded-md"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">🔐 Tài khoản</label>
                            <input
                                type="text"
                                name="Account"
                                value={form.Account || ""}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded-md"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">🔑 Mật khẩu</label>
                            <input
                                type="text"
                                name="Password"
                                value={form.Password || ""}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded-md"
                            />
                        </div>
                    </div>
                );

            case "addLibrarian":
                return (
                    <div className="flex flex-col gap-3">
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">👤 Họ tên</label>
                            <input
                                type="text"
                                name="Full_name"
                                value={form.Full_name || ""}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded-md"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">⚧️ Giới tính</label>
                            <input
                                type="text"
                                name="Gender"
                                value={form.Gender || ""}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded-md"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">📅 Ngày sinh</label>
                            <input
                                type="date"
                                name="DateOfBirth"
                                value={form.DateOfBirth || ""}
                                onChange={handleChange}
                                placeholder="YYYY-MM-DD"
                                className="w-full p-2 border border-gray-300 rounded-md"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">🏠 Địa chỉ</label>
                            <input
                                type="text"
                                name="Address"
                                value={form.Address || ""}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded-md"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">📞 Số điện thoại</label>
                            <input
                                type="text"
                                name="phone"
                                value={form.phone || ""}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded-md"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">🆔 CMND/CCCD</label>
                            <input
                                type="text"
                                name="CIC"
                                value={form.CIC || ""}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded-md"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">💵 Lương cơ bản</label>
                            <input
                                type="number"
                                name="baseSalary"
                                value={form.baseSalary || ""}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded-md"
                            />
                        </div>
                        <label className="block text-gray-700 font-medium mb-1">👨‍💼 ID người quản lý</label>
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
                                        setForm(prev => ({
                                            ...prev,
                                            reportTo: data.LibrarianID
                                        }));
/*                                        alert(`Đã gán reportTo = ${data.LibrarianID}`);*/
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
                                name="reportTo"
                                value={form.reportTo || ""}
                                readOnly
                                className="w-full p-2 border border-gray-300 rounded-md bg-gray-100"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">🔐 Tài khoản</label>
                            <input
                                type="text"
                                name="Account"
                                value={form.Account || ""}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded-md"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">🔑 Mật khẩu</label>
                            <input
                                type="text"
                                name="Password"
                                value={form.Password || ""}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded-md"
                            />
                        </div>
                    </div>
                );
            case "addOrder":
                return (
                    <div className="flex flex-col gap-3">
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">📘 ID tài liệu</label>
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
                        </div>
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
                    </div>
                );
            case "addMembercard":
                return (
                    <div className="flex flex-col gap-3">
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">🎫 CardID (ReaderID)</label>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={loadReaders}
                                    className="px-3 py-1 bg-green-600 text-white rounded-md"
                                >
                                    Tải danh sách Reader
                                </button>
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
                            </div>
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">👨‍💼 IssueBy (LibrarianID)</label>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={async () => {
                                        try {
                                            const res = await fetch(`${API_URL}/get-librarian?acc=${acc}&pwd=${pwd}`);
                                            if (!res.ok) throw new Error("Không thể tải thủ thư");
                                            const data = await res.json();
                                            setForm(prev => ({
                                                ...prev,
                                                IssueBy: data.LibrarianID
                                            }));
                                            // alert(`Đã gán IssueBy = ${data.LibrarianID}`);
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
                                    name="IssueBy"
                                    value={form.IssueBy || ""}
                                    readOnly
                                    className="w-full p-2 border border-gray-300 rounded-md bg-gray-100"
                                />
                            </div>
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
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">🟢 Add Section</h2>

            {/* 🔐 Xác thực thủ thư */}
            {["addReader", "addDocument", "addLibrarian", "addMembercard"].includes(option) && (
                <div className="mb-6 p-4 border border-green-300 rounded-lg bg-green-50">
                    <h3 className="text-lg font-medium text-green-700 mb-2">🔐 Xác thực thủ thư</h3>
                    Đang đăng nhập với tài khoản: <strong>{acc}</strong>
                </div>
            )}

            {/* Khung xác thực người đọc */}
            {option === "addOrder" && (
                <div className="mb-6 p-4 border border-blue-300 rounded-lg bg-blue-50">
                    <h3 className="text-lg font-medium text-blue-700 mb-2">🔐 Xác thực người đọc</h3>
                    <input
                        type="text"
                        placeholder="Tài khoản người đọc"
                        value={acc}
                        onChange={(e) => setAcc(e.target.value)}
                        className="input"
                    />
                    <input
                        type="password"
                        placeholder="Mật khẩu người đọc"
                        value={pwd}
                        onChange={(e) => setPwd(e.target.value)}
                        className="input mt-2"
                    />
                </div>
            )}


            {/* Khung chọn loại dữ liệu */}
            <div className="flex flex-col gap-3 mb-4">
                <label className="font-medium text-gray-700">Chọn loại dữ liệu cần thêm:</label>
                <select
                    value={option}
                    onChange={(e) => {
                        setOption(e.target.value);
                        setForm({});
                        setResult(null);
                    }}
                    className="p-2 border border-gray-300 rounded-md"
                >
                    <option value="addDocument">📘 Add Document</option>
                    <option value="addReader">👤 Add Reader</option>
                    <option value="addLibrarian">🧑‍💼 Add Librarian</option>
                    <option value="addOrder">📦 Add Order</option>
                    <option value="addMembercard">💳 Add Membercard</option>
                </select>
            </div>

            {/* Khung nhập dữ liệu */}
            <div className="mb-4">
                {renderFormFields()}
            </div>

            {/* Nút gửi */}
            <button
                onClick={handleAdd}
                disabled={loading}
                className="mt-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
                {loading ? "Đang xử lý..." : "Gửi yêu cầu thêm"}
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

export default AddSection;
