use axum::{
    extract::{Multipart, Path, Query, State},
    response::Response,
    Json,
};
use std::collections::HashMap;
use uuid::Uuid;

use crate::{
    error::AppError,
    middleware::auth::RequireAdmin,
    models::{
        category::Category,
        product::{CreateProductDto, Product, ProductDb, ProductQuery, UpdateProductDto},
    },
    services::imagekit::ImageKitService,
    state::AppState,
    utils::response::{send_created, send_no_content, send_success, PaginatedResponse, Pagination},
};

/// GET /api/products
pub async fn list_products(
    State(state): State<AppState>,
    Query(query): Query<ProductQuery>,
) -> Result<Response, AppError> {
    let page = query.page.unwrap_or(1).max(1);
    let limit = query.limit.unwrap_or(10).clamp(1, 100);
    let offset = (page - 1) * limit;

    // Xây dựng câu truy vấn điều kiện
    let mut conditions = Vec::new();

    if let Some(ref cat_id) = query.category_id {
        if !cat_id.trim().is_empty() {
            conditions.push(format!("category_id = '{}'", cat_id.replace('\'', "''")));
        }
    }

    if let Some(ref s) = query.search {
        let clean = s.trim().replace('\'', "''");
        if !clean.is_empty() {
            conditions.push(format!("name LIKE '%{}%'", clean));
        }
    }

    if let Some(min) = query.min_price {
        conditions.push(format!("price >= {}", min));
    }

    if let Some(max) = query.max_price {
        conditions.push(format!("price <= {}", max));
    }

    let where_clause = if conditions.is_empty() {
        String::new()
    } else {
        format!("WHERE {}", conditions.join(" AND "))
    };

    let order_col = match query.sort_by.as_deref() {
        Some("price") => "price",
        Some("soldCount") | Some("sold_count") => "sold_count",
        Some("avgRating") | Some("avg_rating") => "avg_rating",
        _ => "created_at",
    };

    let order_dir = match query.sort_order.as_deref() {
        Some("asc") | Some("ASC") => "ASC",
        _ => "DESC",
    };

    // 1. Đếm tổng số lượng bản ghi
    let count_query = format!("SELECT COUNT(*) FROM products {}", where_clause);
    let total: (i64,) = sqlx::query_as(&count_query)
        .fetch_one(&state.db)
        .await?;

    // 2. Lấy danh sách sản phẩm theo trang
    let select_query = format!(
        "SELECT * FROM products {} ORDER BY {} {} LIMIT {} OFFSET {}",
        where_clause, order_col, order_dir, limit, offset
    );

    let raw_products: Vec<ProductDb> = sqlx::query_as(&select_query)
        .fetch_all(&state.db)
        .await?;

    if raw_products.is_empty() {
        let paginated = PaginatedResponse {
            items: Vec::<Product>::new(),
            pagination: Pagination {
                page,
                limit,
                total: total.0,
                total_pages: (total.0 as f64 / limit as f64).ceil() as i64,
            },
        };
        return Ok(send_success(paginated, "Danh sách món ăn"));
    }

    // 3. Lấy ảnh tương ứng cho các sản phẩm
    let product_ids: Vec<String> = raw_products.iter().map(|p| p.id.clone()).collect();
    let in_clause = product_ids
        .iter()
        .map(|id| format!("'{}'", id))
        .collect::<Vec<_>>()
        .join(",");

    let images_query = format!(
        "SELECT product_id, image_url FROM product_images WHERE product_id IN ({}) ORDER BY is_primary DESC, display_order ASC",
        in_clause
    );

    let raw_images: Vec<(String, String)> = sqlx::query_as(&images_query)
        .fetch_all(&state.db)
        .await
        .unwrap_or_default();

    let mut images_map: HashMap<String, Vec<String>> = HashMap::new();
    for (pid, url) in raw_images {
        images_map.entry(pid).or_default().push(url);
    }

    // 4. Lấy danh mục tương ứng
    let cat_ids: Vec<String> = raw_products.iter().map(|p| p.category_id.clone()).collect();
    let cat_in_clause = cat_ids
        .iter()
        .map(|id| format!("'{}'", id))
        .collect::<Vec<_>>()
        .join(",");

    let cat_query = format!("SELECT * FROM categories WHERE id IN ({})", cat_in_clause);
    let raw_cats: Vec<Category> = sqlx::query_as(&cat_query)
        .fetch_all(&state.db)
        .await
        .unwrap_or_default();

    let mut cat_map: HashMap<String, Category> = HashMap::new();
    for cat in raw_cats {
        cat_map.insert(cat.id.clone(), cat);
    }

    let items: Vec<Product> = raw_products
        .into_iter()
        .map(|p| {
            let pid = p.id.clone();
            let cid = p.category_id.clone();
            let imgs = images_map.remove(&pid).unwrap_or_default();
            let cat = cat_map.get(&cid).cloned();
            p.to_product(imgs, cat)
        })
        .collect();

    let total_pages = if total.0 == 0 {
        1
    } else {
        (total.0 as f64 / limit as f64).ceil() as i64
    };

    let paginated = PaginatedResponse {
        items,
        pagination: Pagination {
            page,
            limit,
            total: total.0,
            total_pages,
        },
    };

    Ok(send_success(paginated, "Danh sách món ăn"))
}

