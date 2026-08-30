import React from 'react';
import {
  TrendingUp,
  RefreshCw,
  Tag,
  ShoppingBag,
  DollarSign,
  Clock,
  ShieldCheck,
  AlertTriangle,
  ArrowUpRight,
  Package,
  Layers,
  Sparkles,
} from 'lucide-react';
import { BusinessKPIs } from '../../types';

interface AdminDashboardProps {
  kpis: BusinessKPIs;
  onNavigateAiInsights: () => void;
  onNavigateInventory: () => void;
  onNavigateOrders: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  kpis,
  onNavigateAiInsights,
  onNavigateInventory,
  onNavigateOrders,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-white/90 backdrop-blur-xs p-6 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Management Portal
            </span>
            <span className="text-xs text-slate-500 font-mono">Real-time Used Goods Engine</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-purple-600" />
            <span>リユース事業KPI・在庫回転ダッシュボード</span>
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            「Consumer → Re:Market → Consumer」循環型モデルの売上・粗利・在庫回転日数をリアルタイム集計
          </p>
        </div>

        {/* AI Sales Advisor Trigger */}
        <button
          type="button"
          onClick={onNavigateAiInsights}
          className="h-11 px-5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-2xl text-xs flex items-center gap-2 shadow-md transition cursor-pointer shrink-0"
        >
          <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
          <span>AI経営・在庫分析アシスタントに相談</span>
        </button>
      </div>

      {/* Top KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Monthly Revenue */}
        <div className="card-elevated p-5 rounded-3xl">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-semibold">当月 売上高</span>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xs font-bold text-slate-500">¥</span>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {kpis.revenueThisMonth.toLocaleString()}
            </span>
          </div>
          <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-0.5 mt-2">
            <ArrowUpRight className="w-3.5 h-3.5" />
            前月比 +18.4%（好調）
          </span>
        </div>

        {/* Monthly Gross Profit & Margin */}
        <div className="card-elevated p-5 rounded-3xl">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-semibold">当月 粗利益額（粗利率）</span>
            <span className="p-2 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-1">
              <span className="text-xs font-bold text-slate-500">¥</span>
              <span className="text-2xl sm:text-3xl font-black text-purple-700 tracking-tight">
                {kpis.grossProfitThisMonth.toLocaleString()}
              </span>
            </div>
            <span className="text-base font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
              {kpis.averageGrossMargin}%
            </span>
          </div>
          <span className="text-[11px] text-slate-500 mt-2 block">
            目標粗利率 (30%) を達成中
          </span>
        </div>

        {/* Current Inventory Asset Value */}
        <div
          onClick={onNavigateInventory}
          className="card-elevated p-5 rounded-3xl hover:border-purple-500/80 transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-semibold">出品中 在庫総額 (点数)</span>
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <Package className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-1">
              <span className="text-xs font-bold text-slate-500">¥</span>
              <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {kpis.totalInventoryValue.toLocaleString()}
              </span>
            </div>
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200">
              {kpis.listedCount} 点
            </span>
          </div>
          <span className="text-[11px] text-slate-500 mt-2 block">
            平均仕入原価: ¥{(kpis.totalAcquisitionCost / Math.max(kpis.acquiredCountThisMonth, 1)).toFixed(0).toLocaleString()}
          </span>
        </div>

        {/* Inventory Velocity (Days to sell) */}
        <div className="card-elevated p-5 rounded-3xl">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-semibold">平均在庫回転期間</span>
            <span className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {kpis.averageDaysToSell}
            </span>
            <span className="text-xs font-bold text-slate-500">日 (出品〜売却完了)</span>
          </div>
          <span className="text-[11px] text-emerald-700 font-semibold mt-2 block">
            客単価: ¥{kpis.averageOrderValue.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Used Goods Resale Value Chain Funnel */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-7 shadow-lg border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-emerald-400" />
              <span>リユース・一貫バリューチェーン転換ファネル</span>
            </h3>
            <p className="text-xs text-slate-400">
              一般消費者からの買取から、検品、出品、売却までの各工程数量と通過率
            </p>
          </div>
          <span className="text-xs text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-700/60 font-mono">
            検品合格率: {kpis.inspectionPassRate}%
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {/* Step 1 */}
          <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Step 1: 買取受付</span>
            <span className="text-2xl font-black text-white block mt-1">
              {kpis.funnel.acquisitions} <span className="text-xs font-normal text-slate-400">件</span>
            </span>
            <span className="text-[11px] text-slate-400 mt-2 block">仕入原価総額 ¥{kpis.totalAcquisitionCost.toLocaleString()}</span>
          </div>

          {/* Step 2 */}
          <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
            <span className="text-[10px] text-blue-400 uppercase font-mono block">Step 2: 動作検品完了</span>
            <span className="text-2xl font-black text-white block mt-1">
              {kpis.funnel.inspected} <span className="text-xs font-normal text-slate-400">件</span>
            </span>
            <span className="text-[11px] text-blue-300 mt-2 block">検品通過率 96.2%</span>
          </div>

          {/* Step 3 */}
          <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
            <span className="text-[10px] text-purple-400 uppercase font-mono block">Step 3: ECサイト出品中</span>
            <span className="text-2xl font-black text-white block mt-1">
              {kpis.funnel.listed} <span className="text-xs font-normal text-slate-400">点</span>
            </span>
            <span className="text-[11px] text-purple-300 mt-2 block">AI出品文最適化済</span>
          </div>

          {/* Step 4 */}
          <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
            <span className="text-[10px] text-emerald-400 uppercase font-mono block">Step 4: 顧客売却完了</span>
            <span className="text-2xl font-black text-emerald-400 block mt-1">
              {kpis.funnel.sold} <span className="text-xs font-normal text-slate-400">点</span>
            </span>
            <span className="text-[11px] text-emerald-300 mt-2 block">総売上 ¥{kpis.revenueThisMonth.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Category Performance Breakdown Table */}
      <div className="bg-white/95 backdrop-blur-xs rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">カテゴリー別 収益性 & 粗利実績</h3>
            <p className="text-xs text-slate-500">主力ジャンルの販売高と粗利率の比較</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold">
                <th className="py-3 px-4 rounded-l-xl">カテゴリー</th>
                <th className="py-3 px-4 text-center">出品中在庫数</th>
                <th className="py-3 px-4 text-center">売却済点数</th>
                <th className="py-3 px-4 text-right">売上高</th>
                <th className="py-3 px-4 text-right">粗利益額</th>
                <th className="py-3 px-4 text-right rounded-r-xl">粗利率 %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {kpis.categoryStats.map((cat) => (
                <tr key={cat.category} className="hover:bg-slate-50/70 transition">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{cat.category}</td>
                  <td className="py-3.5 px-4 text-center font-medium text-slate-700">{cat.inStock} 点</td>
                  <td className="py-3.5 px-4 text-center font-medium text-emerald-700">{cat.soldCount} 点</td>
                  <td className="py-3.5 px-4 text-right font-semibold text-slate-900">¥{cat.revenue.toLocaleString()}</td>
                  <td className="py-3.5 px-4 text-right font-bold text-purple-700">¥{cat.grossProfit.toLocaleString()}</td>
                  <td className="py-3.5 px-4 text-right">
                    <span className={`font-black px-2.5 py-0.5 rounded-lg text-xs ${
                      cat.grossMargin >= 30 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}>
                      {cat.grossMargin}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
