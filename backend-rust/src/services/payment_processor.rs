use chrono::Utc;
use regex::Regex;
use sqlx::MySqlPool;
use uuid::Uuid;

use crate::{error::AppError, models::order::OrderDb};

/// Xử lý khớp đơn hàng và lưu lịch sử giao dịch một cách Idempotent (chống trùng lặp tuyệt đối)
pub async fn process_transaction_record(
    db: &MySqlPool,
    transaction_id: &str,
    amount_in: f64,
    content: &str,
    gateway: &str,
    bank_brand: Option<&str>,
    account_number: Option<&str>,
    transaction_date: Option<&str>,
) -> Result<Option<String>, AppError> {
    // 1. Kiểm tra Idempotency - Giao dịch này đã được xử lý chưa?
    let existing: Option<(String,)> = sqlx::query_as(
        "SELECT id FROM payment_transactions WHERE transaction_id = ? LIMIT 1",
    )
    .bind(transaction_id)
    .fetch_optional(db)
    .await?;

    if existing.is_some() {
        tracing::info!(
            "ℹ️ [Payment Processor] Giao dịch ID [{}] đã được xử lý trước đó. Bỏ qua.",
            transaction_id
        );
        return Ok(None);
    }

    // 2. Tìm mã đơn hàng dạng FF1234, FF8921 trong nội dung chuyển khoản
    let re = Regex::new(r"(?i)\b(FF[0-9]{4,7})\b").unwrap();
    let matched_code = re.captures(content).map(|cap| cap[1].to_uppercase());

    let mut matched_order_id = None;

    if let Some(code) = matched_code {
        tracing::info!("🔍 [Payment Processor] Tìm thấy mã đơn hàng: [{}]", code);

        let order: Option<OrderDb> = sqlx::query_as(
            "SELECT * FROM orders WHERE payment_code = ? AND payment_status != 'PAID' LIMIT 1",
        )
        .bind(&code)
        .fetch_optional(db)
        .await?;

        if let Some(ord) = order {
            tracing::info!(
                "🎉 [Payment Processor] Khớp đơn hàng #{} (ID: {}). Số tiền yêu cầu: {}đ, Số tiền nhận: {}đ",
                ord.id, ord.id, ord.total_price, amount_in
            );

            let mut tx = db.begin().await?;

            // Cập nhật trạng thái đơn hàng sang CONFIRMED và PAID
            sqlx::query(
                "UPDATE orders SET status = 'CONFIRMED', payment_status = 'PAID', confirmed_at = ? WHERE id = ?",
            )
            .bind(Utc::now())
            .bind(&ord.id)
            .execute(&mut *tx)
            .await?;

            // Ghi nhận log giao dịch vào payment_transactions
            let tx_rec_id = Uuid::new_v4().to_string();
            sqlx::query(
                "INSERT INTO payment_transactions (id, order_id, gateway, transaction_id, amount_in, content, bank_brand, account_number, transaction_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            )
            .bind(&tx_rec_id)
            .bind(&ord.id)
            .bind(gateway)
            .bind(transaction_id)
            .bind(amount_in)
            .bind(content)
            .bind(bank_brand)
            .bind(account_number)
            .bind(transaction_date)
            .execute(&mut *tx)
            .await?;

            tx.commit().await?;

            tracing::info!("✅ [Payment Processor] Đã xác nhận đơn hàng [{}] thành công!", ord.id);
            matched_order_id = Some(ord.id);
        } else {
            tracing::warn!(
                "⚠️ [Payment Processor] Tìm thấy mã [{}] nhưng không có đơn hàng nào đang chờ thanh toán",
                code
            );

            // Vẫn lưu transaction log để đối soát
            let tx_rec_id = Uuid::new_v4().to_string();
            sqlx::query(
                "INSERT INTO payment_transactions (id, gateway, transaction_id, amount_in, content, bank_brand, account_number, transaction_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            )
            .bind(&tx_rec_id)
            .bind(gateway)
            .bind(transaction_id)
            .bind(amount_in)
            .bind(content)
            .bind(bank_brand)
            .bind(account_number)
            .bind(transaction_date)
            .execute(db)
            .await?;
        }
    } else {
        tracing::debug!(
            "ℹ️ [Payment Processor] Không tìm thấy mã dạng FFxxxxx trong nội dung: '{}'",
            content
        );

        // Lưu transaction log không gán đơn hàng
        let tx_rec_id = Uuid::new_v4().to_string();
        sqlx::query(
            "INSERT INTO payment_transactions (id, gateway, transaction_id, amount_in, content, bank_brand, account_number, transaction_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        )
        .bind(&tx_rec_id)
        .bind(gateway)
        .bind(transaction_id)
        .bind(amount_in)
        .bind(content)
        .bind(bank_brand)
        .bind(account_number)
        .bind(transaction_date)
        .execute(db)
        .await?;
    }

    Ok(matched_order_id)
}