/// GET /api/products/:productId
pub async fn get_product_by_id(
    State(state): State<AppState>,
    Path(product_id): Path<String>,
) -> Result<Response, AppError> {
    let product_db: Option<ProductDb> = sqlx::query_as("SELECT * FROM products WHERE id = ? LIMIT 1")
        .bind(&product_id)
        .fetch_optional(&state.db)
        .await?;

    let product_db = product_db.ok_or_else(|| AppError::NotFound("Không tìm thấy món ăn".to_string()))?;

    let images: Vec<(String,)> = sqlx::query_as(
        "SELECT image_url FROM product_images WHERE product_id = ? ORDER BY is_primary DESC, display_order ASC",
    )
    .bind(&product_id)
    .fetch_all(&state.db)
    .await
    .unwrap_or_default();

    let image_urls: Vec<String> = images.into_iter().map(|(u,)| u).collect();

    let category: Option<Category> = sqlx::query_as("SELECT * FROM categories WHERE id = ? LIMIT 1")
        .bind(&product_db.category_id)
        .fetch_optional(&state.db)
        .await?;

    let product = product_db.to_product(image_urls, category);
    Ok(send_success(product, "Chi tiết món ăn"))
}

/// POST /api/products (Admin only)
pub async fn create_product(
    State(state): State<AppState>,
    _admin: RequireAdmin,
    Json(payload): Json<CreateProductDto>,
) -> Result<Response, AppError> {
    let name = payload.name.trim();
    if name.is_empty() {
        return Err(AppError::Validation("Tên món ăn không được để trống".to_string()));
    }

    let id = format!("prod-{}", Uuid::new_v4());

    let mut tx = state.db.begin().await?;

    sqlx::query(
        "INSERT INTO products (id, name, price, category_id, description) VALUES (?, ?, ?, ?, ?)",
    )
    .bind(&id)
    .bind(name)
    .bind(payload.price)
    .bind(&payload.category_id)
    .bind(&payload.description)
    .execute(&mut *tx)
    .await?;

    if let Some(imgs) = payload.images {
        for (idx, url) in imgs.iter().enumerate() {
            let img_id = Uuid::new_v4().to_string();
            let is_primary = if idx == 0 { 1 } else { 0 };
            sqlx::query(
                "INSERT INTO product_images (id, product_id, image_url, is_primary, display_order) VALUES (?, ?, ?, ?, ?)",
            )
            .bind(&img_id)
            .bind(&id)
            .bind(url)
            .bind(is_primary)
            .bind(idx as i32)
            .execute(&mut *tx)
            .await?;
        }
    }

    tx.commit().await?;

    let product_db: ProductDb = sqlx::query_as("SELECT * FROM products WHERE id = ?")
        .bind(&id)
        .fetch_one(&state.db)
        .await?;

    let images: Vec<(String,)> = sqlx::query_as(
        "SELECT image_url FROM product_images WHERE product_id = ? ORDER BY is_primary DESC, display_order ASC",
    )
    .bind(&id)
    .fetch_all(&state.db)
    .await
    .unwrap_or_default();

    let image_urls: Vec<String> = images.into_iter().map(|(u,)| u).collect();
    let product = product_db.to_product(image_urls, None);

    Ok(send_created(product, "Tạo món ăn thành công"))
}

