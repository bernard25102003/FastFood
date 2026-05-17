# TÀI LIỆU ĐẶC TẢ CHI TIẾT DỰ ÁN
## NỀN TẢNG THƯƠNG MỤC ĐIỆN TỬ ĐẶT ĐỒ ĂN NHANH TRỰC TUYẾN

**Ngày lập:** Tháng 5 năm 2026  
**Phiên bản:** 1.0  
**Trạng thái:** Hoàn thành

---

# PHẦN I: HỆ THỐNG THÔNG TIN QUẢN LÍ

## 1. TỔNG QUAN DỰ ÁN

### 1.1 Định Nghĩa Dự Án
Dự án xây dựng nền tảng thương mục điện tử (E-Commerce Platform) chuyên biệt hóa cho lĩnh vực dịch vụ ăn uống - cụ thể là đặt đồ ăn nhanh trực tuyến. Nền tảng này kết nối giữa nhà cung cấp (quản trị viên), khách hàng (người dùng), và hệ thống thanh toán, quản lí hàng tồn kho, đơn hàng và đánh giá sản phẩm.

### 1.2 Mục Tiêu Kinh Doanh
1. **Tăng cường kênh bán hàng**: Cung cấp thêm một kênh bán hàng trực tuyến ngoài cửa hàng truyền thống
2. **Cải thiện trải nghiệm khách hàng**: Cho phép khách hàng đặt hàng tiện lợi 24/7 từ bất kỳ đâu
3. **Tối ưu hóa quản trị**: Tự động hóa quy trình quản lí đơn hàng, sản phẩm, danh mục
4. **Tăng doanh thu**: Mở rộng thị trường và giảm chi phí vận hành
5. **Xây dựng lòng tin**: Qua hệ thống đánh giá và nhận xét minh bạch

### 1.3 Các Bên Liên Quan (Stakeholder)
| Bên Liên Quan | Vai Trò | Lợi Ích |
|---|---|---|
| **Khách hàng (Users)** | Người sử dụng cuối | Đặt hàng dễ dàng, theo dõi đơn hàng, đánh giá sản phẩm |
| **Quản trị viên (Admin)** | Người quản lí hệ thống | Quản lí sản phẩm, danh mục, đơn hàng, xem báo cáo |
| **Chủ doanh nghiệp** | Chủ sở hữu | Tăng doanh thu, tối ưu chi phí |
| **Đội phát triển** | Developer, BA, QA | Xây dựng và bảo trì hệ thống |
| **Khách hàng tiềm năng** | Thị trường mở rộng | Dễ tìm hiểu, mua sắm sản phẩm |

---

## 2. PHÂN TÍCH NHU CẦU KINH DOANH

### 2.1 Bối Cảnh Hiện Tại
- **Vấn đề hiện tại**: Bán hàng chỉ tập trung tại cửa hàng, khách phải tới trực tiếp hoặc gọi điện
- **Cơ hội**: Xu hướng mua sắm trực tuyến ngày càng phổ biến
- **Thị trường**: Nhu cầu cao từ người bận rộn, muốn tiết kiệm thời gian

### 2.2 Yêu Cầu Chức Năng Chính

#### A. Phía Khách Hàng (User)
1. **Duyệt sản phẩm**
   - Xem danh sách sản phẩm theo danh mục
   - Tìm kiếm sản phẩm theo tên, giá, đánh giá
   - Sắp xếp theo giá, lượng bán, đánh giá
   - Xem thông tin chi tiết sản phẩm (ảnh, giá, mô tả, số lượng bán, đánh giá)

2. **Quản lí giỏ hàng**
   - Thêm sản phẩm vào giỏ hàng
   - Xóa sản phẩm khỏi giỏ hàng
   - Cập nhật số lượng
   - Xem tổng giá tiền

3. **Thanh toán**
   - Nhập thông tin giao hàng (tên, số điện thoại, địa chỉ)
   - Chọn phương thức thanh toán (COD, Chuyển khoản)
   - Xác nhận đơn hàng

4. **Theo dõi đơn hàng**
   - Xem trạng thái đơn hàng (Chờ xác nhận, Đã xác nhận, Đang giao, Hoàn thành)
   - Xem lịch sử đơn hàng

5. **Đánh giá sản phẩm**
   - Viết bình luận, đánh giá sao (1-5) cho sản phẩm
   - Xem đánh giá của khách hàng khác

#### B. Phía Quản Trị Viên (Admin)
1. **Quản lí sản phẩm**
   - Thêm, sửa, xóa sản phẩm
   - Upload ảnh sản phẩm (hỗ trợ gallery)
   - Quản lí giá, mô tả, số lượng tồn kho

2. **Quản lí danh mục**
   - Tạo, cập nhật danh mục
   - Phân loại sản phẩm vào danh mục

3. **Quản lí đơn hàng**
   - Xem danh sách đơn hàng
   - Cập nhật trạng thái đơn hàng
   - Xem chi tiết đơn hàng (khách hàng, sản phẩm, giá, địa chỉ giao)
   - Hủy đơn hàng

4. **Quản lí người dùng**
   - Xem danh sách người dùng
   - Khóa/mở khóa tài khoản

5. **Báo cáo & Thống kê**
   - Doanh thu theo ngày/tháng
   - Sản phẩm bán chạy nhất
   - Số lượng đơn hàng
   - Khách hàng mới

