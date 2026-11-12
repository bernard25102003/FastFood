use std::env;

#[derive(Clone, Debug)]
pub struct AppConfig {
    pub port: u16,
    pub environment: String,
    pub database_url: String,
    pub jwt_secret: String,
    pub jwt_refresh_secret: String,
    pub jwt_expiration_hours: i64,
    pub jwt_refresh_expiration_days: i64,
    pub cors_origin: Vec<String>,
    
    // Brevo Email
    pub brevo_api_key: String,
    pub brevo_sender_email: String,
    pub brevo_sender_name: String,
    
    // SePay VietQR Payment
    pub sepay_bank_name: String,
    pub sepay_account_no: String,
    pub sepay_account_name: String,
    pub sepay_webhook_secret: String,
    pub sepay_api_key: String,
    
    // ImageKit
    pub imagekit_public_key: String,
    pub imagekit_private_key: String,
    pub imagekit_url_endpoint: String,
}

impl AppConfig {
    pub fn from_env() -> Self {
        dotenvy::dotenv().ok();

        let port = env::var("PORT")
            .unwrap_or_else(|_| "3000".to_string())
            .parse::<u16>()
            .unwrap_or(3000);

        let environment = env::var("ENVIRONMENT").unwrap_or_else(|_| "development".to_string());
        
        let database_url = env::var("DATABASE_URL")
            .expect("DATABASE_URL environment variable must be set");

        let jwt_secret = env::var("JWT_SECRET")
            .unwrap_or_else(|_| "super_secret_fastfood_jwt_access_key_2026".to_string());

        let jwt_refresh_secret = env::var("JWT_REFRESH_SECRET")
            .unwrap_or_else(|_| "super_secret_fastfood_jwt_refresh_key_2026".to_string());

        let jwt_expiration_hours = env::var("JWT_EXPIRATION_HOURS")
            .unwrap_or_else(|_| "24".to_string())
            .parse::<i64>()
            .unwrap_or(24);

        let jwt_refresh_expiration_days = env::var("JWT_REFRESH_EXPIRATION_DAYS")
            .unwrap_or_else(|_| "30".to_string())
            .parse::<i64>()
            .unwrap_or(30);

        let cors_raw = env::var("CORS_ORIGIN")
            .unwrap_or_else(|_| "http://localhost:5173,http://localhost:5174".to_string());
        let cors_origin: Vec<String> = cors_raw
            .split(',')
            .map(|s| s.trim().to_string())
            .filter(|s| !s.is_empty())
            .collect();

        // Brevo
        let brevo_api_key = env::var("BREVO_API_KEY").unwrap_or_default();
        let brevo_sender_email = env::var("BREVO_SENDER_EMAIL")
            .unwrap_or_else(|_| "no-reply@fastfood.vn".to_string());
        let brevo_sender_name = env::var("BREVO_SENDER_NAME")
            .unwrap_or_else(|_| "FastFood Vietnam".to_string());

        // SePay
        let sepay_bank_name = env::var("SEPAY_BANK_NAME")
            .unwrap_or_else(|_| "MBBank".to_string());
        let sepay_account_no = env::var("SEPAY_ACCOUNT_NO")
            .unwrap_or_else(|_| "012345678999".to_string());
        let sepay_account_name = env::var("SEPAY_ACCOUNT_NAME")
            .unwrap_or_else(|_| "FASTFOOD VIETNAM".to_string());
        let sepay_webhook_secret = env::var("SEPAY_WEBHOOK_SECRET").unwrap_or_default();
        let sepay_api_key = env::var("SEPAY_API_KEY").unwrap_or_default();

        // ImageKit
        let imagekit_public_key = env::var("IMAGEKIT_PUBLIC_KEY").unwrap_or_default();
        let imagekit_private_key = env::var("IMAGEKIT_PRIVATE_KEY").unwrap_or_default();
        let imagekit_url_endpoint = env::var("IMAGEKIT_URL_ENDPOINT").unwrap_or_default();

        Self {
            port,
            environment,
            database_url,
            jwt_secret,
            jwt_refresh_secret,
            jwt_expiration_hours,
            jwt_refresh_expiration_days,
            cors_origin,
            brevo_api_key,
            brevo_sender_email,
            brevo_sender_name,
            sepay_bank_name,
            sepay_account_no,
            sepay_account_name,
            sepay_webhook_secret,
            sepay_api_key,
            imagekit_public_key,
            imagekit_private_key,
            imagekit_url_endpoint,
        }
    }
}

