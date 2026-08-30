# AGENTS.md — Re:Market（中古品ECサイト）

> File này được OpenCode tự động nạp vào context ở mọi phiên làm việc.
> Viết ở dạng chỉ thị ngắn, có thể hành động (actionable) — tránh văn xuôi dài
> vì tốn token ở MỌI request. Thuật ngữ nghiệp vụ giữ nguyên tiếng Nhật vì đó
> là ngôn ngữ hiển thị của sản phẩm.

## 0. BỐI CẢNH & MỤC ĐÍCH DỰ ÁN

Đây là **portfolio project** mô phỏng mô hình kinh doanh của công ty mua-bán
đồ cũ Nhật Bản (kiểu MarketEnterprise), **KHÔNG** phải shop bán đồ mới thông
thường. Thương hiệu hư cấu: **Re:Market** — 「中古品に、もう一度価値を。」

Luồng nghiệp vụ cốt lõi phải luôn được thể hiện xuyên suốt hệ thống:

```
買取受付 → 商品到着 → 検品中 → 査定完了 → 在庫登録 → 出品準備 → 販売中 → 発送 → 完了
```

Mọi sản phẩm trên site **bắt buộc** xuất phát từ một `Acquisition` (đơn mua
lại từ khách hàng) đã qua `Inspection`. Không tạo sản phẩm "từ hư không" như
site bán đồ mới — đây là điểm phân biệt quan trọng nhất của dự án, agent
không được đơn giản hóa/bỏ qua workflow này để "cho nhanh".

## 1. CẤU HÌNH OPENCODE (MULTI-PROVIDER)

Đặt trong `opencode.json` ở root — **đây là cấu hình cho AI hỗ trợ code
(OpenCode agent), KHÔNG phải AI tính năng của sản phẩm** (xem mục 10).

```json
{
  "$schema": "https://opencode.ai/config.json",
  "provider": {
    "anthropic": { "models": { "claude-sonnet-4-6": {} } },
    "openai": { "models": { "gpt-5.1": {} } },
    "google": { "models": { "gemini-2.5-pro": {} } }
  },
  "model": "anthropic/claude-sonnet-4-6",
  "small_model": "anthropic/claude-haiku-4-5",
  "permission": {
    "edit": "allow",
    "bash": {
      "git push": "ask",
      "rm -rf *": "deny",
      "prisma migrate reset*": "ask",
      "*": "allow"
    }
  }
}
```

- `model`: dùng cho task chính (viết feature, refactor kiến trúc).
- `small_model`: dùng cho task nhỏ/lặp lại (fix lint, format, đổi tên biến,
  viết seed data đơn giản) — tiết kiệm chi phí, agent tự chuyển đổi khi phù hợp.
- Tất cả API key đặt trong biến môi trường shell / secret manager, **không**
  hardcode trong `opencode.json` hay bất kỳ file nào trong repo.
- Nếu một provider bị rate-limit/lỗi giữa chừng, agent báo lỗi rõ ràng và hỏi
  người dùng có muốn đổi provider không — không tự ý fallback âm thầm.

## 2. TECH STACK CỐ ĐỊNH

| Layer | Công nghệ |
|---|---|
| Framework | Next.js (App Router, TypeScript strict) |
| Styling | Tailwind CSS |
| ORM | Prisma |
| Database | PostgreSQL |
| Validation | Zod (bắt buộc validate server-side, không tin client) |
| AI tính năng sản phẩm | Gemini API (mặc định — xem mục 10 để đổi provider) |
| Locale mặc định | 日本語, JPY, Asia/Tokyo |

Không tự ý đổi ORM/DB sang thứ khác (VD: đổi Prisma → Drizzle) dù thấy "tốt
hơn" — nếu thấy cần đổi, dừng lại và hỏi trước khi code.

## 3. NGƯỜI DÙNG & PHÂN QUYỀN

| Role | Phạm vi |
|---|---|
| Customer (顧客) | duyệt/tìm/mua sản phẩm, giỏ hàng, đơn hàng, favorite, mypage |
| Staff (スタッフ) | đăng ký買取, 検品 (inspection), quản lý inventory, chuẩn bị listing |
| Admin (管理者) | quản lý toàn bộ + dashboard KPI, quản lý order/customer |

- Bắt buộc Role-Based Authorization ở **middleware + API route level**, không
  chỉ ẩn UI bằng CSS/conditional render.
- Route `/staff/*` và `/admin/*` phải reject ở server nếu role không đúng,
  kể cả khi request gọi thẳng API không qua UI.

