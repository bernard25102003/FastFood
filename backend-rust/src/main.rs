use std::net::SocketAddr;
use std::time::Duration;
use sqlx::mysql::MySqlPoolOptions;
use tokio::net::TcpListener;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

mod config;
mod error;
mod handlers;
mod middleware;
mod models;
mod services;
mod state;
mod utils;

use config::AppConfig;
use middleware::cors::create_cors_layer;
use state::AppState;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // 1. Khởi tạo logger / tracing
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "info,fastfood_backend=debug".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    // 2. Load biến môi trường
    let config = AppConfig::from_env();
    tracing::info!("🚀 Khởi động FastFood Rust Backend trên port {}...", config.port);

    // 3. Kết nối Cơ sở dữ liệu TiDB Cloud (MySQL)
    tracing::info!("🔌 Đang kết nối TiDB Cloud Database...");
    let pool = MySqlPoolOptions::new()
        .max_connections(20)
        .min_connections(2)
        .acquire_timeout(Duration::from_secs(10))
        .idle_timeout(Duration::from_secs(300))
        .connect(&config.database_url)
        .await
        .expect("❌ Không thể kết nối tới cơ sở dữ liệu TiDB Cloud. Vui lòng kiểm tra DATABASE_URL trong .env");

    tracing::info!("✅ Kết nối TiDB Cloud thành công!");

    // 4. Khởi tạo State và Router
    let cors = create_cors_layer(&config.cors_origin);
    let app_state = AppState::new(pool, config.clone());

    // Khởi động Background Worker đối soát thanh toán tự động với SePay
    services::reconciliation_worker::start_reconciliation_worker(app_state.clone());

    let app = handlers::create_router(app_state)
        .layer(cors);

    // 5. Lắng nghe kết nối TCP
    let addr = SocketAddr::from(([0, 0, 0, 0], config.port));
    let listener = TcpListener::bind(addr).await?;
    tracing::info!("🌐 Server đang lắng nghe tại: http://{}", addr);
    tracing::info!("👉 Health check endpoint: http://{}/health", addr);
    tracing::info!("👉 Webhook SePay endpoint: http://{}/api/webhooks/sepay", addr);

    // 6. Chạy với Graceful Shutdown
    axum::serve(listener, app)
        .with_graceful_shutdown(shutdown_signal())
        .await?;

    tracing::info!("👋 Server đã dừng an toàn (Graceful shutdown).");
    Ok(())
}

async fn shutdown_signal() {
    let ctrl_c = async {
        tokio::signal::ctrl_c()
            .await
            .expect("Không thể cài đặt Ctrl+C handler");
    };

    #[cfg(unix)]
    let terminate = async {
        tokio::signal::unix::signal(tokio::signal::unix::SignalKind::terminate())
            .expect("Không thể cài đặt SIGTERM handler")
            .recv()
            .await;
    };

    #[cfg(not(unix))]
    let terminate = std::future::pending::<()>();

    tokio::select! {
        _ = ctrl_c => {
            tracing::info!("Nhận tín hiệu Ctrl+C, đang chuẩn bị dừng server...");
        },
        _ = terminate => {
            tracing::info!("Nhận tín hiệu SIGTERM, đang chuẩn bị dừng server...");
        },
    }
}