### 2.3 Yêu Cầu Phi Chức Năng
| Yêu Cầu | Mô Tả | Mục Tiêu |
|---|---|---|
| **Hiệu suất** | Thời gian tải trang | < 2 giây |
| **Khả dụng** | Uptime hệ thống | 99% |
| **Bảo mật** | Mã hóa dữ liệu, xác thực | Bảo vệ thông tin khách hàng |
| **Khả năng mở rộng** | Hỗ trợ tăng số người dùng | Từ 1K đến 100K người dùng |
| **Tính nhất quán** | Dữ liệu không mâu thuẫn | ACID compliance |
| **Khả năng phục hồi** | Backup & recovery | Khôi phục dữ liệu < 1 giờ |

---

## 3. CÁC QUY TRÌNH KINH DOANH

### 3.1 Quy Trình Đặt Hàng
```
┌─────────────────────────────────────────────────────┐
│ 1. Khách hàng duyệt sản phẩm                        │
│    - Xem danh mục                                   │
│    - Tìm kiếm, sắp xếp                              │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────v──────────────────────────────────┐
│ 2. Thêm sản phẩm vào giỏ hàng                       │
│    - Chọn số lượng                                  │
│    - Cập nhật giỏ                                   │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────v──────────────────────────────────┐
│ 3. Thanh toán                                       │
│    - Nhập thông tin giao hàng                       │
│    - Chọn phương thức thanh toán                    │
│    - Xác nhận đơn hàng                              │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────v──────────────────────────────────┐
│ 4. Tạo đơn hàng (Status: PENDING)                  │
│    - Lưu thông tin khách hàng                       │
│    - Lưu danh sách sản phẩm                         │
│    - Tính tổng giá tiền                             │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────v──────────────────────────────────┐
│ 5. Gửi email xác nhận                               │
│    - Thông báo đơn hàng tới khách hàng              │
└─────────────────────────────────────────────────────┘
```

### 3.2 Quy Trình Xử Lí Đơn Hàng (Admin)
```
Pending (Chờ xác nhận)
   ↓
Confirmed (Đã xác nhận) ← Admin duyệt
   ↓
Shipping (Đang giao) ← Admin giao cho shipper
   ↓
Completed (Hoàn thành) ← Khách nhận hàng
   ↓ (hoặc)
Cancelled (Hủy) ← Có vấn đề
```

### 3.3 Quy Trình Đánh Giá Sản Phẩm
```
1. Khách hàng nhận hàng
   ↓
2. Truy cập trang chi tiết sản phẩm
   ↓
3. Viết bình luận & chọn sao (1-5)
   ↓
4. Gửi đánh giá
   ↓
5. Cập nhật avg_rating, review_count
```

---

## 4. QUẢN LÍ THÔNG TIN

### 4.1 Các Thực Thể Chính (Entities)

#### User (Người Dùng)
| Trường | Kiểu | Mô Tả |
|---|---|---|
| id | UUID | Mã người dùng duy nhất |
| name | String | Tên người dùng |
| email | String | Email (duy nhất) |
| phone | String | Số điện thoại |
| address | String | Địa chỉ |
| role | Enum | 'user' \| 'admin' |
| status | Enum | 'active' \| 'locked' |
| createdAt | DateTime | Ngày tạo |

#### Category (Danh Mục)
| Trường | Kiểu | Mô Tả |
|---|---|---|
| id | UUID | Mã danh mục |
| name | String | Tên danh mục |
| createdAt | DateTime | Ngày tạo |

#### Product (Sản Phẩm)
| Trường | Kiểu | Mô Tả |
|---|---|---|
| id | UUID | Mã sản phẩm |
| name | String | Tên sản phẩm |
| price | Decimal | Giá bán |
| description | String | Mô tả chi tiết |
| categoryId | UUID | Mã danh mục |
| images | Array | Danh sách ảnh (URL) |
| soldCount | Integer | Số lượng đã bán |
| avgRating | Decimal | Đánh giá trung bình (1-5) |
| reviewCount | Integer | Số lượng đánh giá |
| createdAt | DateTime | Ngày tạo |

#### Order (Đơn Hàng)
| Trường | Kiểu | Mô Tả |
|---|---|---|
| id | UUID | Mã đơn hàng |
| userId | UUID | Mã khách hàng |
| totalPrice | Decimal | Tổng giá tiền |
| status | Enum | pending \| confirmed \| shipping \| completed \| cancelled |
| paymentMethod | Enum | 'COD' \| 'BANK_TRANSFER' |
| customerName | String | Tên khách hàng |
| customerPhone | String | Điện thoại khách |
| customerAddress | String | Địa chỉ giao hàng |
| items | Array | Danh sách sản phẩm trong đơn |
| createdAt | DateTime | Ngày đặt |
| updatedAt | DateTime | Ngày cập nhật |

#### OrderItem (Chi Tiết Đơn Hàng)
| Trường | Kiểu | Mô Tả |
|---|---|---|
| id | UUID | Mã chi tiết |
| orderId | UUID | Mã đơn hàng |
| productId | UUID | Mã sản phẩm |
| name | String | Tên sản phẩm |
| price | Decimal | Giá khi đặt |
| image | String | Ảnh sản phẩm |
| quantity | Integer | Số lượng |

#### Review (Đánh Giá)
| Trường | Kiểu | Mô Tả |
|---|---|---|
| id | UUID | Mã đánh giá |
| userId | UUID | Mã người dùng |
| productId | UUID | Mã sản phẩm |
| rating | Integer | Điểm sao (1-5) |
| comment | String | Bình luận |
| createdAt | DateTime | Ngày tạo |

