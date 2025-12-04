import React, { useState, useEffect } from "react";


const API_URL = `http://${window.location.host}/api`;


const GetSection = () => {
    const [option, setOption] = useState("getDocuments");
    const [result, setResult] = useState(null);
    const [readerList, setReaderList] = useState([]);
    const [documentList, setDocumentList] = useState([]);
    const [loading, setLoading] = useState(false);

    const [params, setParams] = useState({
        acc: "",
        pwd: "",
        id: "",
        readerId: "",
        orderBy: "",
        cardId: ""
    });

    useEffect(() => {
        const cookies = document.cookie.split(";").reduce((acc, c) => {
            const [key, value] = c.trim().split("=");
            acc[key] = value;
            return acc;
        }, {});
        if (!cookies.account || !cookies.password) {
            alert("Vui lòng đăng nhập trước");
            window.location.href = "/login";
        } else {
            setParams(prev => ({
                ...prev,
                acc: cookies.account,
                pwd: cookies.password
            }));
        }
    }, []);



    const handleChange = (e) => {
        setParams({ ...params, [e.target.name]: e.target.value });
    };

    const loadReaders = async () => {
        try {
            const res = await fetch(`${API_URL}/readers?acc=${params.acc}&pwd=${params.pwd}`);
            if (!res.ok) throw new Error("Xác thực thất bại");
            const data = await res.json();
            setReaderList(data);
        } catch (err) {
            console.error("Lỗi khi tải Reader:", err);
        }
    };

    const loadDocuments = async () => {
        try {
            const res = await fetch(`${API_URL}/get-documents/`);
            if (!res.ok) throw new Error("Không thể lấy documents");
            const data = await res.json();
            setDocumentList(data);
        } catch (err) {
            console.error("Lỗi khi tải Document:", err);
        }
    };

    useEffect(() => {
        if (option === "getMembercardByCardID") {
            loadReaders();
        }
    }, [option]);

    const handleFetch = async () => {
        setLoading(true);
        let url = "";

        switch (option) {
            case "getDocuments":
                url = `${API_URL}/get-documents/`;
                break;
            case "getDocumentById":
                url = `${API_URL}/get-document?DocID=${params.id}`;
                break;
            case "getReaders":
                url = `${API_URL}/readers?acc=${params.acc}&pwd=${params.pwd}`;
                break;
            case "getReaderById":
                url = `${API_URL}/reader?acc=${params.acc}&pwd=${params.pwd}&ReaderID=${params.readerId}`;
                break;
            case "getLibrarian":
                url = `${API_URL}/get-librarian?acc=${params.acc}&pwd=${params.pwd}`;
                break;
            case "getOrders":
                url = `${API_URL}/orders?acc=${params.acc}&pwd=${params.pwd}`;
                break;
            case "getOrderByOrderBy":
                url = `${API_URL}/order/orderby?acc=${params.acc}&pwd=${params.pwd}&ReaderID=${params.readerId}&OrderBy=${params.orderBy}`;
                break;
            case "getAllMembercards":
                url = `${API_URL}/membercards?acc=${params.acc}&pwd=${params.pwd}`;
                break;
            case "getMembercardByCardID":
                url = `${API_URL}/membercardByCardID?acc=${params.acc}&pwd=${params.pwd}&CardID=${params.cardId}`;
                break;
            default:
                setResult({ error: "Tùy chọn không hợp lệ" });
                setLoading(false);
                return;
        }

        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error("Lỗi mạng hoặc server không phản hồi");
            const data = await res.json();
            setResult(data);
        } catch (error) {
            console.error("Lỗi khi gọi API:", error);
            setResult({ error: "Không thể kết nối API. Kiểm tra console để biết chi tiết." });
        }
        setLoading(false);
    };

    return (
        <div className="p-6 bg-white rounded-2xl shadow-md">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">🔍 Get Section</h2>

            <div className="mb-4 p-3 border border-red-300 rounded-lg bg-red-50">
                <h3 className="text-base font-medium text-red-700 mb-1">🔐 Xác thực thủ thư</h3>
                <p className="text-gray-800">
                    Đang đăng nhập với tài khoản: <strong>{params.acc}</strong>
                </p>
            </div>

            <div className="flex flex-col gap-3 mb-4">
                <label className="font-medium text-gray-700">Chọn loại dữ liệu cần lấy:</label>
                <select
                    value={option}
                    onChange={(e) => setOption(e.target.value)}
                    className="p-2 border border-gray-300 rounded-md"
                >
                    <option value="getDocuments">📚 Get All Documents</option>
                    <option value="getDocumentById">📖 Get Document by ID</option>
                    <option value="getReaders">👥 Get All Readers</option>
                    <option value="getReaderById">👤 Get Reader by ID</option>
                    <option value="getLibrarian">🧑‍💼 Get Librarian</option>
                    <option value="getOrders">📦 Get All Orders</option>
                    <option value="getOrderByOrderBy">📝 Get Orders by OrderBy</option>
                    <option value="getAllMembercards">💳 Get All Membercards</option>
                    <option value="getMembercardByCardID">🎫 Get Membercard by CardID</option>
                </select>

                {option === "getDocumentById" && (
                    <>
                        <button onClick={loadDocuments} className="px-3 py-1 bg-green-600 text-white rounded-md">
                            Tải danh sách Document
                        </button>
                        <select
                            name="id"
                            value={params.id}
                            onChange={handleChange}
                            className="p-2 border border-gray-300 rounded-md"
                        >
                            <option value="">-- Chọn DocumentID --</option>
                            {documentList.map((doc) => (
                                <option key={doc.DocID} value={doc.DocID}>
                                    {doc.DocID} - {doc.Title}
                                </option>
                            ))}
                        </select>
                    </>
                )}

                {(option === "getReaderById" || option === "getOrderByOrderBy") && (
                    <>
                        <button onClick={loadReaders} className="px-3 py-1 bg-green-600 text-white rounded-md">
                            Tải danh sách Reader
                        </button>
                        <select
                            name="readerId"
                            value={params.readerId}
                            onChange={handleChange}
                            className="p-2 border border-gray-300 rounded-md"
                        >
                            <option value="">-- Chọn ReaderID --</option>
                            {readerList.map((r) => (
                                <option key={r.ReaderID} value={r.ReaderID}>
                                    {r.ReaderID} - {r.Name}
                                </option>
                            ))}
                        </select>
                    </>
                )}

                {option === "getOrderByOrderBy" && (
                    <input
                        type="text"
                        name="orderBy"
                        value={params.orderBy}
                        onChange={handleChange}
                        placeholder="OrderBy (ReaderID)"
                        className="p-2 border border-gray-300 rounded-md"
                    />
                )}

                {option === "getMembercardByCardID" && (
                    <>
                        <label className="font-medium text-gray-700">Chọn Reader để lấy thẻ:</label>
                        <select
                            name="cardId"
                            value={params.cardId}
                            onChange={handleChange}
                            className="p-2 border border-gray-300 rounded-md"
                        >
                            <option value="">-- Chọn ReaderID --</option>
                            {readerList.map((r) => (
                                <option key={r.ReaderID} value={r.ReaderID}>
                                    {r.ReaderID} - {r.Name}
                                </option>
                            ))}
                        </select>
                    </>
                )}

                <button
                    onClick={handleFetch}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
                >
                    {loading ? "Đang tải..." : "Gọi API"}
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

export default GetSection;