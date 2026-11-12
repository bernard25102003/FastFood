use axum::{
    extract::{Path, State},
    response::Response,
    Json,
};
use crate::{
    error::AppError,
    middleware::auth::{AuthUser, RequireAdmin},
    models::user::{ChangePasswordDto, UpdateProfileDto, User},
    state::AppState,
    utils::response::send_success,
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

/// GET /api/users (Admin only)
pub async fn list_users(
    State(state): State<AppState>,
    _admin: RequireAdmin,
) -> Result<Response, AppError> {
    let users: Vec<User> = sqlx::query_as("SELECT * FROM users ORDER BY created_at DESC")
        .fetch_all(&state.db)
        .await?;

    Ok(send_success(users, "Danh sách người dùng"))
}

/// PATCH /api/users/:id/status (Admin only)
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

