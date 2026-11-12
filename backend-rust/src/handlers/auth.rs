use axum::{
    extract::State,
    response::Response,
    Json,
};
use chrono::{Duration, Utc};
use rand::Rng;
use uuid::Uuid;

use crate::{
    error::AppError,
    models::user::{
        AuthResponse, ChangePasswordDto, ForgotPasswordDto, LoginDto, RefreshTokenDto,
        RegisterWithOtpDto, SendOtpDto, User,
    },
    services::brevo::BrevoService,
    state::AppState,
    utils::{
        jwt::{generate_tokens, verify_token},
        response::{send_created, send_success},
    },
};

/// POST /api/auth/send-register-otp
pub async fn send_register_otp(
    State(state): State<AppState>,
    Json(payload): Json<SendOtpDto>,
) -> Result<Response, AppError> {
    let email = payload.email.trim().to_lowercase();
    if email.is_empty() || !email.contains('@') {
        return Err(AppError::Validation("Email không hợp lệ".to_string()));
    }

    // 1. Kiểm tra email đã đăng ký chưa
    let existing: Option<(String,)> = sqlx::query_as("SELECT id FROM users WHERE email = ? LIMIT 1")
        .bind(&email)
        .fetch_optional(&state.db)
        .await?;

    if existing.is_some() {
        return Err(AppError::Conflict("Email này đã được đăng ký tài khoản".to_string()));
    }

    // 2. Chống spam: kiểm tra lần gửi gần nhất trong vòng 60 giây
    let recent_count: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM email_otps WHERE email = ? AND created_at > ? AND is_used = 0",
    )
    .bind(&email)
    .bind(Utc::now() - Duration::seconds(60))
    .fetch_one(&state.db)
    .await?;

    if recent_count.0 > 0 {
        return Err(AppError::BadRequest(
            "Vui lòng đợi 60 giây trước khi yêu cầu mã OTP mới".to_string(),
        ));
    }

    // 3. Sinh mã OTP 6 số
    let otp_code: String = format!("{:06}", rand::thread_rng().gen_range(100_000..999_999));
    let expires_at = Utc::now() + Duration::minutes(5);
    let otp_id = Uuid::new_v4().to_string();

    sqlx::query(
        "INSERT INTO email_otps (id, email, otp_code, otp_type, expires_at) VALUES (?, ?, ?, 'REGISTER', ?)",
    )
    .bind(&otp_id)
    .bind(&email)
    .bind(&otp_code)
    .bind(expires_at)
    .execute(&state.db)
    .await?;

    // 4. Gửi email qua Brevo
    let brevo = BrevoService::new(&state.http_client, &state.config);
    brevo.send_otp_email(&email, &otp_code, "REGISTER").await?;

    Ok(send_success(
        serde_json::json!({ "email": email, "expiresInSeconds": 300 }),
        "Mã OTP đã được gửi về email của bạn",
    ))
}

/// POST /api/auth/register-with-otp hoặc /api/auth/register
pub async fn register_with_otp(
    State(state): State<AppState>,
    Json(payload): Json<RegisterWithOtpDto>,
) -> Result<Response, AppError> {
    let email = payload.email.trim().to_lowercase();
    let name = payload.name.trim();

    if email.is_empty() || name.is_empty() || payload.password.len() < 6 {
        return Err(AppError::Validation(
            "Thông tin đăng ký không hợp lệ (Mật khẩu tối thiểu 6 ký tự)".to_string(),
        ));
    }

    // 1. Xác thực OTP
    let otp_record: Option<(String,)> = sqlx::query_as(
        "SELECT id FROM email_otps WHERE email = ? AND otp_code = ? AND otp_type = 'REGISTER' AND is_used = 0 AND expires_at > ? LIMIT 1",
    )
    .bind(&email)
    .bind(payload.otp.trim())
    .bind(Utc::now())
    .fetch_optional(&state.db)
    .await?;

    let otp_id = otp_record.ok_or_else(|| {
        AppError::BadRequest("Mã OTP không chính xác hoặc đã hết hạn".to_string())
    })?.0;

    // 2. Hash mật khẩu
    let password_hash = bcrypt::hash(&payload.password, 10)
        .map_err(|e| AppError::Internal(format!("Lỗi mã hóa mật khẩu: {}", e)))?;

    let user_id = Uuid::new_v4().to_string();

    // 3. Mở Transaction
    let mut tx = state.db.begin().await?;

    sqlx::query(
        "INSERT INTO users (id, name, email, password_hash, phone, address, role, status) VALUES (?, ?, ?, ?, ?, ?, 'USER', 'ACTIVE')",
    )
    .bind(&user_id)
    .bind(name)
    .bind(&email)
    .bind(&password_hash)
    .bind(&payload.phone)
    .bind(&payload.address)
    .execute(&mut *tx)
    .await?;

    // Đánh dấu OTP đã dùng
    sqlx::query("UPDATE email_otps SET is_used = 1 WHERE id = ?")
        .bind(&otp_id)
        .execute(&mut *tx)
        .await?;

    tx.commit().await?;

    // 4. Lấy thông tin user vừa tạo
    let user: User = sqlx::query_as("SELECT * FROM users WHERE id = ?")
        .bind(&user_id)
        .fetch_one(&state.db)
        .await?;

    // 5. Cấp phát Token
    let tokens = generate_tokens(
        &user.id,
        &user.email,
        &user.role,
        &state.config.jwt_secret,
        &state.config.jwt_refresh_secret,
        state.config.jwt_expiration_hours,
        state.config.jwt_refresh_expiration_days,
    )?;

    Ok(send_created(
        AuthResponse {
            user,
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
        },
        "Đăng ký tài khoản thành công",
    ))
}

