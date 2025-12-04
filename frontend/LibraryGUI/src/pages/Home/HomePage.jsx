import React from 'react';
import { useState, useEffect } from 'react';
import BookCard from '../Components/Bookcard';
import MenuBar from '../Components/Menubar';
import Popup from '../Components/Popup';
import bannerImage from '../../assets/home-banner-bg.jpg';
import UserPopup from '../Components/UserPopup';
import OrdersPopup from '../Components/OrdersPopup';
import OrderForm from '../Components/Orderform'
import './HomePage.css';

const HomePage = () => {
  let url = window.location.host;

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isOrderOpen, setIsOrderOpen] = useState(false);
  const [IdDoc, setIdDoc] = useState(false);
  const [books, setBooks] = useState([]);
  const [showState, setshowState] = useState(null);

  const renderPopupContent = () => {
    switch (showState) {
      case 'user':
        return (
          <UserPopup/>
        );
      case 'orders':
        return (
          <OrdersPopup/>
        );
      default:
        return (
          <>
            <h2 className="text-xl font-semibold mb-2">Chi tiết thông tin</h2>
            <p className="mb-4">Đây là nội dung bên trong cửa sổ nổi. Bạn có thể thêm bất kỳ thông tin nào tại đây.</p>
          </>
        );
    }
  };

  useEffect(() => {
    fetch('http://'+url+'/api/get-documents/')
      .then(response => response.json())
      .then(data => {
        const formattedBooks = data.map(book => ({
          id: book.DocID,
          title: book.Title,
          author: book.Author,
          price: book.Price,
          link: book.Link
        }));
        setBooks(formattedBooks);
      })
      .catch(error => {
        console.error('Lỗi khi gọi API:', error);
      });
  }, []);

  return (
    <div className="home-container">
          <MenuBar setIsPopupOpen={setIsPopupOpen} setshowState={setshowState} />

          <div className="flex justify-end items-center px-6 py-4 bg-white shadow-sm">
              <span className="text-gray-700 mr-4">
                  Xin chào, <strong>{document.cookie.split(";").find(c => c.includes("account"))?.split("=")[1]}</strong>
              </span>
          </div>

          <div className="w-full h-[90vh] bg-cover bg-center flex items-center text-white"
              style={{ backgroundImage: `url(${bannerImage})` }}>
              <div className="text-[120px] font-bold bg-opacity-50 px-6 py-4 rounded text-left">
                  <h1 className='p-3'>Welcome to</h1>
                  <h1 className='p-3'>Bork.com</h1>
              </div>
          </div>

          <div className="min-h-screen w-full bg-[#fafafa] relative text-gray-900">
              <div
                  className="absolute inset-0 z-0 pointer-events-none"
                  style={{
                      backgroundImage: `
                        repeating-linear-gradient(45deg, rgba(0, 0, 0, 0.1) 0, rgba(0, 0, 0, 0.1) 1px, transparent 1px, transparent 20px),
                        repeating-linear-gradient(-45deg, rgba(0, 0, 0, 0.1) 0, rgba(0, 0, 0, 0.1) 1px, transparent 1px, transparent 20px)
                        `,
                      backgroundSize: "40px 40px",
                  }}
              />

              {/* Your Content/Components */}
              <div className='book-show relative z-10'>
                  <div className='title'>
                      List of Books.
                  </div>
                  <div className="book-grid">
                      {books.map((book, index) => (
                          <BookCard key={index} {...book} setIsPopupOpen={setIsOrderOpen} setIdDoc={setIdDoc} />
                      ))}
                  </div>
              </div>
          </div>

          <Popup isOpen={isPopupOpen} onClose={() => setIsPopupOpen(false)}>
              {renderPopupContent()}
          </Popup>

          <Popup isOpen={isOrderOpen} onClose={() => setIsOrderOpen(false)}>
              <OrderForm IdDoc={IdDoc} onClose={() => setIsOrderOpen(false)} />
          </Popup>
      </div>
  );
};

export default HomePage;
