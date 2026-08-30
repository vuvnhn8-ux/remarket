import React, { useState } from 'react';
import {
  ShoppingBag,
  Search,
  Truck,
  CheckCircle2,
  Clock,
  ExternalLink,
  DollarSign,
  Package,
  User,
  MapPin,
  FileText,
} from 'lucide-react';
import { OrderRecord, OrderStatus } from '../../types';
import { api } from '../../services/api';
import { ConditionBadge } from '../common/ConditionBadge';

interface AdminOrderManagementProps {
  orders: OrderRecord[];
  onRefresh: () => void;
}

export const AdminOrderManagement: React.FC<AdminOrderManagementProps> = ({
  orders,
  onRefresh,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null);
  const [trackingNumberInput, setTrackingNumberInput] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  const filtered = orders.filter((order) => {
    if (selectedStatus !== 'all' && order.orderStatus !== selectedStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        order.id.toLowerCase().includes(q) ||
        order.customerName.toLowerCase().includes(q) ||
        (order.trackingNumber && order.trackingNumber.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    setIsUpdating(true);
    try {
      const tracking = trackingNumberInput || (newStatus === '発送済み' ? `YMT-${Math.floor(1000000000 + Math.random() * 9000000000)}` : undefined);
      await api.updateOrderStatus(orderId, newStatus, tracking);
      setSelectedOrder(null);
      setTrackingNumberInput('');
      onRefresh();
    } catch (err: any) {
      alert('更新エラー: ' + err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-purple-100 text-purple-800 text-xs font-bold px-2.5 py-0.5 rounded">
              受注・出荷マネジメント
            </span>
            <span className="text-xs text-slate-500 font-mono">Fulfillment Engine</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-purple-600" />
            <span>注文・配送・ステータス管理</span>
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            購入確定後の即時引き当て確認、ピッキング、追跡番号発行、ステータス更新
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-slate-400 text-[11px] mr-1">状態:</span>
          {['all', '注文受付', '支払確認', '発送準備中', '発送済み', '配達完了'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                selectedStatus === st
                  ? 'bg-purple-600 text-white font-bold shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {st === 'all' ? 'すべての注文' : st}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="注文ID・顧客名・追跡番号で検索..."
            className="w-full h-9 pl-9 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <th className="py-3 px-4">注文番号 / 日時</th>
                <th className="py-3 px-4">購入者情報</th>
                <th className="py-3 px-4">購入商品 (一点物)</th>
                <th className="py-3 px-4 text-right">注文総額</th>
                <th className="py-3 px-4 text-center">配送業者 / 追跡番号</th>
                <th className="py-3 px-4 text-center">ステータス</th>
                <th className="py-3 px-4 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4">
                    <span className="font-mono font-bold text-slate-900 block">{order.id}</span>
                    <span className="text-[10px] text-slate-400">{order.orderedAt.slice(0, 16).replace('T', ' ')}</span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-800 block">{order.customerName}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{order.customerEmail}</span>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="space-y-1">
                      {order.items.map((it, idx) => (
                        <div key={idx} className="flex items-center gap-1.5">
                          <ConditionBadge rank={it.conditionRank} size="sm" showLabel={false} />
                          <span className="font-medium text-slate-900 line-clamp-1">{it.name}</span>
                        </div>
                      ))}
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-right font-black text-slate-900 text-sm">
                    ¥{order.totalAmount.toLocaleString()}
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    {order.trackingNumber ? (
                      <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-[11px]">
                        {order.trackingNumber}
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400">出荷時採番</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-bold ${
                        order.orderStatus === '配達完了'
                          ? 'bg-emerald-100 text-emerald-800'
                          : order.orderStatus === '発送済み'
                          ? 'bg-blue-100 text-blue-800'
                          : order.orderStatus === '発送準備中'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {order.orderStatus}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedOrder(order);
                        setTrackingNumberInput(order.trackingNumber || '');
                      }}
                      className="px-3 py-1 bg-slate-800 hover:bg-slate-900 text-white rounded-md text-xs font-semibold cursor-pointer"
                    >
                      詳細・更新
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail & Status Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">注文詳細 & 出荷ステータス更新</h3>
              <button type="button" onClick={() => setSelectedOrder(null)} className="text-white/80 hover:text-white">✕</button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] text-slate-400 font-mono">注文番号</span>
                  <h4 className="font-mono font-bold text-slate-900 text-sm">{selectedOrder.id}</h4>
                  <p className="text-[11px] text-slate-500">注文日時: {selectedOrder.orderedAt}</p>
                </div>
                <span className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 font-bold">
                  {selectedOrder.orderStatus}
                </span>
              </div>

              {/* Shipping Address */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-800 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  お届け先住所
                </span>
                <p className="text-slate-700">
                  〒{selectedOrder.shippingAddress.postalCode} {selectedOrder.shippingAddress.prefecture} {selectedOrder.shippingAddress.city} {selectedOrder.shippingAddress.addressLine}
                </p>
                <p className="text-slate-600 font-medium">{selectedOrder.customerName} 様 ({selectedOrder.customerPhone})</p>
                <p className="text-[11px] text-blue-700 font-medium pt-1">配達希望時間帯: {selectedOrder.deliveryTimeSlot}</p>
              </div>

              {/* Items */}
              <div>
                <span className="font-bold text-slate-800 block mb-1.5">注文商品一覧</span>
                <div className="space-y-2">
                  {selectedOrder.items.map((it, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-200">
                      <div>
                        <span className="font-bold text-slate-900 block">{it.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono">シリアル: {it.serialNumber || '未登録'}</span>
                      </div>
                      <span className="font-black text-slate-900">¥{it.price.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tracking input */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">ヤマト運輸 追跡番号</label>
                <input
                  type="text"
                  value={trackingNumberInput}
                  onChange={(e) => setTrackingNumberInput(e.target.value)}
                  placeholder="例: YMT-1849204928"
                  className="w-full h-8 px-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs"
                />
              </div>

              {/* Status advancement buttons */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <span className="font-bold text-slate-800 block">ステータス変更:</span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedOrder.id, '発送準備中')}
                    className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold rounded-lg border border-amber-200"
                  >
                    発送準備中
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedOrder.id, '発送済み')}
                    className="p-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-xs"
                  >
                    発送済みに更新
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedOrder.id, '配達完了')}
                    className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-xs"
                  >
                    配達完了
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
