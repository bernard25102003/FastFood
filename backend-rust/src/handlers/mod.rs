use axum::{
    routing::{delete, get, patch, post, put},
    Json, Router,
};
use serde_json::json;

pub mod auth;
pub mod categories;
pub mod orders;
pub mod payments;
pub mod products;
pub mod reviews;
pub mod users;

use crate::state::AppState;

pub fn create_router(state: AppState) -> Router {
    // Health check endpoint
    let health_router = Router::new().route(
        "/health",
        get(|| async {
            Json(json!({
                "status": "ok",
                "service": "fastfood-backend-rust",
                "version": "1.0.0"
            }))
        }),
    );

    // Auth routes
    let auth_routes = Router::new()
        .route("/send-register-otp", post(auth::send_register_otp))
        .route("/register-with-otp", post(auth::register_with_otp))
        .route("/register", post(auth::register_with_otp))
        .route("/login", post(auth::login))
        .route("/refresh", post(auth::refresh_token))
        .route("/logout", post(auth::logout))
        .route("/forgot-password", post(auth::forgot_password_send_otp))
        .route("/reset-password", post(auth::forgot_password_reset));

    // Users routes
    let users_routes = Router::new()
        .route("/profile", get(users::get_profile).put(users::update_profile))
        .route("/change-password", put(users::change_password))
        .route("/", get(users::list_users))
        .route("/:id/status", patch(users::toggle_user_status));

    // Categories routes
    let categories_routes = Router::new()
        .route("/", get(categories::list_categories).post(categories::create_category))
        .route(
            "/:id",
            get(categories::get_category_by_id)
                .put(categories::update_category)
                .delete(categories::delete_category),
        );

    // Products routes
    let products_routes = Router::new()
        .route("/", get(products::list_products).post(products::create_product))
        .route(
            "/:productId",
            get(products::get_product_by_id)
                .put(products::update_product)
                .delete(products::delete_product),
        )
        .route("/:productId/images", post(products::upload_product_images));

    // Orders routes
    let orders_routes = Router::new()
        .route("/", post(orders::create_order).get(orders::list_my_orders))
        .route("/admin", get(orders::list_all_orders))
        .route("/:orderId", get(orders::get_order_by_id))
        .route("/:orderId/verify-payment", post(payments::verify_order_payment))
        .route("/:orderId/status", patch(orders::update_order_status))
        .route("/:orderId/cancel", patch(orders::cancel_order));

    // Reviews routes
    let reviews_routes = Router::new()
        .route("/product/:productId", get(reviews::list_product_reviews))
        .route("/", post(reviews::create_review))
        .route("/:id", delete(reviews::delete_review));

    // Webhooks routes
    let webhooks_routes = Router::new().route("/sepay", post(payments::sepay_webhook));

    // Gộp tất cả các sub-routers vào prefix /api
    let api_router = Router::new()
        .nest("/auth", auth_routes)
        .nest("/users", users_routes)
        .nest("/categories", categories_routes)
        .nest("/products", products_routes)
        .nest("/orders", orders_routes)
        .nest("/reviews", reviews_routes)
        .nest("/webhooks", webhooks_routes);

    Router::new()
        .merge(health_router)
        .nest("/api", api_router)
        .with_state(state)
}

