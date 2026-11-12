use reqwest::multipart::{Form, Part};
use serde::Deserialize;
use crate::{config::AppConfig, error::AppError};

pub struct ImageKitService<'a> {
    client: &'a reqwest::Client,
    config: &'a AppConfig,
}

#[derive(Deserialize)]
struct ImageKitResponse {
    url: String,
}

impl<'a> ImageKitService<'a> {
    pub fn new(client: &'a reqwest::Client, config: &'a AppConfig) -> Self {
        Self { client, config }
    }

    pub async fn upload_file(
        &self,
        file_name: &str,
        file_bytes: Vec<u8>,
    ) -> Result<String, AppError> {
        if self.config.imagekit_private_key.is_empty() {
            return Err(AppError::BadRequest(
                "ImageKit chưa được cấu hình key tải ảnh lên máy chủ".to_string(),
            ));
        }

        let part = Part::bytes(file_bytes).file_name(file_name.to_string());
        let form = Form::new()
            .part("file", part)
            .text("fileName", file_name.to_string())
            .text("folder", "/products");

        let response = self
            .client
            .post("https://upload.imagekit.io/api/v1/files/upload")
            .basic_auth(&self.config.imagekit_private_key, Option::<&str>::None)
            .multipart(form)
            .send()
            .await
            .map_err(|e| AppError::Internal(format!("Lỗi kết nối ImageKit: {}", e)))?;

        if !response.status().is_success() {
            let error_text = response.text().await.unwrap_or_default();
            tracing::error!("ImageKit upload error: {}", error_text);
            return Err(AppError::BadRequest("Tải ảnh thất bại".to_string()));
        }

        let result: ImageKitResponse = response
            .json()
            .await
            .map_err(|e| AppError::Internal(format!("Parse kết quả ImageKit lỗi: {}", e)))?;

        Ok(result.url)
    }
}