### 4.2 Sơ Đồ Quan Hệ Thực Thể (ERD)
```
┌─────────────┐
│   User      │
├─────────────┤
│ id (PK)     │──────┐
│ name        │      │
│ email       │      │
│ phone       │      │
│ address     │      │
│ role        │      │
│ status      │      │
└─────────────┘      │
                     │
                ┌────┴────────────────┐
                │                     │
┌──────────────v──────┐    ┌─────────v──────────┐
│     Order           │    │     Review         │
├─────────────────────┤    ├────────────────────┤
│ id (PK)             │    │ id (PK)            │
│ userId (FK)         │◄───┤ userId (FK)        │
│ totalPrice          │    │ productId (FK)     │
│ status              │    │ rating             │
│ paymentMethod       │    │ comment            │
│ customerName        │    │ createdAt          │
│ customerPhone       │    └────────────────────┘
│ customerAddress     │
│ createdAt           │    ┌─────────────────────┐
└─────────────────────┘    │  Category           │
        │                  ├─────────────────────┤
        │                  │ id (PK)             │
        │      ┌───────────┼─ name              │
        │      │           └─────────────────────┘
        │      │                    │
┌───────┴──────v──────┐      ┌──────v──────────┐
│   OrderItem         │      │   Product       │
├─────────────────────┤      ├─────────────────┤
│ id (PK)             │      │ id (PK)         │
│ orderId (FK)        │      │ name            │
│ productId (FK)      │◄─────┼─ categoryId(FK) │
│ name                │      │ price           │
│ price               │      │ description     │
│ image               │      │ images[]        │
│ quantity            │      │ soldCount       │
└─────────────────────┘      │ avgRating       │
                             │ reviewCount     │
                             │ createdAt       │
                             └─────────────────┘
```

---

## 5. CHIẾN LƯỢC TIẾP THị & HOẠT ĐỘNG

### 5.1 Chiến Lược Tiếp Thị
- **Kênh trực tuyến**: Website, ứng dụng di động
- **Kênh truyền thông xã hội**: Facebook, Instagram quảng cáo các sản phẩm nổi bật
- **Chương trình khuyến mãi**: Giảm giá cho khách hàng mới, mã coupon
- **Email marketing**: Thông báo sản phẩm mới, khuyến mãi

### 5.2 Chi Phí Vận Hành
| Mục | Chi Phí Ước Tính |
|---|---|
| Máy chủ (Cloud hosting) | $50-200/tháng |
| Domain & SSL | $20/năm |
| Dịch vụ email | $0 (built-in) |
| Lưu trữ ảnh (ImageKit) | $50-200/tháng |
| Nhân lực (2-4 người) | $5,000-10,000/tháng |
| **Tổng cộng** | **$5,000-10,500/tháng** |

---

# PHẦN II: HỆ THỐNG THÔNG TIN TÍCH HỢP

## 1. KIẾN TRÚC HỆ THỐNG TỔNG THỂ

### 1.1 Sơ Đồ Kiến Trúc Tổng Thể
```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                         │
├──────────────────────────┬──────────────────────────────────┤
│  User Client (React)     │  Admin Client (React)             │
│  - Duyệt sản phẩm        │  - Quản lí sản phẩm               │
│  - Đặt hàng              │  - Quản lí đơn hàng               │
│  - Theo dõi đơn hàng     │  - Quản lí người dùng             │
│  - Đánh giá              │  - Xem báo cáo thống kê            │
└──────────────────────────┴───────────────┬────────────────────┘
                                          │
                   ┌──────────────────────┼──────────────────────┐
                   │                      │                      │
                   ▼                      ▼                      ▼
           ┌────────────────────────────────────────┐
           │      API Gateway (Express.js)          │
           │  - Rate Limiting                       │
           │  - Authentication (JWT)                │
           │  - Logging & Monitoring                │
           └────────────────────────────────────────┘
                   │
         ┌─────────┴─────────┬──────────────────┐
         │                   │                  │
         ▼                   ▼                  ▼
    ┌──────────┐      ┌──────────┐      ┌──────────┐
    │ Auth     │      │ Product  │      │ Order    │
    │ Service  │      │ Service  │      │ Service  │
    └────┬─────┘      └────┬─────┘      └────┬─────┘
         │                 │                  │
         └─────────────────┼──────────────────┘
                          │
            ┌─────────────┴────────────────┐
            │                              │
            ▼                              ▼
      ┌──────────────┐          ┌──────────────────┐
      │ PostgreSQL   │          │ Redis Cache      │
      │ Database     │          │ (Optional)       │
      └──────────────┘          └──────────────────┘
            │
    ┌───────┴───────┐
    │               │
    ▼               ▼
┌──────────┐  ┌────────────┐
│Prisma    │  │Migrations  │
│ORM       │  │            │
└──────────┘  └────────────┘

┌──────────────────────────┐
│   External Services      │
├──────────────────────────┤
│ ImageKit (Image Upload)  │
│ Email Service            │
│ Payment Gateway          │
└──────────────────────────┘
```

### 1.2 Stack Công Nghệ

#### Backend
| Công Nghệ | Phiên Bản | Mục Đích |
|---|---|---|
| Node.js | 18+ | Runtime |
| Express.js | 4.19+ | Web Framework |
| TypeScript | 5.x | Ngôn ngữ lập trình |
| PostgreSQL | 14+ | Database |
| Prisma | 5.x | ORM |
| JWT | - | Xác thực |
| bcryptjs | 2.x | Mã hóa mật khẩu |
| Zod | 3.x | Validation |
| Winston | 3.x | Logging |
| Jest | 29.x | Unit testing |
| Supertest | - | API testing |

