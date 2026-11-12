use sqlx::mysql::MySqlPoolOptions;
use std::env;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    dotenvy::dotenv().ok();
    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL is not set");
    println!("Connecting to database...");
    
    let pool = MySqlPoolOptions::new()
        .max_connections(2)
        .connect(&database_url)
        .await?;

    println!("Connected successfully!");

    println!("Altering DECIMAL columns to DOUBLE for seamless SQLx f64 compatibility...");
    
    // 1. Tắt foreign key checks tạm thời
    sqlx::query("SET FOREIGN_KEY_CHECKS = 0").execute(&pool).await?;

    // 2. Chuyển đổi DECIMAL -> DOUBLE
    let alter_decimal_queries = [
        "ALTER TABLE products MODIFY COLUMN price DOUBLE NOT NULL DEFAULT 0",
        "ALTER TABLE products MODIFY COLUMN avg_rating DOUBLE NOT NULL DEFAULT 0",
        "ALTER TABLE orders MODIFY COLUMN total_price DOUBLE NOT NULL DEFAULT 0",
        "ALTER TABLE order_items MODIFY COLUMN price DOUBLE NOT NULL DEFAULT 0",
        "ALTER TABLE order_items MODIFY COLUMN subtotal DOUBLE NOT NULL DEFAULT 0",
        "ALTER TABLE payment_transactions MODIFY COLUMN amount_in DOUBLE NOT NULL DEFAULT 0",
    ];

    for q in alter_decimal_queries {
        println!("Executing: {}", q);
        match sqlx::query(q).execute(&pool).await {
            Ok(_) => println!(" -> Success!"),
            Err(e) => println!(" -> Error: {:?}", e),
        }
    }

    // 3. Mở rộng kích thước cột id và foreign keys lên VARCHAR(64)
    let alter_id_queries = [
        "ALTER TABLE categories MODIFY COLUMN id VARCHAR(64) NOT NULL",
        "ALTER TABLE products MODIFY COLUMN id VARCHAR(64) NOT NULL",
        "ALTER TABLE products MODIFY COLUMN category_id VARCHAR(64) NOT NULL",
        "ALTER TABLE product_images MODIFY COLUMN id VARCHAR(64) NOT NULL",
        "ALTER TABLE product_images MODIFY COLUMN product_id VARCHAR(64) NOT NULL",
        "ALTER TABLE orders MODIFY COLUMN id VARCHAR(64) NOT NULL",
        "ALTER TABLE order_items MODIFY COLUMN id VARCHAR(64) NOT NULL",
        "ALTER TABLE order_items MODIFY COLUMN order_id VARCHAR(64) NOT NULL",
        "ALTER TABLE order_items MODIFY COLUMN product_id VARCHAR(64) NOT NULL",
        "ALTER TABLE reviews MODIFY COLUMN id VARCHAR(64) NOT NULL",
        "ALTER TABLE reviews MODIFY COLUMN product_id VARCHAR(64) NOT NULL",
        "ALTER TABLE payment_transactions MODIFY COLUMN id VARCHAR(64) NOT NULL",
        "ALTER TABLE payment_transactions MODIFY COLUMN order_id VARCHAR(64) DEFAULT NULL",
    ];

    for q in alter_id_queries {
        println!("Executing: {}", q);
        match sqlx::query(q).execute(&pool).await {
            Ok(_) => println!(" -> Success!"),
            Err(e) => println!(" -> Error: {:?}", e),
        }
    }

    sqlx::query("SET FOREIGN_KEY_CHECKS = 1").execute(&pool).await?;
    println!("Database schema update completed successfully!");

    Ok(())
}
