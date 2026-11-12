use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, FromRow)]
pub struct OrderDb {
    pub id: String,
    pub user_id: String,
    pub total_price: f64,
    pub status: String,
    pub payment_method: String,
    pub payment_status: String,
    pub payment_code: Option<String>,
    pub name: String,
    pub phone: String,
    pub address: String,
    pub notes: Option<String>,
    pub confirmed_at: Option<DateTime<Utc>>,
    pub completed_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct OrderItem {
    pub id: String,
    pub order_id: String,
    pub product_id: String,
    pub name: String,
    pub product_name: String,
    pub price: f64,
    pub product_price: f64,
    pub image: Option<String>,
    pub product_image: Option<String>,
    pub quantity: i32,
    pub subtotal: f64,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, FromRow)]
pub struct OrderItemDb {
    pub id: String,
    pub order_id: String,
    pub product_id: String,
    pub name: String,
    pub price: f64,
    pub image: Option<String>,
    pub quantity: i32,
    pub subtotal: f64,
    pub created_at: DateTime<Utc>,
}

impl OrderItemDb {
    pub fn to_item(self) -> OrderItem {
        OrderItem {
            id: self.id,
            order_id: self.order_id,
            product_id: self.product_id,
            name: self.name.clone(),
            product_name: self.name,
            price: self.price,
            product_price: self.price,
            image: self.image.clone(),
            product_image: self.image,
            quantity: self.quantity,
            subtotal: self.subtotal,
            created_at: self.created_at,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Order {
    pub id: String,
    pub user_id: String,
    pub order_number: String,
    pub total_price: f64,
    pub status: String,
    pub payment_method: String,
    pub payment_status: String,
    pub payment_code: Option<String>,
    pub viet_qr_url: Option<String>,
    // Hỗ trợ cả 2 chuẩn đặt tên để Frontend không bao giờ bị undefined
    pub name: String,
    pub phone: String,
    pub address: String,
    pub recipient_name: String,
    pub recipient_phone: String,
    pub recipient_address: String,
    pub notes: Option<String>,
    pub confirmed_at: Option<DateTime<Utc>>,
    pub completed_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub items: Vec<OrderItem>,
}

impl OrderDb {
    pub fn to_order(self, items: Vec<OrderItem>, viet_qr_url: Option<String>) -> Order {
        Order {
            id: self.id.clone(),
            user_id: self.user_id,
            order_number: self.id,
            total_price: self.total_price,
            status: self.status,
            payment_method: self.payment_method,
            payment_status: self.payment_status,
            payment_code: self.payment_code,
            viet_qr_url,
            name: self.name.clone(),
            phone: self.phone.clone(),
            address: self.address.clone(),
            recipient_name: self.name,
            recipient_phone: self.phone,
            recipient_address: self.address,
            notes: self.notes,
            confirmed_at: self.confirmed_at,
            completed_at: self.completed_at,
            created_at: self.created_at,
            updated_at: self.updated_at,
            items,
        }
    }
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateOrderItemInput {
    pub product_id: String,
    pub quantity: i32,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateOrderDto {
    pub items: Vec<CreateOrderItemInput>,
    pub payment_method: String,
    // Linh hoạt nhận cả recipientName và name
    pub name: Option<String>,
    pub phone: Option<String>,
    pub address: Option<String>,
    pub recipient_name: Option<String>,
    pub recipient_phone: Option<String>,
    pub recipient_address: Option<String>,
    pub notes: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateOrderStatusDto {
    pub status: String, // PENDING, CONFIRMED, SHIPPING, COMPLETED, CANCELLED
}

#[derive(Debug, Deserialize)]
pub struct OrderQuery {
    pub page: Option<i64>,
    pub limit: Option<i64>,
    pub status: Option<String>,
    #[serde(rename = "userId")]
    pub user_id: Option<String>,
}
