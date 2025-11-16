-- Version 16

/* Create the database */
CREATE DATABASE  IF NOT EXISTS libmanagement;

/* Switch to the librarymanagement database */
USE libmanagement;

/* Drop existing tables  */
-- SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS issue_membercard;
DROP TABLE IF EXISTS readers;
DROP TABLE IF EXISTS librarians;
DROP TABLE IF EXISTS documents;

-- SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE librarians (
    LibrarianID VARCHAR(10) PRIMARY KEY NOT NULL,
    phone CHAR(15) NULL,
    baseSalary INT NOT NULL CHECK (baseSalary > 0),
    Full_name VARCHAR(100) NOT NULL,
    Gender CHAR(6) NOT NULL CHECK (Gender IN ('MALE', 'FEMALE')),
    DateOfBirth DATE NULL,
    Address TEXT NOT NULL,
    reportTo VARCHAR(10) NULL,
    CIC VARCHAR(50) NOT NULL UNIQUE,
	`Account` VARCHAR(50) NOT NULL UNIQUE,
    `Password` VARCHAR(50) NOT NULL,

    CONSTRAINT fk_reportTo FOREIGN KEY (reportTo)
        REFERENCES librarians(LibrarianID)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);


CREATE TABLE readers (
    ReaderID VARCHAR(10) PRIMARY KEY,
    LibrarianID VARCHAR(10) NOT NULL,
    Address VARCHAR(255) NOT NULL,
    Phone CHAR(30) NOT NULL UNIQUE,
    Name VARCHAR(100) NOT NULL,
    Gender CHAR(10) NULL CHECK (Gender IN ('MALE', 'FEMALE')),
    CreateDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Mail CHAR(50) NULL CHECK (Mail LIKE '%@%'),
	Account VARCHAR(50) NOT NULL UNIQUE,
    Password VARCHAR(50) NOT NULL,

    CONSTRAINT fk_Librarian_Reader FOREIGN KEY (LibrarianID)
        REFERENCES librarians(LibrarianID)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);


CREATE TABLE issue_membercard (
    CardID VARCHAR(10) NOT NULL,
    IssueBy VARCHAR(10) NOT NULL,
    `Rank` CHAR(20) NOT NULL CHECK (`Rank` IN ('Normal', 'VIP')),
    ProvideDate DATETIME NOT NULL,
    EndDate DATETIME NOT NULL,

    CONSTRAINT pk_issue_memberCard PRIMARY KEY (CardID, IssueBy),

    CONSTRAINT fk_card_reader FOREIGN KEY (CardID)
        REFERENCES readers(ReaderID)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_card_librarian FOREIGN KEY (IssueBy)
        REFERENCES librarians(LibrarianID)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);


CREATE TABLE documents (
    DocID VARCHAR(10) PRIMARY KEY,
    ISBN VARCHAR(50) NOT NULL UNIQUE,
    Quantity INT NOT NULL CHECK (Quantity >= 0),
    Price DECIMAL(10,2) NOT NULL CHECK (Price > 0),
    Publisher VARCHAR(100) NULL,
    Author VARCHAR(50) NOT NULL,
    Genre CHAR(30) NOT NULL,
    Title VARCHAR(100) NOT NULL,
    Link TEXT NULL,
    Publication_year DATE NOT NULL ,
    Available TINYINT(1) NOT NULL CHECK (Available >= 0),
    `Rank` INT NOT NULL CHECK (`Rank` IN (0, 1, 2))
);