#### Frontend
| Công Nghệ | Phiên Bản | Mục Đích |
|---|---|---|
| React | 18.x | UI Library |
| Vite | 6.x | Build tool |
| TypeScript | 5.x | Ngôn ngữ |
| TailwindCSS | 4.x | Styling |
| Radix UI | Latest | UI Components |
| React Router | 7.x | Routing |
| React Hook Form | 7.x | Form management |
| Zustand/Context | - | State management |

#### DevOps & Deployment
| Công Nghệ | Mục Đích |
|---|---|
| Docker | Containerization |
| Docker Compose | Multi-container orchestration |
| GitHub Actions | CI/CD |
| ESLint | Code linting |
| Prettier | Code formatting |

---

## 2. THIẾT KẾ KIẾN TRÚC CHI TIẾT

### 2.1 Cấu Trúc Backend

#### 2.1.1 Thư Mục Project
```
backend/
├── src/
│   ├── config/
│   │   ├── env.ts              # Environment variables
│   │   ├── prisma.ts           # Prisma client
│   │   ├── cache.ts            # Redis cache config
│   │   ├── imagekit.ts         # ImageKit config
│   │   └── swagger.ts          # Swagger setup
│   ├── middleware/
│   │   ├── auth.ts             # JWT authentication
│   │   ├── errorHandler.ts     # Global error handler
│   │   ├── rateLimiter.ts      # Rate limiting
│   │   ├── requestLogger.ts    # Request logging
│   │   ├── responseHandler.ts  # Response formatting
│   │   └── validate.ts         # Zod validation
│   ├── modules/                # Feature modules
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.routes.ts
│   │   │   └── auth.validator.ts
│   │   ├── users/
│   │   ├── categories/
│   │   ├── products/
│   │   ├── orders/
│   │   └── reviews/
│   ├── types/
│   │   ├── auth.ts             # Auth types
│   │   ├── error.ts            # Error types
│   │   └── response.ts         # Response types
│   ├── utils/
│   │   ├── asyncHandler.ts     # Async error wrapper
│   │   ├── helpers.ts          # Helper functions
│   │   ├── logger.ts           # Logger setup
│   │   └── validators.ts       # Reusable validators
│   └── main.ts                 # Entry point
├── prisma/
│   ├── schema.prisma           # Data model
│   ├── seed.ts                 # Database seed
│   └── migrations/             # Migration files
├── tests/
│   ├── setup.ts                # Jest setup
│   ├── helpers/
│   │   ├── factories.ts        # Test data factories
│   │   └── testApp.ts          # Test app setup
│   ├── unit/                   # Unit tests
│   └── integration/            # Integration tests
├── docker-compose.yml
├── Dockerfile
├── package.json
├── tsconfig.json
├── jest.config.ts
└── README.md
```

#### 2.1.2 Mẫu Module (Module Pattern)
Mỗi feature module (auth, products, orders, ...) theo cấu trúc sau:

```
module/
├── [module].controller.ts      # HTTP handlers
├── [module].service.ts         # Business logic
├── [module].routes.ts          # Route definitions
├── [module].validator.ts       # Input validation
└── types.ts                    # Types for module
```

**Ví dụ: Product Module**
```typescript
// products.controller.ts
export async function getProducts(req, res) {
  // HTTP handler
}

// products.service.ts
export async function fetchProducts() {
  // Business logic - call Prisma
}

// products.routes.ts
router.get('/', getProducts);

// products.validator.ts
export const createProductSchema = z.object({...});
```

### 2.2 Cấu Trúc Frontend

#### 2.2.1 User Client (e:\TT\HoangBeo\appthi\user-client)
```
user-client/
├── src/
│   ├── app/
│   │   ├── App.tsx             # Main component
│   │   ├── routes.tsx          # Route configuration
│   │   ├── types.ts            # Global types
│   │   ├── components/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── ProductCard.tsx
│   │   │   ├── Cart.tsx
│   │   │   └── ...
│   │   ├── contexts/
│   │   │   ├── AuthContext.tsx
│   │   │   ├── CartContext.tsx
│   │   │   └── ThemeContext.tsx
│   │   ├── pages/
│   │   │   ├── HomePage.tsx
│   │   │   ├── ProductsPage.tsx
│   │   │   ├── ProductDetailPage.tsx
│   │   │   ├── CartPage.tsx
│   │   │   ├── CheckoutPage.tsx
│   │   │   ├── OrderHistoryPage.tsx
│   │   │   └── LoginPage.tsx
│   │   ├── services/
│   │   │   ├── api.ts          # API client
│   │   │   ├── auth.service.ts
│   │   │   ├── product.service.ts
│   │   │   ├── order.service.ts
│   │   │   └── review.service.ts
│   │   └── styles/
│   ├── main.tsx                # Entry point
│   └── index.html
├── vite.config.ts
├── tailwind.config.js
└── package.json
```

#### 2.2.2 Admin Client
```
admin-client/
├── src/
│   ├── app/
│   │   ├── App.tsx
│   │   ├── components/
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── DataTable.tsx
│   │   │   └── ...
│   │   ├── contexts/
│   │   │   └── AdminAuthContext.tsx
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Products.tsx
│   │   │   ├── Categories.tsx
│   │   │   ├── Orders.tsx
│   │   │   ├── Users.tsx
│   │   │   ├── Reviews.tsx
│   │   │   └── LoginPage.tsx
│   │   ├── services/
│   │   │   ├── admin.api.ts
│   │   │   └── ...
│   │   └── data/
│   │       └── mockData.ts
│   ├── main.tsx
│   └── index.html
└── package.json
```

