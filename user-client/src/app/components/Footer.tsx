import React from 'react';

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-[#111111] text-white mt-auto">

      {/* Background effects */}
      <div className="absolute inset-0 opacity-[0.04]">
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-[#CC0000] rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-yellow-400 rounded-full blur-3xl" />
      </div>

      <div className="container relative z-10 mx-auto px-4 lg:px-8 py-10">

        {/* TOP */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">

          {/* Brand */}
          <div>
            <div className="inline-flex items-center gap-3 mb-4">

              <div className="w-12 h-12 rounded-xl bg-[#CC0000] flex items-center justify-center shadow-lg shadow-red-900/30 text-xl">
                🍔
              </div>

              <div>
                <h3 className="text-xl font-black tracking-wide uppercase">
                  FastFood
                </h3>

                <span className="text-[#FFDE00] text-xs font-bold tracking-[2px] uppercase">
                  Express
                </span>
              </div>
            </div>

            <p className="text-gray-400 text-sm leading-6 font-medium">
              Thưởng thức đồ ăn nhanh chuẩn vị nhà hàng với tốc độ giao hàng siêu nhanh,
              nóng hổi và chất lượng như vừa ra lò.
            </p>

            {/* Social */}
            <div className="flex items-center gap-3 mt-4">

              <a
                href="https://www.facebook.com/KFCVietnam"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="KFC Vietnam Facebook"
                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-[#CC0000] transition-all duration-300 hover:-translate-y-1 border border-white/10 inline-flex items-center justify-center"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
                  <path d="M22 12.07C22 6.5 17.52 2 12 2S2 6.5 2 12.07c0 5.03 3.66 9.2 8.44 9.93V14.9H7.9V12h2.54V9.8c0-2.52 1.49-3.92 3.78-3.92 1.1 0 2.25.2 2.25.2v2.48H15.2c-1.24 0-1.62.78-1.62 1.57V12h2.77l-.44 2.9h-2.33V22c4.78-.73 8.42-4.9 8.42-9.93z" />
                </svg>
              </a>

              <a
                href="https://www.instagram.com/kfc_vietnam/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="KFC Vietnam Instagram"
                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-[#CC0000] transition-all duration-300 hover:-translate-y-1 border border-white/10 inline-flex items-center justify-center"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
                  <path d="M7.75 2h8.5C19.42 2 22 4.58 22 7.75v8.5C22 19.42 19.42 22 16.25 22h-8.5C4.58 22 2 19.42 2 16.25v-8.5C2 4.58 4.58 2 7.75 2zm8.33 1.8a1.08 1.08 0 1 0 0 2.16 1.08 1.08 0 0 0 0-2.16zM12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 1.8A3.2 3.2 0 1 1 8.8 12 3.2 3.2 0 0 1 12 8.8z" />
                </svg>
              </a>

              <a
                href="https://www.tiktok.com/@kfc.vietnam"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="KFC Vietnam TikTok"
                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-[#CC0000] transition-all duration-300 hover:-translate-y-1 border border-white/10 inline-flex items-center justify-center"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
                  <path d="M19.59 8.59a6.66 6.66 0 0 1-3.9-1.25v5.7a5.05 5.05 0 1 1-4.36-5V10a3.06 3.06 0 1 0 2.37 2.98V2h1.99a4.67 4.67 0 0 0 3.9 4.2z" />
                </svg>
              </a>

            </div>
          </div>

          {/* Contact */}
          <div>
            <div className="mb-4">
              <span className="text-[#FFDE00] text-xs font-black tracking-[4px] uppercase">
                Support
              </span>

              <h3 className="text-xl font-black uppercase mt-2">
                Liên Hệ
              </h3>
            </div>

            <ul className="space-y-3">

              <li className="group flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#CC0000] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  📞
                </div>

                <div>
                  <div className="text-white font-bold">
                    Hotline
                  </div>

                  <div className="text-gray-400 text-sm">
                    099999999
                  </div>
                </div>
              </li>

              <li className="group flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#CC0000] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  ✉️
                </div>

                <div>
                  <div className="text-white font-bold">
                    Email
                  </div>

                  <div className="text-gray-400 text-sm">
                    Hoangfood@fastfood.vn
                  </div>
                </div>
              </li>

              <li className="group flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#CC0000] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  📍
                </div>

                <div>
                  <div className="text-white font-bold">
                    Địa chỉ
                  </div>

                  <div className="text-gray-400 text-sm leading-6">
                    234 Hoàng Quốc Việt, Hà Nội
                  </div>
                </div>
              </li>

            </ul>
          </div>

          {/* Working time */}
          <div>
            <div className="mb-4">
              <span className="text-[#FFDE00] text-xs font-black tracking-[4px] uppercase">
                Open Time
              </span>

              <h3 className="text-xl font-black uppercase mt-2">
                Giờ Mở Cửa
              </h3>
            </div>

            <div className="space-y-3">

              <div className="bg-white/5 border border-white/10 rounded-xl p-3 hover:border-[#CC0000] transition-all duration-300">

                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold">
                    Thứ 2 - Thứ 6
                  </span>

                  <span className="text-[#FFDE00] font-black">
                    8:00 - 22:00
                  </span>
                </div>

                <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full w-[85%] bg-[#CC0000] rounded-full" />
                </div>

              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-3 hover:border-[#CC0000] transition-all duration-300">

                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold">
                    Cuối tuần
                  </span>

                  <span className="text-[#FFDE00] font-black">
                    9:00 - 23:00
                  </span>
                </div>

                <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full w-[95%] bg-[#CC0000] rounded-full" />
                </div>

              </div>

            </div>
          </div>

        </div>

        {/* BOTTOM */}
        <div className="mt-10 pt-6 border-t border-white/10">

          <div className="flex flex-col md:flex-row items-center justify-between gap-4">

            <div className="text-gray-500 text-sm text-center md:text-left">
              © 2026 FastFood Express. All rights reserved.
            </div>

            <div className="flex items-center gap-5 text-sm font-semibold text-gray-400">

              <button className="hover:text-[#FFDE00] transition-colors">
                Chính sách
              </button>

              <button className="hover:text-[#FFDE00] transition-colors">
                Điều khoản
              </button>

              <button className="hover:text-[#FFDE00] transition-colors">
                Hỗ trợ
              </button>

            </div>

          </div>

        </div>
      </div>
    </footer>
  );
}