/// PUT /api/products/:productId (Admin only)
pub async fn update_product(
    State(state): State<AppState>,
    _admin: RequireAdmin,
    Path(product_id): Path<String>,
    Json(payload): Json<UpdateProductDto>,
) -> Result<Response, AppError> {
    let mut tx = state.db.begin().await?;

    sqlx::query(
        "UPDATE products SET name = COALESCE(?, name), price = COALESCE(?, price), category_id = COALESCE(?, category_id), description = COALESCE(?, description) WHERE id = ?",
    )
    .bind(payload.name)
    .bind(payload.price)
    .bind(payload.category_id)
    .bind(payload.description)
    .bind(&product_id)
    .execute(&mut *tx)
    .await?;

    if let Some(imgs) = payload.images {
        sqlx::query("DELETE FROM product_images WHERE product_id = ?")
            .bind(&product_id)
            .execute(&mut *tx)
            .await?;

        for (idx, url) in imgs.iter().enumerate() {
            let img_id = Uuid::new_v4().to_string();
            let is_primary = if idx == 0 { 1 } else { 0 };
            sqlx::query(
                "INSERT INTO product_images (id, product_id, image_url, is_primary, display_order) VALUES (?, ?, ?, ?, ?)",
            )
            .bind(&img_id)
            .bind(&product_id)
            .bind(url)
            .bind(is_primary)
            .bind(idx as i32)
            .execute(&mut *tx)
            .await?;
        }
    }

    tx.commit().await?;

    let product_db: ProductDb = sqlx::query_as("SELECT * FROM products WHERE id = ?")
        .bind(&product_id)
        .fetch_one(&state.db)
        .await?;

    let images: Vec<(String,)> = sqlx::query_as(
        "SELECT image_url FROM product_images WHERE product_id = ? ORDER BY is_primary DESC, display_order ASC",
    )
    .bind(&product_id)
    .fetch_all(&state.db)
    .await
    .unwrap_or_default();

    let image_urls: Vec<String> = images.into_iter().map(|(u,)| u).collect();
    let product = product_db.to_product(image_urls, None);

    Ok(send_success(product, "Cập nhật món ăn thành công"))
}

/// DELETE /api/products/:productId (Admin only)
pub async fn delete_product(
    State(state): State<AppState>,
    _admin: RequireAdmin,
    Path(product_id): Path<String>,
) -> Result<Response, AppError> {
    let res = sqlx::query("DELETE FROM products WHERE id = ?")
        .bind(&product_id)
        .execute(&state.db)
        .await?;

    if res.rows_affected() == 0 {
        return Err(AppError::NotFound("Không tìm thấy món ăn".to_string()));
    }

    Ok(send_no_content())
}

/// POST /api/products/:productId/images (Admin only - Upload qua ImageKit)
pub async fn upload_product_images(
    State(state): State<AppState>,
    _admin: RequireAdmin,
    Path(product_id): Path<String>,
    mut multipart: Multipart,
) -> Result<Response, AppError> {
    let imagekit = ImageKitService::new(&state.http_client, &state.config);
    let mut uploaded_urls = Vec::new();

    while let Some(field) = multipart.next_field().await.map_err(|e| AppError::BadRequest(e.to_string()))? {
        let file_name = field.file_name().unwrap_or("image.jpg").to_string();
        let data = field.bytes().await.map_err(|e| AppError::BadRequest(e.to_string()))?;

        if !data.is_empty() {
            let uploaded_url = imagekit.upload_file(&file_name, data.to_vec()).await?;
            let img_id = Uuid::new_v4().to_string();

            sqlx::query(
                "INSERT INTO product_images (id, product_id, image_url, is_primary, display_order) VALUES (?, ?, ?, 0, 99)",
            )
            .bind(&img_id)
            .bind(&product_id)
            .bind(&uploaded_url)
            .execute(&state.db)
            .await?;

            uploaded_urls.push(uploaded_url);
        }
    }

    Ok(send_success(uploaded_urls, "Tải ảnh sản phẩm thành công"))
}

