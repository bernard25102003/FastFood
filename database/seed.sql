-- ==============================================================================
-- FASTFOOD SEED DATA (MySQL 8.0 & TiDB Cloud Compatible)
-- Default Accounts:
--   Admin: bernard25102003@gmail.com / @Hoangdz2k3
-- ==============================================================================

USE `fastfood_db`;

-- 1. USERS
-- Password hash for '@Hoangdz2k3'
INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `phone`, `address`, `role`, `status`) VALUES
('usr-admin-001', 'Quản Trị Viên', 'bernard25102003@gmail.com', '$2b$10$LzhG/R/vxk.tipBWMjdmDuIo6tUEZAQiQt7kUrvF88DFsqB0d0ETe', '0901234567', 'Trụ sở FastFood, TP.HCM', 'ADMIN', 'ACTIVE');

-- 2. CATEGORIES
INSERT INTO `categories` (`id`, `name`, `description`, `icon`) VALUES
('cat-burgers-01', 'Burgers', 'Bánh mì kẹp thơm ngon, bò Úc và gà giòn sốt đặc biệt', '🍔'),
('cat-pizza-02', 'Pizza', 'Pizza nướng củi phô mai Mozzarella kéo sợi vàng ươm', '🍕'),
('cat-chicken-03', 'Chicken', 'Gà rán giòn rụm đậm vị sốt cay ngọt Hàn Quốc', '🍗'),
('cat-drinks-04', 'Drinks', 'Nước ngọt sảng khoái và nước ép trái cây mát lạnh', '🥤'),
('cat-sides-05', 'Sides', 'Khoai tây chiên giòn, phô mai que và đồ ăn kèm hấp dẫn', '🍟'),
('cat-desserts-06', 'Desserts', 'Kem tươi, bánh ngọt và tráng miệng thanh mát', '🍰');

-- 3. PRODUCTS
INSERT INTO `products` (`id`, `name`, `price`, `category_id`, `description`, `sold_count`, `avg_rating`, `review_count`) VALUES
('prod-burger-01', 'Burger Bò Phô Mai Đặc Biệt', 55000.00, 'cat-burgers-01', 'Bánh mì kẹp với thịt bò Úc tươi nướng than hồng, phô mai Cheddar béo ngậy, rau xà lách tươi và sốt BBQ.', 150, 4.80, 24),
('prod-burger-02', 'Burger Gà Giòn Sốt Cay', 48000.00, 'cat-burgers-01', 'Phi lê ức gà chiên giòn rụm kết hợp sốt mayo cay nhẹ đặc chế.', 98, 4.70, 15),
('prod-burger-03', 'Burger Bò Nướng Hai Tầng', 75000.00, 'cat-burgers-01', 'Hai lớp bò nướng kép đẫm phô mai, thịt xông khói giòn tan.', 80, 4.90, 30),

('prod-pizza-01', 'Pizza Pepperoni Thượng Hạng', 89000.00, 'cat-pizza-02', 'Xúc xích Pepperoni cay nhẹ nhập khẩu, sốt cà chua Ý và ngập tràn phô mai Mozzarella.', 210, 4.90, 45),
('prod-pizza-02', 'Pizza Hải Sản Nhiệt Đới', 105000.00, 'cat-pizza-02', 'Tôm sú tươi, mực lá giòn sần sật, thanh cua và ớt chuông nướng.', 135, 4.75, 18),
('prod-pizza-03', 'Pizza Phô Mai 4 Vị', 95000.00, 'cat-pizza-02', 'Sự kết hợp hoàn hảo giữa 4 loại phô mai hảo hạng tan chảy đậm đà.', 70, 4.60, 12),

('prod-chicken-01', 'Gà Rán Giòn Cay (3 Miếng)', 65000.00, 'cat-chicken-03', '3 miếng gà giòn vỏ giòn rụm, thịt bên trong mềm ngọt mọng nước.', 320, 4.85, 60),
('prod-chicken-02', 'Cánh Gà Sốt Nước Mắm Tỏi Ớt', 58000.00, 'cat-chicken-03', 'Cánh gà chiên giòn đảo sốt nước mắm chua ngọt mặn mà chuẩn vị Việt.', 180, 4.80, 35),
('prod-chicken-03', 'Gà Rán Không Xương Lắc Phô Mai', 49000.00, 'cat-chicken-03', 'Gà viên rút xương chiên vàng lắc đều bột phô mai thơm phức.', 140, 4.70, 20),

('prod-drinks-01', 'Coca-Cola Tươi Mát Lạnh (330ml)', 15000.00, 'cat-drinks-04', 'Nước ngọt có gas ướp lạnh đã khát tức thì.', 450, 5.00, 80),
('prod-drinks-02', 'Trà Đào Cam Sả', 25000.00, 'cat-drinks-04', 'Trà đào thơm nồng quyện cùng vị chua thanh của cam vàng và hương sả sảng khoái.', 210, 4.90, 40),
('prod-drinks-03', 'Nước Cam Tươi Nguyên Chất', 28000.00, 'cat-drinks-04', 'Nước cam vắt tươi nguyên chất 100% không đường hóa học.', 95, 4.80, 16),

