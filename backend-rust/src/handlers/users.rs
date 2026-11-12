use axum::{
    extract::{Path, Query, State},
    response::Response,
    Json,
};
use crate::{
    error::AppError,
    middleware::auth::{AuthUser, RequireAdmin},
    models::user::{ChangePasswordDto, UpdateProfileDto, User, UserQuery},
    state::AppState,
    utils::response::{send_no_content, send_success, PaginatedResponse, Pagination},
};

/// GET /api/users/profile
pub async fn get_profile(
    State(state): State<AppState>,
    auth_user: AuthUser,
) -> Result<Response, AppError> {
    let user: User = sqlx::query_as("SELECT * FROM users WHERE id = ? LIMIT 1")
        .bind(&auth_user.id)
        .fetch_one(&state.db)
        .await?;

    Ok(send_success(user, "Lấy thông tin người dùng thành công"))
}

/// PUT /api/users/profile
pub async fn update_profile(
    State(state): State<AppState>,
    auth_user: AuthUser,
    Json(payload): Json<UpdateProfileDto>,
) -> Result<Response, AppError> {
    sqlx::query(
        "UPDATE users SET name = COALESCE(?, name), phone = COALESCE(?, phone), address = COALESCE(?, address) WHERE id = ?",
    )
    .bind(payload.name)
    .bind(payload.phone)
    .bind(payload.address)
    .bind(&auth_user.id)
    .execute(&state.db)
    .await?;

    let user: User = sqlx::query_as("SELECT * FROM users WHERE id = ? LIMIT 1")
        .bind(&auth_user.id)
        .fetch_one(&state.db)
        .await?;

    Ok(send_success(user, "Cập nhật hồ sơ thành công"))
}

/// PUT /api/users/change-password
pub async fn change_password(
    State(state): State<AppState>,
    auth_user: AuthUser,
    Json(payload): Json<ChangePasswordDto>,
) -> Result<Response, AppError> {
    let user: User = sqlx::query_as("SELECT * FROM users WHERE id = ? LIMIT 1")
        .bind(&auth_user.id)
        .fetch_one(&state.db)
        .await?;

    let is_valid = bcrypt::verify(&payload.current_password, &user.password_hash)
        .unwrap_or(false);

    if !is_valid {
        return Err(AppError::BadRequest("Mật khẩu hiện tại không chính xác".to_string()));
    }

    if payload.new_password.len() < 6 {
        return Err(AppError::Validation("Mật khẩu mới tối thiểu 6 ký tự".to_string()));
    }

    let new_hash = bcrypt::hash(&payload.new_password, 10)
        .map_err(|e| AppError::Internal(format!("Lỗi mã hóa: {}", e)))?;

    sqlx::query("UPDATE users SET password_hash = ? WHERE id = ?")
        .bind(&new_hash)
        .bind(&auth_user.id)
        .execute(&state.db)
        .await?;

    Ok(send_success(serde_json::json!({}), "Đổi mật khẩu thành công"))
}

/// GET /api/users & GET /api/users/admin (Admin only)
pub async fn list_users(
    State(state): State<AppState>,
    _admin: RequireAdmin,
    Query(query): Query<UserQuery>,
) -> Result<Response, AppError> {
    let page = query.page.unwrap_or(1).max(1);
    let limit = query.limit.unwrap_or(10).clamp(1, 100);
    let offset = (page - 1) * limit;

    let mut conditions = Vec::new();
    if let Some(ref role) = query.role {
        if !role.trim().is_empty() {
            conditions.push(format!("role = '{}'", role.replace('\'', "''")));
        }
    }
    if let Some(ref status) = query.status {
        if !status.trim().is_empty() {
            conditions.push(format!("status = '{}'", status.replace('\'', "''")));
        }
    }

    let where_clause = if conditions.is_empty() {
        String::new()
    } else {
        format!("WHERE {}", conditions.join(" AND "))
    };

    let count_query = format!("SELECT COUNT(*) FROM users {}", where_clause);
    let total: (i64,) = sqlx::query_as(&count_query)
        .fetch_one(&state.db)
        .await?;

    let select_query = format!(
        "SELECT * FROM users {} ORDER BY created_at DESC LIMIT {} OFFSET {}",
        where_clause, limit, offset
    );
    let users: Vec<User> = sqlx::query_as(&select_query)
        .fetch_all(&state.db)
        .await?;

    let paginated = PaginatedResponse {
        items: users,
        pagination: Pagination::new(page, limit, total.0),
    };

    Ok(send_success(paginated, "Danh sách người dùng"))
}

