/**
 * Re:Market — APP_MODE configuration (AGENTS.md mục 14.1)
 *
 * Đây là NƠI DUY NHẤT đọc biến môi trường `APP_MODE` (và localStorage demo)
 * để xác định chế độ vận hành toàn site. Toàn bộ codebase phải gọi qua
 * `isSimulationMode()` / `getAppMode()` ở file này, KHÔNG đọc rải rác
 * `process.env.APP_MODE` ở nơi khác.
 *
 * Thứ tự ưu tiên:
 *  1. process.env.APP_MODE  (server / production)
 *  2. localStorage 'remarket_simulation_mode' (demo UI chuyển mode trong dev)
 *  3. Mặc định: simulation
 */

export type AppMode = 'simulation' | 'live';

export function getAppMode(): AppMode {
  try {
    if (typeof process !== 'undefined' && process.env && process.env.APP_MODE) {
      return process.env.APP_MODE === 'live' ? 'live' : 'simulation';
    }
  } catch {
    // no-op (trình duyệt không có process.env)
  }
  try {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('remarket_simulation_mode');
      if (stored === null) return 'simulation';
      return stored === 'true' ? 'simulation' : 'live';
    }
  } catch {
    // no-op
  }
  return 'simulation';
}

export function isSimulationMode(): boolean {
  return getAppMode() === 'simulation';
}
