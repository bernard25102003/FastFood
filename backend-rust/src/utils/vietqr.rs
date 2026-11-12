/// Hàm tạo URL ảnh VietQR động liên kết với hệ sinh thái SePay
/// Cú pháp chuẩn của SePay Image Gateway:
/// https://qr.sepay.vn/img?acc={STK}&bank={BANK}&amount={AMOUNT}&des={DESCRIPTION}
pub fn generate_vietqr_url(
    bank_name: &str,
    account_no: &str,
    amount: i64,
    description: &str,
) -> String {
    let encoded_desc = urlencoding_simple(description);
    format!(
        "https://qr.sepay.vn/img?acc={}&bank={}&amount={}&des={}",
        account_no, bank_name, amount, encoded_desc
    )
}

fn urlencoding_simple(input: &str) -> String {
    input
        .chars()
        .map(|c| match c {
            'A'..='Z' | 'a'..='z' | '0'..='9' | '-' | '_' | '.' | '~' => c.to_string(),
            ' ' => "%20".to_string(),
            _ => format!("%{:02X}", c as u32),
        })
        .collect()
}