('prod-sides-01', 'Khoai Tây Chiên Lắc Phô Mai', 29000.00, 'cat-sides-05', 'Khoai tây sợi vàng ươm chiên giòn rụm phủ lớp phô mai béo ngậy.', 280, 4.75, 50),
('prod-sides-02', 'Phô Mai Que Kéo Sợi (4 Que)', 35000.00, 'cat-sides-05', 'Phô mai que chiên xù nóng hổi kéo sợi dai béo.', 190, 4.85, 33),

('prod-desserts-01', 'Kem Tươi Sundae Sốt Dâu Tây', 22000.00, 'cat-desserts-06', 'Kem sữa tươi vani mềm mịn rưới sốt dâu tây ngọt ngào.', 110, 4.90, 22),
('prod-desserts-02', 'Bánh Donut Sô Cô La', 18000.00, 'cat-desserts-06', 'Bánh donut mềm xốp phủ sô cô la Bỉ hảo hạng.', 85, 4.65, 14);

-- 4. PRODUCT IMAGES (Hình ảnh chất lượng cao từ CDN Unsplash)
INSERT INTO `product_images` (`id`, `product_id`, `image_url`, `is_primary`, `display_order`) VALUES
('img-bg-01', 'prod-burger-01', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800', 1, 1),
('img-bg-02', 'prod-burger-02', 'https://images.unsplash.com/photo-1562547683-f26c0b82cf61?w=800', 1, 1),
('img-bg-03', 'prod-burger-03', 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800', 1, 1),

('img-pz-01', 'prod-pizza-01', 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800', 1, 1),
('img-pz-02', 'prod-pizza-02', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800', 1, 1),
('img-pz-03', 'prod-pizza-03', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800', 1, 1),

('img-ck-01', 'prod-chicken-01', 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=800', 1, 1),
('img-ck-02', 'prod-chicken-02', 'https://images.unsplash.com/photo-1562967914-608f82629710?w=800', 1, 1),
('img-ck-03', 'prod-chicken-03', 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=800', 1, 1),

('img-dk-01', 'prod-drinks-01', 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=800', 1, 1),
('img-dk-02', 'prod-drinks-02', 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=800', 1, 1),
('img-dk-03', 'prod-drinks-03', 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=800', 1, 1),

('img-sd-01', 'prod-sides-01', 'https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?w=800', 1, 1),
('img-sd-02', 'prod-sides-02', 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=800', 1, 1),

('img-ds-01', 'prod-desserts-01', 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=800', 1, 1),
('img-ds-02', 'prod-desserts-02', 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800', 1, 1);

-- 5. SAMPLE ORDERS
INSERT INTO `orders` (`id`, `user_id`, `total_price`, `status`, `payment_method`, `payment_status`, `payment_code`, `name`, `phone`, `address`, `notes`, `confirmed_at`) VALUES
('ord-demo-001', 'usr-user-001', 120000.00, 'CONFIRMED', 'BANK_TRANSFER', 'PAID', 'FF1001', 'Nguyễn Văn An', '0902345678', '123 Đường Lê Lợi, Quận 1, TP.HCM', 'Giao lúc 12h trưa', NOW()),
('ord-demo-002', 'usr-user-002', 84000.00, 'PENDING', 'BANK_TRANSFER', 'UNPAID', 'FF1002', 'Trần Thị Bình', '0903456789', '456 Đường Nguyễn Trãi, Quận 5, TP.HCM', 'Ít đá trong đồ uống', NULL);

-- 6. ORDER ITEMS
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `name`, `price`, `image`, `quantity`, `subtotal`) VALUES
('item-001', 'ord-demo-001', 'prod-burger-01', 'Burger Bò Phô Mai Đặc Biệt', 55000.00, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800', 1, 55000.00),
('item-002', 'ord-demo-001', 'prod-chicken-01', 'Gà Rán Giòn Cay (3 Miếng)', 65000.00, 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=800', 1, 65000.00),
('item-003', 'ord-demo-002', 'prod-pizza-01', 'Pizza Pepperoni Thượng Hạng', 89000.00, 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800', 1, 89000.00);

-- 7. SAMPLE REVIEWS
INSERT INTO `reviews` (`id`, `user_id`, `product_id`, `rating`, `comment`) VALUES
('rev-001', 'usr-user-001', 'prod-burger-01', 5, 'Burger rất ngon, thịt bò mềm và thơm mùi khói. Giao hàng nhanh!'),
('rev-002', 'usr-user-002', 'prod-pizza-01', 5, 'Pizza phô mai ngập tràn, viền giòn rất ngon, 10 điểm chất lượng.');

