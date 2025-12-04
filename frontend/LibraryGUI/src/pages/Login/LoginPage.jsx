import React, { useState } from 'react';
import Background from '../../assets/Background_login.jpg';

const LoginPage = () => {
  const [role, setRole] = useState('reader');
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
        let url = window.location.host;
/*      let url = "localhost:8000";*/
    const endpoint =
      role === 'reader'
        ? `http://`+url+`/api/reader?acc=${account}&pwd=${password}`
        : `http://`+url+`/api/get-librarian?acc=${account}&pwd=${password}`;


    try {
      const response = await fetch(endpoint);
    //   const result = await response.json();
    //   console.log('Kết quả đăng nhập:', result);
        if (response.status === 200) {
            const result = await response.json();
            console.log('Kết quả đăng nhập:', result);
            if (role === 'reader') {
                document.cookie = `account=${account}; path=/`;
                document.cookie = `password=${password}; path=/`;
                document.cookie = `role=${role}; path=/`;
                window.location.href = '/home';
            }

            if (role === 'librarian') {
                document.cookie = `account=${account}; path=/`;
                document.cookie = `password=${password}; path=/`;
                document.cookie = `role=${role}; path=/`;
                window.location.href = '/librarian';
            }
        } else {
            console.error('Đăng nhập thất bại:', response.status);
        }
    } catch (error) {
      console.error('Lỗi đăng nhập:', error);
    }
  };

  return (
    <div className="flex">
      {/* Bên trái: ảnh nền */}
      <div className="w-1/2 h-[100vh]">
        <img
          src={Background}
          alt="Background"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Bên phải: form đăng nhập */}
      <div className="w-1/2 flex items-center justify-center bg-white">
        <div className="w-full max-w-md p-1">
          <h2 className="text-[50px] font-bold mb-6 text-center">Welcome back!</h2>

          <div className="flex justify-center gap-4 mb-6">
            <span
              onClick={() => setRole('librarian')}
              className={`cursor-pointer px-4 py-2 rounded font-semibold transition 
                ${role === 'librarian' ? 'text-green-500 shadow-green-500 shadow-md' : 'text-gray-500'}`}
            >
              Librarian
            </span>
            <span
              onClick={() => setRole('reader')}
              className={`cursor-pointer px-4 py-2 rounded font-semibold transition 
                ${role === 'reader' ? 'text-green-500 shadow-green-500 shadow-md' : 'text-gray-500'}`}
            >
              Reader
            </span>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Account</label>
            <input
              type="text"
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border rounded-md shadow-sm focus:ring focus:ring-blue-300"
              placeholder="Your account"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border rounded-md shadow-sm focus:ring focus:ring-blue-300"
              placeholder="••••••••"
            />
          </div>
          <button
            onClick={handleLogin}
            className="bg-gradient-to-r dark:text-gray-300 from-blue-500 to-purple-500 shadow-lg mt-6 p-2 text-white rounded-lg w-full hover:scale-105 hover:from-purple-500 hover:to-blue-500 transition duration-300 ease-in-out">
            Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
