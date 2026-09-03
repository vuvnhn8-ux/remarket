import React from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Tag } from 'lucide-react';
import { ProductItem } from '../../types';
import { ConditionBadge } from '../common/ConditionBadge';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: ProductItem[];
  onRemoveItem: (id: string) => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onRemoveItem,
  onProceedToCheckout,
}) => {
  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  const tax = Math.round(subtotal * (10 / 110)); // 10% tax inclusive
  const shippingFee = subtotal >= 5000 || items.length === 0 ? 0 : 550;
  const total = subtotal + shippingFee;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base font-bold text-slate-900">ショッピングカート</h2>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                {items.length}点
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {items.length > 0 ? (
              items.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 flex gap-3 relative"
                >
                  {/* Image */}
                  <div className="w-20 h-20 bg-slate-200 rounded-lg overflow-hidden shrink-0">
                    <img
                      src={item.featuredImage}
                      alt={item.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <ConditionBadge rank={item.conditionRank} size="sm" showLabel={true} />
                        <button
                          type="button"
                          onClick={() => onRemoveItem(item.id)}
                          className="text-slate-400 hover:text-rose-600 transition"
                          title="削除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug">
                        {item.name}
                      </h4>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                        個体番号: {item.serialNumber || item.id}
                      </p>
                    </div>

                    <div className="flex items-baseline justify-between pt-2 border-t border-slate-200/60 mt-1">
                      <span className="text-[11px] text-slate-500 font-medium">現品1点限り</span>
                      <span className="text-sm font-black text-slate-900">
                        ¥{item.price.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16 space-y-3">
                <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">カートに商品が入っていません</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  お気に入りの商品や探しているアイテムをカートに追加してください。
                </p>
              </div>
            )}
          </div>

          {/* Footer Summary & Checkout */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 space-y-3">
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>小計（税込）:</span>
                  <span className="font-semibold text-slate-900">¥{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>（内消費税 10%）:</span>
                  <span>¥{tax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>送料:</span>
                  <span className={shippingFee === 0 ? 'text-emerald-700 font-bold' : 'text-slate-900 font-semibold'}>
                    {shippingFee === 0 ? '無料 (¥5,000以上)' : `¥${shippingFee.toLocaleString()}`}
                  </span>
                </div>
                <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-200">
                  <span>合計（お支払金額）:</span>
                  <span className="text-emerald-700">¥{total.toLocaleString()}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={onProceedToCheckout}
                className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                <span>ご購入手続きへ進む</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>SSL暗号化通信 / 14日間初期不良安心返品対応</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