---

## 3. THIẾT KẾ API (API Specification)

### 3.1 Tổng Quan API
- **Base URL**: `http://localhost:3000/api`
- **Authentication**: JWT Bearer Token
- **Response Format**: JSON
- **Versioning**: URL-based (`/api/v1/...`)

### 3.2 Các API Endpoint

#### 3.2.1 Authentication Module
```
POST   /api/auth/register         # Đăng ký
POST   /api/auth/login            # Đăng nhập
POST   /api/auth/logout           # Đăng xuất
POST   /api/auth/refresh-token    # Làm mới token
GET    /api/auth/me               # Thông tin user hiện tại
```

**Ví dụ: Login**
```json
// Request
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

// Response 200 OK
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "user@example.com",
      "role": "user"
    },
    "token": "jwt_token_here",
    "refreshToken": "refresh_token_here"
  }
}
```

#### 3.2.2 Products Module
```
GET    /api/products              # Lấy danh sách sản phẩm (user)
GET    /api/products/:id          # Chi tiết sản phẩm
GET    /api/categories            # Lấy danh mục

// Admin only
POST   /api/admin/products        # Tạo sản phẩm
PUT    /api/admin/products/:id    # Cập nhật sản phẩm
DELETE /api/admin/products/:id    # Xóa sản phẩm
POST   /api/admin/categories      # Tạo danh mục
```

**Ví dụ: Get Products with Filters**
```json
// Request
GET /api/products?categoryId=uuid&sort=price&order=asc&search=pizza

// Response 200 OK
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "name": "Margherita Pizza",
        "price": 8.99,
        "description": "Classic pizza",
        "images": ["url1", "url2"],
        "soldCount": 150,
        "avgRating": 4.5,
        "reviewCount": 32,
        "categoryId": "uuid"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100
    }
  }
}
```

#### 3.2.3 Orders Module
```
// User
POST   /api/orders               # Tạo đơn hàng
GET    /api/orders              # Lấy danh sách đơn hàng của user
GET    /api/orders/:id          # Chi tiết đơn hàng

// Admin
GET    /api/admin/orders        # Lấy tất cả đơn hàng
PUT    /api/admin/orders/:id    # Cập nhật trạng thái
DELETE /api/admin/orders/:id    # Hủy đơn hàng
```

**Ví dụ: Create Order**
```json
// Request
POST /api/orders
{
  "items": [
    {
      "productId": "uuid",
      "quantity": 2
    }
  ],
  "customerName": "John Doe",
  "customerPhone": "0123456789",
  "customerAddress": "123 Main St",
  "paymentMethod": "COD"
}

// Response 201 Created
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "status": "pending",
    "totalPrice": 25.98,
    "items": [...],
    "createdAt": "2026-05-07T10:30:00Z"
  }
}
```

#### 3.2.4 Reviews Module
```
POST   /api/reviews              # Tạo đánh giá
GET    /api/products/:id/reviews # Lấy đánh giá sản phẩm
```

### 3.3 HTTP Status Codes
| Code | Ý Nghĩa |
|---|---|
| 200 | OK - Thành công |
| 201 | Created - Tài nguyên được tạo |
| 400 | Bad Request - Dữ liệu không hợp lệ |
| 401 | Unauthorized - Chưa xác thực |
| 403 | Forbidden - Không có quyền |
| 404 | Not Found - Không tìm thấy |
| 429 | Too Many Requests - Vượt quá giới hạn |
| 500 | Internal Server Error - Lỗi hệ thống |

### 3.4 Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

---

## 4. THIẾT KẾ DATABASE

### 4.1 Schema Prisma (Simplified)
```prisma
model User {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  phone     String?
  address   String?
  password  String
  role      String   @default("user")  // "user" | "admin"
  status    String   @default("active") // "active" | "locked"
  
  orders    Order[]
  reviews   Review[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Category {
  id        String    @id @default(cuid())
  name      String    @unique
  products  Product[]
  
  createdAt DateTime @default(now())
}

model Product {
  id          String     @id @default(cuid())
  name        String
  price       Decimal    @db.Decimal(10, 2)
  description String     @db.Text
  categoryId  String
  category    Category   @relation(fields: [categoryId], references: [id])
  
  images      String[]   @default([])
  soldCount   Int        @default(0)
  avgRating   Decimal    @default(0) @db.Decimal(3, 2)
  reviewCount Int        @default(0)
  
  orderItems  OrderItem[]
  reviews     Review[]
  
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
}

model Order {
  id                String      @id @default(cuid())
  userId            String
  user              User        @relation(fields: [userId], references: [id])
  
  totalPrice        Decimal     @db.Decimal(12, 2)
  status            String      @default("pending")
  paymentMethod     String
  
  customerName      String
  customerPhone     String
  customerAddress   String
  
  items             OrderItem[]
  
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
}

model OrderItem {
  id        String   @id @default(cuid())
  orderId   String
  order     Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  productId String
  product   Product  @relation(fields: [productId], references: [id])
  
  name      String
  price     Decimal  @db.Decimal(10, 2)
  image     String
  quantity  Int
  
  createdAt DateTime @default(now())
}

model Review {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  productId String
  product   Product  @relation(fields: [productId], references: [id])
  
  rating    Int      @db.SmallInt // 1-5
  comment   String   @db.Text
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### 4.2 Lưu Ý Thiết Kế Database
- **Normalization**: Tuân theo 3NF
- **Indexes**: Tạo index cho các trường thường xuyên query (email, categoryId, userId)
- **Foreign Keys**: Bảo toàn tính toàn vẹn dữ liệu
- **Soft Delete**: Có thể thêm `deletedAt` cho các thực thể quan trọng

---

## 5. LUỒNG TÍCH HỢP HỆ THỐNG

### 5.1 Luồng Đăng Nhập
```
User enters email/password
        ↓
