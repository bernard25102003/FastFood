use axum::{
    async_trait,
    extract::FromRequestParts,
    http::request::Parts,
};
use crate::{
    error::AppError,
    state::AppState,
    utils::jwt::verify_token,
};

#[derive(Clone, Debug)]
pub struct AuthUser {
    pub id: String,
    pub email: String,
    pub role: String,
}

#[async_trait]
impl FromRequestParts<AppState> for AuthUser {
    type Rejection = AppError;

    async fn from_request_parts(
        parts: &mut Parts,
        state: &AppState,
    ) -> Result<Self, Self::Rejection> {
        let auth_header = parts
            .headers
            .get("Authorization")
            .and_then(|v| v.to_str().ok())
            .ok_or_else(|| {
                AppError::Unauthorized("Vui lòng đăng nhập để tiếp tục (Thiếu Authorization header)".to_string())
            })?;

        if !auth_header.starts_with("Bearer ") {
            return Err(AppError::Unauthorized("Định dạng Token không đúng (Cần 'Bearer <token>')".to_string()));
        }

        let token = &auth_header[7..];
        let claims = verify_token(token, &state.config.jwt_secret)?;

        Ok(AuthUser {
            id: claims.sub,
            email: claims.email,
            role: claims.role,
        })
    }
}

pub struct RequireAdmin(pub AuthUser);

#[async_trait]
impl FromRequestParts<AppState> for RequireAdmin {
    type Rejection = AppError;

    async fn from_request_parts(
        parts: &mut Parts,
        state: &AppState,
    ) -> Result<Self, Self::Rejection> {
        let auth_user = AuthUser::from_request_parts(parts, state).await?;
        if auth_user.role != "ADMIN" {
            return Err(AppError::Forbidden("Chỉ Quản trị viên (Admin) mới có quyền truy cập".to_string()));
        }
        Ok(RequireAdmin(auth_user))
    }
}

