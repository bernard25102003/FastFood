use axum::{
    extract::{Path, Query, State},
    response::Response,
    Json,
};
use chrono::{DateTime, Utc};
use std::collections::HashMap;
use uuid::Uuid;

use crate::{
    error::AppError,
    middleware::auth::{AuthUser, RequireAdmin},
    models::{
        product::ProductImageItem,
        review::{
            CreateReviewDto, Review, ReviewProductSummary, ReviewQuery, ReviewResponse,
            ReviewUserSummary,
        },
    },
    state::AppState,
    utils::response::{send_created, send_no_content, send_success, PaginatedResponse, Pagination},
};

/// GET /api/reviews/product/:productId
pub async fn list_product_reviews(
    State(state): State<AppState>,
    Path(product_id): Path<String>,
    Query(query): Query<ReviewQuery>,
) -> Result<Response, AppError> {
    let page = query.page.unwrap_or(1).max(1);
    let limit = query.limit.unwrap_or(10).clamp(1, 100);
    let offset = (page - 1) * limit;

    let total: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM reviews WHERE product_id = ?")
        .bind(&product_id)
        .fetch_one(&state.db)
        .await?;

    let raw_reviews: Vec<Review> = sqlx::query_as(
        "SELECT * FROM reviews WHERE product_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?",
    )
    .bind(&product_id)
    .bind(limit)
    .bind(offset)
    .fetch_all(&state.db)
    .await?;

    if raw_reviews.is_empty() {
        let paginated = PaginatedResponse {
            items: Vec::<ReviewResponse>::new(),
            pagination: Pagination::new(page, limit, total.0),
        };
        return Ok(send_success(paginated, "Danh sách đánh giá món ăn"));
    }

    // Lookup users
    let user_ids: Vec<String> = raw_reviews.iter().map(|r| r.user_id.clone()).collect();
    let u_placeholders = vec!["?"; user_ids.len()].join(",");
    let users_query = format!("SELECT id, name, email FROM users WHERE id IN ({})", u_placeholders);
    let mut u_q = sqlx::query_as::<_, (String, String, String)>(&users_query);
    for uid in &user_ids {
        u_q = u_q.bind(uid);
    }
    let raw_users = u_q.fetch_all(&state.db).await.unwrap_or_default();
    let mut user_map: HashMap<String, ReviewUserSummary> = HashMap::new();
    for (id, name, email) in raw_users {
        user_map.insert(id.clone(), ReviewUserSummary { id, name, email });
    }

    let items: Vec<ReviewResponse> = raw_reviews
        .into_iter()
        .map(|r| {
            let u = user_map.get(&r.user_id).cloned();
            r.to_response(None, u)
        })
        .collect();

    let paginated = PaginatedResponse {
        items,
        pagination: Pagination::new(page, limit, total.0),
    };

    Ok(send_success(paginated, "Danh sách đánh giá món ăn"))
}