Frontend validates input (Zod)
        ↓
POST /api/auth/login
        ↓
Backend validates (Zod)
        ↓
Check email exists
        ↓
Compare password (bcryptjs)
        ↓
Generate JWT token
        ↓
Return token + user info
        ↓
Frontend stores token (localStorage)
        ↓
Frontend includes token in Authorization header
```

### 5.2 Luồng Đặt Hàng
```
User selects products → Adds to cart → Proceeds to checkout
        ↓
Frontend validates cart items
        ↓
POST /api/orders
        ↓
Backend middleware: Verify JWT
        ↓
Validate order data (Zod)
        ↓
Fetch product details from DB
        ↓
Calculate total price
        ↓
Create order with status "pending"
        ↓
Create order items
        ↓
Send confirmation email
        ↓
Return order details
        ↓
Frontend shows confirmation
```

### 5.3 Luồng Upload Ảnh Sản Phẩm
```
Admin selects image
        ↓
Frontend sends to backend via multipart/form-data
        ↓
Backend receives file
        ↓
Validate file type (image/jpeg, image/png)
        ↓
Send to ImageKit
        ↓
ImageKit returns URL
        ↓
Save URL to database
        ↓
Return URL to frontend
```

---

## 6. BẢO MẬT & KIỂM SOÁT TRUY CẬP

### 6.1 Authentication (Xác Thực)
- **Method**: JWT (JSON Web Token)
- **Secret**: Stored in `.env`
- **Expiry**: Access token 24h, Refresh token 7 days
- **Algorithm**: HS256

### 6.2 Authorization (Phân Quyền)
| Endpoint | User | Admin |
|---|---|---|
| GET /products | ✓ | ✓ |
| POST /orders | ✓ | ✓ |
| POST /admin/products | ✗ | ✓ |
| DELETE /admin/products | ✗ | ✓ |
| PUT /admin/orders/:id | ✗ | ✓ |

### 6.3 Bảo Mật Dữ Liệu
- **Passwords**: Hash với bcryptjs (salt rounds: 10)
- **Sensitive Data**: Không log password, tokens
- **Database**: SSL/TLS connection
- **API**: HTTPS enforced
- **CORS**: Chỉ cho phép origins được phép
- **Rate Limiting**: 100 requests/15 minutes per IP

### 6.4 Input Validation
- Frontend: Zod validation
- Backend: Zod validation (double validation)
- Sanitize: Loại bỏ HTML tags trong text fields

---

# PHẦN III: QUẢN TRỊ DỰ ÁN PHẦN MỀM

## 1. PHẠM VI DỰ ÁN

### 1.1 Mục Tiêu
Phát triển một nền tảng e-commerce đầy đủ cho lĩnh vực ăn uống, gồm:
1. **Backend API**: REST API đầy đủ chức năng
2. **Frontend User**: Website đặt hàng cho khách hàng
3. **Frontend Admin**: Dashboard quản lí cho nhân viên
4. **DevOps**: Deployment, CI/CD, monitoring

### 1.2 Phạm Vi Bao Gồm (In Scope)
- [x] Quản lí sản phẩm & danh mục
- [x] Quản lí đơn hàng
- [x] Hệ thống xác thực (User & Admin)
- [x] Hệ thống đánh giá
- [x] Upload ảnh
- [x] API Documentation
- [x] Unit & Integration Tests
- [x] Deployment

### 1.3 Phạm Vi Không Bao Gồm (Out of Scope)
- [ ] Mobile app (iOS/Android)
- [ ] AI recommendation engine
- [ ] Multi-language support
- [ ] Advanced analytics
- [ ] Payment gateway integration (chỉ UI mockup)
- [ ] Real-time notifications
- [ ] Inventory management system

---

## 2. KỲ CÔNG VIỆC & TIMELINE

### 2.1 Tổng Thời Gian Dự Tính
**Tổng duration: 5 phases, ~6 tháng**

### 2.2 Chi Tiết Từng Phase

#### PHASE 1: Infrastructure & Database Setup (1 tháng)
**Mục tiêu**: Thiết lập nền tảng
- [x] Setup Node.js project
- [x] Cấu hình TypeScript & linting
- [x] Setup PostgreSQL & Prisma
- [x] Docker & Docker Compose
- [x] Thiết kế database schema
- [x] Migration setup

**Deliverables**:
- Project skeleton
- Docker environment
- Database migrations
- README documentation

**Resources**: 1-2 Backend Dev

#### PHASE 2: Core Backend APIs (1.5 tháng)
**Mục tiêu**: Xây dựng tất cả backend APIs

**Tasks**:
- [x] Auth module (register, login, JWT)
- [x] User management
- [x] Category management
- [x] Product management
- [x] Order management
- [x] Review system
- [x] Image upload (ImageKit)
- [x] Error handling & logging
- [x] Input validation (Zod)
- [x] Swagger documentation

**Testing**:
- Unit tests (70% coverage)
- Integration tests (50% coverage)
- API testing

**Resources**: 2-3 Backend Dev

#### PHASE 3: Frontend Development (1.5 tháng)
**Mục tiêu**: Xây dựng UI cho user và admin

**User Client**:
- [x] Home page
- [x] Product listing & filtering
- [x] Product detail page
- [x] Shopping cart
- [x] Checkout
- [x] Order tracking
- [x] Review section
- [x] User authentication

**Admin Client**:
- [x] Dashboard
- [x] Product management
- [x] Category management
- [x] Order management
- [x] User management
- [x] Basic analytics

**Resources**: 2-3 Frontend Dev

#### PHASE 4: Testing & Optimization (0.5 tháng)
**Mục tiêu**: QA & performance tuning

- [x] End-to-end testing
- [x] Performance testing
- [x] Security testing
- [x] Load testing
- [x] Bug fixes
- [x] Code review & refactoring

**Resources**: 1 QA, 1-2 Backend Dev

#### PHASE 5: Deployment & Documentation (1 tháng)
**Mục tiêu**: Production deployment

- [x] CI/CD pipeline (GitHub Actions)
- [x] Docker image building
- [x] Server setup (AWS/Vercel)
- [x] Database backup strategy
- [x] Monitoring & alerting
- [x] Documentation
- [x] User manual
- [x] Deployment guide

**Resources**: 1 DevOps Eng, 1 Tech Writer

### 2.3 Timeline Chart
```
Phase 1: |████████|
Phase 2: |             ████████████|
Phase 3: |             ████████████|
Phase 4: |                        ████|
Phase 5: |                          ████|
Month:   1  2  3  4  5  6
```

---

## 3. ĐỘI DỰ ÁN

### 3.1 Cấu Trúc Tổ Chức
```
Project Manager (1)
├── Tech Lead / Architect (1)
├── Backend Team (2-3)
│   ├── Senior Backend Dev
│   ├── Junior Backend Dev
│   └── (1 more if needed)
├── Frontend Team (2-3)
│   ├── Senior Frontend Dev
│   ├── Junior Frontend Dev
│   └── (1 more if needed)
├── QA/Tester (1)
└── DevOps Engineer (0.5-1)
```

### 3.2 Mô Tả Vai Trò

| Vai Trò | Trách Nhiệm | Kỹ Năng Cần |
|---|---|---|
| **PM** | Lên kế hoạch, theo dõi tiến độ, quản lí risk | Leadership, Agile |
| **Tech Lead** | Thiết kế hệ thống, code review, mentoring | System design, Architecture |
| **Backend Dev** | Phát triển API, database, business logic | Node.js, TypeScript, Prisma |
| **Frontend Dev** | Phát triển UI, responsive design | React, TypeScript, TailwindCSS |
| **QA** | Testing, bug reporting, validation | Test planning, QA tools |
| **DevOps** | Deployment, monitoring, CI/CD | Docker, GitHub Actions |

### 3.3 Kỹ Năng Yêu Cầu
**Backend**:
- Node.js/Express
- TypeScript
- PostgreSQL
- Prisma ORM
- Jest testing
- RESTful API design

**Frontend**:
- React 18+
- TypeScript
- TailwindCSS
- React Router
- React Hook Form
- State management

**DevOps**:
- Docker & Docker Compose
- GitHub Actions
- Cloud deployment (AWS/Vercel)
- Monitoring & logging

---

## 4. QUẢN LÍ RỦI RO

### 4.1 Danh Sách Rủi RO

| # | Rủi Ro | Khả Năng | Tác Động | Giải Pháp |
|---|---|---|---|---|
| 1 | Delay timeline do thiếu resources | Cao | Cao | Tuyển thêm developer |
| 2 | Scope creep từ khách hàng | Cao | Trung | Quản lí chặt requirements |
| 3 | Database performance issues | Trung | Cao | Load testing, indexing |
| 4 | Security vulnerabilities | Trung | Rất cao | Security review, penetration testing |
| 5 | Incompatibility issues (libraries) | Thấp | Trung | Version pinning, early testing |
| 6 | Team member turnover | Trung | Cao | Documentation, knowledge sharing |
| 7 | Third-party API failures (ImageKit) | Thấp | Trung | Fallback mechanism, caching |

### 4.2 Chiến Lược Giảm Thiểu
- **Frequent demos**: Hàng tuần demo cho stakeholders
- **Code review**: All PRs reviewed by 2 people
- **Testing**: High test coverage (>80%)
- **Documentation**: Real-time documentation
- **Monitoring**: Production monitoring từ ngày đầu

---

## 5. QUẢN LÍ NHU CẦU THAY ĐỔI

### 5.1 Quy Trình Change Request
```
1. Request submitted → 2. Assess impact → 3. Prioritize
            ↓
