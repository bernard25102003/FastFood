use bcrypt::hash;
use dotenvy::dotenv;
use sqlx::mysql::MySqlPoolOptions;
use std::env;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    dotenv().ok();
    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL is not set");
    println!("Connecting to database...");

    let pool = MySqlPoolOptions::new()
        .max_connections(2)
        .connect(&database_url)
        .await?;

    println!("Connected to TiDB successfully!");

    println!("Hashing password '@Hoangdz2k3' with bcrypt cost 10...");
    let password = "@Hoangdz2k3";
    let password_hash = hash(password, 10)?;
    println!("Password hash generated: {}", password_hash);

    println!("Cleaning up user data...");
    sqlx::query("SET FOREIGN_KEY_CHECKS = 0").execute(&pool).await?;

    // 1. Delete user transactions
    sqlx::query("DELETE FROM payment_transactions").execute(&pool).await?;
    println!(" -> Cleared payment_transactions");

    // 2. Delete user OTPs
    sqlx::query("DELETE FROM email_otps").execute(&pool).await?;
    println!(" -> Cleared email_otps");

    // 3. Delete user reviews
    sqlx::query("DELETE FROM reviews").execute(&pool).await?;
    println!(" -> Cleared reviews");

    // 4. Delete user orders and order items
    sqlx::query("DELETE FROM order_items").execute(&pool).await?;
    println!(" -> Cleared order_items");
    sqlx::query("DELETE FROM orders").execute(&pool).await?;
    println!(" -> Cleared orders");

    // 5. Delete all users
    sqlx::query("DELETE FROM users").execute(&pool).await?;
    println!(" -> Cleared users");

    // 6. Reset product statistics
    sqlx::query("UPDATE products SET sold_count = 0, review_count = 0, avg_rating = 5.0")
        .execute(&pool)
        .await?;
    println!(" -> Reset product statistics (sold_count=0, review_count=0, avg_rating=5.0)");

    // 7. Insert the single admin user
    let admin_id = "usr-admin-001";
    let admin_name = "Quản Trị Viên";
    let admin_email = "bernard25102003@gmail.com";
    let admin_phone = "0901234567";
    let admin_address = "Trụ sở FastFood, TP.HCM";

    sqlx::query(
        r#"INSERT INTO users (id, name, email, password_hash, phone, address, role, status)
           VALUES (?, ?, ?, ?, ?, ?, 'ADMIN', 'ACTIVE')"#,
    )
    .bind(admin_id)
    .bind(admin_name)
    .bind(admin_email)
    .bind(&password_hash)
    .bind(admin_phone)
    .bind(admin_address)
    .execute(&pool)
    .await?;

    println!(" -> Inserted sole admin user: {} ({})", admin_email, admin_id);

    sqlx::query("SET FOREIGN_KEY_CHECKS = 1").execute(&pool).await?;

    // 8. Verify
    let user_count: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM users")
        .fetch_one(&pool)
        .await?;
    println!("Total users in database: {}", user_count.0);

    let admin_user: (String, String, String, String) = sqlx::query_as(
        "SELECT id, name, email, role FROM users WHERE email = ? LIMIT 1",
    )
    .bind(admin_email)
    .fetch_one(&pool)
    .await?;

    println!("Verified Admin: ID={}, Name={}, Email={}, Role={}", admin_user.0, admin_user.1, admin_user.2, admin_user.3);

    let is_valid = bcrypt::verify(password, &password_hash).unwrap_or(false);
    println!("Password verification check: {}", if is_valid { "PASSED ✅" } else { "FAILED ❌" });

    Ok(())
}
