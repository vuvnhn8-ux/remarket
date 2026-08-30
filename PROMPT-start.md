# Prompt khởi động — dán vào OpenCode

Đọc kỹ `AGENTS.md` ở root project trước khi làm bất kỳ việc gì — toàn bộ rule
nghiệp vụ, kiến trúc dual-mode (simulation/live), schema, bảo mật đều nằm ở đó.

Bắt đầu implement theo **từng phase**, sau mỗi phase dừng lại để tôi review
trước khi sang phase tiếp theo. Không tự ý gộp nhiều phase vào 1 lượt chạy.

## Phase 0 — Khởi tạo project

1. Khởi tạo Next.js (App Router, TypeScript strict) + Tailwind.
2. Cài Prisma, kết nối PostgreSQL (đọc connection string từ `.env.local`,
   không hardcode).
3. Tạo `lib/config/app-mode.ts` với hàm `isSimulationMode()` đọc từ
   `APP_MODE` — đây là điểm duy nhất được đọc biến này trực tiếp.
4. Tạo `.env.example` liệt kê đầy đủ biến môi trường cần thiết (DB, AI
   provider key, payment key thật + giả), kèm comment giải thích từng biến.
5. Setup ESLint + Prettier + `npx tsc --noEmit` chạy được sạch.

Dừng lại sau phase này, báo cáo cấu trúc thư mục đã tạo.

## Phase 1 — Database schema

1. Viết schema Prisma đầy đủ theo mục 4 trong `AGENTS.md` (bao gồm cả field
   `isSimulation` trên `Order` và `Payment` theo mục 14.3).
2. Chạy migration đầu tiên.
3. Viết `prisma/seed.ts` — seed tối thiểu theo mục 13, nhưng **chỉ seed
   khoảng 10 sản phẩm mẫu** ở phase này để tôi kiểm tra schema trước, chưa
   cần seed đủ 100+.

Dừng lại, in ra schema và hỏi tôi confirm trước khi seed đầy đủ.

## Phase 2 — Auth & phân quyền

1. Setup authentication (NextAuth hoặc giải pháp bạn thấy phù hợp với stack —
   đề xuất trước, đừng tự chọn âm thầm) với 3 role: Customer/Staff/Admin.
2. Middleware chặn `/staff/*` và `/admin/*` ở server.
3. Trang đăng ký/đăng nhập cơ bản cho Customer.

Dừng lại, tôi sẽ test đăng nhập/phân quyền trước khi tiếp tục.

## Phase 3 — Luồng nghiệp vụ lõi (Staff)

Theo đúng thứ tự: 買取登録 (Acquisition) → 検品 (Inspection) → 在庫登録
(Inventory) → chuẩn bị listing. Đây là phần lõi phân biệt dự án — làm đúng
state machine, không tắt bớt bước nào.

Dừng lại sau khi luồng Staff chạy được end-to-end với 1 item mẫu.

## Phase 4 — Trang khách hàng (Customer-facing)

Trang chủ, tìm kiếm/filter, chi tiết sản phẩm (hiển thị condition minh bạch
theo mục 5), giỏ hàng, favorite.

## Phase 5 — Checkout & Payment (dual-mode)

Implement đúng kiến trúc adapter ở mục 14.2 trong `AGENTS.md`:
- `PaymentService` + interface chung.
- `SimulationPaymentAdapter` trước (không cần key thật, test được ngay).
- `StripePaymentAdapter` sau, đọc key thật từ env, xử lý webhook + verify
  signature.
- Server-side lock chống mua trùng item unique-stock (mục 6).

Test cả 2 mode trước khi sang phase tiếp.

## Phase 6 — Order management & Admin dashboard

Order management cho Admin, dashboard KPI query thật từ DB (mục 9), không
hardcode số liệu.

## Phase 7 — 3 tính năng AI

Theo đúng kiến trúc `lib/ai/` ở mục 10 — Listing Assistant, Shopping
Assistant (query DB thật), Sales Assistant (tách fact/interpretation).

## Phase 8 — Seed đầy đủ + smoke test

Seed đủ 100+ sản phẩm, 50+ acquisition, 30+ order theo mục 13. Chạy qua toàn
bộ checklist ở mục 15 (`AGENTS.md`), báo cáo kết quả từng mục — mục nào fail
thì sửa trước khi báo hoàn thành.

## Phase 9 — Chuẩn bị go-live

Viết `scripts/purge-simulation-data.ts` theo mục 14.3, kèm hướng dẫn ngắn
(README hoặc comment) các bước chuyển từ simulation sang live thật khi vận
hành chính thức (đổi `APP_MODE`, chạy purge script, verify Stripe webhook
live mode).

---

Bắt đầu từ **Phase 0** ngay bây giờ. Nếu có quyết định kỹ thuật không rõ
trong `AGENTS.md` (VD: chọn thư viện Auth cụ thể), hỏi tôi trước, đừng tự
quyết định rồi code luôn.
