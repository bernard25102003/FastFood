use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use chrono::Utc;
use serde::Serialize;

#[derive(Serialize)]
pub struct ApiResponse<T: Serialize> {
    pub success: bool,
    pub code: String,
    pub message: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub data: Option<T>,
    pub timestamp: String,
}

#[derive(Serialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Pagination {
    pub page: i64,
    pub limit: i64,
    pub total: i64,
    pub total_pages: i64,
    pub has_next: bool,
    pub has_prev: bool,
}

impl Pagination {
    pub fn new(page: i64, limit: i64, total: i64) -> Self {
        let total_pages = if total == 0 {
            1
        } else if limit <= 0 {
            1
        } else {
            (total as f64 / limit as f64).ceil() as i64
        };
        Self {
            page,
            limit,
            total,
            total_pages,
            has_next: page < total_pages,
            has_prev: page > 1,
        }
    }
}

#[derive(Serialize, Clone, Debug)]
pub struct PaginatedResponse<T: Serialize> {
    pub items: Vec<T>,
    pub pagination: Pagination,
}

pub fn send_success<T: Serialize>(data: T, message: &str) -> Response {
    let resp = ApiResponse {
        success: true,
        code: "SUCCESS".to_string(),
        message: message.to_string(),
        data: Some(data),
        timestamp: Utc::now().to_rfc3339(),
    };
    (StatusCode::OK, Json(resp)).into_response()
}

pub fn send_created<T: Serialize>(data: T, message: &str) -> Response {
    let resp = ApiResponse {
        success: true,
        code: "CREATED".to_string(),
        message: message.to_string(),
        data: Some(data),
        timestamp: Utc::now().to_rfc3339(),
    };
    (StatusCode::CREATED, Json(resp)).into_response()
}

pub fn send_no_content() -> Response {
    StatusCode::NO_CONTENT.into_response()
}

