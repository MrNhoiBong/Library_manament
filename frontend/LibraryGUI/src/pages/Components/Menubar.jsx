import React from "react";
import logo from '../../assets/logo.svg';
import { useNavigate } from 'react-router-dom';

const Menubar = ({setIsPopupOpen, setshowState}) => {
    const navigate = useNavigate();
    const handleLogoClick = () => {
        navigate('/login')};
    
    const handleUserClick = () => {
        setIsPopupOpen(true)
        setshowState('user')
    }

    const handleBooksClick = () => {
        document.cookie = "account=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "password=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        navigate('/login');
    }

    const handleCartClick = () => {
        setIsPopupOpen(true)
        setshowState('orders')
    }

    return(
        <div className="bg-white/60 sticky top-0 z-50 w-full bg-transparent backdrop-blur-md shadow-md px-8 py-4 flex items-center justify-between text-gray-800 font-semibold">
            {/* Logo */}
            <img src={logo} alt="Logo" className="h-10 w-auto" onClick={handleLogoClick}/>

            {/* Search Bar */}
            <div className="flex items-center bg-white rounded-full px-4 py-2 shadow-md w-1/2 max-w-md">
                <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-500 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M16.65 16.65A7.5 7.5 0 1116.65 2.5a7.5 7.5 0 010 14.15z" />
                </svg>
                <input
                type="text"
                placeholder="Search"
                className="outline-none w-full text-sm text-gray-700"
                />
            </div>

            {/* Icon Buttons */}
            <div className="flex rounded-lg justify-between shadow bg-white/60 gap-5 p-2">
                {/* User Icon */}
                <button className=" text-balck hover:text-blue-600 transition"
                onClick={handleUserClick}
                >
                    User
                </button>

                {/* Cart Icon */}
                <button className="text-black hover:text-green-600 transition"
                onClick={handleCartClick}
                >
                    Cart
                </button>

                {/* Logout Icon */}
                <button className="text-black hover:text-blue-600 transition"
                    onClick={handleBooksClick}
                >
                    Logout
                </button>
            </div>
        </div>
    )
}

export default Menubar;