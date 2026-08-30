import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Package,
  ArrowRight,
  UserCheck,
  Calendar,
  Layers,
  Sparkles,
  Camera,
} from 'lucide-react';
import {
  AcquisitionRecord,
  ConditionRank,
  InspectionRecord,
  CONDITION_DETAILS,
} from '../../types';
import { api } from '../../services/api';
import { ConditionBadge } from '../common/ConditionBadge';

interface StaffInspectionWorkspaceProps {
  selectedAcquisition: AcquisitionRecord | null;
  allAcquisitions: AcquisitionRecord[];
  onSelectAcquisition: (acq: AcquisitionRecord) => void;
  onInspectionComplete: (inspection: InspectionRecord, acquisition: AcquisitionRecord) => void;
}

const COMMON_ACCESSORIES = [
  '元箱',
  '取扱説明書',
  'バッテリー',
  'ACアダプター / 充電器',
  'USB-Cケーブル',
  'ストラップ',
  'レンズフロントキャップ',
  'レンズリアキャップ',
  'フード',
  '専用ケース',
];

export const StaffInspectionWorkspace: React.FC<StaffInspectionWorkspaceProps> = ({
  selectedAcquisition,
  allAcquisitions,
  onSelectAcquisition,
  onInspectionComplete,
}) => {
  // Pending acquisitions that need inspection
  const pendingAcquisitions = allAcquisitions.filter(
    (a) => a.status === '商品到着' || a.status === '検品中' || a.status === '買取受付'
  );

  const activeAcq = selectedAcquisition || pendingAcquisitions[0] || null;

  // Form State
  const [inspectorName, setInspectorName] = useState('佐藤 査定士 (一級リユース査定士)');
  const [rank, setRank] = useState<ConditionRank>('A');
  const [overallResult, setOverallResult] = useState<'pass' | 'conditional_pass' | 'fail'>('pass');
  const [selectedAccessories, setSelectedAccessories] = useState<string[]>([
    '元箱',
    '取扱説明書',
    'バッテリー',
    'ACアダプター / 充電器',
  ]);
  const [missingAccessories, setMissingAccessories] = useState<string[]>(['ストラップ']);
  const [defects, setDefects] = useState<string[]>(['底面にわずかなスレあり']);
  const [defectInput, setDefectInput] = useState('');
  const [inspectorNotes, setInspectorNotes] = useState(
    '外観は非常に良好。通電・連写・各種ボタン・センサー部テストすべてパス。バッテリー健全度も問題ありません。'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleToggleAccessory = (item: string) => {
    if (selectedAccessories.includes(item)) {
      setSelectedAccessories((prev) => prev.filter((i) => i !== item));
      if (!missingAccessories.includes(item)) {
        setMissingAccessories((prev) => [...prev, item]);
      }
    } else {
      setSelectedAccessories((prev) => [...prev, item]);
      setMissingAccessories((prev) => prev.filter((i) => i !== item));
    }
  };

  const handleAddDefect = () => {
    if (defectInput.trim() && !defects.includes(defectInput.trim())) {
      setDefects((prev) => [...prev, defectInput.trim()]);
      setDefectInput('');
    }
  };

  const handleRemoveDefect = (index: number) => {
    setDefects((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmitInspection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAcq) return;

    setIsSubmitting(true);
    try {
      const payload = {
        acquisitionId: activeAcq.id,
        inspectorName,
        conditionRank: rank,
        overallResult,
        cosmeticCheck: {
          scratches: rank === 'S' ? 'なし' : rank === 'A' ? '目立たない微細なスレ' : '小キズあり',
          dirt: 'クリーニング・除菌完了',
          dents: 'なし',
          discoloration: 'なし',
          damage: 'なし',
        },
        functionCheck: {
          powerOn: true,
          displayScreen: true,
          buttonsAndSwitches: true,
          batteryHealth: rank === 'S' || rank === 'A' ? '90%以上（良好）' : '80%〜89%（正常）',
          connectivityAndPorts: true,
          mainFunctions: true,
        },
        includedAccessories: selectedAccessories,
        missingAccessories,
        defects,
        inspectorNotes,
      };

      const savedInspection = await api.createInspection(payload);
      onInspectionComplete(savedInspection, activeAcq);
    } catch (err: any) {
      alert('検品データの保存に失敗しました: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!activeAcq) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 text-center bg-white rounded-xl border border-slate-200">
        <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800">現在、検品待ちの買取商品はありません</h3>
        <p className="text-xs text-slate-500 mt-1">
          「1. 買取管理」より新しい買取受付を登録してください。
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-0.5 rounded">
              スタッフ検品コンソール
            </span>
            <span className="text-xs text-slate-500 font-mono">ステップ 2/3</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-blue-600" />
            <span>商品精密検品 & 状態ランク判定（Inspection）</span>
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            20項目の動作・外観検査を実施し、客観的なS〜Dランク付与と欠品チェックを記録
          </p>
        </div>

        {/* Acquisition Selector Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-600">対象買取品:</span>
          <select
            value={activeAcq.id}
            onChange={(e) => {
              const found = allAcquisitions.find((a) => a.id === e.target.value);
              if (found) onSelectAcquisition(found);
            }}
            className="h-9 px-3 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:outline-hidden"
          >
            {allAcquisitions.map((acq) => (
              <option key={acq.id} value={acq.id}>
                {acq.id} - {acq.brand} {acq.model} ({acq.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Target Item Quick Summary Card */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {activeAcq.images && activeAcq.images[0] && (
            <img
              src={activeAcq.images[0]}
              alt=""
              referrerPolicy="no-referrer"
              className="w-16 h-16 rounded-xl object-cover border border-slate-700 shrink-0"
            />
          )}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-blue-500 text-slate-950 font-bold text-[10px] px-2 py-0.5 rounded">
                {activeAcq.category}
              </span>
              <span className="text-xs text-slate-400 font-mono">ID: {activeAcq.id}</span>
              {activeAcq.serialNumber && (
                <span className="text-xs text-slate-400 font-mono">SN: {activeAcq.serialNumber}</span>
              )}
            </div>
            <h3 className="text-base font-bold">{activeAcq.brand} {activeAcq.model}</h3>
            <p className="text-xs text-slate-300">
              売却顧客: {activeAcq.customerName} | 買取仕入原価: <strong className="text-emerald-400">¥{activeAcq.purchasePrice.toLocaleString()}</strong>
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[11px] text-slate-400 block">受付時のお客様コメント</span>
          <span className="text-xs text-slate-200 italic max-w-sm block">
            "{activeAcq.initialConditionNotes}"
          </span>
        </div>
      </div>

      {/* Inspection Form */}
      <form onSubmit={handleSubmitInspection} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Inspection Checks (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section 1: Condition Grading Selection */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              1. 状態ランク（Condition Rank）の格付け
            </h3>
            <p className="text-xs text-slate-500">
              外観および動作テスト結果を総合的に判断し、適切なランクを選択してください。
            </p>

            <div className="grid grid-cols-5 gap-2 pt-1">
              {(['S', 'A', 'B', 'C', 'D'] as ConditionRank[]).map((r) => {
                const info = CONDITION_DETAILS[r];
                const isSelected = rank === r;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRank(r)}
                    className={`p-3 rounded-xl border text-center transition cursor-pointer flex flex-col items-center justify-between ${
                      isSelected
                        ? `${info.badgeBg} ${info.badgeBorder} ring-2 ring-emerald-500 shadow-xs`
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span className={`font-mono font-black text-base ${isSelected ? info.badgeText : 'text-slate-700'}`}>
                      ランク{r}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-700 mt-1 block">
                      {info.label}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-600 mt-2">
              <strong>選択中 ランク{rank}基準: </strong>
              {CONDITION_DETAILS[rank]?.description}
            </div>
          </div>

          {/* Section 2: Exterior & Functional Checklist */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">2. 動作・機能テスト検証項目</h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              {[
                { label: '電源投入・起動', pass: true },
                { label: '主要操作部・ボタン・ダイヤル', pass: true },
                { label: '液晶モニター・ビューファインダー', pass: true },
                { label: 'バッテリー充電・端子接続', pass: true },
                { label: 'ワイヤレス通信 (Wi-Fi / Bluetooth)', pass: true },
                { label: 'センサー部・レンズマウント', pass: true },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="font-medium text-slate-800">{item.label}</span>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> 合格
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Accessories Checklist */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Package className="w-4 h-4 text-blue-600" />
              3. 付属品・欠品チェック
            </h3>
            <p className="text-xs text-slate-500">
              付属するアイテムをクリックして選択してください（未選択の項目は自動的に欠品として記録されます）。
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              {COMMON_ACCESSORIES.map((acc) => {
                const isChecked = selectedAccessories.includes(acc);
                return (
                  <button
                    key={acc}
                    type="button"
                    onClick={() => handleToggleAccessory(acc)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer flex items-center gap-1.5 ${
                      isChecked
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs'
                        : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <CheckCircle2 className={`w-3.5 h-3.5 ${isChecked ? 'text-emerald-600' : 'text-slate-300'}`} />
                    <span>{acc}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Defects, Inspector Comments & Submit (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Defects Management */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              4. キズ・特記事項（透明開示用）
            </h3>

            <div className="flex gap-2">
              <input
                type="text"
                value={defectInput}
                onChange={(e) => setDefectInput(e.target.value)}
                placeholder="例: グリップ部分に軽度のテカリあり"
                className="flex-1 h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
              <button
                type="button"
                onClick={handleAddDefect}
                className="px-3 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition"
              >
                追加
              </button>
            </div>

            <div className="space-y-1.5 pt-1">
              {defects.map((def, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-amber-50 text-amber-900 rounded-lg border border-amber-200 text-xs">
                  <span>{def}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveDefect(idx)}
                    className="text-amber-700 hover:text-rose-600 font-bold ml-2"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Inspector Notes & Certificate */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">5. 査定士コメント & 最終判定</h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">検品担当者名</label>
              <input
                type="text"
                value={inspectorName}
                onChange={(e) => setInspectorName(e.target.value)}
                className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">専門検品員コメント（出品時のベースとなります）</label>
              <textarea
                rows={3}
                value={inspectorNotes}
                onChange={(e) => setInspectorNotes(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs leading-relaxed"
              />
            </div>

            {/* Submit & Proceed to Step 3 */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 text-sm cursor-pointer disabled:opacity-50"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>検品を確定し、出品・価格設定へ進む</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
