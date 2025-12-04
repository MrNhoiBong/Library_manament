import React, { useEffect, useState } from "react";

export default function UserPop() {
    const [reader, setReader] = useState(null);
    const cookies = document.cookie.split(";").reduce((acc, c) => {
        const [key, value] = c.trim().split("=");
        acc[key] = value;
        return acc;
    }, {});

  let url = window.location.host;

  useEffect(() => {
    // Gọi API để lấy dữ liệu reader
    fetch('http://'+url+'/api/reader?acc='+cookies.account+'&pwd='+cookies.password) // URL API của bạn
      .then((res) => res.json())
      .then((data) => setReader(data))
      .catch((err) => console.error("Fetch error:", err));
  }, []);

  if (!reader) {
    return <p>Đang tải thông tin người đọc...</p>;
  }

  return (
    <section className="max-w-full max-h-full overflow-auto">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_1.2fr]">
        {/* Left Section */}
        <div className="bg-gradient-to-b from-orange-500 via-orange-600 to-orange-700 p-8 text-white flex flex-col items-center gap-6">
          <div className="relative">
            <div className="h-28 w-28 rounded-full ring-4 ring-white/40 overflow-hidden bg-white/10 flex items-center justify-center">
              {/* Avatar illustration */}
              <svg viewBox="0 0 64 64" className="h-16 w-16 text-white/90">
                <circle cx="32" cy="22" r="12" fill="currentColor" />
                <path
                  d="M8 56c4-12 16-18 24-18s20 6 24 18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white/20 px-3 py-1 text-xs font-semibold rounded-full">
              Reader
            </span>
          </div>

          <div className="text-center">
            <h1 className="text-xl font-bold">
              {reader.Name} ({reader.Gender})
            </h1>
            <p className="text-sm text-white/90">{reader.ReaderID}</p>
          </div>
        </div>

        {/* Right Section */}
        <div className="p-8">
          <h2 className="text-lg font-semibold text-slate-900">
            Thông tin người đọc
          </h2>
          <div className="mt-6 space-y-4">
            <InfoItem label="Email" value={reader.Mail} icon="mail" />
            <InfoItem label="Phone" value={reader.Phone} icon="phone" />
            <InfoItem label="Address" value={reader.Address} icon="location" />
            <InfoItem label="Account" value={reader.Account} icon="user" />
            <InfoItem label="Password" value={reader.Password} icon="lock" />
            <InfoItem label="Created" value={reader.CreateDate} icon="calendar" />
          </div>
        </div>
      </div>
    </section>
  );
}

// Component phụ để hiển thị từng thông tin
function InfoItem({ label, value, icon }) {
  const icons = {
    mail: <path d="M4 6h16v12H4z" />,
    phone: <path d="M2 4l5-2 5 9-4 2C7 13 6 15 8 17l2 2c2 2 4 1 6 0l2-2c2-2 4-3 2-6l-2-4" />,
    location: <path d="M12 2C8 2 5 5 5 9c0 5 7 13 7 13s7-8 7-13c0-4-3-7-7-7z" />,
    user: <path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v3h20v-3c0-3.3-6.7-5-10-5z" />,
    lock: <path d="M12 17a2 2 0 100-4 2 2 0 000 4zm6-7V9a6 6 0 00-12 0v1H4v10h16V10h-2zm-8-1a4 4 0 118 0v1H10V9z" />,
    calendar: <path d="M4 4h16v16H4z M4 10h16" />,
  };

  return (
    <div className="flex items-start gap-3">
      <span className="h-9 w-9 flex items-center justify-center bg-slate-100 rounded-lg text-slate-700">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          {icons[icon]}
        </svg>
      </span>
      <div>
        <p className="text-xs uppercase text-slate-500">{label}</p>
        <p className="text-slate-900">{value}</p>
      </div>
    </div>
  );
}