## 4. SCHEMA DATABASE (BẮT BUỘC TỐI THIỂU)

```
User, Customer, Staff
Product, Category, Brand, ProductImage, ProductCondition
Acquisition          -- đơn mua lại từ khách
Inspection, InspectionItem
Inventory, InventoryTransaction
PriceHistory
Cart, CartItem
Favorite
Order, OrderItem
Payment, Shipping
AIListingDraft, AIRequest   -- log mọi request/response AI để audit
```

Quan hệ bắt buộc phải khớp chuỗi nghiệp vụ:

```
Acquisition → Inspection → Inventory → Product (listing) → OrderItem
```

Mọi migration đặt trong `prisma/migrations/`, kèm comment ngắn giải thích lý
do nếu thay đổi cấu trúc quan hệ nêu trên.

## 5. CONDITION GRADING (RANK HỆ THỐNG)

| Rank | Tên tiếng Nhật | Ý nghĩa hiển thị cho khách |
|---|---|---|
| S | 新品同様 | Như mới, gần như chưa qua sử dụng |
| A | 非常に良い | Rất tốt, dấu vết sử dụng tối thiểu |
| B | 良好 | Tốt, có vết sử dụng nhỏ |
| C | 使用感あり | Có dấu hiệu sử dụng rõ |
| D | 傷・不具合あり | Có trầy xước/lỗi chức năng |

Mỗi rank khi hiển thị **phải kèm mô tả cụ thể** (外観/動作/付属品/欠品), không
chỉ hiện chữ cái đơn lẻ — đây là yêu cầu minh bạch bắt buộc cho hàng đã qua sử dụng.

## 6. TỒN KHO — MỖI ITEM LÀ DUY NHẤT

Khác site bán đồ mới, mỗi sản phẩm đã qua sử dụng thường là **stock = 1, độc
nhất** (VD: 1 chiếc camera cụ thể, không phải "còn 50 cái giống hệt").

- Trạng thái inventory: `入荷 → 検品中 → 在庫 → 出品中 → 取り置き → 売却済み
  → 返品 → 廃棄`
- **Bắt buộc validate stock ở server** bằng transaction/lock (VD: Prisma
  `$transaction` với `SELECT ... FOR UPDATE` hoặc optimistic locking qua
  version field) để chống 2 khách mua trùng 1 item cùng lúc.
- Ghi `InventoryTransaction` cho mỗi thay đổi trạng thái để có lịch sử đầy đủ
  (không update đè, phải append log).

## 7. PRICING

Mỗi item hiển thị (ít nhất ở màn Staff/Admin, không nhất thiết public):
`買取価格 (acquisition cost)` → `販売価格 (selling price)` → `粗利 (gross
profit)` → `粗利率 (gross margin %)`.

Không dựng mô hình AI pricing phức tạp — chỉ cần nền tảng dữ liệu đúng để
sau này có thể cắm AI pricing vào (tách riêng service, không gắn cứng logic
pricing vào UI component).

## 8. LUỒNG MUA HÀNG (CUSTOMER)

`Tìm sản phẩm → Xem chi tiết/条件 → Thêm giỏ → Checkout → Thanh toán (mock/test
provider nếu chưa tích hợp thật) → Xác nhận đơn → Cập nhật inventory → Admin
nhận đơn → Cập nhật shipping`

Trạng thái đơn hàng: `注文受付 → 支払確認 → 発送準備中 → 発送済み → 配達完了`

Nếu payment thật (Stripe/PayOS/...) chưa được cấu hình, dùng **mock provider
có tài liệu rõ ràng trong code** (comment giải thích đây là mock, cách thay
bằng provider thật) — không dùng nút giả không có logic backend đứng sau.

## 9. DASHBOARD & KPI — KHÔNG HARDCODE SỐ LIỆU

Mọi số liệu dashboard (販売, 買取, 在庫, KPI như 検品完了率, 出品率, 販売率,
average days to sell, 粗利率) phải **query trực tiếp từ database**, không
hardcode/giả lập giá trị tĩnh trong component hoặc seed cứng vào response.

## 10. KIẾN TRÚC AI TÍNH NĂNG SẢN PHẨM (TÁCH BIỆT KHỎI OPENCODE)

**Đây là AI chạy trong ứng dụng đã deploy, KHÁC với AI đang hỗ trợ code
(mục 1).** Ba tính năng bắt buộc:

