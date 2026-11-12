use reqwest::Client;
use serde::{Deserialize, Serialize};
use crate::error::AppError;

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct SepayApiTransaction {
    pub id: i64,
    #[serde(default)]
    pub bank_brand_name: Option<String>,
    #[serde(default)]
    pub account_number: Option<String>,
    #[serde(default)]
    pub transaction_date: Option<String>,
    pub amount_in: serde_json::Value,
    #[serde(default)]
    pub amount_out: Option<serde_json::Value>,
    #[serde(default)]
    pub transaction_content: Option<String>,
    #[serde(default)]
    pub reference_number: Option<String>,
}

impl SepayApiTransaction {
    pub fn get_amount_in_f64(&self) -> f64 {
        match &self.amount_in {
            serde_json::Value::Number(n) => n.as_f64().unwrap_or(0.0),
            serde_json::Value::String(s) => s.parse::<f64>().unwrap_or(0.0),
            _ => 0.0,
        }
    }
}

#[derive(Debug, Deserialize)]
pub struct SepayTransactionsResponse {
    pub status: i32,
    #[serde(default)]
    pub transactions: Vec<SepayApiTransaction>,
}

pub struct SepayClient<'a> {
    client: &'a Client,
    api_key: &'a str,
}

impl<'a> SepayClient<'a> {
    pub fn new(client: &'a Client, api_key: &'a str) -> Self {
        Self { client, api_key }
    }

    /// Lấy danh sách giao dịch mới nhất từ SePay API
    pub async fn fetch_recent_transactions(
        &self,
        account_number: &str,
        limit: u32,
    ) -> Result<Vec<SepayApiTransaction>, AppError> {
        if self.api_key.trim().is_empty() {
            return Err(AppError::BadRequest(
                "SEPAY_API_KEY chưa được cấu hình trong hệ thống".to_string(),
            ));
        }

        let mut url = format!(
            "https://my.sepay.vn/userapi/transactions/list?limit={}",
            limit.clamp(1, 100)
        );
        if !account_number.trim().is_empty() {
            url.push_str(&format!("&account_number={}", account_number.trim()));
        }

        let res = self
            .client
            .get(&url)
            .header("Authorization", format!("Apikey {}", self.api_key.trim()))
            .header("Content-Type", "application/json")
            .send()
            .await
            .map_err(|e| AppError::Internal(format!("Lỗi kết nối tới SePay Transactions API: {}", e)))?;

        let status = res.status();
        if !status.is_success() {
            let err_text = res.text().await.unwrap_or_default();
            tracing::warn!("⚠️ SePay API returned status {}: {}", status, err_text);
            return Err(AppError::BadRequest(format!(
                "SePay API trả về mã lỗi {}: {}",
                status, err_text
            )));
        }

        let data: SepayTransactionsResponse = res
            .json()
            .await
            .map_err(|e| AppError::Internal(format!("Lỗi giải mã JSON từ SePay API: {}", e)))?;

        Ok(data.transactions)
    }
}

