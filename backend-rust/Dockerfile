# ─── 1. Build Stage ───────────────────────────────────────────────────────────
FROM rust:1.79-slim-bookworm AS builder

WORKDIR /app

# Cài đặt các thư viện hệ thống cần thiết cho quá trình biên dịch
RUN apt-get update && apt-get install -y pkg-config libssl-dev && rm -rf /var/lib/apt/lists/*

COPY Cargo.toml ./

# Cache dependencies
RUN mkdir src && echo "fn main() {}" > src/main.rs && cargo build --release && rm -rf src

COPY src ./src

# Compile binary release với LTO và Strip
RUN touch src/main.rs && cargo build --release

# ─── 2. Runtime Stage (Siêu nhẹ ~30MB) ───────────────────────────────────────
FROM debian:bookworm-slim AS runner

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates tzdata \
    && rm -rf /var/lib/apt/lists/*

# Tạo user không đặc quyền để chạy ứng dụng an toàn
RUN useradd -m -u 1001 appuser

COPY --from=builder /app/target/release/fastfood-backend /app/fastfood-backend

RUN chown -R appuser:appuser /app

USER appuser

EXPOSE 3000

ENV PORT=3000
ENV ENVIRONMENT=production

CMD ["/app/fastfood-backend"]

