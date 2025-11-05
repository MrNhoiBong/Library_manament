from pydantic import BaseModel, Field
from typing import Optional
from datetime import date, datetime

class Document(BaseModel):
    ISBN: str
    Quantity: int
    Price: float
    Publisher: Optional[str] = 'NULL'
    Author: str
    Genre: str
    Title: str
    Publication_year: str  # YYYY-MM-DD
    Available: int
    Rank: int

class Librarian(BaseModel):
    phone: Optional[str] = Field(None, max_length=15)
    baseSalary: int
    Full_name: str
    Gender: str
    DateOfBirth: Optional[date] = None
    Address: str
    reportTo: Optional[int] = None
    CIC: str
    Account: str
    Password: str

class Reader(BaseModel):
    LibrarianID: int
    Address: str
    Phone: str = Field(..., max_length=30)
    Name: str
    Gender: Optional[str] = Field(None, max_length=10)
    CreateDate: datetime
    Mail: Optional[str] = Field(None, max_length=50)
    Account: str
    Password: str

class OrderRequest(BaseModel):
    DocID: int
    Address: str
    BorrowDay: int
    Note: Optional[str] = None

class DeleteDocumentRequest(BaseModel):
    DocID: int

# 📦 Dữ liệu đầu vào
class DeleteLibrarianRequest(BaseModel):
    LibrarianID: int

class DeleteReaderRequest(BaseModel):
    ReaderID: int

class DeleteOrderRequest(BaseModel):
    RequestDate: str  # Định dạng: 'YYYY-MM-DD' hoặc 'YYYY-MM-DD HH:MM:SS'
    OrderBy: int
    DocID: int

class DocumentUpdate(BaseModel):
    DocID: int
    ISBN: str
    Quantity: int
    Price: float
    Publisher: str
    Author: str
    Genre: str
    Title: str
    Link: str
    Publication_year: str  # YYYY-MM-DD
    Available: int
    Rank: int

class LibrarianUpdate(BaseModel):
    LibrarianID: int
    phone: str
    baseSalary: int
    Full_name: str
    Gender: str
    DateOfBirth: str # YYYY-MM-DD
    Address: str
    reportTo: int
    CIC: str

class ReaderUpdate(BaseModel):
    ReaderID: int
    LibrarianID: int
    Address: str
    Phone: str
    Name: str
    Gender: str
    CreateDate: str  # Định dạng YYYY-MM-DD HH:MM:SS
    Mail: str
    Account: str
    Password: str

class OrderUpdate(BaseModel):
    RequestDate: str  # YYYY-MM-DD HH:MM:SS
    DocID: int
    OrderBy: int
    ApplyBy: int
    BorrowDay: int
    ApprovedDate: str
    ReceivedDate: str
    ReturnDate: str
    Price: float
    DeliveryDate: str
    PaymentStatus: str
    Note: str
    Address: str