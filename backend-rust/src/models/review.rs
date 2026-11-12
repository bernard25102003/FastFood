use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
#[serde(rename_all = "camelCase")]
pub struct Review {
    pub id: String,
    pub user_id: String,
    pub product_id: String,
    pub rating: i32,
    pub comment: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateReviewDto {
    pub product_id: String,
    pub rating: i32,
    pub comment: Option<String>,
    pub content: Option<String>, // Frontend đôi khi gửi field content
}

#[derive(Debug, Deserialize)]
pub struct ReviewQuery {
    pub page: Option<i64>,
    pub limit: Option<i64>,
}

