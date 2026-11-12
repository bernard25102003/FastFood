use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, FromRow, Serialize, Deserialize)]
pub struct EmailOtp {
    pub id: String,
    pub email: String,
    pub otp_code: String,
    pub otp_type: String,
    pub attempts: i32,
    pub is_used: i8,
    pub expires_at: DateTime<Utc>,
    pub created_at: DateTime<Utc>,
}

