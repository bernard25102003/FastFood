use reqwest::Client;
use serde_json::json;
use crate::{config::AppConfig, error::AppError};

pub struct BrevoService<'a> {
    client: &'a Client,
    config: &'a AppConfig,
}

impl<'a> BrevoService<'a> {
    pub fn new(client: &'a Client, config: &'a AppConfig) -> Self {
        Self { client, config }
    }

    /// Gửi email chứa mã OTP giao dịch bằng Brevo Transactional API
    pub async fn send_otp_email(&self, to_email: &str, otp_code: &str, otp_type: &str) -> Result<(), AppError> {
        if self.config.brevo_api_key.is_empty() {
            tracing::warn!(
                "⚠️ [Brevo Mock] BREVO_API_KEY chưa được cấu hình. Mã OTP cho {}: [{}]",
                to_email,
                otp_code
            );
            return Ok(());
        }

        let subject = match otp_type {
            "FORGOT_PASSWORD" => "Mã OTP khôi phục mật khẩu - FastFood Vietnam",
            _ => "Mã OTP xác thực tài khoản - FastFood Vietnam",
        };

        let action_title = match otp_type {
            "FORGOT_PASSWORD" => "Khôi phục mật khẩu tài khoản",
            _ => "Đăng ký thành viên mới",
        };

        let html_content = format!(
            r#"<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7f7f7; margin: 0; padding: 20px; }}
    .container {{ max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.06); }}
    .logo {{ text-align: center; font-size: 24px; font-weight: 800; color: #dc2626; margin-bottom: 24px; }}
    .title {{ font-size: 18px; font-weight: 600; color: #1f2937; margin-bottom: 12px; }}
    .desc {{ font-size: 14px; color: #4b5563; line-height: 1.6; margin-bottom: 24px; }}
    .otp-box {{ background: #fef2f2; border: 2px dashed #dc2626; border-radius: 8px; text-align: center; padding: 18px; margin-bottom: 24px; }}
    .otp-code {{ font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #dc2626; }}
    .footer {{ font-size: 12px; color: #9ca3af; text-align: center; margin-top: 32px; border-top: 1px solid #f3f4f6; padding-top: 16px; }}
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">🍔 FastFood Vietnam</div>
    <div class="title">Xác thực: {action_title}</div>
    <div class="desc">
      Bạn đang thực hiện thao tác trên hệ thống FastFood. Vui lòng sử dụng mã OTP dưới đây để hoàn tất. Mã có hiệu lực trong vòng <b>5 phút</b>.
    </div>
    <div class="otp-box">
      <div class="otp-code">{otp_code}</div>
    </div>
    <div class="desc" style="font-size: 13px; color: #ef4444;">
      ⚠️ Tuyệt đối không chia sẻ mã này cho bất kỳ ai để đảm bảo an toàn tài khoản.
    </div>
    <div class="footer">
      Email tự động được gửi từ hệ thống FastFood E-Commerce Platform.<br>
      © 2026 FastFood Vietnam. All rights reserved.
    </div>
  </div>
</body>
</html>"#
        );

        let payload = json!({
            "sender": {
                "name": self.config.brevo_sender_name,
                "email": self.config.brevo_sender_email
            },
            "to": [
                { "email": to_email }
            ],
            "subject": subject,
            "htmlContent": html_content
        });

        let response = self
            .client
            .post("https://api.brevo.com/v3/smtp/email")
            .header("api-key", &self.config.brevo_api_key)
            .header("Content-Type", "application/json")
            .json(&payload)
            .send()
            .await
            .map_err(|e| AppError::Internal(format!("Không thể kết nối đến Brevo API: {}", e)))?;

        if !response.status().is_success() {
            let error_text = response.text().await.unwrap_or_default();
            tracing::error!("Brevo API error: {}", error_text);
            return Err(AppError::Internal(
                "Gửi email xác thực thất bại. Vui lòng kiểm tra lại địa chỉ email hoặc thử lại sau".to_string(),
            ));
        }

        tracing::info!("✅ Đã gửi email OTP thành công tới {}", to_email);
        Ok(())
    }
}