/// POST /api/auth/login
pub async fn login(
    State(state): State<AppState>,
    Json(payload): Json<LoginDto>,
) -> Result<Response, AppError> {
    let email = payload.email.trim().to_lowercase();
    let user: Option<User> = sqlx::query_as("SELECT * FROM users WHERE email = ? LIMIT 1")
        .bind(&email)
        .fetch_optional(&state.db)
        .await?;

    let user = user.ok_or_else(|| {
        AppError::Unauthorized("Email hoặc mật khẩu không chính xác".to_string())
    })?;

    if user.status == "LOCKED" {
        return Err(AppError::Forbidden("Tài khoản của bạn đã bị khóa".to_string()));
    }

    let is_valid = bcrypt::verify(&payload.password, &user.password_hash)
        .unwrap_or(false);

    if !is_valid {
        return Err(AppError::Unauthorized("Email hoặc mật khẩu không chính xác".to_string()));
    }

    let tokens = generate_tokens(
        &user.id,
        &user.email,
        &user.role,
        &state.config.jwt_secret,
        &state.config.jwt_refresh_secret,
        state.config.jwt_expiration_hours,
        state.config.jwt_refresh_expiration_days,
    )?;

    Ok(send_success(
        AuthResponse {
            user,
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
        },
        "Đăng nhập thành công",
    ))
}

/// POST /api/auth/refresh
pub async fn refresh_token(
    State(state): State<AppState>,
    Json(payload): Json<RefreshTokenDto>,
) -> Result<Response, AppError> {
    let claims = verify_token(&payload.refresh_token, &state.config.jwt_refresh_secret)?;

    let user: User = sqlx::query_as("SELECT * FROM users WHERE id = ? LIMIT 1")
        .bind(&claims.sub)
        .fetch_one(&state.db)
        .await?;

    if user.status == "LOCKED" {
        return Err(AppError::Forbidden("Tài khoản đã bị khóa".to_string()));
    }

    let tokens = generate_tokens(
        &user.id,
        &user.email,
        &user.role,
        &state.config.jwt_secret,
        &state.config.jwt_refresh_secret,
        state.config.jwt_expiration_hours,
        state.config.jwt_refresh_expiration_days,
    )?;

    Ok(send_success(
        serde_json::json!({
            "accessToken": tokens.access_token,
            "refreshToken": tokens.refresh_token,
        }),
        "Làm mới token thành công",
    ))
}

/// POST /api/auth/logout
pub async fn logout() -> Response {
    send_success(serde_json::json!({}), "Đăng xuất thành công")
}

/// POST /api/auth/forgot-password
pub async fn forgot_password_send_otp(
    State(state): State<AppState>,
    Json(payload): Json<SendOtpDto>,
) -> Result<Response, AppError> {
    let email = payload.email.trim().to_lowercase();
    let existing: Option<(String,)> = sqlx::query_as("SELECT id FROM users WHERE email = ? LIMIT 1")
        .bind(&email)
        .fetch_optional(&state.db)
        .await?;

    if existing.is_none() {
        return Err(AppError::NotFound("Không tìm thấy tài khoản với email này".to_string()));
    }

    let otp_code: String = format!("{:06}", rand::thread_rng().gen_range(100_000..999_999));
    let expires_at = Utc::now() + Duration::minutes(5);
    let otp_id = Uuid::new_v4().to_string();

    sqlx::query(
        "INSERT INTO email_otps (id, email, otp_code, otp_type, expires_at) VALUES (?, ?, ?, 'FORGOT_PASSWORD', ?)",
    )
    .bind(&otp_id)
    .bind(&email)
    .bind(&otp_code)
    .bind(expires_at)
    .execute(&state.db)
    .await?;

    let brevo = BrevoService::new(&state.http_client, &state.config);
    brevo.send_otp_email(&email, &otp_code, "FORGOT_PASSWORD").await?;

    Ok(send_success(
        serde_json::json!({ "email": email }),
        "Mã xác thực đã được gửi về email của bạn",
    ))
}

/// POST /api/auth/reset-password
pub async fn forgot_password_reset(
    State(state): State<AppState>,
    Json(payload): Json<ForgotPasswordDto>,
) -> Result<Response, AppError> {
    let email = payload.email.trim().to_lowercase();
    if payload.new_password.len() < 6 {
        return Err(AppError::Validation("Mật khẩu mới tối thiểu 6 ký tự".to_string()));
    }

    let otp_record: Option<(String,)> = sqlx::query_as(
        "SELECT id FROM email_otps WHERE email = ? AND otp_code = ? AND otp_type = 'FORGOT_PASSWORD' AND is_used = 0 AND expires_at > ? LIMIT 1",
    )
    .bind(&email)
    .bind(payload.otp.trim())
    .bind(Utc::now())
    .fetch_optional(&state.db)
    .await?;

    let otp_id = otp_record.ok_or_else(|| {
        AppError::BadRequest("Mã OTP không đúng hoặc đã hết hạn".to_string())
    })?.0;

    let password_hash = bcrypt::hash(&payload.new_password, 10)
        .map_err(|e| AppError::Internal(format!("Lỗi mã hóa: {}", e)))?;

    let mut tx = state.db.begin().await?;
    sqlx::query("UPDATE users SET password_hash = ? WHERE email = ?")
        .bind(&password_hash)
        .bind(&email)
        .execute(&mut *tx)
        .await?;

    sqlx::query("UPDATE email_otps SET is_used = 1 WHERE id = ?")
        .bind(&otp_id)
        .execute(&mut *tx)
        .await?;

    tx.commit().await?;

    Ok(send_success(serde_json::json!({}), "Đặt lại mật khẩu thành công"))
}