4. Plan & schedule → 5. Implement → 6. Test & review
            ↓
7. Deploy → 8. Monitor & close
```

### 5.2 Tiêu Chí Đánh Giá
- **Impact**: Ảnh hưởng đến bao nhiêu features?
- **Effort**: Cần bao nhiêu người-ngày?
- **Risk**: Rủi ro gây ra lỗi gì?
- **Priority**: Mức độ ưu tiên

---

## 6. QUẢN LÍ CHẤT LƯỢNG

### 6.1 Metrics Chất Lượng
| Metric | Target |
|---|---|
| Code coverage | > 80% |
| Critical bugs | 0 |
| Test pass rate | 100% |
| API response time | < 500ms (p95) |
| Uptime | 99% |
| Performance score | > 90 |

### 6.2 Testing Strategy
1. **Unit Tests**: Jest, 70%+ coverage
2. **Integration Tests**: Supertest, API testing
3. **E2E Tests**: Manual + Cypress
4. **Performance Tests**: Load testing
5. **Security Tests**: OWASP top 10

### 6.3 Code Standards
- ESLint configuration
- Prettier for formatting
- TypeScript strict mode
- Conventional commits
- Branch protection rules

---

## 7. LIÊN LẠC & BÁNG CÁO

### 7.1 Stakeholder Communication Plan
| Stakeholder | Tần Suất | Format | Content |
|---|---|---|---|
| Client | Hàng tuần | Meeting | Progress update, demo |
| Team | Hàng ngày | Standup | Blockers, plans |
| Tech Lead | Hàng ngày | Chat | Technical issues |
| Manager | Hàng tuần | Email | Metrics, risks |
| Developers | Hàng tuần | PR review | Code quality feedback |

### 7.2 Status Report Template
```
Week #:
- Completed: [list of completed tasks]
- In Progress: [list of ongoing tasks]
- Blockers: [any blockers or issues]
- Next Week: [planned tasks]
- Metrics: Code coverage, test pass rate, PRs merged
```

---

## 8. QUẢN LÍ TÀI NGUYÊN

### 8.1 Ngân Sách Dự Tính (6 months)

| Mục | Chi Phí |
|---|---|
| **Nhân lực** | |
| 1x PM (6 months) | $6,000 |
| 2-3x Backend Dev (6 months) | $18,000-27,000 |
| 2-3x Frontend Dev (6 months) | $12,000-18,000 |
| 1x QA (6 months) | $4,000 |
| 1x DevOps (3 months) | $3,000 |
| **Công cụ & Dịch vụ** | |
| Cloud hosting (AWS/Vercel) | $2,000 |
| ImageKit (image storage) | $1,200 |
| Domain & SSL | $100 |
| Monitoring tools (DataDog, etc) | $500 |
| **Khác** | |
| Training & resources | $500 |
| Contingency (10%) | $4,500-5,000 |
| **TỔNG CỘNG** | **$52,400-64,400** |

### 8.2 Resource Allocation
```
Phase 1 (1 month):
- 1-2 Backend Dev
- 1 DevOps Eng

