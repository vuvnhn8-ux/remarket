/**
 * Re:Market — Stripe Payment Adapter (SERVER-ONLY, AGENTS.md mục 14.2)
 *
 * Chỉ được import từ server (server.ts). Không bao giờ lọt vào client bundle —
 * nơi có STRIPE_SECRET_KEY/WEBHOOK_SECRET.
 *
 * CHƯA tích hợp SDK Stripe thật — đây là khung sẵn sàng (PaymentIntent confirm +
 * webhook verify signature). Khi cắm thật:
 *   1. npm i stripe
 *   2. tạo PaymentIntent, confirm qua webhook `payment_intent.succeeded`
 *   3. xác minh signature bằng STRIPE_WEBHOOK_SECRET
 */

import { OrderRecord } from '../../src/types';
import { PaymentAdapter, PaymentResult } from './index';

export class StripePaymentAdapter implements PaymentAdapter {
  readonly name = 'StripePaymentAdapter';

  async confirmPayment(order: OrderRecord): Promise<PaymentResult> {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      return { success: false, reason: 'STRIPE_SECRET_KEY chưa được cấu hình (APP_MODE=live).' };
    }
    // TODO(live): gọi Stripe PaymentIntent thật tại đây.
    // Trong demo framework chưa có SDK, trả success để luồng không bị chặn.
    return { success: true };
  }
}
