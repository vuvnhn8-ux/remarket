import React, { useState } from 'react';
import {
  Package,
  Search,
  Filter,
  TrendingUp,
  Tag,
  Building,
  Clock,
  Edit2,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { InventoryItem, ConditionRank } from '../../types';
import { api } from '../../services/api';
import { ConditionBadge } from '../common/ConditionBadge';

interface AdminInventoryManagementProps {
  inventories: InventoryItem[];
  onRefresh: () => void;
}

export const AdminInventoryManagement: React.FC<AdminInventoryManagementProps> = ({
  inventories,
  onRefresh,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [newSellingPrice, setNewSellingPrice] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [lifecycleItem, setLifecycleItem] = useState<InventoryItem | null>(null);

  const filtered = inventories.filter((item) => {
    if (selectedStatus !== 'all' && item.status !== selectedStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.id.toLowerCase().includes(q) ||
        item.productName.toLowerCase().includes(q) ||
        item.brand.toLowerCase().includes(q) ||
        item.serialNumber.toLowerCase().includes(q) ||
        item.warehouseLocation.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleOpenEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setNewSellingPrice(String(item.sellingPrice ?? item.currentSellingPrice ?? 0));
  };

  const handleSavePrice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setIsUpdating(true);
    try {
      await api.updateInventoryPrice(editingItem.id, Number(newSellingPrice));
      setEditingItem(null);
      onRefresh();
    } catch (err: any) {
      alert('価格変更エラー: ' + err.message);
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
              個別在庫台帳・価格管理
            </span>
            <span className="text-xs text-slate-500 font-mono">Traceability Engine</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Package className="w-6 h-6 text-purple-600" />
            <span>在庫・シリアル・粗利マネジメント</span>
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            中古一点物ごとのシリアル番号、仕入原価、粗利率、保管棚番、販売価格の動的コントロール
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-slate-400 text-[11px] mr-1">状態:</span>
          {['all', '出品中', '売却済み', '在庫'].map((st) => (
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
              {st === 'all' ? 'すべての在庫' : st}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="在庫ID・商品名・シリアル・棚番で検索..."
            className="w-full h-9 pl-9 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <th className="py-3 px-4">在庫管理ID / シリアル</th>
                <th className="py-3 px-4">商品名 / ブランド</th>
                <th className="py-3 px-4 text-center">ランク</th>
                <th className="py-3 px-4 text-right">仕入原価</th>
                <th className="py-3 px-4 text-right">販売設定価格</th>
                <th className="py-3 px-4 text-right">粗利 (粗利率)</th>
                <th className="py-3 px-4">保管ロケーション</th>
                <th className="py-3 px-4 text-center">ステータス</th>
                <th className="py-3 px-4 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((item) => {
                const currentPrice = item.sellingPrice ?? item.currentSellingPrice ?? 0;
                const margin = currentPrice > 0
                  ? ((item.grossProfit / currentPrice) * 100).toFixed(1)
                  : '0.0';
                return (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-slate-900 block">{item.id}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{item.serialNumber}</span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="text-[10px] text-slate-400 font-semibold">{item.brand || 'Re:Market'} ({item.category || '中古品'})</span>
                      <h4 className="font-bold text-slate-900 line-clamp-1">{item.productName || item.productId}</h4>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <ConditionBadge rank={item.conditionRank} size="sm" showLabel={false} />
                    </td>

                    <td className="py-3 px-4 text-right font-medium text-slate-600">
                      ¥{item.acquisitionCost.toLocaleString()}
                    </td>

                    <td className="py-3 px-4 text-right font-bold text-slate-900">
                      ¥{currentPrice.toLocaleString()}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <span className="font-bold text-purple-700 block">
                        ¥{item.grossProfit.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-emerald-700 font-semibold">
                        ({margin}%)
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-600 text-[11px]">
                      <span className="flex items-center gap-1">
                        <Building className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{item.warehouseLocation}</span>
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold ${
                          item.status === '出品中'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.status === '売却済み'
                            ? 'bg-slate-200 text-slate-700'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 bg-slate-100 hover:bg-purple-100 hover:text-purple-700 text-slate-600 rounded-md transition cursor-pointer"
                          title="価格改定"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setLifecycleItem(item)}
                          className="p-1.5 bg-slate-100 hover:bg-blue-100 hover:text-blue-700 text-slate-600 rounded-md transition cursor-pointer"
                          title="トレース履歴"
                        >
                          <Clock className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Price Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="bg-purple-600 text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">販売価格の改定・粗利シミュレーション</h3>
              <button type="button" onClick={() => setEditingItem(null)} className="text-white/80 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSavePrice} className="p-5 space-y-4 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-mono block">在庫ID: {editingItem.id}</span>
                <h4 className="font-bold text-slate-900 mt-0.5">{editingItem.productName}</h4>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex justify-between">
                  <span>仕入原価（買取価格）:</span>
                  <span className="font-bold">¥{editingItem.acquisitionCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>現在販売価格:</span>
                  <span className="font-bold">¥{(editingItem.sellingPrice ?? editingItem.currentSellingPrice ?? 0).toLocaleString()}</span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">新しい販売設定価格 (税込 円) *</label>
                <input
                  type="number"
                  required
                  value={newSellingPrice}
                  onChange={(e) => setNewSellingPrice(e.target.value)}
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-base font-bold text-slate-900 focus:outline-hidden"
                />
              </div>

              {/* Real-time simulation */}
              <div className="bg-purple-50 p-3 rounded-xl border border-purple-200 text-purple-900 space-y-1">
                <div className="flex justify-between">
                  <span>改定後 想定粗利:</span>
                  <span className="font-black">¥{(Number(newSellingPrice) - editingItem.acquisitionCost).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>改定後 粗利率:</span>
                  <span className="font-black">
                    {Number(newSellingPrice) > 0 ? (((Number(newSellingPrice) - editingItem.acquisitionCost) / Number(newSellingPrice)) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg font-semibold"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold"
                >
                  {isUpdating ? '更新中...' : '価格を改定する'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lifecycle Trace Modal */}
      {lifecycleItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">一点物 個体トレーサビリティ履歴</h3>
              <button type="button" onClick={() => setLifecycleItem(null)} className="text-white/80 hover:text-white">✕</button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <ConditionBadge rank={lifecycleItem.conditionRank} size="sm" showLabel={true} />
                  <span className="font-mono font-bold text-slate-800">{lifecycleItem.id}</span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm mt-1">{lifecycleItem.productName}</h4>
                <p className="text-[11px] text-slate-500 font-mono">シリアル番号: {lifecycleItem.serialNumber}</p>
              </div>

              <div className="space-y-3">
                <h5 className="font-bold text-slate-800">個体ライフサイクル（監査ログ）</h5>
                <div className="relative pl-6 space-y-3 border-l-2 border-slate-200 ml-2">
                  <div className="relative">
                    <div className="absolute -left-[31px] top-0 w-3.5 h-3.5 rounded-full bg-blue-500" />
                    <span className="font-bold text-slate-800 block">1. 買取受付完了</span>
                    <p className="text-[11px] text-slate-500">買取ID: {lifecycleItem.acquisitionId} | 仕入原価: ¥{lifecycleItem.acquisitionCost.toLocaleString()}</p>
                  </div>
                  <div className="relative">
                    <div className="absolute -left-[31px] top-0 w-3.5 h-3.5 rounded-full bg-emerald-500" />
                    <span className="font-bold text-slate-800 block">2. 専門動作検品 & ランク確定</span>
                    <p className="text-[11px] text-slate-500">検品ID: {lifecycleItem.inspectionId} | 判定: ランク{lifecycleItem.conditionRank}</p>
                  </div>
                  <div className="relative">
                    <div className="absolute -left-[31px] top-0 w-3.5 h-3.5 rounded-full bg-purple-500" />
                    <span className="font-bold text-slate-800 block">3. 個別在庫登録 & EC出品公開</span>
                    <p className="text-[11px] text-slate-500">登録日: {lifecycleItem.registeredAt.slice(0, 10)} | 保管: {lifecycleItem.warehouseLocation}</p>
                  </div>
                  {lifecycleItem.status === '売却済み' && (
                    <div className="relative">
                      <div className="absolute -left-[31px] top-0 w-3.5 h-3.5 rounded-full bg-rose-500" />
                      <span className="font-bold text-rose-700 block">4. 顧客購入 & 売却完了</span>
                      <p className="text-[11px] text-slate-500">成約価格: ¥{lifecycleItem.sellingPrice.toLocaleString()} | 確定粗利: ¥{lifecycleItem.grossProfit.toLocaleString()}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setLifecycleItem(null)}
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg font-bold"
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
