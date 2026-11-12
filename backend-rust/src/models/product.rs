use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use super::category::Category;

#[derive(Debug, Clone, FromRow)]
pub struct ProductDb {
    pub id: String,
    pub name: String,
    pub price: f64,
    pub category_id: String,
    pub description: Option<String>,
    pub sold_count: i32,
    pub avg_rating: f64,
    pub review_count: i32,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
#[serde(rename_all = "camelCase")]
pub struct ProductImageItem {
    pub id: String,
    pub product_id: String,
    pub image_url: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub thumbnail_url: Option<String>,
    pub display_order: i32,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub created_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Product {
    pub id: String,
    pub name: String,
    pub price: f64,
    pub category_id: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub category: Option<Category>,
    pub description: Option<String>,
    pub sold_count: i32,
    pub avg_rating: f64,
    pub review_count: i32,
    pub images: Vec<ProductImageItem>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl ProductDb {
    pub fn to_product(self, images: Vec<ProductImageItem>, category: Option<Category>) -> Product {
        Product {
            id: self.id,
            name: self.name,
            price: self.price,
            category_id: self.category_id,
            category,
            description: self.description,
            sold_count: self.sold_count,
            avg_rating: self.avg_rating,
            review_count: self.review_count,
            images,
            created_at: self.created_at,
            updated_at: self.updated_at,
        }
    }
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateProductDto {
    pub name: String,
    pub price: f64,
    pub category_id: String,
    pub description: Option<String>,
    pub images: Option<Vec<String>>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateProductDto {
    pub name: Option<String>,
    pub price: Option<f64>,
    pub category_id: Option<String>,
    pub description: Option<String>,
    pub images: Option<Vec<String>>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ReorderImagesDto {
    pub image_ids: Vec<String>,
}

#[derive(Debug, Deserialize)]
pub struct ProductQuery {
    pub page: Option<i64>,
    pub limit: Option<i64>,
    pub search: Option<String>,
    #[serde(rename = "categoryId")]
    pub category_id: Option<String>,
    #[serde(rename = "sortBy")]
    pub sort_by: Option<String>, // price, soldCount, avgRating, createdAt
    #[serde(rename = "sortOrder")]
    pub sort_order: Option<String>, // asc, desc
    #[serde(rename = "minPrice")]
    pub min_price: Option<f64>,
    #[serde(rename = "maxPrice")]
    pub max_price: Option<f64>,
}
