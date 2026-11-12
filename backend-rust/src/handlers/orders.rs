use axum::{
    extract::{Path, Query, State},
    response::Response,
    Json,
};
use chrono::Utc;
use rand::Rng;
use std::collections::HashMap;
use uuid::Uuid;

use crate::{
    error::AppError,
    middleware::auth::{AuthUser, RequireAdmin},
    models::order::{
        CreateOrderDto, Order, OrderDb, OrderItem, OrderItemDb, OrderQuery, UpdateOrderStatusDto,
    },
    state::AppState,
    utils::{
        response::{send_created, send_success, PaginatedResponse, Pagination},
        vietqr::generate_vietqr_url,
    },
};

/// POST /api/orders
pub async fn create_order(
    State(state): State<AppState>,
    auth_user: AuthUser,
    Json(payload): Json<CreateOrderDto>,
) -> Result<Response, AppError> {
    if payload.items.is_empty() {
        return Err(AppError::Validation("Đơn hàng phải có ít nhất 1 sản phẩm".to_string()));
    }

    let recipient_name = payload
        .recipient_name
        .or(payload.name)
        .unwrap_or_default();
    let recipient_phone = payload
        .recipient_phone
        .or(payload.phone)
        .unwrap_or_default();
    let recipient_address = payload
        .recipient_address
        .or(payload.address)
        .unwrap_or_default();

    if recipient_name.trim().is_empty() || recipient_phone.trim().is_empty() || recipient_address.trim().is_empty() {
        return Err(AppError::Validation("Vui lòng điền đầy đủ tên, số điện thoại và địa chỉ giao hàng".to_string()));
    }

    // 1. Lấy thông tin các sản phẩm từ DB để tính tiền chuẩn (Parameterized Query chống SQLi)
    let pids: Vec<String> = payload.items.iter().map(|i| i.product_id.clone()).collect();
    let placeholders = vec!["?"; pids.len()].join(",");

    let query_str = format!("SELECT id, name, price FROM products WHERE id IN ({})", placeholders);
    let mut prod_q = sqlx::query_as::<_, (String, String, f64)>(&query_str);
    for pid in &pids {
        prod_q = prod_q.bind(pid);
    }
    let db_prods: Vec<(String, String, f64)> = prod_q.fetch_all(&state.db).await?;

    let prod_map: HashMap<String, (String, f64)> = db_prods
        .into_iter()
        .map(|(id, name, price)| (id, (name, price)))
        .collect();

    // Lấy ảnh đại diện của từng sản phẩm (Parameterized Query chống SQLi)
    let img_query = format!(
        "SELECT product_id, image_url FROM product_images WHERE product_id IN ({}) ORDER BY is_primary DESC",
        placeholders
    );
    let mut img_q = sqlx::query_as::<_, (String, String)>(&img_query);
    for pid in &pids {
        img_q = img_q.bind(pid);
    }
    let raw_imgs: Vec<(String, String)> = img_q.fetch_all(&state.db).await.unwrap_or_default();

    let mut img_map: HashMap<String, String> = HashMap::new();
    for (pid, url) in raw_imgs {
        img_map.entry(pid).or_insert(url);
    }

    let mut total_price: f64 = 0.0;
    let mut order_items_data = Vec::new();

    for item in &payload.items {
        if item.quantity <= 0 {
            return Err(AppError::Validation("Số lượng sản phẩm phải lớn hơn 0".to_string()));
        }

        let (pname, pprice) = prod_map.get(&item.product_id).ok_or_else(|| {
            AppError::NotFound(format!("Sản phẩm với ID {} không tồn tại", item.product_id))
        })?;

        let subtotal = pprice * (item.quantity as f64);
        total_price += subtotal;

        let img_url = img_map.get(&item.product_id).cloned();

        order_items_data.push((
            Uuid::new_v4().to_string(),
            item.product_id.clone(),
            pname.clone(),
            *pprice,
            img_url,
            item.quantity,
            subtotal,
        ));
    }

    let order_id = format!("ord-{}", Uuid::new_v4());
    let payment_code = if payload.payment_method == "BANK_TRANSFER" {
        // Sinh mã thanh toán ngẫu nhiên dạng FF1000 - FF9999
        let code_num: u32 = rand::thread_rng().gen_range(1000..99999);
        Some(format!("FF{}", code_num))
    } else {
        None
    };

    let viet_qr_url = if let Some(ref code) = payment_code {
        let amount_num = total_price as i64;
        Some(generate_vietqr_url(
            &state.config.sepay_bank_name,
            &state.config.sepay_account_no,
            amount_num,
            code,
        ))
    } else {
        None
    };

    // 2. Thực thi Transaction lưu đơn hàng và các item
    let mut tx = state.db.begin().await?;

    sqlx::query(
        "INSERT INTO orders (id, user_id, total_price, status, payment_method, payment_status, payment_code, name, phone, address, notes) VALUES (?, ?, ?, 'PENDING', ?, 'UNPAID', ?, ?, ?, ?, ?)",
    )
    .bind(&order_id)
    .bind(&auth_user.id)
    .bind(total_price)
    .bind(&payload.payment_method)
    .bind(&payment_code)
    .bind(&recipient_name)
    .bind(&recipient_phone)
    .bind(&recipient_address)
    .bind(payload.notes)
    .execute(&mut *tx)
    .await?;

    for (item_id, pid, name, price, img, qty, subtotal) in &order_items_data {
        sqlx::query(
            "INSERT INTO order_items (id, order_id, product_id, name, price, image, quantity, subtotal) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        )
        .bind(item_id)
        .bind(&order_id)
        .bind(pid)
        .bind(name)
        .bind(price)
        .bind(img)
        .bind(qty)
        .bind(subtotal)
        .execute(&mut *tx)
        .await?;

        // Lưu ý: sold_count không tăng tại đây mà chỉ tăng khi đơn hàng đạt trạng thái COMPLETED
    }

    tx.commit().await?;

    // 3. Lấy lại Order hoàn chỉnh trả về cho Client
    let order_db: OrderDb = sqlx::query_as("SELECT * FROM orders WHERE id = ?")
        .bind(&order_id)
        .fetch_one(&state.db)
        .await?;

    let raw_items: Vec<OrderItemDb> = sqlx::query_as("SELECT * FROM order_items WHERE order_id = ?")
        .bind(&order_id)
        .fetch_all(&state.db)
        .await
        .unwrap_or_default();

    let items: Vec<OrderItem> = raw_items.into_iter().map(|i| i.to_item()).collect();
    let order = order_db.to_order(items, viet_qr_url);

    Ok(send_created(order, "Tạo đơn hàng thành công"))
}

/// GET /api/orders (Lấy danh sách đơn hàng của người dùng hiện tại)
pub async fn list_my_orders(
    State(state): State<AppState>,
    auth_user: AuthUser,
    Query(query): Query<OrderQuery>,
) -> Result<Response, AppError> {
    let page = query.page.unwrap_or(1).max(1);
    let limit = query.limit.unwrap_or(20).clamp(1, 100);
    let offset = (page - 1) * limit;

    let total: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM orders WHERE user_id = ?")
        .bind(&auth_user.id)
        .fetch_one(&state.db)
        .await?;

    let raw_orders: Vec<OrderDb> = sqlx::query_as(
        "SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?",
    )
    .bind(&auth_user.id)
    .bind(limit)
    .bind(offset)
    .fetch_all(&state.db)
    .await?;

    let mut items = Vec::new();

    if !raw_orders.is_empty() {
        let order_ids: Vec<String> = raw_orders.iter().map(|o| o.id.clone()).collect();
        let placeholders = vec!["?"; order_ids.len()].join(",");

        let items_query = format!("SELECT * FROM order_items WHERE order_id IN ({})", placeholders);
        let mut items_q = sqlx::query_as::<_, OrderItemDb>(&items_query);
        for oid in &order_ids {
            items_q = items_q.bind(oid);
        }
        let raw_items: Vec<OrderItemDb> = items_q
            .fetch_all(&state.db)
            .await
            .unwrap_or_default();

        let mut items_map: HashMap<String, Vec<OrderItem>> = HashMap::new();
        for item in raw_items {
            let oid = item.order_id.clone();
            items_map.entry(oid).or_default().push(item.to_item());
        }

        for ord in raw_orders {
            let oid = ord.id.clone();
            let o_items = items_map.remove(&oid).unwrap_or_default();
            let qr = if ord.payment_method == "BANK_TRANSFER" && ord.payment_status != "PAID" {
                ord.payment_code.as_ref().map(|code| {
                    generate_vietqr_url(
                        &state.config.sepay_bank_name,
                        &state.config.sepay_account_no,
                        ord.total_price as i64,
                        code,
                    )
                })
            } else {
                None
            };
            items.push(ord.to_order(o_items, qr));
        }
    }

    let paginated = PaginatedResponse {
        items,
        pagination: Pagination::new(page, limit, total.0),
    };

    Ok(send_success(paginated, "Danh sách đơn hàng của bạn"))
}

/// GET /api/orders/:orderId
pub async fn get_order_by_id(
    State(state): State<AppState>,
    auth_user: AuthUser,
    Path(order_id): Path<String>,
) -> Result<Response, AppError> {
    let order_db: Option<OrderDb> = sqlx::query_as("SELECT * FROM orders WHERE id = ? LIMIT 1")
        .bind(&order_id)
        .fetch_optional(&state.db)
        .await?;

    let order_db = order_db.ok_or_else(|| AppError::NotFound("Không tìm thấy đơn hàng".to_string()))?;

    // Người dùng chỉ xem được đơn của mình, Admin xem được tất cả
    if auth_user.role != "ADMIN" && order_db.user_id != auth_user.id {
        return Err(AppError::Forbidden("Bạn không có quyền xem đơn hàng này".to_string()));
    }

    let raw_items: Vec<OrderItemDb> = sqlx::query_as("SELECT * FROM order_items WHERE order_id = ?")
        .bind(&order_id)
        .fetch_all(&state.db)
        .await
        .unwrap_or_default();

    let items: Vec<OrderItem> = raw_items.into_iter().map(|i| i.to_item()).collect();
    let qr = if order_db.payment_method == "BANK_TRANSFER" && order_db.payment_status != "PAID" {
        order_db.payment_code.as_ref().map(|code| {
            generate_vietqr_url(
                &state.config.sepay_bank_name,
                &state.config.sepay_account_no,
                order_db.total_price as i64,
                code,
            )
        })
    } else {
        None
    };

    let order = order_db.to_order(items, qr);
    Ok(send_success(order, "Chi tiết đơn hàng"))
}

/// GET /api/orders/admin (Quản trị viên xem tất cả đơn)
pub async fn list_all_orders(
    State(state): State<AppState>,
    _admin: RequireAdmin,
    Query(query): Query<OrderQuery>,
) -> Result<Response, AppError> {
    let page = query.page.unwrap_or(1).max(1);
    let limit = query.limit.unwrap_or(20).clamp(1, 100);
    let offset = (page - 1) * limit;

    let mut conditions = Vec::new();
    if let Some(ref st) = query.status {
        if !st.trim().is_empty() {
            conditions.push(format!("status = '{}'", st.replace('\'', "''")));
        }
    }
    if let Some(ref uid) = query.user_id {
        if !uid.trim().is_empty() {
            conditions.push(format!("user_id = '{}'", uid.replace('\'', "''")));
        }
    }

    let where_clause = if conditions.is_empty() {
        String::new()
    } else {
        format!("WHERE {}", conditions.join(" AND "))
    };

    let count_query = format!("SELECT COUNT(*) FROM orders {}", where_clause);
    let total: (i64,) = sqlx::query_as(&count_query)
        .fetch_one(&state.db)
        .await?;

    let select_query = format!(
        "SELECT * FROM orders {} ORDER BY created_at DESC LIMIT {} OFFSET {}",
        where_clause, limit, offset
    );

    let raw_orders: Vec<OrderDb> = sqlx::query_as(&select_query)
        .fetch_all(&state.db)
        .await?;

    let mut items = Vec::new();
    if !raw_orders.is_empty() {
        let order_ids: Vec<String> = raw_orders.iter().map(|o| o.id.clone()).collect();
        let placeholders = vec!["?"; order_ids.len()].join(",");

        let items_query = format!("SELECT * FROM order_items WHERE order_id IN ({})", placeholders);
        let mut items_q = sqlx::query_as::<_, OrderItemDb>(&items_query);
        for oid in &order_ids {
            items_q = items_q.bind(oid);
        }
        let raw_items: Vec<OrderItemDb> = items_q
            .fetch_all(&state.db)
            .await
            .unwrap_or_default();

        let mut items_map: HashMap<String, Vec<OrderItem>> = HashMap::new();
        for item in raw_items {
            let oid = item.order_id.clone();
            items_map.entry(oid).or_default().push(item.to_item());
        }

        for ord in raw_orders {
            let oid = ord.id.clone();
            let o_items = items_map.remove(&oid).unwrap_or_default();
            let qr = if ord.payment_method == "BANK_TRANSFER" && ord.payment_status != "PAID" {
                ord.payment_code.as_ref().map(|code| {
                    generate_vietqr_url(
                        &state.config.sepay_bank_name,
                        &state.config.sepay_account_no,
                        ord.total_price as i64,
                        code,
                    )
                })
            } else {
                None
            };
            items.push(ord.to_order(o_items, qr));
        }
    }

    let paginated = PaginatedResponse {
        items,
        pagination: Pagination::new(page, limit, total.0),
    };

    Ok(send_success(paginated, "Danh sách quản lý đơn hàng"))
}

/// PATCH /api/orders/:orderId/status & /api/orders/admin/:orderId/status (Admin cập nhật trạng thái đơn)
pub async fn update_order_status(
    State(state): State<AppState>,
    _admin: RequireAdmin,
    Path(order_id): Path<String>,
    Json(payload): Json<UpdateOrderStatusDto>,
) -> Result<Response, AppError> {
    let order_db: Option<OrderDb> = sqlx::query_as("SELECT * FROM orders WHERE id = ? LIMIT 1")
        .bind(&order_id)
        .fetch_optional(&state.db)
        .await?;

    let order_db = order_db.ok_or_else(|| AppError::NotFound("Không tìm thấy đơn hàng".to_string()))?;
    let current_status = order_db.status.as_str();
    let target_status = payload.status.trim().to_uppercase();

    // 1. Kiểm tra State Machine transition
    let valid_next = match current_status {
        "PENDING" => vec!["CONFIRMED", "CANCELLED"],
        "CONFIRMED" => vec!["SHIPPING", "CANCELLED"],
        "SHIPPING" => vec!["COMPLETED", "CANCELLED"],
        "COMPLETED" => {
            return Err(AppError::BadRequest("Đơn hàng đã hoàn thành, không thể thay đổi trạng thái nữa.".to_string()));
        }
        "CANCELLED" => {
            return Err(AppError::BadRequest("Đơn hàng đã bị hủy, không thể thay đổi trạng thái nữa.".to_string()));
        }
        _ => vec![],
    };

    if current_status == target_status {
        let raw_items: Vec<OrderItemDb> = sqlx::query_as("SELECT * FROM order_items WHERE order_id = ?")
            .bind(&order_id)
            .fetch_all(&state.db)
            .await
            .unwrap_or_default();
        let items: Vec<OrderItem> = raw_items.into_iter().map(|i| i.to_item()).collect();
        return Ok(send_success(order_db.to_order(items, None), "Trạng thái đơn hàng không đổi"));
    }

    if !valid_next.contains(&target_status.as_str()) {
        return Err(AppError::BadRequest(format!(
            "Không thể chuyển trạng thái đơn hàng từ '{}' sang '{}'. Trạng thái tiếp theo hợp lệ: {:?}",
            current_status, target_status, valid_next
        )));
    }

    let mut tx = state.db.begin().await?;
    let now = Utc::now();
    let confirmed_at = if target_status == "CONFIRMED" { Some(now) } else { None };
    let completed_at = if target_status == "COMPLETED" { Some(now) } else { None };

    sqlx::query(
        "UPDATE orders SET status = ?, confirmed_at = COALESCE(?, confirmed_at), completed_at = COALESCE(?, completed_at) WHERE id = ?",
    )
    .bind(&target_status)
    .bind(confirmed_at)
    .bind(completed_at)
    .bind(&order_id)
    .execute(&mut *tx)
    .await?;

    // Khi đơn hàng đạt trạng thái COMPLETED, tăng sold_count của các sản phẩm trong đơn
    if target_status == "COMPLETED" {
        let items: Vec<(String, i32)> = sqlx::query_as("SELECT product_id, quantity FROM order_items WHERE order_id = ?")
            .bind(&order_id)
            .fetch_all(&mut *tx)
            .await
            .unwrap_or_default();

        for (pid, qty) in items {
            sqlx::query("UPDATE products SET sold_count = sold_count + ? WHERE id = ?")
                .bind(qty)
                .bind(&pid)
                .execute(&mut *tx)
                .await?;
        }
    }

    tx.commit().await?;

    let updated_order: OrderDb = sqlx::query_as("SELECT * FROM orders WHERE id = ?")
        .bind(&order_id)
        .fetch_one(&state.db)
        .await?;

    let raw_items: Vec<OrderItemDb> = sqlx::query_as("SELECT * FROM order_items WHERE order_id = ?")
        .bind(&order_id)
        .fetch_all(&state.db)
        .await
        .unwrap_or_default();

    let items: Vec<OrderItem> = raw_items.into_iter().map(|i| i.to_item()).collect();
    let order = updated_order.to_order(items, None);

    Ok(send_success(order, "Cập nhật trạng thái đơn hàng thành công"))
}

/// PATCH /api/orders/:orderId/cancel (Khách hủy đơn khi đang PENDING)
pub async fn cancel_order(
    State(state): State<AppState>,
    auth_user: AuthUser,
    Path(order_id): Path<String>,
) -> Result<Response, AppError> {
    let order_db: Option<OrderDb> = sqlx::query_as("SELECT * FROM orders WHERE id = ? LIMIT 1")
        .bind(&order_id)
        .fetch_optional(&state.db)
        .await?;

    let order_db = order_db.ok_or_else(|| AppError::NotFound("Không tìm thấy đơn hàng".to_string()))?;

    if order_db.user_id != auth_user.id {
        return Err(AppError::Forbidden("Bạn không có quyền hủy đơn hàng này".to_string()));
    }

    if order_db.status != "PENDING" {
        return Err(AppError::BadRequest(
            "Chỉ có thể hủy đơn hàng khi đơn đang ở trạng thái 'Chờ xác nhận'".to_string(),
        ));
    }

    sqlx::query("UPDATE orders SET status = 'CANCELLED' WHERE id = ?")
        .bind(&order_id)
        .execute(&state.db)
        .await?;

    Ok(send_success(serde_json::json!({ "id": order_id, "status": "CANCELLED" }), "Đã hủy đơn hàng"))
}

