import React, { useState, useEffect } from "react";
import GetSection from "../Components/GetSection";
import AddSection from "../Components/AddSection";
import UpdateSection from "../Components/UpdateSection";
import DeleteSection from "../Components/DeleteSection";
import logout from '../../assets/logout-icon.jpg';

const LibrarianPage = () => {
    const [tab, setTab] = useState("get");
    const [account, setAccount] = useState("");

    useEffect(() => {
        const cookies = document.cookie.split(";").reduce((acc, item) => {
            const [key, value] = item.trim().split("=");
            acc[key] = value;
            return acc;
        }, {});

        if (!cookies.account || !cookies.password || cookies.role !== "librarian") {
            alert("Vui lòng đăng nhập thủ thư");
            window.location.href = "/login";
        } else {
            setAccount(cookies.account); // ✅ dùng đúng key
        }
    }, []);


    // ✅ Hàm Logout
    const handleLogout = () => {
        document.cookie = "account=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "password=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        window.location.href = "/login";
    };

    const renderSection = () => {
        switch (tab) {
            case "get": return <GetSection />;
            case "add": return <AddSection />;
            case "update": return <UpdateSection />;
            case "delete": return <DeleteSection />;
            default: return <GetSection />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-10">
            <div className="flex items-center justify-between mb-6">
                <div className="flex gap-3">
                    <button onClick={() => setTab("get")} className="px-4 py-2 bg-blue-500 text-white rounded-lg">Get</button>
                    <button onClick={() => setTab("add")} className="px-4 py-2 bg-green-500 text-white rounded-lg">Add</button>
                    <button onClick={() => setTab("update")} className="px-4 py-2 bg-yellow-500 text-white rounded-lg">Update</button>
                    <button onClick={() => setTab("delete")} className="px-4 py-2 bg-red-500 text-white rounded-lg">Delete</button>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-gray-700">👋 Xin chào, {account}</span>
<button onClick={handleLogout} className="px-4 py-2 bg-gray-700 text-white rounded-lg flex items-center gap-2">
  <img src={logout} alt="Logout icon" className="w-5 h-5" />
  Đăng xuất
</button>
                </div>
            </div>
            {renderSection()}
        </div>
    );
};

export default LibrarianPage;