Phase 2 (1.5 months):
- 2-3 Backend Dev
- 1 QA

Phase 3 (1.5 months):
- 2-3 Frontend Dev
- 1 Backend Dev (support)
- 1 QA

Phase 4 (0.5 months):
- 1-2 Backend Dev
- 2-3 Frontend Dev
- 1 QA

Phase 5 (1 month):
- 1 DevOps Eng
- 1 Tech Writer
- 1 Backend Dev (support)
```

---

## 9. TIÊU CHÍ ĐO LƯỜNG THÀNH CÔNG

### 9.1 Project Success Criteria
- [x] **Tiến độ**: Deliver on time (within 6 months)
- [x] **Chất lượng**: All acceptance tests pass
- [x] **Performance**: Response time < 500ms
- [x] **Uptime**: 99% availability
- [x] **User satisfaction**: Positive feedback
- [x] **Documentation**: Complete & clear
- [x] **Team**: Zero critical bugs in production

### 9.2 Business Metrics
- **MAU** (Monthly Active Users): Target 10K
- **Conversion rate**: Target 5%
- **Average order value**: $15-20
- **Customer satisfaction**: > 4.0 rating
- **Repeat purchase rate**: > 40%

---

## 10. LỘ TRÌNH PHÁT TRIỂN

### 10.1 Version Roadmap
```
v1.0 (MVP) - 6 months
├── Basic product management
├── Order processing
├── User authentication
└── Reviews system

v1.1 - Month 7-8
├── Advanced search & filters
├── Wishlist feature
├── Order tracking notifications
└── Performance optimization

v1.2 - Month 9-10
├── Mobile responsiveness improvements
├── Admin analytics
├── Customer support chat
└── Inventory alerts

v2.0 - Future
├── Mobile app (iOS/Android)
├── AI recommendations
├── Multi-vendor support
├── Advanced payment gateway
└── Marketing automation
```

---

## 11. LESSONS LEARNED & BEST PRACTICES

### 11.1 Best Practices áp dụng
1. **Version Control**: Git flow branching
2. **Code Review**: All changes reviewed
3. **Testing**: High test coverage
4. **Documentation**: Real-time docs
5. **Monitoring**: Proactive monitoring
6. **Security**: Security by design

### 11.2 Assumptions
- Team has NodeJS/React experience
- PostgreSQL is installed & running
- ImageKit account is available
- Cloud hosting account is ready
- Team understands Agile methodology

### 11.3 Constraints
- Budget: ~$50K-65K
- Timeline: 6 months
- Team size: 6-8 people
- Technology: Node.js, React, PostgreSQL

---

# KẾT LUẬN

Tài liệu này cung cấp một cái nhìn toàn diện về dự án e-commerce đặt đồ ăn nhanh:

1. **Phần I - HỆ THỐNG THÔNG TIN QUẢN LÍ**: Phân tích chi tiết về nhu cầu kinh doanh, các quy trình, người dùng, và dữ liệu
2. **Phần II - HỆ THỐNG THÔNG TIN TÍCH HỢP**: Kiến trúc hệ thống, công nghệ, thiết kế database, và API
3. **Phần III - QUẢN TRỊ DỰ ÁN**: Kế hoạch, timeline, đội dự án, quản lí rủi ro, và giải pháp

Dự án này là một ứng dụng thương mục điện tử hoàn chỉnh, tích hợp tốt các công nghệ hiện đại, được quản lí chuyên nghiệp theo phương pháp Agile.

---

**Tài liệu này được chuẩn bị cho mục đích học tập và báo cáo**

Phiên bản: 1.0  
Ngày: Tháng 5, 2026  
Tác giả: Development Team
