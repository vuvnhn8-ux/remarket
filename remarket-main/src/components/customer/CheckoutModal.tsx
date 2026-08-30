import React, { useState } from 'react';
import {
  X,
  CreditCard,
  Truck,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Building,
  User,
  Phone,
  Mail,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { ProductItem, OrderRecord, PaymentMethod } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: ProductItem[];
  onOrderSuccess: (order: OrderRecord) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  onOrderSuccess,
}) => {
  if (!isOpen) return null;

  const { user } = useAuth();

  // Form State (prefill từ tài khoản đã đăng nhập)
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('090-1234-5678');
  const [postalCode, setPostalCode] = useState('150-0001');
  const [prefecture, setPrefecture] = useState('東京都');
  const [cityAddress, setCityAddress] = useState('渋谷区神宮前 1-2-3 メゾン原宿 402');
  const [deliverySlot, setDeliverySlot] = useState('午前中 (8:00-12:00)');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('credit_card');
  const [cardNumber, setCardNumber] = useState('•••• •••• •••• 4242');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [completedOrder, setCompletedOrder] = useState<OrderRecord | null>(null);

  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  const tax = Math.round(subtotal * (10 / 110));
  const shippingFee = subtotal >= 5000 ? 0 : 770;
  const total = subtotal + shippingFee;

  const handleExecutePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    // Real mode: bắt buộc đăng nhập khách hàng thật (không dùng CUST-0001 cứng)
    const customerId = user?.customerId;
    if (!customerId) {
      setErrorMessage('購入を続けるには顧客アカウントでログインしてください。');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      // Build Atomic Order payload
      const orderPayload = {
        customerId,
        customerName,
        customerEmail: email,
        customerPhone: phone,
        shippingAddress: {
          postalCode,
          prefecture,
          city: cityAddress,
          addressLine: '',
        },
        deliveryTimeSlot: deliverySlot,
        paymentMethod,
        items: items.map((p) => ({
          productId: p.id,
          name: p.name,
          brand: p.brand,
          category: p.category,
          conditionRank: p.conditionRank,
          price: p.price,
          acquisitionCost: p.price * 0.65, // mapped internally by server dbStore
          serialNumber: p.serialNumber,
          featuredImage: p.featuredImage,
        })),
        subtotal,
        tax,
        shippingFee,
        totalAmount: total,
      };

      const resultOrder = await api.createOrder(orderPayload);
      setCompletedOrder(resultOrder);
      onOrderSuccess(resultOrder);
    } catch (err: any) {
      setErrorMessage(err.message || '注文の処理中にエラーが発生しました。');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-white text-sm">
              Re:
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">ご購入・ご注文手続き</h3>
              <p className="text-[11px] text-slate-400">
                1点もの中古在庫の即時引き当て（在庫排他制御）・即日出荷対応
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Order Completed Success Screen */}
        {completedOrder ? (
          <div className="p-6 sm:p-8 text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest block mb-1">
                Order Completed!
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                ご注文ありがとうございます！
              </h3>
              <p className="text-xs text-slate-600 mt-1.5">
                ご注文番号: <strong className="font-mono text-slate-900">{completedOrder.id}</strong>
              </p>
            </div>

            {/* Atomic Confirmation Callout */}
            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200 text-left text-xs space-y-2 text-emerald-900">
              <div className="font-bold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>中古在庫の引き当てが正常に完了しました</span>
              </div>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                対象商品（{items.map((i) => i.name).join(', ')}）のステータスが「売却済」に更新され、在庫の排他制御が完了しました。自社リユースセンターより丁寧に梱包して発送いたします。
              </p>
              <div className="pt-2 border-t border-emerald-200/60 flex justify-between text-[11px]">
                <span>配送追跡番号（ヤマト運輸）:</span>
                <span className="font-mono font-bold text-slate-900">{completedOrder.trackingNumber || '未採番（出荷時通知）'}</span>
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition cursor-pointer"
              >
                お買い物を続ける
              </button>
            </div>
          </div>
        ) : (
          /* Checkout Form */
          <form onSubmit={handleExecutePurchase} className="p-5 sm:p-6 space-y-5">
            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Customer & Shipping Details */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                お届け先・購入者情報
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">お名前 *</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">メールアドレス *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">電話番号 *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">郵便番号 *</label>
                  <input
                    type="text"
                    required
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-medium text-slate-700 mb-1">ご住所（都道府県・市区町村・番地・建物名） *</label>
                  <input
                    type="text"
                    required
                    value={`${prefecture} ${cityAddress}`}
                    onChange={(e) => setCityAddress(e.target.value)}
                    className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Delivery & Payment Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1.5 flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-blue-600" />
                  配送希望時間帯
                </label>
                <select
                  value={deliverySlot}
                  onChange={(e) => setDeliverySlot(e.target.value)}
                  className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-hidden"
                >
                  <option value="指定なし">指定なし（最速配送）</option>
                  <option value="午前中 (8:00-12:00)">午前中 (8:00-12:00)</option>
                  <option value="14:00-16:00">14:00-16:00</option>
                  <option value="16:00-18:00">16:00-18:00</option>
                  <option value="18:00-20:00">18:00-20:00</option>
                  <option value="19:00-21:00">19:00-21:00</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1.5 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-purple-600" />
                  お支払い方法
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-hidden"
                >
                  <option value="credit_card">クレジットカード (即時決済)</option>
                  <option value="paypay">PayPay (オンライン決済)</option>
                  <option value="convenience_store">コンビニ決済</option>
                  <option value="bank_transfer">銀行振込</option>
                </select>
              </div>
            </div>

            {/* Summary Box */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>商品合計 ({items.length}点):</span>
                <span className="font-semibold text-slate-900">¥{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>送料:</span>
                <span className={shippingFee === 0 ? 'text-emerald-700 font-bold' : 'text-slate-900 font-semibold'}>
                  {shippingFee === 0 ? '無料' : `¥${shippingFee.toLocaleString()}`}
                </span>
              </div>
              <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
                <span>お支払い総額:</span>
                <span className="text-emerald-700 text-base">¥{total.toLocaleString()}</span>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting || items.length === 0}
                className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 text-sm cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>在庫引き当て・決済処理中...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>注文を確定する（¥{total.toLocaleString()}）</span>
                  </>
                )}
              </button>
              <p className="text-[11px] text-center text-slate-500 mt-2">
                ※「注文を確定する」を押すと、一点物在庫が即座に確保・売却済みに更新されます。
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
