use axum::{
    extract::{Path, Query, State},
    response::Response,
    Json,
};
use uuid::Uuid;

use crate::{
    error::AppError,
    middleware::auth::{AuthUser, RequireAdmin},
    models::review::{CreateReviewDto, Review, ReviewQuery},
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

    let items: Vec<Review> = sqlx::query_as(
        "SELECT * FROM reviews WHERE product_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?",
    )
    .bind(&product_id)
    .bind(limit)
    .bind(offset)
    .fetch_all(&state.db)
    .await?;

    let total_pages = if total.0 == 0 { 1 } else { (total.0 as f64 / limit as f64).ceil() as i64 };

    let paginated = PaginatedResponse {
        items,
        pagination: Pagination {
            page,
            limit,
            total: total.0,
            total_pages,
        },
    };

    Ok(send_success(paginated, "Danh sách đánh giá món ăn"))
}

/// POST /api/reviews (Đánh giá món ăn)
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

    Ok(send_created(review, "Đánh giá món ăn thành công"))
}

/// DELETE /api/reviews/:id (Admin xóa review)
pub async fn delete_review(
    State(state): State<AppState>,
    _admin: RequireAdmin,
    Path(id): Path<String>,
) -> Result<Response, AppError> {
    sqlx::query("DELETE FROM reviews WHERE id = ?")
        .bind(&id)
        .execute(&state.db)
        .await?;

    Ok(send_no_content())
}

