import pymysql
import uvicorn
from Schema import *
from fastapi import FastAPI, HTTPException, Query , Body, Request
from typing import Optional

app = FastAPI()
connection = pymysql.connect(
        host='127.0.0.1',
        port=3307,
        user='root',
        password='strong_password',
        database='libmanagement',
    )

# Api: get documents no auth
@app.get("/api/get-documents/")
def get_documents():
    try:
        with connection.cursor(pymysql.cursors.DictCursor) as cursor:
            cursor.execute("SELECT * FROM documents")
            results = cursor.fetchall()
            print(results)
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi truy vấn: {str(e)}")

@app.get("/api/get-document")
def get_document_by_id(DocID: int = Query(..., description="ID của tài liệu cần lấy")):
    try:
        with connection.cursor(pymysql.cursors.DictCursor) as cursor:
            cursor.execute("SELECT * FROM documents WHERE DocID = %s", (DocID,))
            result = cursor.fetchone()
            if not result:
                raise HTTPException(status_code=404, detail="Không tìm thấy tài liệu với ID đã cho")
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi truy vấn: {str(e)}")

# Auth function
def auth(acc: str, pwd: str) -> bool:
    try:
        with connection.cursor() as cursor:
            sql = "SELECT COUNT(*) FROM librarians WHERE Account = %s AND Password = %s"
            cursor.execute(sql, (acc, pwd))
            result = cursor.fetchone()
            return result[0] > 0
    except Exception as e:
        print(f"Lỗi xác thực: {e}")
        return False

def get_reader_id(acc: str, pwd: str) -> Optional[int]:
    try:
        with connection.cursor() as cursor:
            sql = "SELECT ReaderID FROM readers WHERE Account = %s AND Password = %s"
            cursor.execute(sql, (acc, pwd))
            result = cursor.fetchone()
            return result[0] if result else None
    except Exception as e:
        print(f"Lỗi truy vấn ReaderID: {e}")
        return None

@app.get("/api/get-librarian")
def get_librarian(acc: str = Query(..., description="Tài khoản đăng nhập"),
                  pwd: str = Query(..., description="Mật khẩu đăng nhập")):
    try:
        with connection.cursor(pymysql.cursors.DictCursor) as cursor:
            sql = "SELECT * FROM librarians WHERE Account = %s AND Password = %s"
            cursor.execute(sql, (acc, pwd))
            result = cursor.fetchone()
            if not result:
                raise HTTPException(status_code=401, detail="Sai tài khoản hoặc mật khẩu")
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi truy vấn: {str(e)}")

@app.get("/api/orders")
def get_orders(acc: str = Query(..., description="Tài khoản thủ thư"),
               pwd: str = Query(..., description="Mật khẩu thủ thư")):
    if not auth(acc, pwd):
        raise HTTPException(status_code=401, detail="Tài khoản hoặc mật khẩu không hợp lệ")

    try:
        with connection.cursor(pymysql.cursors.DictCursor) as cursor:
            cursor.execute("SELECT * FROM orders")
            results = cursor.fetchall()
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi truy vấn đơn hàng: {str(e)}")

@app.get("/api/order/orderby")
def get_orders_by_orderby(
    acc: str = Query(..., description="Tài khoản đăng nhập"),
    pwd: str = Query(..., description="Mật khẩu đăng nhập"),
    ReaderID: Optional[int] = Query(None, description="ID của người đặt đơn (nếu có)")
):
    # Nếu ReaderID được nhập → kiểm tra thủ thư
    if ReaderID is not None:
        if not auth(acc, pwd):
            raise HTTPException(status_code=401, detail="Tài khoản thủ thư không hợp lệ")
    else:
        # Nếu không nhập ReaderID → lấy ReaderID từ bảng readers
        ReaderID = get_reader_id(acc, pwd)
        if ReaderID is None:
            raise HTTPException(status_code=401, detail="Tài khoản người đọc không hợp lệ")

    # Truy vấn đơn hàng theo OrderBy
    try:
        with connection.cursor(pymysql.cursors.DictCursor) as cursor:
            sql = "SELECT * FROM orders WHERE OrderBy = %s"
            cursor.execute(sql, (ReaderID,))
            results = cursor.fetchall()
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi truy vấn đơn hàng: {str(e)}")

@app.get("/api/readers")
def get_all_readers(
    acc: str = Query(..., description="Tài khoản thủ thư"),
    pwd: str = Query(..., description="Mật khẩu thủ thư")
):
    if not auth(acc, pwd):
        raise HTTPException(status_code=401, detail="Tài khoản hoặc mật khẩu không hợp lệ")

    try:
        with connection.cursor(pymysql.cursors.DictCursor) as cursor:
            cursor.execute("SELECT * FROM readers")
            results = cursor.fetchall()
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi truy vấn dữ liệu readers: {str(e)}")

