/**
 * Re:Market — Payment architecture (AGENTS.md mục 14.2)
 *
 * Checkout flow
 *       ↓
 *  PaymentService (lib/payment/index.ts)   ← điểm gọi duy nhất trong app
 *       ↓
 * SimulationPaymentAdapter / StripePaymentAdapter
 *
 * Business logic (tạo order, trừ kho) không biết đang chạy adapter nào.
 * Order luôn đi qua state machine: 注文受付 → 支払確認 → 発送準備中 → ...
 */

import { OrderRecord } from '../../src/types';

export type PaymentResult = { success: true } | { success: false; reason: string };

/**
 * Interface tối thiểu mà PaymentService cần từ store (dbStore/simStore sync,
 * hoặc SupabaseStore/ServerStore async). Giúp PaymentService không gắn cứng với
 * một lớp store cụ thể. Các phương thức cho phép cả trả synchronous lẫn async —
 * `createAndConfirmOrder` dùng `await` nên xử lý được cả hai (AGENTS.md 14.2).
 */
export interface PaymentStore {
  createOrder(data: Record<string, unknown>): OrderRecord | Promise<OrderRecord>;
  confirmOrderPayment(orderId: string): OrderRecord | null | Promise<OrderRecord | null>;
  failOrderPayment(orderId: string): OrderRecord | null | Promise<OrderRecord | null>;
  getOrderById(orderId: string): OrderRecord | undefined | Promise<OrderRecord | undefined>;
}

export interface PaymentAdapter {
  readonly name: string;
  confirmPayment(order: OrderRecord): Promise<PaymentResult>;
}

/**
 * Simulation adapter — không gọi mạng ra ngoài, trả kết quả xác định trước.
 * Có thể cấu hình luôn success, hoặc giả lập thất bại (để demo error handling).
 */
export class SimulationPaymentAdapter implements PaymentAdapter {
  readonly name = 'SimulationPaymentAdapter';
  constructor(private readonly alwaysSucceed = true) {}

  async confirmPayment(order: OrderRecord): Promise<PaymentResult> {
    // Mô phỏng độ trễ nhỏ nhưng không gọi API bên ngoài.
    await new Promise((resolve) => setTimeout(resolve, 400));
    if (!this.alwaysSucceed && order.id.endsWith('4')) {
      return { success: false, reason: 'カード承認が拒否されました（デモの失敗シナリオ）。' };
    }
    return { success: true };
  }
}

/**
 * PaymentService — điểm gọi duy nhất cho thanh toán (client-safe).
 * Chọn adapter dựa trên chế độ simulation/live.
 * Lưu ý: StripePaymentAdapter nằm ở file riêng (lib/payment/stripe.ts), chỉ được
 * import ở server (server.ts) và truyền vào qua options.adapter — tránh lộ key/
 * logic thanh toán thật vào client bundle.
 */
export class PaymentService {
  private readonly adapter: PaymentAdapter;

  constructor(
    private readonly store: PaymentStore,
    options?: { adapter?: PaymentAdapter; simulationMode?: boolean }
  ) {
    this.adapter = options?.adapter || new SimulationPaymentAdapter();
  }

  /**
   * Tạo order ở trạng thái 注文受付 (giữ chỗ stock atomically), sau đó xác nhận
   * thanh toán qua adapter. Business logic không biết adapter nào được chạy.
   */
  async createAndConfirmOrder(data: Record<string, unknown>): Promise<{ order: OrderRecord; result: PaymentResult }> {
    const order = await this.store.createOrder(data);
    const result = await this.adapter.confirmPayment(order);

    if (result.success) {
      await this.store.confirmOrderPayment(order.id);
    } else {
      await this.store.failOrderPayment(order.id);
    }

    return { order: (await this.store.getOrderById(order.id))!, result };
  }
}
