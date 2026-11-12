use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, FromRow, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PaymentTransaction {
    pub id: String,
    pub order_id: Option<String>,
    pub gateway: String,
    pub transaction_id: String,
    pub amount_in: f64,
    pub content: Option<String>,
    pub bank_brand: Option<String>,
    pub account_number: Option<String>,
    pub transaction_date: Option<String>,
    pub created_at: DateTime<Utc>,
}

/// Payload Webhook nhận từ SePay khi có biến động số dư VietQR
#[derive(Debug, Clone, Deserialize)]
pub struct SepayWebhookPayload {
    #[serde(alias = "id")]
    pub id: serde_json::Value, // Có thể là số hoặc chuỗi
    
    pub gateway: Option<String>,

    #[serde(alias = "bankBrandName", alias = "bank_brand_name")]
    pub bank_brand_name: Option<String>,

    #[serde(alias = "transactionDate")]
    pub transaction_date: Option<String>,

    #[serde(alias = "accountNumber")]
    pub account_number: Option<String>,

    #[serde(alias = "subAccount")]
    pub sub_account: Option<String>,

    pub content: Option<String>,

    #[serde(alias = "transferType")]
    pub transfer_type: Option<String>, // "in" là nạp tiền vào

    #[serde(alias = "transferAmount", alias = "amountIn")]
    pub transfer_amount: Option<f64>,

    #[serde(alias = "referenceCode")]
    pub reference_code: Option<String>,
}

