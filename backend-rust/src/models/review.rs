use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use crate::models::product::ProductImageItem;

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

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ReviewProductSummary {
    pub id: String,
    pub name: String,
    pub images: Vec<ProductImageItem>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ReviewUserSummary {
    pub id: String,
    pub name: String,
    pub email: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ReviewResponse {
    pub id: String,
    pub user_id: String,
    pub product_id: String,
    pub rating: i32,
    pub comment: String,
    pub content: String,
    pub verified: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub product: Option<ReviewProductSummary>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub user: Option<ReviewUserSummary>,
}

impl Review {
    pub fn to_response(
        self,
        product: Option<ReviewProductSummary>,
        user: Option<ReviewUserSummary>,
    ) -> ReviewResponse {
        ReviewResponse {
            id: self.id,
            user_id: self.user_id,
            product_id: self.product_id,
            rating: self.rating,
            comment: self.comment.clone(),
            content: self.comment,
            verified: true,
            created_at: self.created_at,
            updated_at: self.updated_at,
            product,
            user,
        }
    }
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
    pub rating: Option<i32>,
    #[serde(rename = "productId")]
    pub product_id: Option<String>,
}