/// GET /api/reviews/admin (Admin only)
pub async fn list_all_reviews(
    State(state): State<AppState>,
    _admin: RequireAdmin,
    Query(query): Query<ReviewQuery>,
) -> Result<Response, AppError> {
    let page = query.page.unwrap_or(1).max(1);
    let limit = query.limit.unwrap_or(10).clamp(1, 100);
    let offset = (page - 1) * limit;

    let mut conditions = Vec::new();
    if let Some(rating) = query.rating {
        conditions.push(format!("rating = {}", rating));
    }
    if let Some(ref pid) = query.product_id {
        if !pid.trim().is_empty() {
            conditions.push(format!("product_id = '{}'", pid.replace('\'', "''")));
        }
    }

    let where_clause = if conditions.is_empty() {
        String::new()
    } else {
        format!("WHERE {}", conditions.join(" AND "))
    };

    let count_query = format!("SELECT COUNT(*) FROM reviews {}", where_clause);
    let total: (i64,) = sqlx::query_as(&count_query)
        .fetch_one(&state.db)
        .await?;

    let select_query = format!(
        "SELECT * FROM reviews {} ORDER BY created_at DESC LIMIT {} OFFSET {}",
        where_clause, limit, offset
    );
    let raw_reviews: Vec<Review> = sqlx::query_as(&select_query)
        .fetch_all(&state.db)
        .await?;

    if raw_reviews.is_empty() {
        let paginated = PaginatedResponse {
            items: Vec::<ReviewResponse>::new(),
            pagination: Pagination::new(page, limit, total.0),
        };
        return Ok(send_success(paginated, "Danh sách quản lý đánh giá"));
    }

    // Lookup users
    let user_ids: Vec<String> = raw_reviews.iter().map(|r| r.user_id.clone()).collect();
    let u_placeholders = vec!["?"; user_ids.len()].join(",");
    let users_query = format!("SELECT id, name, email FROM users WHERE id IN ({})", u_placeholders);
    let mut u_q = sqlx::query_as::<_, (String, String, String)>(&users_query);
    for uid in &user_ids {
        u_q = u_q.bind(uid);
    }
    let raw_users = u_q.fetch_all(&state.db).await.unwrap_or_default();
    let mut user_map: HashMap<String, ReviewUserSummary> = HashMap::new();
    for (id, name, email) in raw_users {
        user_map.insert(id.clone(), ReviewUserSummary { id, name, email });
    }

    // Lookup products
    let prod_ids: Vec<String> = raw_reviews.iter().map(|r| r.product_id.clone()).collect();
    let p_placeholders = vec!["?"; prod_ids.len()].join(",");
    let prods_query = format!("SELECT id, name FROM products WHERE id IN ({})", p_placeholders);
    let mut p_q = sqlx::query_as::<_, (String, String)>(&prods_query);
    for pid in &prod_ids {
        p_q = p_q.bind(pid);
    }
    let raw_prods = p_q.fetch_all(&state.db).await.unwrap_or_default();

    // Lookup product images
    let img_query = format!(
        "SELECT id, product_id, image_url, display_order, created_at FROM product_images WHERE product_id IN ({}) ORDER BY is_primary DESC, display_order ASC",
        p_placeholders
    );
    let mut img_q = sqlx::query_as::<_, (String, String, String, i32, DateTime<Utc>)>(&img_query);
    for pid in &prod_ids {
        img_q = img_q.bind(pid);
    }
    let raw_imgs = img_q.fetch_all(&state.db).await.unwrap_or_default();
    let mut img_map: HashMap<String, Vec<ProductImageItem>> = HashMap::new();
    for (id, pid, url, display_order, created_at) in raw_imgs {
        img_map.entry(pid.clone()).or_default().push(ProductImageItem {
            id,
            product_id: pid,
            thumbnail_url: Some(url.clone()),
            image_url: url,
            display_order,
            created_at: Some(created_at),
        });
    }

    let mut prod_map: HashMap<String, ReviewProductSummary> = HashMap::new();
    for (id, name) in raw_prods {
        let imgs = img_map.remove(&id).unwrap_or_default();
        prod_map.insert(id.clone(), ReviewProductSummary { id, name, images: imgs });
    }

    let items: Vec<ReviewResponse> = raw_reviews
        .into_iter()
        .map(|r| {
            let u = user_map.get(&r.user_id).cloned();
            let p = prod_map.get(&r.product_id).cloned();
            r.to_response(p, u)
        })
        .collect();

    let paginated = PaginatedResponse {
        items,
        pagination: Pagination::new(page, limit, total.0),
    };

    Ok(send_success(paginated, "Danh sách quản lý đánh giá"))
}

