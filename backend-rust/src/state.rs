use std::sync::Arc;
use sqlx::MySqlPool;
use reqwest::Client as HttpClient;
use crate::config::AppConfig;

#[derive(Clone)]
pub struct AppState {
    pub db: MySqlPool,
    pub config: Arc<AppConfig>,
    pub http_client: HttpClient,
}

impl AppState {
    pub fn new(db: MySqlPool, config: AppConfig) -> Self {
        let http_client = HttpClient::builder()
            .timeout(std::time::Duration::from_secs(15))
            .build()
            .unwrap_or_default();

        Self {
            db,
            config: Arc::new(config),
            http_client,
        }
    }
}

