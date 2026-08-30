/**
 * Re:Market — Purge Simulation Data (AGENTS.md mục 14.3 / PROMPT-start Phase 9)
 *
 * Mục đích:
 *  - Xoá toàn bộ record có `isSimulation=true` (Order/OrderItem/Payment liên quan).
 *  - KHÔNG đụng Product/Inventory/Acquisition thật (các bảng này không có khái
 *    niệm simulation), nhưng khôi phục trạng thái bán cho những item chỉ bị bán
 *    thông qua order simulation (để inventory/list ở trạng thái đúng trước go-live).
 *
 * Điều kiện chạy:
 *  - Chạy khi chuyển từ `APP_MODE=simulation` sang `APP_MODE=live` chuẩn bị go-live.
 *  - Lệnh: `npm run purge:simulation`
 *
 * Lưu ý kiến trúc:
 *  - DB hiện tại là in-memory (dbStore) nên script thao tác trực tiếp trên store.
 *  - Khi migrate sang Postgres thật, script này cần được viết lại bằng Prisma
 *    deleteMany({ where: { isSimulation: true } }) nhưng giữ NGUYÊN ý tưởng nghiệp vụ:
 *    chỉ xoá record simulation, không đụng dữ liệu thật.
 */

import { dbStore } from '../src/data/dbStore';

function run() {
  const ordersBefore = dbStore.getOrders().length;

  // 1. Chọn các order simulation
  const simOrders = dbStore.getOrders().filter((o) => o.isSimulation === true);
  const simOrderIds = new Set(simOrders.map((o) => o.id));

  console.log(`[Purge] Tìm thấy ${simOrders.length} order simulation (isSimulation=true) trong tổng ${ordersBefore} order.`);

  if (simOrders.length === 0) {
    console.log('[Purge] Không có dữ liệu simulation — không làm gì thêm.');
    return;
  }

  // 2. Khôi phục lại stock/status cho các sản phẩm chỉ bị bán qua order simulation.
  //    Điều này đảm bảo sau khi purge, inventory & listing trở về trạng thái còn bán
  //    (nếu item chưa được bán thật), không làm sai lệch dữ liệu kinh doanh thật.
  const soldProductIds = new Set<string>();
  for (const order of simOrders) {
    for (const item of order.items) {
      soldProductIds.add(item.productId);
    }
  }

  // Truy cập store nội bộ để khôi phục trạng thái — đây là lý do tách runbook riêng.
  // Chúng ta chỉ khôi phục những item KHÔNG thuộc order thật (order live).
  const liveOrderProductIds = new Set<string>();
  for (const order of dbStore.getOrders()) {
    if (order.isSimulation !== true) {
      for (const item of order.items) liveOrderProductIds.add(item.productId);
    }
  }

  const restored: string[] = [];
  for (const pid of soldProductIds) {
    if (liveOrderProductIds.has(pid)) continue; // bán thật rồi thì không khôi phục
    const restoredIds = dbStore.restoreSimulationSale(pid);
    if (restoredIds) restored.push(...restoredIds);
  }

  // 3. Xoá hẳn các order simulation
  const removed = dbStore.purgeOrdersByIds([...simOrderIds]);

  console.log(`[Purge] Đã khôi phục ${restored.length} item về trạng thái có thể bán (${(new Set(restored)).size} sản phẩm).`);
  console.log(`[Purge] Đã xoá ${removed} order simulation.`);
  console.log(`[Purge] Order còn lại sau purge: ${dbStore.getOrders().length} (chỉ còn record thật).`);
  console.log('[Purge] Hoàn tất. Dữ liệu Product/Inventory/Acquisition thật không bị đụng tới.');
}

run();