/// GET /api/reviews/my (Xem các đánh giá của chính mình)
pub async fn list_my_reviews(
    State(state): State<AppState>,
    auth_user: AuthUser,
    Query(query): Query<ReviewQuery>,
) -> Result<Response, AppError> {
    let page = query.page.unwrap_or(1).max(1);
    let limit = query.limit.unwrap_or(10).clamp(1, 100);
    let offset = (page - 1) * limit;

    let total: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM reviews WHERE user_id = ?")
        .bind(&auth_user.id)
        .fetch_one(&state.db)
        .await?;

    let raw_reviews: Vec<Review> = sqlx::query_as(
        "SELECT * FROM reviews WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?",
    )
    .bind(&auth_user.id)
    .bind(limit)
    .bind(offset)
    .fetch_all(&state.db)
    .await?;

    if raw_reviews.is_empty() {
        let paginated = PaginatedResponse {
            items: Vec::<ReviewResponse>::new(),
            pagination: Pagination::new(page, limit, total.0),
        };
        return Ok(send_success(paginated, "Đánh giá của bạn"));
    }

    let prod_ids: Vec<String> = raw_reviews.iter().map(|r| r.product_id.clone()).collect();
    let p_placeholders = vec!["?"; prod_ids.len()].join(",");
    let prods_query = format!("SELECT id, name FROM products WHERE id IN ({})", p_placeholders);
    let mut p_q = sqlx::query_as::<_, (String, String)>(&prods_query);
    for pid in &prod_ids {
        p_q = p_q.bind(pid);
    }
    let raw_prods = p_q.fetch_all(&state.db).await.unwrap_or_default();

    let img_query = format!(
        "SELECT id, product_id, image_url, display_order, created_at FROM product_images WHERE product_id IN ({}) ORDER BY is_primary DESC, display_order ASC",
        p_placeholders
    );
    let mut img_q = sqlx::query_as::<_, (String, String, String, i32, DateTime<Utc>)>(&img_query);
    for pid in &prod_ids {
        img_q = img_q.bind(pid);
    }
    let raw_imgs = img_q.fetch_all(&state.db).await.unwrap_or_default();
    let mut img_map: HashMap<String, Vec<ProductImageItem>> = HashMap::new();
    for (id, pid, url, display_order, created_at) in raw_imgs {
        img_map.entry(pid.clone()).or_default().push(ProductImageItem {
            id,
            product_id: pid,
            thumbnail_url: Some(url.clone()),
            image_url: url,
            display_order,
            created_at: Some(created_at),
        });
    }

    let mut prod_map: HashMap<String, ReviewProductSummary> = HashMap::new();
    for (id, name) in raw_prods {
        let imgs = img_map.remove(&id).unwrap_or_default();
        prod_map.insert(id.clone(), ReviewProductSummary { id, name, images: imgs });
    }

    let items: Vec<ReviewResponse> = raw_reviews
        .into_iter()
        .map(|r| {
            let p = prod_map.get(&r.product_id).cloned();
            r.to_response(p, None)
        })
        .collect();

    let paginated = PaginatedResponse {
        items,
        pagination: Pagination::new(page, limit, total.0),
    };

    Ok(send_success(paginated, "Đánh giá của bạn"))
}