1. **AI #1 — Listing Assistant**: Staff nhập 商品名/ブランド/型番/状態/傷/
   付属品/検品結果 → AI sinh 商品タイトル/商品説明/状態説明/検索キーワード.
   Staff luôn review trước khi publish (không auto-publish).
2. **AI #2 — Shopping Assistant**: Khách hỏi bằng ngôn ngữ tự nhiên (VD:
   「10万円以下で中古のカメラを探しています」) → AI phải **query DB thật**
   rồi trả kết quả dựa trên dữ liệu thật, **tuyệt đối không được bịa sản
   phẩm không tồn tại trong DB**.
3. **AI #3 — Sales Assistant (nội bộ, Admin)**: Admin hỏi câu phân tích (VD:
   「今月、売れ行きが悪いカテゴリーは？」) → hệ thống lấy dữ liệu thật từ DB
   rồi đưa cho AI diễn giải. **Kết quả trả về phải phân tách rõ: phần nào là
   dữ liệu thật (fact) và phần nào là diễn giải của AI (interpretation)** —
   không trộn lẫn hai loại này trong cùng một câu.

**Kiến trúc bắt buộc:**

```
UI / API route
      ↓
AI Service layer (lib/ai/*)   ← toàn bộ gọi AI tập trung ở đây
      ↓
Provider adapter (Gemini mặc định, có thể đổi)
```

- **Không** gọi thẳng Gemini/OpenAI SDK từ trong React component hoặc rải
  rác nhiều API route — luôn đi qua `lib/ai/` để dễ đổi provider và audit.
- Mọi request/response AI ghi vào bảng `AIRequest` (input, output, model,
  timestamp) để audit và debug.
- API key của AI provider chỉ tồn tại ở server, **không bao giờ** lộ ra
  client/browser bundle.
- Vì multi-provider: viết interface chung (VD: `generateListing(input):
  Promise<ListingDraft>`) rồi implement riêng cho từng provider, thay vì gọi
  API cụ thể trực tiếp trong business logic — giúp đổi Gemini ↔ OpenAI ↔
  Claude sau này không phải sửa nhiều nơi.

## 11. BẢO MẬT

- Input validation bằng Zod ở **mọi** API route, không chỉ client-side.
- Không expose bất kỳ API key/secret nào ra client bundle (kiểm tra bằng
  `NEXT_PUBLIC_*` prefix — chỉ biến thật sự an toàn để public mới dùng prefix
  này).
- Server-side stock/inventory validation bắt buộc (mục 6).
- Mọi lỗi API bọc `try-catch`, không nuốt lỗi im lặng (`catch {}` rỗng bị cấm).

## 12. QUY TẮC CODE & LÀM VIỆC VỚI OPENCODE

- Server Components mặc định; chỉ thêm `"use client"` khi thực sự cần
  state/event/hook.
- **Không** dùng `// TODO: implement this` hay hàm rỗng giả định — code phải
  chạy được ngay.
- Trước khi sửa file, luôn đọc file hiện tại, không đoán nội dung từ bộ nhớ.
- Ưu tiên patch/diff thay vì viết lại toàn bộ file khi chỉ sửa một phần.
- Sau khi sửa code, chạy `npm run build`/`npx tsc --noEmit` để tự kiểm tra
  trước khi báo "xong" — không suy đoán code chạy được.
- Không hardcode dữ liệu demo vào component — luôn qua seed script
  (`prisma/seed.ts`) và query thật.

## 13. DỮ LIỆU SEED TỐI THIỂU

- 100+ sản phẩm đồ cũ Nhật Bản thực tế (カメラ/パソコン/スマートフォン/
  ゲーム/オーディオ/腕時計/家電/工具/アウトドア/カー用品), đa dạng rank,
  brand, giá.
- 50+ Acquisition, 50+ Customer, 30+ Order.
- Đủ trạng thái Inventory và kết quả Inspection khác nhau để dashboard/KPI
  không rỗng khi demo.

## 14. HAI CHẾ ĐỘ VẬN HÀNH: SIMULATION vs LIVE

Đây là app **chạy thật**, không phải demo tĩnh. Nhưng cần 2 chế độ song song
trong giai đoạn đầu:

- **Simulation (`APP_MODE=simulation`)**: dùng để show cho khách hàng/nhà
  đầu tư xem toàn bộ luồng hoạt động mà **không cần tiền thật**.
- **Live (`APP_MODE=live`)**: khách hàng test/dùng luồng thanh toán **thật**.