/// GET /api/users/admin/:id (Admin only)
pub async fn get_user_by_id(
    State(state): State<AppState>,
    _admin: RequireAdmin,
    Path(user_id): Path<String>,
) -> Result<Response, AppError> {
    let user: Option<User> = sqlx::query_as("SELECT * FROM users WHERE id = ? LIMIT 1")
        .bind(&user_id)
        .fetch_optional(&state.db)
        .await?;

    let user = user.ok_or_else(|| AppError::NotFound("Không tìm thấy người dùng".to_string()))?;
    Ok(send_success(user, "Chi tiết người dùng"))
}

/// PATCH /api/users/admin/:id/lock (Admin only)
pub async fn lock_user(
    State(state): State<AppState>,
    _admin: RequireAdmin,
    Path(user_id): Path<String>,
) -> Result<Response, AppError> {
    let res = sqlx::query("UPDATE users SET status = 'LOCKED' WHERE id = ?")
        .bind(&user_id)
        .execute(&state.db)
        .await?;

    if res.rows_affected() == 0 {
        return Err(AppError::NotFound("Không tìm thấy người dùng".to_string()));
    }

    let user: User = sqlx::query_as("SELECT * FROM users WHERE id = ?")
        .bind(&user_id)
        .fetch_one(&state.db)
        .await?;

    Ok(send_success(user, "Đã khóa tài khoản thành công"))
}

/// PATCH /api/users/admin/:id/unlock (Admin only)
pub async fn unlock_user(
    State(state): State<AppState>,
    _admin: RequireAdmin,
    Path(user_id): Path<String>,
) -> Result<Response, AppError> {
    let res = sqlx::query("UPDATE users SET status = 'ACTIVE' WHERE id = ?")
        .bind(&user_id)
        .execute(&state.db)
        .await?;

    if res.rows_affected() == 0 {
        return Err(AppError::NotFound("Không tìm thấy người dùng".to_string()));
    }

    let user: User = sqlx::query_as("SELECT * FROM users WHERE id = ?")
        .bind(&user_id)
        .fetch_one(&state.db)
        .await?;

    Ok(send_success(user, "Đã mở khóa tài khoản thành công"))
}

/// DELETE /api/users/admin/:id & DELETE /api/users/:id (Admin only)
pub async fn delete_user(
    State(state): State<AppState>,
    admin: RequireAdmin,
    Path(user_id): Path<String>,
) -> Result<Response, AppError> {
    if admin.0.id == user_id {
        return Err(AppError::BadRequest("Không thể tự xóa tài khoản của chính mình".to_string()));
    }

    let res = sqlx::query("DELETE FROM users WHERE id = ?")
        .bind(&user_id)
        .execute(&state.db)
        .await?;

    if res.rows_affected() == 0 {
        return Err(AppError::NotFound("Không tìm thấy người dùng để xóa".to_string()));
    }

    Ok(send_no_content())
}

/// PATCH /api/users/:id/status (Admin only - backward compatibility)
pub async fn toggle_user_status(
    State(state): State<AppState>,
    _admin: RequireAdmin,
    Path(user_id): Path<String>,
) -> Result<Response, AppError> {
    let current_status: Option<(String,)> = sqlx::query_as("SELECT status FROM users WHERE id = ?")
        .bind(&user_id)
        .fetch_optional(&state.db)
        .await?;

    let current_status = current_status
        .ok_or_else(|| AppError::NotFound("Không tìm thấy người dùng".to_string()))?
        .0;

    let new_status = if current_status == "ACTIVE" {
        "LOCKED"
    } else {
        "ACTIVE"
    };

    sqlx::query("UPDATE users SET status = ? WHERE id = ?")
        .bind(new_status)
        .bind(&user_id)
        .execute(&state.db)
        .await?;

    Ok(send_success(
        serde_json::json!({ "id": user_id, "status": new_status }),
        "Cập nhật trạng thái người dùng thành công",
    ))
}

