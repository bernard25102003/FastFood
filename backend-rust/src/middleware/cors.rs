use axum::http::{header, Method};
use tower_http::cors::{Any, CorsLayer};

pub fn create_cors_layer(allowed_origins: &[String]) -> CorsLayer {
    if allowed_origins.is_empty() || allowed_origins.iter().any(|o| o == "*") {
        CorsLayer::new()
            .allow_methods([
                Method::GET,
                Method::POST,
                Method::PUT,
                Method::PATCH,
                Method::DELETE,
                Method::OPTIONS,
            ])
            .allow_headers([
                header::AUTHORIZATION,
                header::CONTENT_TYPE,
                header::ACCEPT,
                header::ORIGIN,
            ])
            .allow_origin(Any)
    } else {
        let origins: Vec<_> = allowed_origins
            .iter()
            .filter_map(|o| o.parse().ok())
            .collect();

        CorsLayer::new()
            .allow_methods([
                Method::GET,
                Method::POST,
                Method::PUT,
                Method::PATCH,
                Method::DELETE,
                Method::OPTIONS,
            ])
            .allow_headers([
                header::AUTHORIZATION,
                header::CONTENT_TYPE,
                header::ACCEPT,
                header::ORIGIN,
            ])
            .allow_credentials(true)
            .allow_origin(origins)
    }
}

