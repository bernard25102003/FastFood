use axum::{
    body::Bytes,
    extract::{Path, State},
    http::{HeaderMap, StatusCode},
    response::{IntoResponse, Response},
    Json,
};
use hmac::{Hmac, Mac};
use sha2::Sha256;
use uuid::Uuid;

type HmacSha256 = Hmac<Sha256>;

use crate::{
    error::AppError,
    middleware::auth::AuthUser,
    models::{
        order::OrderDb,
        transaction::SepayWebhookPayload,
    },
    services::{
        payment_processor::process_transaction_record,
        sepay::SepayClient,
    },
    state::AppState,
    utils::response::send_success,
};

/// POST /api/webhooks/sepay
/// Nhận thông báo Webhook biến động số dư VietQR từ SePay theo thời gian thực
pub async fn sepay_webhook(
    State(state): State<AppState>,
    headers: HeaderMap,
    body_bytes: Bytes,
) -> Result<Response, AppError> {
    // 1. Xác thực bảo mật Webhook (Hỗ trợ cả HMAC-SHA256 và API Key)
    let secret = state.config.sepay_webhook_secret.trim();
    if !secret.is_empty() {
        let sig_header = headers
            .get("x-sepay-signature")
            .or_else(|| headers.get("X-SePay-Signature"))
            .and_then(|v| v.to_str().ok())
            .map(|s| s.trim());

        let timestamp_header = headers
            .get("x-sepay-timestamp")
            .or_else(|| headers.get("X-SePay-Timestamp"))
            .and_then(|v| v.to_str().ok())
            .map(|s| s.trim());

        if let Some(signature) = sig_header {
            // Chế độ 1: Xác thực chữ ký HMAC-SHA256
            let timestamp = timestamp_header.unwrap_or_default();
            let mut mac = HmacSha256::new_from_slice(secret.as_bytes())
                .map_err(|e| AppError::Internal(format!("Lỗi khởi tạo HMAC: {}", e)))?;

            mac.update(timestamp.as_bytes());
            mac.update(b".");
            mac.update(&body_bytes);

            let expected_hex = hex::encode(mac.finalize().into_bytes());
            let expected_sig = format!("sha256={}", expected_hex);

            tracing::info!(
                "🔍 [SePay HMAC Auth] Timestamp: '{}' | Signature nhận: '{}' | Kì vọng: '{}'",
                timestamp,
                signature,
                expected_sig
            );

            if signature != expected_sig && signature != expected_hex {
                tracing::warn!("⛔ [SePay Webhook] Chữ ký HMAC-SHA256 không hợp lệ!");
                return Err(AppError::Unauthorized("Chữ ký SePay HMAC-SHA256 không hợp lệ".to_string()));
            }
        } else {
            // Chế độ 2: Xác thực qua Header Authorization (Apikey ...)
            let auth_header = headers
                .get("Authorization")
                .or_else(|| headers.get("authorization"))
                .and_then(|v| v.to_str().ok())
                .unwrap_or_default()
                .trim();

            tracing::info!(
                "🔍 [SePay Webhook Auth Check] Header nhận: '{}' | Secret cấu hình: '{}'",
                auth_header,
                secret
            );

            let expected_key1 = format!("Apikey {}", secret);
            let expected_key2 = format!("ApiKey {}", secret);
            let expected_key3 = format!("Bearer {}", secret);
            let expected_key4 = format!("apikey {}", secret);

            let is_valid = auth_header == expected_key1
                || auth_header == expected_key2
                || auth_header == expected_key3
                || auth_header == expected_key4
                || auth_header == secret
                || (auth_header.contains(secret) && !secret.is_empty());

            if !is_valid {
                tracing::warn!(
                    "⛔ [SePay Webhook] Từ chối: Sai Secret Token. Nhận được: '{}' | Kì vọng: 'Apikey {}'",
                    auth_header,
                    secret
                );
                return Err(AppError::Unauthorized("Sai mã bảo mật SePay Webhook".to_string()));
            }
        }
    }

    // 2. Parse dữ liệu Webhook từ raw body
    let payload: SepayWebhookPayload = serde_json::from_slice(&body_bytes)
        .map_err(|e| AppError::Validation(format!("Dữ liệu Webhook không đúng định dạng JSON: {}", e)))?;

    tracing::info!("📥 [SePay Webhook] Nhận payload: {:?}", payload);

    let transaction_id = match payload.id {
        serde_json::Value::Number(n) => n.to_string(),
        serde_json::Value::String(s) => s,
        _ => Uuid::new_v4().to_string(),
    };

    let amount_in = payload.transfer_amount.unwrap_or(0.0);
    let content = payload.content.clone().unwrap_or_default();

    // 3. Thực thi bộ xử lý thanh toán Idempotent dùng chung
    let matched_order_id = process_transaction_record(
        &state.db,
        &transaction_id,
        amount_in,
        &content,
        payload.gateway.as_deref().unwrap_or("SEPAY"),
        payload.bank_brand_name.as_deref(),
        payload.account_number.as_deref(),
        payload.transaction_date.as_deref(),
    )
    .await?;

    Ok((
        StatusCode::OK,
        Json(serde_json::json!({
            "success": true,
            "matchedOrderId": matched_order_id,
            "message": "Webhook processed successfully"
        })),
    )
        .into_response())
}

