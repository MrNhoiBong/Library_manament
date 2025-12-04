import React from "react";
import { useState, useEffect } from 'react';
import './Bookcard.css';

const Bookcard = ({id, title, author, price, link, setIsPopupOpen, setIdDoc}) => {
    const handleBookClick = () => {
        setIsPopupOpen(true)
        setIdDoc(id)
        console.log(id)
    }

    return(
        <div className="book-card" onClick={handleBookClick}>
            {/* <div className="book-cover"></div> */}
            <div
                className="h-[200px] flex items-center justify-center mb-4 bg-gray-100"
                style={{
                    backgroundImage: `url(${link})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                }}
            ></div>

            <h3>{title}</h3>
            <p><strong>Author:</strong> {author}</p>
            {price && <p><strong>Giá:</strong> {price}</p>}
        </div>
    )
}

export default Bookcard;