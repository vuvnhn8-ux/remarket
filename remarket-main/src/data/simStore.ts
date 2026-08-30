/**
 * Re:Market — Simulation Store (riêng biệt với dữ liệu thật)
 *
 * APP_MODE=simulation dùng store này: bộ dữ liệu DEMO nhỏ gọn, dễ phân biệt,
 * được đánh dấu simulation. Khi go-live, toàn bộ thao tác ở đây có thể purge
 * mà không đụng dbStore thật (nguyên tắc AGENTS.md 14.3).
 */

import { DatabaseStore } from './dbStore';
import { generateSimulationSeed } from './simSeed';

export const simStore = new DatabaseStore({
  seed: generateSimulationSeed,
  label: 'SIMULATION DB',
});