Về sau, khi đưa vào vận hành chính thức, chế độ simulation sẽ bị **gỡ bỏ
hoàn toàn** — vì vậy kiến trúc phải cho phép xoá simulation dễ dàng, không
được để logic simulation trộn lẫn không thể tách khỏi logic thật.

### 14.1 Cơ chế chuyển mode

- Điều khiển bằng biến môi trường `APP_MODE=simulation|live`, áp dụng cho
  toàn bộ site tại một thời điểm (không cho user tự chọn mode trên UI).
- Đọc giá trị này **duy nhất một chỗ**: `lib/config/app-mode.ts` — export
  hàm `isSimulationMode()`. Toàn bộ codebase gọi qua hàm này, **không** đọc
  `process.env.APP_MODE` rải rác nhiều nơi.
- Hiển thị banner rõ ràng ở UI khi `APP_MODE=simulation` (VD: dải màu cảnh
  báo "デモ環境です。実際の決済は発生しません。") để không ai nhầm là môi
  trường thật.

### 14.2 Payment — kiến trúc adapter bắt buộc

```
Checkout flow
      ↓
PaymentService (lib/payment/index.ts)   ← điểm gọi duy nhất trong app
      ↓
   ┌───────────────┴───────────────┐
SimulationPaymentAdapter      StripePaymentAdapter (hoặc Komoju sau)
(giả lập thành công/thất bại,  (gọi Stripe thật, xử lý webhook thật,
 không gọi mạng ra ngoài)       verify signature thật)
```

- Interface chung bắt buộc, VD:
  `createPaymentIntent(order): Promise<PaymentIntent>`,
  `confirmPayment(id): Promise<PaymentResult>`,
  `handleWebhook(payload, signature): Promise<void>`.
- `PaymentService` chọn adapter dựa trên `isSimulationMode()` — business
  logic (tạo order, trừ kho...) **không được biết** đang chạy adapter nào.
- `SimulationPaymentAdapter` vẫn phải đi qua đúng state machine đơn hàng
  (`注文受付 → 支払確認 → ...`), chỉ khác là không gọi API bên ngoài và luôn
  trả kết quả xác định trước (có thể cho phép giả lập cả trường hợp thất
  bại để demo error handling).
- Route webhook thật (`/api/webhooks/stripe`) **không được active** khi
  `APP_MODE=simulation` — trả 404 hoặc bỏ qua, tránh nhầm lẫn khi test.

### 14.3 Đánh dấu dữ liệu để dọn dẹp sau này

- Bảng `Order` và `Payment` có field `isSimulation: boolean` (default theo
  `APP_MODE` lúc tạo record).
- Viết sẵn script `scripts/purge-simulation-data.ts` — xoá toàn bộ record có
  `isSimulation=true` (Order, OrderItem, Payment liên quan) khi chuẩn bị go-live.
  **Không đụng** Product/Inventory/Acquisition thật (những bảng này không có
  khái niệm simulation).
- Dashboard/KPI (mục 9) mặc định **loại trừ** record `isSimulation=true`
  khỏi số liệu kinh doanh thật, trừ khi có filter riêng "xem demo data".

### 14.4 Việc gỡ bỏ simulation sau này phải đơn giản

Vì lý do trên, agent khi code **không được**:
- Rải `if (isSimulationMode())` khắp business logic (chỉ được rẽ nhánh ở
  tầng adapter/service, không rẽ nhánh trong component hay route handler).
- Gộp chung schema Order thật và giả theo cách không thể lọc/xoá sạch.
- Hardcode dữ liệu giả trực tiếp vào UI thay vì đi qua adapter + DB thật.

## 15. TIÊU CHÍ HOÀN THÀNH (SMOKE TEST TRƯỚC KHI BÁO "XONG")

Đăng ký/đăng nhập · tìm & lọc sản phẩm · xem chi tiết & condition · favorite ·
giỏ hàng · checkout & trừ kho không trùng lặp · 買取 registration · 検品 ·
inventory management · pricing · product listing · order management admin ·
AI listing description · AI shopping search (dựa DB thật) · AI sales
analysis (tách fact/interpretation) · phân quyền role đúng ở server ·
checkout chạy đúng ở cả `APP_MODE=simulation` và `APP_MODE=live` · banner
demo hiển thị đúng khi simulation · script purge simulation data chạy không
lỗi và không đụng dữ liệu thật.

Agent phải tự chạy build/lint và kiểm tra logic trước khi tuyên bố hoàn tất,
không suy đoán.