/// POST /api/orders/:id/verify-payment
/// Khách hàng chủ động kiểm tra trạng thái thanh toán đơn hàng qua SePay API
pub async fn verify_order_payment(
    State(state): State<AppState>,
    auth_user: AuthUser,
    Path(order_id): Path<String>,
) -> Result<Response, AppError> {
    // 1. Lấy thông tin đơn hàng
    let order: Option<OrderDb> = sqlx::query_as("SELECT * FROM orders WHERE id = ? LIMIT 1")
        .bind(&order_id)
        .fetch_optional(&state.db)
        .await?;

    let order = order.ok_or_else(|| AppError::NotFound("Không tìm thấy đơn hàng".to_string()))?;

    // Người dùng chỉ kiểm tra được đơn của mình, Admin kiểm tra được tất cả
    if auth_user.role != "ADMIN" && order.user_id != auth_user.id {
        return Err(AppError::Forbidden("Bạn không có quyền thao tác trên đơn hàng này".to_string()));
    }

    // Nếu đơn đã được xác nhận thanh toán rồi
    if order.payment_status == "PAID" || order.status != "PENDING" {
        return Ok(send_success(
            serde_json::json!({
                "paid": true,
                "orderId": order.id,
                "status": order.status,
                "paymentStatus": order.payment_status,
            }),
            "Đơn hàng đã được thanh toán thành công",
        ));
    }

    // Nếu đơn không phải chuyển khoản ngân hàng hoặc không có mã thanh toán
    let payment_code = match order.payment_code {
        Some(ref c) if !c.is_empty() => c.clone(),
        _ => {
            return Ok(send_success(
                serde_json::json!({
                    "paid": false,
                    "orderId": order.id,
                    "status": order.status,
                    "paymentStatus": order.payment_status,
                }),
                "Đơn hàng này không sử dụng phương thức chuyển khoản",
            ));
        }
    };

    // 2. Nếu có cấu hình SEPAY_API_KEY -> gọi SePay Transactions API để đối soát ngay lập tức
    let api_key = state.config.sepay_api_key.trim();
    if !api_key.is_empty() {
        let sepay = SepayClient::new(&state.http_client, api_key);
        if let Ok(txs) = sepay.fetch_recent_transactions(&state.config.sepay_account_no, 30).await {
            for tx in txs {
                let amount_in = tx.get_amount_in_f64();
                if amount_in > 0.0 {
                    let tid_str = tx.id.to_string();
                    let content_str = tx.transaction_content.as_deref().unwrap_or_default();
                    let bank = tx.bank_brand_name.as_deref();
                    let acc = tx.account_number.as_deref();
                    let date = tx.transaction_date.as_deref();

                    let _ = process_transaction_record(
                        &state.db,
                        &tid_str,
                        amount_in,
                        content_str,
                        "SEPAY_VERIFY",
                        bank,
                        acc,
                        date,
                    )
                    .await;
                }
            }
        }
    }

    // 3. Đọc lại trạng thái mới nhất của đơn hàng sau khi đối soát
    let updated_order: OrderDb = sqlx::query_as("SELECT * FROM orders WHERE id = ? LIMIT 1")
        .bind(&order_id)
        .fetch_one(&state.db)
        .await?;

    let is_paid = updated_order.payment_status == "PAID" || updated_order.status != "PENDING";
    let msg = if is_paid {
        "Thanh toán thành công! Đơn hàng của bạn đã được xác nhận."
    } else {
        "Hệ thống chưa tìm thấy biến động số dư cho mã đơn này. Nếu bạn vừa chuyển khoản, vui lòng đợi vài giây để ngân hàng xử lý."
    };

    Ok(send_success(
        serde_json::json!({
            "paid": is_paid,
            "orderId": updated_order.id,
            "status": updated_order.status,
            "paymentStatus": updated_order.payment_status,
            "paymentCode": payment_code,
        }),
        msg,
    ))
}
