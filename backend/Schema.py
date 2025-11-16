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
    reportTo: Optional[str] = None
    CIC: str
    Account: str
    Password: str

class Reader(BaseModel):
    LibrarianID: str
    Address: str
    Phone: str = Field(..., max_length=30)
    Name: str
    Gender: Optional[str] = Field(None, max_length=10)
    CreateDate: datetime
    Mail: Optional[str] = Field(None, max_length=50)
    Account: str
    Password: str

class OrderRequest(BaseModel):
    DocID: str                  # ✅ Mã tài liệu
    Address: str                # ✅ Địa chỉ nhận
    BorrowDay: int             # ✅ Số ngày mượn (CHECK > 0)
    Note: Optional[str] = None # ✅ Ghi chú (tùy chọn)

class MemberCard(BaseModel):
    CardID: str
    IssueBy: str
    Rank: str
    IssueDate: Optional[str] = None # Định dạng: 'YYYY-MM-DD'
    EndDate: Optional[str] = None  # Định dạng: 'YYYY-MM-DD'

#Add
class AddMemberCard(BaseModel):
    CardID: str
    IssueBy: str
    Rank: str

# Delete
class DeleteDocumentRequest(BaseModel):
    DocID: str

# 📦 Dữ liệu đầu vào
class DeleteLibrarianRequest(BaseModel):
    LibrarianID: str

class DeleteReaderRequest(BaseModel):
    ReaderID: str

class DeleteOrderRequest(BaseModel):
    RequestDate: str  # Định dạng: 'YYYY-MM-DD' hoặc 'YYYY-MM-DD HH:MM:SS'
    OrderBy: str
    DocID: str

class DeleteMemberCardRequest(BaseModel):
    CardID: str

# Update
class DocumentUpdate(BaseModel):
    DocID: str
    ISBN: str
    Quantity: int
    Price: float
    Publisher: str
    Author: str
    Genre: str
    Title: str
    Link: Optional[str] = None
    Publication_year: str  # YYYY-MM-DD
    Available: int
    Rank: int

class LibrarianUpdate(BaseModel):
    LibrarianID: str
    phone: str
    baseSalary: int
    Full_name: str
    Gender: str
    DateOfBirth: str # YYYY-MM-DD
    Address: str
    reportTo: str
    CIC: str

class ReaderUpdate(BaseModel):
    ReaderID: str
    LibrarianID: str
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
    DocID: str
    OrderBy: str
    ApplyBy: str
    BorrowDay: int
    ApprovedDate: str
    ReceivedDate: str
    ReturnDate: str
    Price: float
    DeliveryDate: str
    PaymentStatus: str
    Note: str
    Address: str

class MemberCardUpdate(BaseModel):
    CardID: str
    Rank: Optional[str] = None
    IssueBy: Optional[str] = None