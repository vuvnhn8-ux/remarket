import React, { useState } from 'react';
import {
  Sparkles,
  Tag,
  Box,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  Package,
  Layers,
  ArrowRight,
  Loader2,
  Building,
} from 'lucide-react';
import {
  AcquisitionRecord,
  InspectionRecord,
  ConditionRank,
  ProductItem,
} from '../../types';
import { api } from '../../services/api';
import { ConditionBadge } from '../common/ConditionBadge';

interface StaffListingCreatorProps {
  currentAcquisition: AcquisitionRecord | null;
  currentInspection: InspectionRecord | null;
  onListingPublished: (product: ProductItem) => void;
}

export const StaffListingCreator: React.FC<StaffListingCreatorProps> = ({
  currentAcquisition,
  currentInspection,
  onListingPublished,
}) => {
  // If no current item passed, fallback to default or prompt
  const acq = currentAcquisition || {
    id: 'ACQ-2026-0003',
    customerName: '佐藤 美咲',
    customerEmail: 'sato@example.com',
    customerPhone: '080-9876-5432',
    category: 'カメラ',
    brand: 'Fujifilm',
    model: 'X-T4 レンズキット ブラック',
    serialNumber: 'SN-FUJI-992140',
    purchasePrice: 95000,
    acquiredAt: new Date().toISOString(),
    status: '査定完了',
    initialConditionNotes: 'ワンオーナー品。動作良好。',
    images: ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80'],
  };

  const insp = currentInspection || {
    id: 'INSP-2026-0003',
    acquisitionId: acq.id,
    inspectorName: '佐藤 査定士',
    inspectedAt: new Date().toISOString(),
    conditionRank: 'A' as ConditionRank,
    overallResult: 'pass' as const,
    cosmeticCheck: {
      scratches: '小キズあり',
      dirt: '除菌清掃済',
      dents: 'なし',
      discoloration: 'なし',
      damage: 'なし',
    },
    functionCheck: {
      powerOn: true,
      displayScreen: true,
      buttonsAndSwitches: true,
      batteryHealth: '92%（良好）',
      connectivityAndPorts: true,
      mainFunctions: true,
    },
    includedAccessories: ['元箱', 'バッテリー', 'ACアダプター / 充電器', 'ストラップ'],
    missingAccessories: ['取扱説明書'],
    defects: ['底面にわずかなスレあり'],
    inspectorNotes: '外観は非常に良好。通電・連写・各種ボタン・センサー部テストすべてパス。',
  };

  // Form State
  const [sellingPrice, setSellingPrice] = useState<string>('138000');
  const [title, setTitle] = useState<string>(
    `【${insp.conditionRank}ランク・動作確認済】${acq.brand} ${acq.model} 付属品完備 3ヶ月安心保証付き`
  );
  const [description, setDescription] = useState<string>(
    `${acq.brand}の人気モデル「${acq.model}」の中古品です。専門査定士による徹底した20項目の動作検証および除菌クリーニングを実施しており、安心してお使いいただけます。初期不良14日間無料返品対応、3ヶ月の自然故障動作保証付きです。`
  );
  const [cosmeticNote, setCosmeticNote] = useState<string>(
    insp.defects.length > 0 ? `特記事項: ${insp.defects.join('、')}` : '目立つキズはなく綺麗な状態です。'
  );
  const [functionalNote, setFunctionalNote] = useState<string>(
    '電源投入、基本動作、主要機能、各種端子すべてテスト済み・完全動作品です。'
  );
  const [keywords, setKeywords] = useState<string[]>([
    acq.brand,
    acq.model,
    acq.category,
    `ランク${insp.conditionRank}`,
    '中古',
    '動作保証',
  ]);
  const [warehouseLocation, setWarehouseLocation] = useState<string>('東京第1リユースセンター A-03-05');

  const [isAiGenerating, setIsAiGenerating] = useState<boolean>(false);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Gross profit & margin calculations
  const priceNum = Number(sellingPrice) || 0;
  const costNum = acq.purchasePrice || 0;
  const grossProfit = priceNum - costNum;
  const grossMargin = priceNum > 0 ? ((grossProfit / priceNum) * 100).toFixed(1) : '0.0';

  const handleAiGenerateListing = async () => {
    setIsAiGenerating(true);
    try {
      const generated = await api.generateListing({
        brand: acq.brand,
        model: acq.model,
        category: acq.category,
        rank: insp.conditionRank,
        defects: insp.defects,
        accessories: insp.includedAccessories,
        missingAccessories: insp.missingAccessories,
        inspectorNotes: insp.inspectorNotes,
      });

      if (generated.title) setTitle(generated.title);
      if (generated.description) setDescription(generated.description);
      if (generated.cosmeticNote) setCosmeticNote(generated.cosmeticNote);
      if (generated.functionalNote) setFunctionalNote(generated.functionalNote);
      if (generated.keywords) setKeywords(generated.keywords);
    } catch (err: any) {
      alert('AI生成エラー: ' + err.message);
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handlePublishListing = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPublishing(true);
    try {
      const result = await api.registerInventory({
        acquisitionId: acq.id,
        inspectionId: insp.id,
        sellingPrice: priceNum,
        warehouseLocation,
      });

      setSuccessMessage(`商品「${result.product.name}」をECサイトに正常に出品・在庫公開しました！`);
      setTimeout(() => {
        onListingPublished(result.product);
      }, 1200);
    } catch (err: any) {
      alert('出品エラー: ' + err.message);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-0.5 rounded">
              スタッフ出品ポータル
            </span>
            <span className="text-xs text-slate-500 font-mono">ステップ 3/3</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Tag className="w-6 h-6 text-blue-600" />
            <span>出品準備 & AI出品文生成（Listing & Pricing）</span>
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Gemini AIによる商品説明・SEO生成と、粗利・在庫ロケーション管理
          </p>
        </div>

        {/* AI Listing Assistant Button */}
        <button
          type="button"
          onClick={handleAiGenerateListing}
          disabled={isAiGenerating}
          className="h-11 px-5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-md transition cursor-pointer disabled:opacity-50 shrink-0"
        >
          {isAiGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>AI出品文を自動生成中...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>AIで出品文・タイトルを自動生成</span>
            </>
          )}
        </button>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-600 text-white rounded-xl font-bold text-xs text-center shadow-md animate-fade-in flex items-center justify-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Pricing & Gross Margin Real-time Calculator Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-700">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-emerald-400" />
          <h3 className="font-bold text-sm text-slate-100">中古ビジネス 粗利・価格シミュレーター</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {/* Purchase Cost */}
          <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700">
            <span className="text-[11px] text-slate-400 block">仕入原価（買取価格）</span>
            <span className="text-xl font-black text-slate-200">
              ¥{costNum.toLocaleString()}
            </span>
          </div>

          {/* Selling Price Input */}
          <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700">
            <label className="text-[11px] text-slate-400 block mb-1">中古販売設定価格 (税込)</label>
            <div className="flex items-center gap-1">
              <span className="text-emerald-400 font-bold">¥</span>
              <input
                type="number"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1 text-sm font-bold text-white focus:outline-hidden focus:border-emerald-400"
              />
            </div>
          </div>

          {/* Gross Profit */}
          <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700">
            <span className="text-[11px] text-slate-400 block">想定 粗利益額</span>
            <span className={`text-xl font-black ${grossProfit > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              ¥{grossProfit.toLocaleString()}
            </span>
          </div>

          {/* Gross Margin % */}
          <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700">
            <span className="text-[11px] text-slate-400 block">想定 粗利率 (Target: ~30%)</span>
            <div className="flex items-baseline gap-1">
              <span className={`text-2xl font-black ${Number(grossMargin) >= 25 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {grossMargin}%
              </span>
              <span className="text-[10px] text-slate-400">
                {Number(grossMargin) >= 25 ? '健全水準' : '要確認'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Listing Preparation Form */}
      <form onSubmit={handlePublishListing} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Listing Details & Descriptions (8 cols) */}
        <div className="lg:col-span-8 space-y-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-800">
                EC商品タイトル（AI最適化） *
              </label>
              <span className="text-[11px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded font-medium">
                AI支援
              </span>
            </div>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-800">
                商品説明文（安心ポイント・用途提案） *
              </label>
              <span className="text-[11px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded font-medium">
                AI支援
              </span>
            </div>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 leading-relaxed focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">外観・状態説明文</label>
              <textarea
                rows={2}
                value={cosmeticNote}
                onChange={(e) => setCosmeticNote(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">動作確認・保証説明文</label>
              <textarea
                rows={2}
                value={functionalNote}
                onChange={(e) => setFunctionalNote(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>
          </div>

          {/* Search Keywords */}
          <div>
            <label className="text-xs font-bold text-slate-800 block mb-1.5">
              検索用キーワード・タグ (SEO)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {keywords.map((kw, i) => (
                <span
                  key={i}
                  className="bg-slate-100 text-slate-700 text-[11px] font-medium px-2.5 py-1 rounded-md border border-slate-200 flex items-center gap-1"
                >
                  <span>#{kw}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Warehouse & Publication (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Building className="w-4 h-4 text-slate-700" />
              倉庫・個別在庫ロケーション
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">保管倉庫・棚番号</label>
              <select
                value={warehouseLocation}
                onChange={(e) => setWarehouseLocation(e.target.value)}
                className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-hidden"
              >
                <option value="東京第1リユースセンター A-03-05">東京第1リユースセンター A-03-05</option>
                <option value="東京第1リユースセンター B-02-12">東京第1リユースセンター B-02-12</option>
                <option value="横浜リユースセンター A-01-08">横浜リユースセンター A-01-08</option>
                <option value="大阪リユースセンター C-04-01">大阪リユースセンター C-04-01</option>
              </select>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
              <div className="flex justify-between">
                <span>状態ランク:</span>
                <span className="font-bold text-slate-900">ランク{insp.conditionRank}</span>
              </div>
              <div className="flex justify-between">
                <span>シリアル番号:</span>
                <span className="font-mono text-slate-900">{acq.serialNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>付属品点数:</span>
                <span className="font-semibold text-slate-900">{insp.includedAccessories.length}点</span>
              </div>
            </div>

            {/* Final Publish Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isPublishing}
                className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 text-sm cursor-pointer disabled:opacity-50"
              >
                {isPublishing ? (
                  <span>在庫登録・EC公開中...</span>
                ) : (
                  <>
                    <Box className="w-4 h-4" />
                    <span>ECサイトに出品・在庫公開</span>
                  </>
                )}
              </button>
              <p className="text-[11px] text-center text-slate-500 mt-2">
                ※出品すると、お客様向けECサイトで即時購入可能な状態になります。
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
