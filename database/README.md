# HƯỚNG DẪN IMPORT DATABASE VÀO TIDB CLOUD (MYSQL)

## Cách 1: Sử dụng Web Console (Nhanh nhất - Không cần cài đặt phần mềm)

1. Đăng nhập vào trang quản trị: **[https://tidbcloud.com](https://tidbcloud.com)**
2. Chọn Cluster Serverless của bạn.
3. Ở menu bên trái, chọn tab **SQL Editor**.
4. Mở file [schema.sql](file:///e:/TT/FastFood-main/database/schema.sql), sao chép toàn bộ nội dung và dán vào SQL Editor ➔ Nhấn **Run** (Ctrl + Enter) để tạo bảng.
5. Tiếp tục mở file [seed.sql](file:///e:/TT/FastFood-main/database/seed.sql), sao chép toàn bộ nội dung và dán vào SQL Editor ➔ Nhấn **Run** để nạp dữ liệu mẫu ban đầu.

---

## Cách 2: Sử dụng lệnh MySQL CLI hoặc DBeaver / DataGrip

Từ terminal máy tính có cài sẵn client mysql:
```bash
# Kết nối và chạy schema
mysql --connect-timeout 15 -u '<TIDB_USER>' -h '<TIDB_HOST>' -P 4000 -D fastfood_db --ssl-mode=VERIFY_IDENTITY --ssl-ca=/path/to/ca.pem -p < database/schema.sql

# Nạp dữ liệu seed
mysql --connect-timeout 15 -u '<TIDB_USER>' -h '<TIDB_HOST>' -P 4000 -D fastfood_db --ssl-mode=VERIFY_IDENTITY --ssl-ca=/path/to/ca.pem -p < database/seed.sql
```

---

## 🔑 Tài khoản mẫu được tạo sẵn trong Seed Data:

* **Tài khoản Quản trị (Admin)**:
  * Email: `admin@food.com`
  * Mật khẩu: `Admin@123`
* **Tài khoản Người dùng (User)**:
  * Email: `user1@mem.com` (hoặc `user2@mem.com`)
  * Mật khẩu: `Admin@123`

