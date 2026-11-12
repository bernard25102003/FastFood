use chrono::{Duration, Utc};
use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, Validation};
use serde::{Deserialize, Serialize};
use crate::error::AppError;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Claims {
    pub sub: String,       // user_id
    pub email: String,
    pub role: String,      // USER or ADMIN
    pub exp: i64,          // expiration timestamp
    pub iat: i64,          // issued at
    pub token_type: String,// "access" or "refresh"
}

pub struct TokenPair {
    pub access_token: String,
    pub refresh_token: String,
}

pub fn generate_tokens(
    user_id: &str,
    email: &str,
    role: &str,
    secret: &str,
    refresh_secret: &str,
    access_hours: i64,
    refresh_days: i64,
) -> Result<TokenPair, AppError> {
    let now = Utc::now();
    let access_exp = (now + Duration::hours(access_hours)).timestamp();
    let refresh_exp = (now + Duration::days(refresh_days)).timestamp();

    let access_claims = Claims {
        sub: user_id.to_string(),
        email: email.to_string(),
        role: role.to_string(),
        exp: access_exp,
        iat: now.timestamp(),
        token_type: "access".to_string(),
    };

    let refresh_claims = Claims {
        sub: user_id.to_string(),
        email: email.to_string(),
        role: role.to_string(),
        exp: refresh_exp,
        iat: now.timestamp(),
        token_type: "refresh".to_string(),
    };

    let access_token = encode(
        &Header::default(),
        &access_claims,
        &EncodingKey::from_secret(secret.as_bytes()),
    )
    .map_err(|e| AppError::Internal(format!("Error encoding access token: {}", e)))?;

    let refresh_token = encode(
        &Header::default(),
        &refresh_claims,
        &EncodingKey::from_secret(refresh_secret.as_bytes()),
    )
    .map_err(|e| AppError::Internal(format!("Error encoding refresh token: {}", e)))?;

    Ok(TokenPair {
        access_token,
        refresh_token,
    })
}

pub fn verify_token(token: &str, secret: &str) -> Result<Claims, AppError> {
    let mut validation = Validation::default();
    validation.validate_exp = true;

    let token_data = decode::<Claims>(
        token,
        &DecodingKey::from_secret(secret.as_bytes()),
        &validation,
    )
    .map_err(|_| AppError::Unauthorized("Mã xác thực không hợp lệ hoặc đã hết hạn".to_string()))?;

    Ok(token_data.claims)
}

