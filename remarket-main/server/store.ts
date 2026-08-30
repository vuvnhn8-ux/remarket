/**
 * Re:Market — Server-side store selection (AGENTS.md mục 14)
 *
 * Server phải phục vụ ĐÚNG store theo APP_MODE để 2 chế độ có dữ liệu riêng:
 *   - APP_MODE=simulation → simStore (bộ dữ liệu DEMO nhỏ, prefix SIM-*)
 *   - APP_MODE=live        → db (dữ liệu thật, 192 sản phẩm)
 *
 * Toàn bộ route/API và auth phải đi qua getStore() thay vì dùng db cố định,
 * giống như client api.ts tách simStore/db theo isSimulationMode().
 */

import { db } from '../src/data/dbStore';
import { simStore } from '../src/data/simStore';
import { isSimulationMode } from '../lib/config/app-mode';

export function getStore() {
  return isSimulationMode() ? simStore : db;
}
