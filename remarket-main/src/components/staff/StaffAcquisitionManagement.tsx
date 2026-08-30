import React, { useState } from 'react';
import {
  RefreshCw,
  Plus,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  User,
  Tag,
  Box,
} from 'lucide-react';
import { AcquisitionRecord, AcquisitionStatus, ProductCategory } from '../../types';
import { CATEGORIES } from '../../data/seedData';
import { api } from '../../services/api';

interface StaffAcquisitionManagementProps {
  acquisitions: AcquisitionRecord[];
  onRefresh: () => void;
  onStartInspection: (acquisition: AcquisitionRecord) => void;
}

export const StaffAcquisitionManagement: React.FC<StaffAcquisitionManagementProps> = ({
  acquisitions,
  onRefresh,
  onStartInspection,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // New Acquisition Form State
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [category, setCategory] = useState<ProductCategory>('カメラ');
  const [brand, setBrand] = useState('Fujifilm');
  const [model, setModel] = useState('X-T4 レンズキット ブラック');
  const [serialNumber, setSerialNumber] = useState('SN-FUJI-992140');
  const [purchasePrice, setPurchasePrice] = useState<string>('95000');
  const [initialConditionNotes, setInitialConditionNotes] = useState('ワンオーナー品。元箱、バッテリー、充電器付属。');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80');

  const filtered = acquisitions.filter((acq) => {
    if (selectedStatus !== 'all' && acq.status !== selectedStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        acq.id.toLowerCase().includes(q) ||
        acq.brand.toLowerCase().includes(q) ||
        acq.model.toLowerCase().includes(q) ||
        acq.customerName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCreateAcquisition = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.createAcquisition({
        customerName,
        customerEmail: customerEmail || 'customer@example.com',
        customerPhone: customerPhone || '090-0000-0000',
        category,
        brand,
        model,
        serialNumber,
        purchasePrice: Number(purchasePrice),
        initialConditionNotes,
        images: [imageUrl],
      });
      setIsModalOpen(false);
      onRefresh();
      // Reset form
      setCustomerName('');
      setPurchasePrice('95000');
    } catch (err: any) {
      alert('買取登録エラー: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdvanceStatus = async (id: string, newStatus: AcquisitionStatus) => {
    try {
      await api.updateAcquisitionStatus(id, newStatus);
      onRefresh();
    } catch (err: any) {
      alert('更新エラー: ' + err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Banner & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-0.5 rounded">
              スタッフ管理ポータル
            </span>
            <span className="text-xs text-slate-500 font-mono">ステップ 1/3</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <RefreshCw className="w-6 h-6 text-blue-600" />
            <span>買取・仕入管理（Acquisition）</span>
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            一般消費者からのお買取受付・現物受入・仕入原価（買取価格）の管理
          </p>
        </div>

        {/* New Acquisition Registration Button */}
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="h-11 px-5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-md transition cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>新規 買取受付を登録</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        {/* Status Pills */}
        <div className="flex flex-wrap items-center gap-1 text-xs">
          <span className="text-slate-400 text-[11px] mr-1">状態:</span>
          {[
            { id: 'all', label: 'すべて' },
            { id: '買取受付', label: '買取受付' },
            { id: '商品到着', label: '商品到着（検品待ち）' },
            { id: '検品中', label: '検品中' },
            { id: '査定完了', label: '査定完了' },
            { id: '在庫登録', label: '在庫登録済' },
            { id: '販売中', label: '販売中' },
          ].map((st) => (
            <button
              key={st.id}
              type="button"
              onClick={() => setSelectedStatus(st.id)}
              className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                selectedStatus === st.id
                  ? 'bg-blue-600 text-white font-bold shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="買取ID・品名・顧客名で検索..."
            className="w-full h-9 pl-9 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Acquisition Records Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <th className="py-3 px-4">買取管理ID</th>
                <th className="py-3 px-4">商品・カテゴリー</th>
                <th className="py-3 px-4">顧客名・受付日</th>
                <th className="py-3 px-4 text-right">買取成立価格 (原価)</th>
                <th className="py-3 px-4 text-center">ステータス</th>
                <th className="py-3 px-4 text-right">次工程アクション</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4">
                    <span className="font-mono font-bold text-slate-900 block">{item.id}</span>
                    <span className="text-[10px] text-slate-400">{item.serialNumber || 'シリアル未登録'}</span>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      {item.images && item.images[0] && (
                        <img
                          src={item.images[0]}
                          alt=""
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded-md object-cover border border-slate-200 shrink-0"
                        />
                      )}
                      <div>
                        <span className="text-[10px] text-blue-700 font-semibold bg-blue-50 px-1.5 py-0.5 rounded">
                          {item.category}
                        </span>
                        <h4 className="font-bold text-slate-900 mt-0.5">{item.brand} {item.model}</h4>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-medium text-slate-800 block">{item.customerName}</span>
                    <span className="text-[10px] text-slate-400">{item.acquiredAt.slice(0, 10)}</span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <span className="font-black text-slate-900 text-sm">
                      ¥{item.purchasePrice.toLocaleString()}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-bold ${
                        item.status === '販売中'
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.status === '商品到着'
                          ? 'bg-amber-100 text-amber-800'
                          : item.status === '検品中'
                          ? 'bg-blue-100 text-blue-800 animate-pulse'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    {item.status === '買取受付' && (
                      <button
                        type="button"
                        onClick={() => handleAdvanceStatus(item.id, '商品到着')}
                        className="px-3 py-1 bg-slate-800 hover:bg-slate-900 text-white rounded-md text-xs font-semibold cursor-pointer"
                      >
                        荷物受入（到着）
                      </button>
                    )}

                    {(item.status === '商品到着' || item.status === '検品中') && (
                      <button
                        type="button"
                        onClick={() => onStartInspection(item)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 ml-auto cursor-pointer shadow-xs"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>検品作業を開始</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}

                    {item.status === '査定完了' && (
                      <span className="text-emerald-700 font-semibold text-xs flex items-center justify-end gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>検品済・出品待</span>
                      </span>
                    )}

                    {(item.status === '在庫登録' || item.status === '販売中') && (
                      <span className="text-slate-400 text-xs">出品完了</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Acquisition Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">新規 買取受付登録</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-white/80 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAcquisition} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">売却希望のお客様名 *</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="例: 佐々木 拓也"
                    className="w-full h-8 px-2.5 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">カテゴリー *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ProductCategory)}
                    className="w-full h-8 px-2.5 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ブランド・メーカー *</label>
                  <input
                    type="text"
                    required
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full h-8 px-2.5 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">型番・品名 *</label>
                  <input
                    type="text"
                    required
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full h-8 px-2.5 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">シリアル番号</label>
                  <input
                    type="text"
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    className="w-full h-8 px-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">買取成立価格（仕入原価 円） *</label>
                  <input
                    type="number"
                    required
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(e.target.value)}
                    className="w-full h-8 px-2.5 bg-slate-50 border border-slate-200 rounded-lg font-bold text-emerald-700"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">受付時メモ・付属品状況</label>
                <textarea
                  rows={2}
                  value={initialConditionNotes}
                  onChange={(e) => setInitialConditionNotes(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg font-semibold"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold"
                >
                  {isSubmitting ? '登録中...' : '買取受付を完了'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
