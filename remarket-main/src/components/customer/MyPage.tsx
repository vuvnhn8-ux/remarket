import React, { useState } from 'react';
import {
  Package,
  Heart,
  User,
  RefreshCw,
  Truck,
  CheckCircle2,
  Clock,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { OrderRecord, ProductItem, AcquisitionRecord, OrderStatus } from '../../types';
import { ProductCard } from './ProductCard';
import { ConditionBadge } from '../common/ConditionBadge';
import { useAuth } from '../../context/AuthContext';

interface MyPageProps {
  orders: OrderRecord[];
  products: ProductItem[];
  favorites: string[];
  acquisitions: AcquisitionRecord[];
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onSelectProduct: (product: ProductItem) => void;
  initialTab?: 'orders' | 'favorites' | 'profile' | 'tradein';
}

export const MyPage: React.FC<MyPageProps> = ({
  orders,
  products,
  favorites,
  acquisitions,
  onToggleFavorite,
  onSelectProduct,
  initialTab = 'orders',
}) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'favorites' | 'profile' | 'tradein'>(initialTab);
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null);

  const { user } = useAuth();

  const favoriteProducts = products.filter((p) => favorites.includes(p.id));
  // Chỉ hiển thị 買取 của chính khách đã đăng nhập (dùng identity thật, không hardcode tên)
  const myAcquisitions = user
    ? acquisitions.filter(
        (a) =>
          (a.customerEmail && a.customerEmail.toLowerCase() === user.email.toLowerCase()) ||
          (a.customerName && a.customerName === user.name)
      )
    : [];
  // Chỉ hiển thị 注文 của chính khách đã đăng nhập (dùng email thật)
  const myOrders = user
    ? orders.filter((o) => o.customerEmail && o.customerEmail.toLowerCase() === user.email.toLowerCase())
    : [];

  const statusOrder: OrderStatus[] = ['注文受付', '支払確認', '発送準備中', '発送済み', '配達完了'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Page Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-lg text-white">
            {user?.name?.charAt(0) || 'マ'}
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold">{user?.name || 'マイページ'} 様のマイページ</h1>
            <p className="text-xs text-slate-400">
              会員ID: <span className="text-emerald-400 font-semibold">{user?.customerId || user?.id || '—'}</span> | {user?.email || ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs bg-slate-800 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700">
            お気に入り: <strong className="text-emerald-400">{favorites.length}</strong> | 買取履歴: <strong className="text-amber-400">{myAcquisitions.length}</strong>
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2 sm:gap-6 overflow-x-auto text-xs sm:text-sm font-bold">
        <button
          type="button"
          onClick={() => setActiveTab('orders')}
          className={`pb-3 flex items-center gap-2 cursor-pointer transition border-b-2 ${
            activeTab === 'orders'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>注文履歴 ({myOrders.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('favorites')}
          className={`pb-3 flex items-center gap-2 cursor-pointer transition border-b-2 ${
            activeTab === 'favorites'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>お気に入り ({favoriteProducts.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('tradein')}
          className={`pb-3 flex items-center gap-2 cursor-pointer transition border-b-2 ${
            activeTab === 'tradein'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <RefreshCw className="w-4 h-4" />
          <span>買取・下取履歴 ({myAcquisitions.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`pb-3 flex items-center gap-2 cursor-pointer transition border-b-2 ${
            activeTab === 'profile'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <User className="w-4 h-4" />
          <span>会員情報・お届け先</span>
        </button>
      </div>

      {/* Tab Contents */}
      {/* 1. Orders Tab */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          {myOrders.length > 0 ? (
            myOrders.map((order) => {
              const currentStepIdx = statusOrder.indexOf(order.orderStatus);
              return (
                <div
                  key={order.id}
                  className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden"
                >
                  {/* Order Top Bar */}
                  <div className="bg-slate-50 p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex flex-wrap items-center gap-4">
                      <div>
                        <span className="text-slate-500 block text-[10px]">注文日</span>
                        <span className="font-semibold text-slate-800">{order.orderedAt.slice(0, 10)}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">注文番号</span>
                        <span className="font-mono font-bold text-slate-900">{order.id}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">合計金額</span>
                        <span className="font-black text-emerald-700">¥{order.totalAmount.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800">
                        {order.orderStatus}
                      </span>
                    </div>
                  </div>

                  {/* Order Shipping Status Progress Pipeline */}
                  <div className="p-4 bg-slate-900/5 border-b border-slate-100">
                    <div className="grid grid-cols-5 gap-1 text-center">
                      {statusOrder.map((step, idx) => {
                        const isPastOrCurrent = idx <= currentStepIdx;
                        const isCurrent = idx === currentStepIdx;
                        return (
                          <div key={step} className="flex flex-col items-center">
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold mb-1 transition ${
                                isCurrent
                                  ? 'bg-emerald-600 text-white ring-2 ring-emerald-400 shadow-xs'
                                  : isPastOrCurrent
                                  ? 'bg-emerald-500 text-white'
                                  : 'bg-slate-200 text-slate-400'
                              }`}
                            >
                              {isPastOrCurrent ? '✓' : idx + 1}
                            </div>
                            <span
                              className={`text-[11px] font-medium ${
                                isCurrent ? 'text-emerald-800 font-bold' : isPastOrCurrent ? 'text-slate-700' : 'text-slate-400'
                              }`}
                            >
                              {step}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {order.trackingNumber && (
                      <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
                        <span className="flex items-center gap-1.5">
                          <Truck className="w-3.5 h-3.5 text-blue-600" />
                          配送業者: ヤマト運輸（宅急便）
                        </span>
                        <span className="font-mono font-bold text-slate-900">
                          追跡番号: {order.trackingNumber}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Order Items */}
                  <div className="p-4 divide-y divide-slate-100">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="py-3 first:pt-0 last:pb-0 flex items-center gap-4">
                        <div className="w-16 h-16 bg-slate-100 rounded-lg overflow-hidden shrink-0">
                          {item.image ? (
                            <img src={item.image} alt="" loading="lazy" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                              <Package className="w-6 h-6" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <ConditionBadge rank={item.conditionRank} size="sm" showLabel={true} />
                            <span className="text-xs text-slate-500">{item.brand}</span>
                          </div>
                          <h4 className="text-xs font-bold text-slate-900">{item.name}</h4>
                          {item.serialNumber && (
                            <p className="text-[10px] text-slate-400 font-mono">シリアル: {item.serialNumber}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-slate-400 block">点数: 1点</span>
                          <span className="text-sm font-black text-slate-900">¥{item.price.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500 text-xs">
              まだ注文履歴がありません。
            </div>
          )}
        </div>
      )}

      {/* 2. Favorites Tab */}
      {activeTab === 'favorites' && (
        <div>
          {favoriteProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {favoriteProducts.map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  isFavorite={true}
                  onToggleFavorite={onToggleFavorite}
                  onSelectProduct={onSelectProduct}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-2">
              <Heart className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="text-sm font-bold text-slate-800">お気に入りに登録された商品はありません</h4>
              <p className="text-xs text-slate-500">気になる商品のハートマークを押してお気に入りに保存できます。</p>
            </div>
          )}
        </div>
      )}

      {/* 3. Trade-in / Acquisitions History Tab */}
      {activeTab === 'tradein' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">お客様の買取・下取申込履歴</h3>
            <p className="text-xs text-slate-500">Re:Marketにお売りいただいた商品の査定状況と履歴</p>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {myAcquisitions.map((acq) => (
              <div key={acq.id} className="py-3 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono font-bold text-slate-700">{acq.id}</span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-700">
                      {acq.status}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900">{acq.brand} {acq.model}</h4>
                  <p className="text-[11px] text-slate-500">
                    受付日: {acq.acquiredAt.slice(0, 10)} | カテゴリー: {acq.category}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">買取成立金額</span>
                  <span className="text-sm font-black text-emerald-700">
                    ¥{acq.purchasePrice.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Profile Tab */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4 max-w-2xl text-xs">
          <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
            ご登録会員情報
          </h3>

          <div className="space-y-3">
            <div className="grid grid-cols-3 py-1.5 border-b border-slate-100">
              <span className="text-slate-500">お名前:</span>
              <span className="col-span-2 font-bold text-slate-800">{user?.name || '—'}</span>
            </div>
            <div className="grid grid-cols-3 py-1.5 border-b border-slate-100">
              <span className="text-slate-500">メールアドレス:</span>
              <span className="col-span-2 font-mono text-slate-800">{user?.email || '—'}</span>
            </div>
            <div className="grid grid-cols-3 py-1.5 border-b border-slate-100">
              <span className="text-slate-500">会員ID:</span>
              <span className="col-span-2 font-mono text-slate-800">{user?.customerId || user?.id || '—'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
