use std::time::Duration;
use tokio::time::sleep;

use crate::{
    services::{
        payment_processor::process_transaction_record,
        sepay::SepayClient,
    },
    state::AppState,
};

/// Khởi động background task chạy định kỳ đối soát các đơn hàng PENDING với SePay API
pub fn start_reconciliation_worker(state: AppState) {
    tokio::spawn(async move {
        tracing::info!("🚀 [Reconciliation Worker] Background reconciliation worker đã sẵn sàng (chu kỳ 2 phút)...");

        // Chờ 15s sau khi khởi động server mới bắt đầu quét lần đầu
        sleep(Duration::from_secs(15)).await;

        loop {
            let api_key = state.config.sepay_api_key.trim();
            if !api_key.is_empty() {
                // Kiểm tra xem có đơn hàng nào đang chờ thanh toán chuyển khoản trong 2h gần nhất không
                let pending_count: Result<(i64,), _> = sqlx::query_as(
                    "SELECT COUNT(*) FROM orders WHERE status = 'PENDING' AND payment_method = 'BANK_TRANSFER' AND created_at > NOW() - INTERVAL 2 HOUR",
                )
                .fetch_one(&state.db)
                .await;

                if let Ok((count,)) = pending_count {
                    if count > 0 {
                        tracing::info!(
                            "⏰ [Reconciliation Worker] Phát hiện {} đơn hàng đang chờ thanh toán. Đang gọi SePay API đối soát bù...",
                            count
                        );

                        let sepay = SepayClient::new(&state.http_client, api_key);
                        match sepay.fetch_recent_transactions(&state.config.sepay_account_no, 30).await {
                            Ok(txs) => {
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
                                            "SEPAY_RECONCILE",
                                            bank,
                                            acc,
                                            date,
                                        )
                                        .await;
                                    }
                                }
                            }
                            Err(e) => {
                                tracing::warn!("⚠️ [Reconciliation Worker] Lỗi khi gọi SePay Transactions API: {:?}", e);
                            }
                        }
                    }
                }
            }

            // Nghỉ 120 giây giữa các lần quét
            sleep(Duration::from_secs(120)).await;
        }
    });
}