/// POST /api/reviews (Đánh giá món ăn - Chỉ cho phép người đã mua và nhận hàng thành công)
pub async fn create_review(
    State(state): State<AppState>,
    auth_user: AuthUser,
    Json(payload): Json<CreateReviewDto>,
) -> Result<Response, AppError> {
    if payload.rating < 1 || payload.rating > 5 {
        return Err(AppError::Validation("Điểm đánh giá phải từ 1 đến 5 sao".to_string()));
    }

    let comment = payload
        .comment
        .or(payload.content)
        .unwrap_or_default();

    if comment.trim().is_empty() {
        return Err(AppError::Validation("Nội dung đánh giá không được để trống".to_string()));
    }

    // Kiểm tra xem người dùng đã mua sản phẩm này trong đơn hàng COMPLETED chưa
    if auth_user.role != "ADMIN" {
        let has_purchased: (i64,) = sqlx::query_as(
            r#"SELECT COUNT(*) FROM order_items oi
               JOIN orders o ON oi.order_id = o.id
               WHERE o.user_id = ? AND oi.product_id = ? AND o.status = 'COMPLETED'"#,
        )
        .bind(&auth_user.id)
        .bind(&payload.product_id)
        .fetch_one(&state.db)
        .await?;

        if has_purchased.0 == 0 {
            return Err(AppError::Forbidden(
                "Bạn chỉ có thể đánh giá sản phẩm sau khi đã mua và nhận hàng thành công (đơn hàng COMPLETED).".to_string(),
            ));
        }
    }

    let id = format!("rev-{}", Uuid::new_v4());
    let mut tx = state.db.begin().await?;

    // Upsert đánh giá
    sqlx::query(
        r#"INSERT INTO reviews (id, user_id, product_id, rating, comment)
           VALUES (?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE rating = VALUES(rating), comment = VALUES(comment), updated_at = NOW()"#,
    )
    .bind(&id)
    .bind(&auth_user.id)
    .bind(&payload.product_id)
    .bind(payload.rating)
    .bind(&comment)
    .execute(&mut *tx)
    .await?;

    // Tính lại avg_rating và review_count của sản phẩm
    let stats: (Option<f64>, i64) = sqlx::query_as(
        "SELECT AVG(rating), COUNT(*) FROM reviews WHERE product_id = ?",
    )
    .bind(&payload.product_id)
    .fetch_one(&mut *tx)
    .await?;

    let avg = stats.0.unwrap_or(5.0);
    let count = stats.1 as i32;

    sqlx::query("UPDATE products SET avg_rating = ?, review_count = ? WHERE id = ?")
        .bind(avg)
        .bind(count)
        .bind(&payload.product_id)
        .execute(&mut *tx)
        .await?;

    tx.commit().await?;

    let review: Review = sqlx::query_as("SELECT * FROM reviews WHERE user_id = ? AND product_id = ?")
        .bind(&auth_user.id)
        .bind(&payload.product_id)
        .fetch_one(&state.db)
        .await?;

    Ok(send_created(review.to_response(None, None), "Đánh giá món ăn thành công"))
}

/// DELETE /api/reviews/:id (Admin hoặc tác giả xóa review - Tự động tính lại điểm trung bình)
pub async fn delete_review(
    State(state): State<AppState>,
    auth_user: AuthUser,
    Path(id): Path<String>,
) -> Result<Response, AppError> {
    let review: Option<(String, String)> = sqlx::query_as("SELECT product_id, user_id FROM reviews WHERE id = ?")
        .bind(&id)
        .fetch_optional(&state.db)
        .await?;

    let (product_id, user_id) = match review {
        Some(r) => r,
        None => return Err(AppError::NotFound("Không tìm thấy đánh giá".to_string())),
    };

    if auth_user.role != "ADMIN" && user_id != auth_user.id {
        return Err(AppError::Forbidden("Bạn không có quyền xóa đánh giá này".to_string()));
    }

    let mut tx = state.db.begin().await?;

    sqlx::query("DELETE FROM reviews WHERE id = ?")
        .bind(&id)
        .execute(&mut *tx)
        .await?;

    // Tính lại avg_rating và review_count của sản phẩm sau khi xóa
    let stats: (Option<f64>, i64) = sqlx::query_as(
        "SELECT AVG(rating), COUNT(*) FROM reviews WHERE product_id = ?",
    )
    .bind(&product_id)
    .fetch_one(&mut *tx)
    .await?;

    let avg = stats.0.unwrap_or(0.0);
    let count = stats.1 as i32;

    sqlx::query("UPDATE products SET avg_rating = ?, review_count = ? WHERE id = ?")
        .bind(avg)
        .bind(count)
        .bind(&product_id)
        .execute(&mut *tx)
        .await?;

    tx.commit().await?;

    Ok(send_no_content())
}
