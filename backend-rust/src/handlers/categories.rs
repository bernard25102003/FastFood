use axum::{
    extract::{Path, State},
    response::Response,
    Json,
};
use uuid::Uuid;

use crate::{
    error::AppError,
    middleware::auth::RequireAdmin,
    models::category::{Category, CreateCategoryDto, UpdateCategoryDto},
    state::AppState,
    utils::response::{send_created, send_no_content, send_success},
};

/// GET /api/categories
pub async fn list_categories(State(state): State<AppState>) -> Result<Response, AppError> {
    let categories: Vec<Category> = sqlx::query_as(
        "SELECT * FROM categories ORDER BY name ASC",
    )
    .fetch_all(&state.db)
    .await?;

    Ok(send_success(categories, "Danh sách danh mục món ăn"))
}

/// GET /api/categories/:id
pub async fn get_category_by_id(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> Result<Response, AppError> {
    let category: Option<Category> = sqlx::query_as(
        "SELECT * FROM categories WHERE id = ? LIMIT 1",
    )
    .bind(&id)
    .fetch_optional(&state.db)
    .await?;

    let category = category.ok_or_else(|| AppError::NotFound("Không tìm thấy danh mục".to_string()))?;
    Ok(send_success(category, "Chi tiết danh mục"))
}

/// POST /api/categories (Admin only)
pub async fn create_category(
    State(state): State<AppState>,
    _admin: RequireAdmin,
    Json(payload): Json<CreateCategoryDto>,
) -> Result<Response, AppError> {
    let name = payload.name.trim();
    if name.is_empty() {
        return Err(AppError::Validation("Tên danh mục không được để trống".to_string()));
    }

    let id = format!("cat-{}", Uuid::new_v4());

    sqlx::query(
        "INSERT INTO categories (id, name, description, icon) VALUES (?, ?, ?, ?)",
    )
    .bind(&id)
    .bind(name)
    .bind(payload.description)
    .bind(payload.icon)
    .execute(&state.db)
    .await?;

    let category: Category = sqlx::query_as("SELECT * FROM categories WHERE id = ?")
        .bind(&id)
        .fetch_one(&state.db)
        .await?;

    Ok(send_created(category, "Tạo danh mục thành công"))
}

/// PUT /api/categories/:id (Admin only)
pub async fn update_category(
    State(state): State<AppState>,
    _admin: RequireAdmin,
    Path(id): Path<String>,
    Json(payload): Json<UpdateCategoryDto>,
) -> Result<Response, AppError> {
    sqlx::query(
        "UPDATE categories SET name = COALESCE(?, name), description = COALESCE(?, description), icon = COALESCE(?, icon) WHERE id = ?",
    )
    .bind(payload.name)
    .bind(payload.description)
    .bind(payload.icon)
    .bind(&id)
    .execute(&state.db)
    .await?;

    let category: Category = sqlx::query_as("SELECT * FROM categories WHERE id = ?")
        .bind(&id)
        .fetch_one(&state.db)
        .await?;

    Ok(send_success(category, "Cập nhật danh mục thành công"))
}

/// DELETE /api/categories/:id (Admin only)
pub async fn delete_category(
    State(state): State<AppState>,
    _admin: RequireAdmin,
    Path(id): Path<String>,
) -> Result<Response, AppError> {
    let res = sqlx::query("DELETE FROM categories WHERE id = ?")
        .bind(&id)
        .execute(&state.db)
        .await?;

    if res.rows_affected() == 0 {
        return Err(AppError::NotFound("Không tìm thấy danh mục để xóa".to_string()));
    }

    Ok(send_no_content())
}