@app.get("/api/reader")
def get_reader(
    acc: str = Query(..., description="Tài khoản đăng nhập"),
    pwd: str = Query(..., description="Mật khẩu đăng nhập"),
    ReaderID: Optional[int] = Query(None, description="ID của người đọc (nếu có)")
):
    try:
        with connection.cursor(pymysql.cursors.DictCursor) as cursor:
            if ReaderID is not None:
                # Truy cập bởi thủ thư → xác thực
                if not auth(acc, pwd):
                    raise HTTPException(status_code=401, detail="Tài khoản thủ thư không hợp lệ")
                cursor.execute("SELECT * FROM readers WHERE ReaderID = %s", (ReaderID,))
            else:
                # Truy cập bởi người đọc → kiểm tra tài khoản
                cursor.execute("SELECT * FROM readers WHERE Account = %s AND Password = %s", (acc, pwd))

            result = cursor.fetchone()
            if not result:
                raise HTTPException(status_code=404, detail="Không tìm thấy thông tin người đọc")
            return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi truy vấn dữ liệu reader: {str(e)}")

# Api add
@app.post("/api/add-doc")
def add_document(
    acc: str = Query(..., description="Tài khoản thủ thư"),
    pwd: str = Query(..., description="Mật khẩu thủ thư"),
    doc: Document = Body(..., description="Thông tin tài liệu cần thêm")
):
    if not auth(acc, pwd):
        raise HTTPException(status_code=401, detail="Tài khoản thủ thư không hợp lệ")

    try:
        with connection.cursor() as cursor:
            sql = """INSERT INTO documents (ISBN, Quantity, Price, Publisher, Author, Genre, Title, Publication_year, 
            Available, `Rank`) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"""
            cursor.execute(sql, (
                doc.ISBN,
                doc.Quantity,
                doc.Price,
                doc.Publisher,
                doc.Author,
                doc.Genre,
                doc.Title,
                doc.Publication_year,
                doc.Available,
                doc.Rank,
            ))
            connection.commit()
        return {"message": "Thêm tài liệu thành công"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi thêm tài liệu: {str(e)}")

@app.post("/api/add-librarian")
def add_librarian(
    acc: str = Query(..., description="Tài khoản thủ thư đang thực hiện"),
    pwd: str = Query(..., description="Mật khẩu thủ thư đang thực hiện"),
    librarian: Librarian = Body(..., description="Thông tin thủ thư cần thêm")
):
    if not auth(acc, pwd):
        raise HTTPException(status_code=401, detail="Tài khoản thủ thư không hợp lệ")

    try:
        with connection.cursor() as cursor:
            sql = """
                INSERT INTO librarians (phone, baseSalary, Full_name, Gender, DateOfBirth, Address, reportTo, CIC, Account, Password)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            cursor.execute(sql, (
                librarian.phone,
                librarian.baseSalary,
                librarian.Full_name,
                librarian.Gender,
                librarian.DateOfBirth,
                librarian.Address,
                librarian.reportTo,
                librarian.CIC,
                librarian.Account,
                librarian.Password
            ))
            connection.commit()
        return {"message": "Thêm thủ thư thành công"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi thêm thủ thư: {str(e)}")

@app.post("/api/add-reader")
def add_reader(
    acc: str = Query(..., description="Tài khoản thủ thư"),
    pwd: str = Query(..., description="Mật khẩu thủ thư"),
    reader: Reader = Body(..., description="Thông tin người đọc cần thêm")
):
    if not auth(acc, pwd):
        raise HTTPException(status_code=401, detail="Tài khoản thủ thư không hợp lệ")

    try:
        with connection.cursor() as cursor:
            sql = """
                INSERT INTO readers (LibrarianID, Address, Phone, Name, Gender, CreateDate, Mail, Account, Password)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            cursor.execute(sql, (
                reader.LibrarianID,
                reader.Address,
                reader.Phone,
                reader.Name,
                reader.Gender,
                reader.CreateDate,
                reader.Mail,
                reader.Account,
                reader.Password
            ))
            connection.commit()
        return {"message": "Thêm người đọc thành công"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi thêm người đọc: {str(e)}")

@app.post("/api/add-order")
def add_order(acc: str = Query(...), pwd: str = Query(...), order: OrderRequest = None):
    reader_id = get_reader_id(acc, pwd)
    if reader_id is None:
        raise HTTPException(status_code=401, detail="Tài khoản hoặc mật khẩu không hợp lệ.")

    now = datetime.now()

    query = """
        INSERT INTO orders (
            RequestDate, BorrowDay, ApprovedDate, ReceivedDate, ReturnDate,
            Price, DeliveryDate, PaymentStatus, Note, Address,
            ApplyBy, DocID, OrderBy
        ) VALUES (
            %s, %s, %s, %s, %s,
            %s, %s, %s, %s, %s,
            %s, %s, %s
        )
    """

    values = (
        now,                # RequestDate
        order.BorrowDay,    # BorrowDay
        None,               # ApprovedDate
        None,               # ReceivedDate
        None,               # ReturnDate
        0.00,               # Price
        None,               # DeliveryDate
        'Unpaid',           # PaymentStatus
        order.Note,         # Note
        order.Address,      # Address
        1,                  # ApplyBy
        order.DocID,        # DocID
        reader_id           # OrderID
    )
    try:
        with connection.cursor(pymysql.cursors.DictCursor) as cursor:
            cursor.execute(query, values)
            connection.commit()
            return {"message": "Thêm order thành công", "OrderID": reader_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi hệ thống: {str(e)}")

@app.post("/api/delete-document")
async def delete_document(
    body: DeleteDocumentRequest,
    acc: str = Query(...),
    pwd: str = Query(...)
):
    if not acc or not pwd:
        raise HTTPException(status_code=400, detail="Thiếu thông tin xác thực")

    if not auth(acc, pwd):
        raise HTTPException(status_code=403, detail="Không có quyền thủ thư")

    with connection.cursor() as cursor:
        cursor.execute("DELETE FROM documents WHERE DocID = %s", (body.DocID,))
        connection.commit()

    return {"message": f"Đã xóa tài liệu có DocID = {body.DocID}"}

@app.post("/api/delete-librarian")
async def delete_librarian(
    body: DeleteLibrarianRequest,
    acc: str = Query(...),
    pwd: str = Query(...)
):
    if not auth(acc, pwd):
        raise HTTPException(status_code=403, detail="Không có quyền thủ thư")

    with connection.cursor() as cursor:
        cursor.execute("DELETE FROM librarians WHERE LibrarianID = %s", (body.LibrarianID,))
        connection.commit()

    return {"message": f"Đã xóa thủ thư có LibrarianID = {body.LibrarianID}"}

@app.post("/api/delete-reader")
async def delete_reader(
    body: DeleteReaderRequest,
    acc: str = Query(...),
    pwd: str = Query(...)
):
    if not auth(acc, pwd):
        raise HTTPException(status_code=403, detail="Không có quyền thủ thư")

    with connection.cursor() as cursor:
        cursor.execute("DELETE FROM readers WHERE ReaderID = %s", (body.ReaderID,))
        connection.commit()

    return {"message": f"Đã xóa người đọc có ReaderID = {body.ReaderID}"}

@app.post("/api/delete-order")
async def delete_order(
    body: DeleteOrderRequest,
    acc: str = Query(...),
    pwd: str = Query(...)
):
    if not auth(acc, pwd):
        raise HTTPException(status_code=403, detail="Không có quyền thủ thư")

    with connection.cursor() as cursor:
        cursor.execute(
            "DELETE FROM orders WHERE RequestDate = %s AND OrderBy = %s AND DocID = %s",
            (body.RequestDate, body.OrderBy, body.DocID)
        )
        connection.commit()

    return {
        "message": f"Đã xóa đơn đặt tài liệu với DocID = {body.DocID}, OrderBy = {body.OrderBy}, RequestDate = {body.RequestDate}"
    }

@app.put("/api/update-document")
async def update_document(
    doc: DocumentUpdate,
    acc: str = Query(...),
    pwd: str = Query(...)
):
    # Bước 1: Xác thực thủ thư
    if not auth(acc, pwd):
        raise HTTPException(status_code=401, detail="Tài khoản hoặc mật khẩu không hợp lệ")

    with connection.cursor() as cursor:
        # Bước 2: Kiểm tra DocID có tồn tại
        cursor.execute("SELECT * FROM documents WHERE DocID = %s", (doc.DocID,))
        existing = cursor.fetchone()
        if not existing:
            raise HTTPException(status_code=404, detail="Không tồn tại document để sửa chữa")

        # Bước 3: Tạo câu lệnh UPDATE động
        fields = []
        values = []
        for key, value in doc.dict().items():
            if key != "DocID" and value is not None:
                fields.append(f"{key} = %s")
                values.append(value)

        if not fields:
            raise HTTPException(status_code=400, detail="Không có dữ liệu nào để cập nhật")
        index = ', '.join(fields).find('Rank')
        update_query = f"UPDATE documents SET {', '.join(fields)[:index] + "`Rank`" + ', '.join(fields)[index+4:]} WHERE DocID = %s"
        values.append(doc.DocID)
        cursor.execute(update_query, tuple(values))
        connection.commit()

    connection.close()
    return {"message": "Cập nhật document thành công"}

@app.put("/api/update-librarian")
def update_librarian(
    acc: str = Query(...),
    pwd: str = Query(...),
    data: LibrarianUpdate = None
):

    if not auth(acc, pwd):
        raise HTTPException(status_code=401, detail="Sai tài khoản hoặc mật khẩu")

    # 🔍 Kiểm tra LibrarianID
    with connection.cursor() as cursor:
        cursor.execute("SELECT 1 FROM librarians WHERE LibrarianID=%s", (data.LibrarianID,))
        if cursor.fetchone() is None:
            raise HTTPException(status_code=404, detail="Không tồn tại thủ thư với LibrarianID này")

    # 🛠️ Tạo câu lệnh UPDATE
    update_fields = []
    update_values = []
    if(data.reportTo == 0):
        data.reportTo = None
    for field, value in data.dict(exclude={"LibrarianID"}).items():
        update_fields.append(f"{field}=%s")
        update_values.append(value)

    if not update_fields:
        raise HTTPException(status_code=400, detail="Không có dữ liệu để cập nhật")

    update_values.append(data.LibrarianID)
    sql = f"UPDATE librarians SET {', '.join(update_fields)} WHERE LibrarianID=%s"
    with connection.cursor() as cursor:
        cursor.execute(sql, update_values)
        connection.commit()

    return {"message": "Cập nhật thủ thư thành công"}

@app.put("/api/update-reader")
def update_reader(
        acc: str = Query(...),
        pwd: str = Query(...),
        data: ReaderUpdate = None
):
        # 🔐 Xác thực thủ thư
        if not auth(acc, pwd):
            raise HTTPException(status_code=401, detail="Sai tài khoản hoặc mật khẩu thủ thư")

        # 🔍 Kiểm tra ReaderID có tồn tại
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1 FROM readers WHERE ReaderID=%s", (data.ReaderID,))
            if cursor.fetchone() is None:
                raise HTTPException(status_code=404, detail="Không tồn tại bạn đọc với ReaderID này")

        # 🛠️ Tạo câu lệnh UPDATE
        update_fields = []
        update_values = []
        for field, value in data.dict(exclude={"ReaderID"}).items():
            update_fields.append(f"{field}=%s")
            if value == 'null':
                update_values.append(None)
            else:
                update_values.append(value)

        update_values.append(data.ReaderID)
        sql = f"UPDATE readers SET {', '.join(update_fields)} WHERE ReaderID=%s"

        with connection.cursor() as cursor:
            cursor.execute(sql, update_values)
            connection.commit()

        return {"message": "Cập nhật thông tin bạn đọc thành công"}

@app.put("/api/update-order")
def update_order(
    acc: str = Query(...),
    pwd: str = Query(...),
    data: OrderUpdate = None
):
    global connection  # Dùng connection đã có

    # 🔐 Xác thực thủ thư
    if not auth(acc, pwd):
        raise HTTPException(status_code=401, detail="Sai tài khoản hoặc mật khẩu thủ thư")

    # 🔍 Kiểm tra đơn hàng có tồn tại
    with connection.cursor() as cursor:
        cursor.execute(
            "SELECT 1 FROM orders WHERE RequestDate=%s AND DocID=%s AND OrderBy=%s",
            (data.RequestDate, data.DocID, data.OrderBy)
        )
        if cursor.fetchone() is None:
            raise HTTPException(status_code=404, detail="Không tồn tại đơn hàng với RequestDate, DocID, OrderBy này")

    # 🛠️ Tạo câu lệnh UPDATE
    update_fields = []
    update_values = []
    for field, value in data.dict().items():
        if field not in ["RequestDate", "DocID", "OrderBy"]:
            update_fields.append(f"{field}=%s")
            update_values.append(value)

    update_values.extend([data.RequestDate, data.DocID, data.OrderBy])
    sql = f"""
        UPDATE orders
        SET {', '.join(update_fields)}
        WHERE RequestDate=%s AND DocID=%s AND OrderBy=%s
    """

    with connection.cursor() as cursor:
        cursor.execute(sql, update_values)
        connection.commit()

    return {"message": "Cập nhật đơn hàng thành công"}

if __name__ == '__main__':
    uvicorn.run(
        "backend:app",
        host="127.0.0.1",
        port=8000,
        reload=False,
        log_level="debug"
    )