CREATE TABLE orders (
    RequestDate DATETIME NOT NULL,
    ApplyBy VARCHAR(10) NULL,
    DocID VARCHAR(10) NOT NULL,
    OrderBy VARCHAR(10) NOT NULL,
    BorrowDay INT NOT NULL CHECK (BorrowDay > 0),
    ApprovedDate DATETIME NULL,
    ReceivedDate DATETIME NULL,
    ReturnDate DATETIME NULL,
    Price DECIMAL(10,2) NULL CHECK (Price >= 0),
    DeliveryDate DATE NULL,
    PaymentStatus ENUM('Paid', 'Unpaid', 'Pending') NOT NULL,
    Note TEXT NULL,
    Address VARCHAR(255) NOT NULL,

    PRIMARY KEY (RequestDate, DocID, OrderBy),

    CONSTRAINT fk_order_document FOREIGN KEY (DocID)
        REFERENCES documents(DocID)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_order_librarian FOREIGN KEY (ApplyBy)
        REFERENCES librarians(LibrarianID)
        ON UPDATE CASCADE
        ON DELETE SET NULL,

    CONSTRAINT fk_order_reader FOREIGN KEY (OrderBy)
        REFERENCES readers(ReaderID)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

-- Librarian Trigger
DROP TRIGGER IF EXISTS trg_generate_librarian_id;
DELIMITER $$
CREATE TRIGGER trg_generate_librarian_id
BEFORE INSERT ON librarians
FOR EACH ROW
BEGIN
    DECLARE last_id INT;
    DECLARE new_id VARCHAR(10);

    -- Lấy số cuối cùng đã dùng
    SELECT 
        IFNULL(MAX(CAST(SUBSTRING(LibrarianID, 3) AS UNSIGNED)), 0)
    INTO last_id
    FROM librarians;

    -- Tăng lên 1 và tạo mã mới
    SET new_id = CONCAT('LB', LPAD(last_id + 1, 3, '0'));

    -- Gán vào LibrarianID
    SET NEW.LibrarianID = new_id;
END$$
DELIMITER ;


DROP TRIGGER IF EXISTS trg_check_age;
DELIMITER $$
CREATE TRIGGER trg_check_age
BEFORE INSERT ON librarians
FOR EACH ROW
BEGIN
    DECLARE age INT;
    IF NEW.DateOfBirth IS NOT NULL THEN
        SET age = TIMESTAMPDIFF(YEAR, NEW.DateOfBirth, CURDATE());
        IF age < 18 OR age > 100 THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Age must be between 18 and 100 years';
        END IF;
    END IF;
END$$
DELIMITER ;

-- Trigger kiểm tra reportTo không được trỏ về chính mình
DROP TRIGGER IF EXISTS trg_check_reportTo;
DELIMITER $$
CREATE TRIGGER trg_check_reportTo
BEFORE INSERT ON librarians
FOR EACH ROW
BEGIN
    IF NEW.reportTo = NEW.LibrarianID THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'A librarian cannot report to themselves.';
    END IF;
END$$
DELIMITER ;

-- Nếu muốn kiểm tra khi UPDATE nữa:
DROP TRIGGER IF EXISTS trg_check_reportTo_update;
DELIMITER $$
CREATE TRIGGER trg_check_reportTo_update
BEFORE UPDATE ON librarians
FOR EACH ROW
BEGIN
    IF NEW.reportTo = NEW.LibrarianID THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'A librarian cannot report to themselves (update check).';
    END IF;
END$$
DELIMITER ;

DROP TRIGGER IF EXISTS prevent_duplicate_account_in_librarians;
DELIMITER $$
CREATE TRIGGER prevent_duplicate_account_in_librarians
BEFORE INSERT ON librarians
FOR EACH ROW
BEGIN
    IF EXISTS (SELECT 1 FROM readers WHERE Account = NEW.Account) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Account already exists in readers';
    END IF;
END$$
DELIMITER ;

-- Reader Triggers
DROP TRIGGER IF EXISTS trg_generate_reader_id;
DELIMITER $$
CREATE TRIGGER trg_generate_reader_id
BEFORE INSERT ON readers
FOR EACH ROW
BEGIN
    DECLARE last_id INT;
    DECLARE new_id VARCHAR(10);

    -- Lấy số cuối cùng đã dùng
    SELECT 
        IFNULL(MAX(CAST(SUBSTRING(ReaderID, 3) AS UNSIGNED)), 0)
    INTO last_id
    FROM readers;

    -- Tăng lên 1 và tạo mã mới
    SET new_id = CONCAT('RD', LPAD(last_id + 1, 3, '0'));

    -- Gán vào LibrarianID
    SET NEW.ReaderID = new_id;
END$$
DELIMITER ;

DROP TRIGGER IF EXISTS prevent_duplicate_account_in_readers;
DELIMITER $$
CREATE TRIGGER prevent_duplicate_account_in_readers
BEFORE INSERT ON readers
FOR EACH ROW
BEGIN
    IF EXISTS (SELECT 1 FROM librarians WHERE Account = NEW.Account) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Account already exists in librarians';
    END IF;
END$$
DELIMITER ;

-- Issue Member Card Trigger
DROP TRIGGER IF EXISTS delete_membercard_after_reader;
DELIMITER $$
CREATE TRIGGER delete_membercard_after_reader
AFTER DELETE ON readers
FOR EACH ROW
BEGIN
    DELETE FROM issue_membercard
    WHERE CardID = OLD.ReaderID;
END $$
DELIMITER ;

DROP TRIGGER IF EXISTS trg_check_issue_card_dates;
DELIMITER $$
CREATE TRIGGER trg_check_issue_card_dates
BEFORE INSERT ON issue_membercard
FOR EACH ROW
BEGIN
    IF NEW.EndDate <= NEW.ProvideDate OR NEW.EndDate <= CURDATE() THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'EndDate must be greater than ProvideDate and current date.';
    END IF;
END$$
DELIMITER ;

-- Nếu muốn kiểm tra khi UPDATE:
DROP TRIGGER IF EXISTS trg_check_issue_card_dates_update;
DELIMITER $$
CREATE TRIGGER trg_check_issue_card_dates_update
BEFORE UPDATE ON issue_membercard
FOR EACH ROW
BEGIN
    IF NEW.EndDate <= NEW.ProvideDate THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'EndDate must be greater than ProvideDate (update check).';
    ELSEIF NEW.EndDate <= CURDATE() THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'EndDate must be greater than the current date (update check).';
    END IF;
END$$
DELIMITER ;

DROP TRIGGER IF EXISTS trg_sp_issue_membercard;
DELIMITER $$
CREATE TRIGGER trg_sp_issue_membercard
BEFORE INSERT ON issue_membercard
FOR EACH ROW
BEGIN
    DECLARE p_ProvideDate DATETIME;
    DECLARE p_EndDate DATETIME;

    SET p_ProvideDate = NOW();

    IF NEW.Rank = 'Normal' THEN
        SET p_EndDate = DATE_ADD(p_ProvideDate, INTERVAL 6 MONTH);
    ELSEIF NEW.Rank = 'VIP' THEN
        SET p_EndDate = DATE_ADD(p_ProvideDate, INTERVAL 1 YEAR);
    ELSE
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Invalid rank for membercard';
    END IF;

    -- Gán lại vào bản ghi đang insert
    SET NEW.ProvideDate = p_ProvideDate;
    SET NEW.EndDate = p_EndDate;
END$$
DELIMITER ;

-- Proceduce gia hạn thẻ
DROP PROCEDURE IF EXISTS sp_renew_membercard;
DELIMITER $$
CREATE PROCEDURE sp_renew_membercard (
    IN p_ReaderID VARCHAR(10),
    IN p_NewRank CHAR(20)
)
BEGIN
    DECLARE curEnd DATETIME;
    DECLARE newEnd DATETIME;

    SELECT EndDate INTO curEnd
    FROM issue_membercard
    WHERE CardID = p_ReaderID
    LIMIT 1;

    IF curEnd IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Card does not exist';
    END IF;

    IF p_NewRank = 'Normal' THEN
        SET newEnd = DATE_ADD(curEnd, INTERVAL 6 MONTH);
    ELSEIF p_NewRank = 'VIP' THEN
        SET newEnd = DATE_ADD(curEnd, INTERVAL 1 YEAR);
    ELSE
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Invalid rank';
    END IF;

    UPDATE issue_membercard
    SET `Rank` = p_NewRank, EndDate = newEnd
    WHERE CardID = p_ReaderID;
END $$
DELIMITER ;


-- Document Triggers
DROP TRIGGER IF EXISTS trg_generate_doc_id;
DELIMITER $$
CREATE TRIGGER trg_generate_doc_id
BEFORE INSERT ON documents
FOR EACH ROW
BEGIN
    DECLARE last_id INT;
    DECLARE new_id VARCHAR(10);

    -- Lấy số cuối cùng đã dùng
    SELECT 
        IFNULL(MAX(CAST(SUBSTRING(DocID, 4) AS UNSIGNED)), 0)
    INTO last_id
    FROM documents;

    -- Tăng lên 1 và tạo mã mới
    SET new_id = CONCAT('DOC', LPAD(last_id + 1, 3, '0'));

    -- Gán vào LibrarianID
    SET NEW.DocID = new_id;
END$$
DELIMITER ;

DROP TRIGGER IF EXISTS check_publication_year;
DELIMITER $$
CREATE TRIGGER check_publication_year
BEFORE INSERT ON documents
FOR EACH ROW
BEGIN
    IF NEW.Publication_year > CURDATE() THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Publication year cannot be in the future';
    END IF;
END$$
DELIMITER ;

-- Order Triggers
DROP TRIGGER IF EXISTS check_order_dates;
DELIMITER $$
CREATE TRIGGER check_order_dates
BEFORE INSERT ON orders
FOR EACH ROW
BEGIN
    IF (NEW.ApprovedDate <> null)and(NEW.ApprovedDate < NEW.RequestDate) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'ApprovedDate must be >= RequestDate';
    END IF;

    IF NEW.ReceivedDate < NEW.ApprovedDate THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'ReceivedDate must be >= ApprovedDate';
    END IF;

    IF (NEW.ReturnDate <> null)and(NEW.ReturnDate <= NEW.ReceivedDate) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'ReturnDate must be > ReceivedDate';
    END IF;
END$$
DELIMITER ;

DROP TRIGGER IF EXISTS trg_check_membercard_rank;
DELIMITER $$
CREATE TRIGGER trg_check_membercard_rank
BEFORE INSERT ON orders
FOR EACH ROW
BEGIN
    DECLARE cardRank CHAR(20);
    DECLARE docRank INT;

    -- Lấy rank thẻ (nếu có)
    SELECT `Rank` INTO cardRank
    FROM issue_membercard
    WHERE CardID = NEW.OrderBy
    LIMIT 1;

    -- Lấy rank document
    SELECT `Rank` INTO docRank
    FROM documents
    WHERE DocID = NEW.DocID
    LIMIT 1;

    -- Nếu reader không có thẻ
    IF cardRank IS NULL THEN
        IF docRank <> 0 THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Reader without card can only borrow rank 0 documents.';
        END IF;
    ELSE
        -- Logic cho Normal/VIP
        IF cardRank = 'Normal' AND docRank <> 0 THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Normal card cannot borrow this document rank.';
        END IF;

        IF cardRank = 'VIP' AND docRank NOT IN (0, 1) THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'VIP card cannot borrow this document rank.';
        END IF;
    END IF;
END$$
DELIMITER ;

INSERT INTO librarians
(phone, baseSalary, Full_name, Gender, DateOfBirth, Address, reportTo, CIC, `Account`, `Password`)
VALUES
('0000000000', 1, 'Admin', 'MALE', '1980-05-12', 'NULL', NULL, 'NULL', 'admin', 'admin123'),
('0908765432', 20000000, 'Tran Van Minh', 'MALE', '1985-03-22', '45 Hai Ba Trung, Ha Noi', 'LB001', '012345678902', 'minh.tran', 'minh123'),
('0912345678', 15000000, 'Le Thi Huong', 'FEMALE', '1990-07-10', '56 Le Duan, Ha Noi', 'LB002', '012345678903', 'huong.le', 'huong123'),
('0923456789', 12000000, 'Pham Quang Huy', 'MALE', '1993-09-14', '78 Kim Ma, Ha Noi', 'LB002', '012345678904', 'huy.pham', 'huy123'),
('0934567890', 11000000, 'Dang Thi My Linh', 'FEMALE', '1995-02-25', '21 Nguyen Chi Thanh, Ha Noi', 'LB003', '012345678905', 'linh.dang', 'linh123'),
('0945678901', 9000000, 'Hoang Minh Tuan', 'MALE', '1998-06-11', '19 Ton Duc Thang, Ha Noi', 'LB003', '012345678906', 'tuan.hoang', 'tuan123'),
('0967890123', 8000000, 'Tran Thi Mai', 'FEMALE', '2000-08-20', '123 Tran Hung Dao, Ha Noi', 'LB004', '012345678908', 'mai.tran', 'mai123'),
('0956789012', 8500000, 'Bui Thu Trang', 'FEMALE', '1999-11-03', '90 Tran Phu, Ha Noi', 'LB004', '012345678907', 'trang.bui', 'trang123'),
('0970000001', 7500000, 'Nguyen Van A', 'MALE', '1990-01-01', '100 Le Loi, Ha Noi', 'LB001', '012345679901', 'a.nguyen', 'pass123'),
('0970000002', 7600000, 'Tran Thi B', 'FEMALE', '1991-02-02', '101 Le Loi, Ha Noi', 'LB002', '012345679902', 'b.tran', 'pass123'),
('0970000003', 7700000, 'Le Van C', 'MALE', '1992-03-03', '102 Le Loi, Ha Noi', 'LB003', '012345679903', 'c.le', 'pass123'),
('0970000004', 7800000, 'Pham Thi D', 'FEMALE', '1993-04-04', '103 Le Loi, Ha Noi', 'LB004', '012345679904', 'd.pham', 'pass123'),
('0970000005', 7900000, 'Hoang Van E', 'MALE', '1994-05-05', '104 Le Loi, Ha Noi', 'LB001', '012345679905', 'e.hoang', 'pass123'),
('0970000006', 8000000, 'Bui Thi F', 'FEMALE', '1995-06-06', '105 Le Loi, Ha Noi', 'LB002', '012345679906', 'f.bui', 'pass123'),
('0970000007', 8100000, 'Do Van G', 'MALE', '1996-07-07', '106 Le Loi, Ha Noi', 'LB003', '012345679907', 'g.do', 'pass123'),
('0970000008', 8200000, 'Nguyen Thi H', 'FEMALE', '1997-08-08', '107 Le Loi, Ha Noi', 'LB004', '012345679908', 'h.nguyen', 'pass123'),
('0970000009', 8300000, 'Tran Van I', 'MALE', '1998-09-09', '108 Le Loi, Ha Noi', 'LB001', '012345679909', 'i.tran', 'pass123'),
('0970000010', 8400000, 'Le Thi K', 'FEMALE', '1999-10-10', '109 Le Loi, Ha Noi', 'LB002', '012345679910', 'k.le', 'pass123'),
('0970000011', 7500000, 'Pham Van L', 'MALE', '1990-11-11', '110 Le Loi, Ha Noi', 'LB003', '012345679911', 'l.pham', 'pass123'),
('0970000012', 7600000, 'Hoang Thi M', 'FEMALE', '1991-12-12', '111 Le Loi, Ha Noi', 'LB004', '012345679912', 'm.hoang', 'pass123');

INSERT INTO readers
(LibrarianID, Address, Phone, `Name`, Gender, CreateDate, Mail, `Account`, `Password`)
VALUES
('LB001', '123 Le Loi, Ha Noi', '0901111222', 'Pham Van Nam', 'MALE', '2024-10-01 09:30:00', 'nam.pham@example.com', 'nam.pham', 'nam123'),
('LB002', '45 Tran Hung Dao, Ha Noi', '0902222333', 'Nguyen Thi Hoa', 'FEMALE', '2024-11-15 10:00:00', 'hoa.nguyen@example.com', 'hoa.nguyen', 'hoa123'),
('LB003', '56 Nguyen Van Cu, Ha Noi', '0903333444', 'Tran Quoc Bao', 'MALE', '2025-01-12 14:15:00', 'bao.tran@example.com', 'bao.tran', 'bao123'),
('LB003', '89 Kim Ma, Ha Noi', '0904444555', 'Le My Duyen', 'FEMALE', '2025-03-10 11:00:00', 'duyen.le@example.com', 'duyen.le', 'duyen123'),
('LB004', '102 Ton Duc Thang, Ha Noi', '0905555666', 'Hoang Duc Anh', 'MALE', '2025-04-05 08:20:00', 'anh.hoang@example.com', 'anh.hoang', 'anh123'),
('LB005', '21 Phan Chu Trinh, Ha Noi', '0906666777', 'Do Thi Mai', 'FEMALE', '2025-05-20 13:45:00', 'mai.do@example.com', 'mai.do', 'mai123'),
('LB006', '99 Nguyen Chi Thanh, Ha Noi', '0907777888', 'Nguyen Van Long', 'MALE', '2025-06-12 16:30:00', 'long.nguyen@example.com', 'long.nguyen', 'long123'),
('LB007', '12 Truong Dinh, Ha Noi', '0908888999', 'Vu Thi Thu', 'FEMALE', '2025-07-28 09:00:00', 'thu.vu@example.com', 'thu.vu', 'thu123'),
('LB001', '200 Le Lai, Ha Noi', '0910000001', 'Nguyen Thi E', 'FEMALE', '2025-01-10 08:00:00', 'e.nguyen@example.com', 'e.nguyen', 'pass123'),
('LB002', '201 Le Lai, Ha Noi', '0910000002', 'Tran Van F', 'MALE', '2025-01-11 09:00:00', 'f.tran@example.com', 'f.tran', 'pass123'),
('LB003', '202 Le Lai, Ha Noi', '0910000003', 'Le Thi G', 'FEMALE', '2025-01-12 10:00:00', 'g.le@example.com', 'g.le', 'pass123'),
('LB004', '203 Le Lai, Ha Noi', '0910000004', 'Pham Van H', 'MALE', '2025-01-13 11:00:00', 'h.pham@example.com', 'h.pham', 'pass123'),
('LB001', '204 Le Lai, Ha Noi', '0910000005', 'Hoang Thi I', 'FEMALE', '2025-01-14 12:00:00', 'i.hoang@example.com', 'i.hoang', 'pass123'),
('LB002', '205 Le Lai, Ha Noi', '0910000006', 'Bui Van J', 'MALE', '2025-01-15 13:00:00', 'j.bui@example.com', 'j.bui', 'pass123'),
('LB003', '206 Le Lai, Ha Noi', '0910000007', 'Do Thi K', 'FEMALE', '2025-01-16 14:00:00', 'k.do@example.com', 'k.do', 'pass123'),
('LB004', '207 Le Lai, Ha Noi', '0910000008', 'Nguyen Van L', 'MALE', '2025-01-17 15:00:00', 'l.nguyen@example.com', 'l.nguyen', 'pass123'),
('LB001', '208 Le Lai, Ha Noi', '0910000009', 'Tran Thi M', 'FEMALE', '2025-01-18 16:00:00', 'm.tran@example.com', 'm.tran', 'pass123'),
('LB002', '209 Le Lai, Ha Noi', '0910000010', 'Le Van N', 'MALE', '2025-01-19 17:00:00', 'n.le@example.com', 'n.le', 'pass123'),
('LB003', '210 Le Lai, Ha Noi', '0910000011', 'Pham Thi O', 'FEMALE', '2025-01-20 18:00:00', 'o.pham@example.com', 'o.pham', 'pass123'),
('LB004', '211 Le Lai, Ha Noi', '0910000012', 'Hoang Van P', 'MALE', '2025-01-21 09:00:00', 'p.hoang@example.com', 'p.hoang', 'pass123');


INSERT INTO issue_membercard (CardID, IssueBy, `Rank`, ProvideDate, EndDate)
VALUES
('RD001', 'LB001', 'VIP', '2025-01-01 09:00:00', '2026-01-01 09:00:00'),
('RD002', 'LB002', 'Normal', '2025-02-10 10:00:00', '2026-02-10 10:00:00'),
('RD003', 'LB003', 'VIP', '2025-03-05 11:00:00', '2026-03-05 11:00:00'),
('RD004', 'LB003', 'VIP', '2025-03-12 12:00:00', '2026-03-12 12:00:00'),
('RD005', 'LB004', 'Normal', '2025-04-01 08:30:00', '2026-04-01 08:30:00'),
('RD006', 'LB005', 'VIP', '2025-05-15 09:45:00', '2026-05-15 09:45:00'),
('RD007', 'LB006', 'Normal', '2025-06-20 14:20:00', '2026-06-20 14:20:00'),
('RD008', 'LB007', 'VIP', '2025-07-10 15:00:00', '2026-07-10 15:00:00'),
('RD009', 'LB001', 'VIP', '2025-08-01 09:00:00', '2026-08-01 09:00:00'),
('RD010', 'LB002', 'VIP', '2025-08-10 10:00:00', '2026-08-10 10:00:00'),
('RD011', 'LB003', 'Normal', '2025-08-15 11:00:00', '2026-08-15 11:00:00'),
('RD012', 'LB004', 'VIP', '2025-08-20 12:00:00', '2026-08-20 12:00:00'),
('RD013', 'LB001', 'Normal', '2025-08-25 09:00:00', '2026-08-25 09:00:00'),
('RD014', 'LB002', 'VIP', '2025-08-30 10:00:00', '2026-08-30 10:00:00'),
('RD015', 'LB003', 'Normal', '2025-09-04 11:00:00', '2026-09-04 11:00:00'),
('RD016', 'LB004', 'VIP', '2025-09-09 12:00:00', '2026-09-09 12:00:00'),
('RD017', 'LB001', 'Normal', '2025-09-14 09:00:00', '2026-09-14 09:00:00'),
('RD018', 'LB002', 'VIP', '2025-09-19 10:00:00', '2026-09-19 10:00:00'),
('RD019', 'LB003', 'Normal', '2025-09-24 11:00:00', '2026-09-24 11:00:00'),
('RD020', 'LB004', 'VIP', '2025-09-29 12:00:00', '2026-09-29 12:00:00');

INSERT INTO documents (
    ISBN, Quantity, Price, Publisher, Author, Genre, Title, Link, Publication_year, Available, `Rank`
) VALUES
('978-604-1-12345-0', 10, 95000.00, 'NXB Kim Đồng', 'Nguyễn Nhật Ánh', 'Thiếu nhi', 'Cho tôi xin một vé đi tuổi thơ', 'https://upload.wikimedia.org/wikipedia/vi/c/c9/Cho_t%C3%B4i_xin_m%E1%BB%99t_v%C3%A9_%C4%91i_tu%E1%BB%95i_th%C6%A1.jpg'
 ,'2020-05-10', 1, 1),
('978-604-2-67890-1', 5, 120000.00, 'NXB Trẻ', 'Nam Cao', 'Văn học', 'Chí Phèo', 'https://upload.wikimedia.org/wikipedia/commons/4/42/Chi_Pheo_cover_1957.jpg' , '2018-02-12', 1, 0),
('978-604-3-13579-2', 7, 145000.00, 'NXB Văn Học', 'Tô Hoài', 'Truyện dài', 'Dế Mèn Phiêu Lưu Ký', 'https://upload.wikimedia.org/wikipedia/commons/9/91/B%C3%ACa_D%E1%BA%BF_M%C3%A8n_Phi%C3%AAu_L%C6%B0u_K%C3%BD_c%E1%BB%A7a_NXB_T%C3%A2n_D%C3%A2n.jpg' , '2019-06-20', 1, 0),
('978-604-4-24680-3', 9, 89000.00, 'NXB Giáo Dục', 'Nguyễn Du', 'Thơ', 'Truyện Kiều', 'https://upload.wikimedia.org/wikipedia/commons/b/b7/%C4%90o%E1%BA%A1n_tr%C6%B0%E1%BB%9Dng_t%C3%A2n_thanh.png' , '2017-09-05', 1, 0),
('978-604-5-11223-4', 12, 99000.00, 'NXB Lao Động', 'Vũ Trọng Phụng', 'Hiện thực', 'Số đỏ', 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Sodobanindau.jpg/330px-Sodobanindau.jpg' , '2016-11-15', 1, 0),
('978-604-6-44556-5', 8, 135000.00, 'NXB Tri Thức', 'Ngô Tất Tố', 'Hiện thực', 'Tắt đèn', 'https://upload.wikimedia.org/wikipedia/vi/b/b1/T%E1%BA%AFt_%C4%91%C3%A8n-Nh%C3%A3_Nam.jpeg' , '2015-03-22', 1, 0),
('978-604-7-77889-6', 6, 200000.00, 'NXB Văn Nghệ', 'Hồ Biểu Chánh', 'Kinh điển', 'Ngọn cỏ gió đùa', 'https://ebookvie.com/wp-content/uploads/2023/12/ngon-co-gio-dua.jpg' , '2014-07-09', 1, 0),
('978-604-8-99001-7', 11, 75000.00, 'NXB Thanh Niên', 'Shakespeare', 'Kịch', 'Romeo và Juliet', 'https://upload.wikimedia.org/wikipedia/commons/5/55/Romeo_and_juliet_brown.jpg' , '2013-01-14', 1, 0),
('978-604-9-00001-1', 5, 140000.00, 'NXB Văn Học', 'Lỗ Tấn', 'Văn học', 'Ah Q chính truyện', 'https://m.media-amazon.com/images/I/41Jp8gZ3ewL.jpg', '2019-01-10', 1, 0), 
('978-604-9-00002-2', 7, 185000.00, 'NXB Thế Giới', 'Antoine de Saint-Exupéry', 'Thiếu nhi', 'Hoàng Tử Bé', 'https://upload.wikimedia.org/wikipedia/vi/thumb/0/05/Littleprince.JPG/330px-Littleprince.JPG', '2020-06-20', 1, 0), 
('978-604-9-00003-3', 12, 110000.00, 'NXB Trẻ', 'Ernest Hemingway', 'Văn học', 'Ông Già Và Biển Cả', 'https://upload.wikimedia.org/wikipedia/vi/thumb/7/73/Oldmansea.jpg/330px-Oldmansea.jpg', '2019-11-12', 1, 0), 
('978-604-9-00004-4', 10, 160000.00, 'NXB Kim Đồng', 'J.K. Rowling', 'Fantasy', 'Harry Potter và Hòn đá Phù thủy', 'https://upload.wikimedia.org/wikipedia/vi/5/51/Harry_Potter_v%C3%A0_H%C3%B2n_%C4%91%C3%A1_ph%C3%B9_th%E1%BB%A7y_b%C3%ACa_2003.jpeg', '2018-04-15', 1, 0), -- Harry Potter and the Sorcerer's Stone
('978-604-9-00005-5', 6, 155000.00, 'NXB Phụ Nữ', 'Harper Lee', 'Văn học', 'Giết Chết Con Chim Nhại', 'https://upload.wikimedia.org/wikipedia/vi/5/5c/Mockingbirdfirst.JPG', '2022-03-08', 1, 0), 
('978-604-9-00006-6', 8, 175000.00, 'NXB Văn Học', 'Victor Hugo', 'Kinh điển', 'Những Người Khốn Khổ (Tập 1)', 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Ebcosette.jpg/330px-Ebcosette.jpg', '2020-12-01', 1, 0),
('978-604-9-00007-7', 9, 130000.00, 'NXB Lao Động', 'Dale Carnegie', 'Kỹ năng sống', 'Đắc Nhân Tâm', 'https://tiemsach.org/wp-content/uploads/2023/07/Ebook-Dac-nhan-tam.jpg', '2017-07-11', 1, 0),
('978-604-9-00008-8', 4, 190000.00, 'NXB Kim Đồng', 'Lewis Carroll', 'Thiếu nhi', 'Alice ở Xứ Sở Thần Tiên', 'https://i.pinimg.com/originals/6f/db/71/6fdb71d70ff6137c8692c23283cc294f.gif', '2016-09-23', 1, 0),
('978-604-9-00009-9', 11, 105000.00, 'NXB Trẻ', 'James Steward', 'Math', 'calculus 1', 'https://testallbank.com/wp-content/uploads/2021/02/single-variable-calculus-early-transcendentals-8th-edition-stewart-solutions-manual.jpg', '2023-05-04', 1, 0),
('978-604-9-00010-0', 5, 125000.00, 'NXB Văn Học', 'Gabriel García Márquez', 'Huyền ảo', 'Trăm Năm Cô Đơn', 'https://upload.wikimedia.org/wikipedia/vi/7/7a/Tr%C4%83m_n%C4%83m_c%C3%B4_%C4%91%C6%A1n.jpg', '2021-08-30', 1, 0), 
('978-604-9-00011-1', 7, 145000.00, 'NXB Giáo Dục', 'Stephen Hawking', 'Khoa học', 'Lược Sử Thời Gian', 'https://upload.wikimedia.org/wikipedia/vi/6/6f/L%C6%B0%E1%BB%A3c_s%E1%BB%AD_th%E1%BB%9Di_gian.jpg', '2019-10-27', 1, 0), 
('978-604-9-00012-2', 9, 90000.00, 'NXB Tổng Hợp TP.HCM', 'Nguyễn Nhật Ánh', 'Thiếu nhi', 'Tôi Thấy Hoa Vàng Trên Cỏ Xanh', 'https://upload.wikimedia.org/wikipedia/vi/thumb/3/3d/T%C3%B4i_th%E1%BA%A5y_hoa_v%C3%A0ng_tr%C3%AAn_c%E1%BB%8F_xanh.jpg/330px-T%C3%B4i_th%E1%BA%A5y_hoa_v%C3%A0ng_tr%C3%AAn_c%E1%BB%8F_xanh.jpg', '2020-02-17', 1, 0);

INSERT INTO orders (
    RequestDate, ApplyBy, DocID, OrderBy, BorrowDay,
    ApprovedDate, DeliveryDate, ReceivedDate, ReturnDate, Price,
    PaymentStatus, Note, Address
) VALUES
('2025-01-05 10:00:00', 'LB001', 'DOC001', 'RD001', 10, '2025-01-06', '2025-01-08', '2025-01-07', '2025-01-20', 95000.00, 'Paid', 'Mượn đọc tại nhà', '123 Lê Lợi, Hà Nội'),
('2025-02-10 09:30:00', 'LB002', 'DOC002', 'RD002', 12, '2025-02-11', '2025-02-13', '2025-02-12', '2025-02-25', 120000.00, 'Paid', 'Mượn sách văn học', '45 Trần Hưng Đạo, Hà Nội'),
('2025-03-02 11:15:00', 'LB003', 'DOC003', 'RD003', 14, '2025-03-03', '2025-03-05', '2025-03-04', '2025-03-18', 145000.00, 'Unpaid', 'Chưa thanh toán', '56 Nguyễn Văn Cừ, Hà Nội'),
('2025-03-12 14:00:00', 'LB003', 'DOC004', 'RD004', 13, '2025-03-13', '2025-03-15', '2025-03-14', '2025-03-27', 89000.00, 'Paid', 'Mượn cho trẻ em', '89 Kim Mã, Hà Nội'),
('2025-04-15 08:45:00', 'LB004', 'DOC005', 'RD005', 15, '2025-04-16', '2025-04-18', '2025-04-17', '2025-05-01', 99000.00, 'Pending', 'Chờ duyệt', '102 Tôn Đức Thắng, Hà Nội'),
('2025-05-20 09:10:00', 'LB005', 'DOC006', 'RD006', 16, '2025-05-21', '2025-05-23', '2025-05-22', '2025-06-05', 135000.00, 'Paid', 'Mượn nghiên cứu', '21 Phan Chu Trinh, Hà Nội'),
('2025-06-10 13:00:00', 'LB006', 'DOC007', 'RD007', 14, '2025-06-11', '2025-06-13', '2025-06-12', '2025-06-25', 200000.00, 'Unpaid', 'Khách VIP trả chậm', '99 Nguyễn Chí Thanh, Hà Nội'),
('2025-07-15 15:20:00', 'LB007', 'DOC008', 'RD008', 10, '2025-07-16', '2025-07-18', '2025-07-17', '2025-07-30', 75000.00, 'Paid', 'Mượn kịch cổ điển', '12 Trương Định, Hà Nội'),
('2025-08-01 10:00:00', 'LB001', 'DOC009', 'RD009', 10, '2025-08-02', '2025-08-04', '2025-08-03', '2025-08-14', 75000.00, 'Paid', 'Mượn tại nhà', '200 Lê Lai, Hà Nội'),
('2025-08-03 10:30:00', 'LB002', 'DOC010', 'RD010', 12, '2025-08-04', '2025-08-06', '2025-08-05', '2025-08-17', 87000.00, 'Unpaid', 'Chờ thanh toán', '201 Lê Lai, Hà Nội'),
('2025-08-05 11:00:00', 'LB003', 'DOC011', 'RD011', 14, '2025-08-06', '2025-08-08', '2025-08-07', '2025-08-21', 92000.00, 'Paid', 'Mượn nghiên cứu', '202 Lê Lai, Hà Nội'),
('2025-08-07 11:30:00', 'LB004', 'DOC012', 'RD012', 15, '2025-08-08', '2025-08-10', '2025-08-09', '2025-08-24', 83000.00, 'Pending', 'Chờ duyệt', '203 Lê Lai, Hà Nội'),
('2025-08-09 12:00:00', 'LB001', 'DOC013', 'RD013', 10, '2025-08-10', '2025-08-12', '2025-08-11', '2025-08-21', 88000.00, 'Paid', 'Mượn tại thư viện', '204 Lê Lai, Hà Nội'),
('2025-08-11 12:30:00', 'LB002', 'DOC014', 'RD014', 12, '2025-08-12', '2025-08-14', '2025-08-13', '2025-08-26', 90000.00, 'Paid', 'Mượn phục vụ học tập', '205 Lê Lai, Hà Nội'),
('2025-08-13 13:00:00', 'LB003', 'DOC015', 'RD015', 14, '2025-08-14', '2025-08-16', '2025-08-15', '2025-08-29', 95000.00, 'Unpaid', 'Đang chờ xử lý', '206 Lê Lai, Hà Nội'),
('2025-08-15 13:30:00', 'LB004', 'DOC016', 'RD016', 15, '2025-08-16', '2025-08-18', '2025-08-17', '2025-09-01', 93000.00, 'Paid', 'Mượn nghiên cứu', '207 Lê Lai, Hà Nội'),
('2025-08-17 14:00:00', 'LB001', 'DOC017', 'RD017', 10, '2025-08-18', '2025-08-20', '2025-08-19', '2025-08-29', 87000.00, 'Paid', 'Mượn tại nhà', '208 Lê Lai, Hà Nội'),
('2025-08-19 14:30:00', 'LB002', 'DOC018', 'RD018', 12, '2025-08-20', '2025-08-22', '2025-08-21', '2025-09-02', 89000.00, 'Unpaid', 'Chờ duyệt', '209 Lê Lai, Hà Nội'),
('2025-08-21 15:00:00', 'LB003', 'DOC019', 'RD019', 14, '2025-08-22', '2025-08-24', '2025-08-23', '2025-09-06', 92000.00, 'Paid', 'Mượn nghiên cứu', '210 Lê Lai, Hà Nội'),
('2025-08-23 15:30:00', 'LB004', 'DOC020', 'RD020', 15, '2025-08-24', '2025-08-26', '2025-08-25', '2025-09-09', 94000.00, 'Pending', 'Mượn tại thư viện', '211 Lê Lai, Hà Nội');

