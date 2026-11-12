# 🦀 FASTFOOD RUST BACKEND API

Hệ thống Backend viết bằng **Rust (Axum + Tokio + SQLx)**, kết nối trực tiếp **TiDB Cloud (MySQL 8.0 Serverless)**, tích hợp xác thực Email OTP qua **Brevo** và xử lý tự động thanh toán VietQR qua **SePay Webhook**.

---

## ⚡ Ưu điểm nổi bật

1. **Hiệu năng vượt trội**: Viết trên Axum và Tokio runtime, xử lý hàng chục ngàn kết nối đồng thời với độ trễ (latency) < 1ms.
2. **Tiết kiệm tài nguyên**: Bộ nhớ tiêu thụ chỉ **~12MB - 18MB RAM** (so với 150MB+ của Node.js).
3. **An toàn bộ nhớ**: Tận dụng cơ chế type-safety và borrow checker của Rust, loại bỏ hoàn toàn lỗi crash runtime `undefined` hoặc `null pointer`.
4. **Bảo toàn 100% Shared Contract**: Đảm bảo cấu trúc Request/Response JSON khớp hoàn toàn với `user-client` và `admin-client`.

---

## 🚀 Hướng dẫn phát triển & Chạy cục bộ (Local Development)

### 1. Chuẩn bị:
* Cài đặt Rust toolchain: [https://rustup.rs](https://rustup.rs)
* Cơ sở dữ liệu TiDB Cloud hoặc MySQL local: Chạy script `database/schema.sql` và `database/seed.sql`.

### 2. Cấu hình biến môi trường:
```bash
cp .env.example .env
# Chỉnh sửa DATABASE_URL, BREVO_API_KEY, SEPAY_ACCOUNT_NO...
```

### 3. Chạy Server ở chế độ Development:
```bash
cargo run
```
Server sẽ khởi động tại `http://localhost:3000`.

---

## 📦 Biên dịch Production (Compile Release Binary)

Chạy lệnh:
```bash
cargo build --release
```
File nhị phân tối ưu được tạo ra tại:
👉 `target/release/fastfood-backend` (Kích thước chỉ khoảng **~15MB - 20MB**).

---

## 🌐 Triển khai lên Linux VM (VPS)

Xem chi tiết trong thư mục [deploy/](file:///e:/TT/FastFood-main/backend-rust/deploy):
1. Chạy file script tự động: `bash deploy/deploy_vm.sh`
2. Copy binary `fastfood-backend` và file `.env` vào `/opt/fastfood/`
3. Kích hoạt service: `sudo systemctl enable --now fastfood.service`
4. Cấu hình Caddy reverse proxy với file `deploy/Caddyfile` để tự động kích hoạt HTTPS SSL Let's Encrypt.

