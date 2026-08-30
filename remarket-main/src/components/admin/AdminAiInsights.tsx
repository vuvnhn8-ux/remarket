import React, { useState } from 'react';
import {
  Sparkles,
  TrendingUp,
  BrainCircuit,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Database,
  Lightbulb,
  ArrowRight,
} from 'lucide-react';
import { BusinessKPIs } from '../../types';
import { api } from '../../services/api';

interface AdminAiInsightsProps {
  kpis: BusinessKPIs;
}

interface InsightsResult {
  question: string;
  databaseFacts: string[];
  analysis: string;
  actionableRecommendations: string[];
}

export const AdminAiInsights: React.FC<AdminAiInsightsProps> = ({ kpis }) => {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<InsightsResult[]>([
    {
      question: '今月の売上・粗利率の概況と、在庫回転を高めるためのアドバイス',
      databaseFacts: [
        `当月売上高: ¥${kpis.revenueThisMonth.toLocaleString()}（平均粗利率: ${kpis.averageGrossMargin}%）`,
        `在庫回転状況: 出品中 ${kpis.listedCount}点 / 売却済 ${kpis.soldCount}点（平均販売日数: ${kpis.averageDaysToSell}日）`,
        `買取査定通過率: ${kpis.inspectionPassRate}%（当月買取件数: ${kpis.acquiredCountThisMonth}点）`,
      ],
      analysis:
        'カメラおよびパソコンカテゴリーが30%超の健全な粗利率を維持して収益の柱となっています。一方、滞留日数が14日を超える一部の家電・オーディオ在庫において回転率の向上が課題です。',
      actionableRecommendations: [
        '滞留14日以上の在庫に対する5〜8%のタイムセール価格見直し（早期の現金化とキャッシュフロー改善）',
        '高粗利が見込める「ミラーレス一眼ボディ」「MacBook M2/M3モデル」の買取査定10%UPキャンペーンの実施',
        'Sランク・Aランク美品に特化した特集ページの展開による客単価の引き上げ',
      ],
    },
  ]);

  const presetQuestions = [
    '今月売れ行きが悪いカテゴリーと改善策は？',
    '粗利率を最大化するための価格設定・仕入アドバイス',
    '在庫回転率（平均滞留日数）を高めるための施策は？',
    'カメラ・PCジャンルの買取強化戦略',
  ];

  const handleAsk = async (qText?: string) => {
    const text = qText || question;
    if (!text.trim() || loading) return;

    setLoading(true);
    try {
      const res = await api.askSalesInsights(text);
      setHistory((prev) => [
        {
          question: text,
          databaseFacts: res.databaseFacts,
          analysis: res.analysis,
          actionableRecommendations: res.actionableRecommendations,
        },
        ...prev,
      ]);
      setQuestion('');
    } catch (err: any) {
      alert('AI経営分析エラー: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-purple-100 text-purple-800 text-xs font-bold px-2.5 py-0.5 rounded">
              AI経営・在庫分析アシスタント
            </span>
            <span className="text-xs text-slate-500 font-mono">Gemini Flash AI #3</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <BrainCircuit className="w-6 h-6 text-purple-600" />
            <span>リユース戦略・販売分析コンサルタント</span>
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            リアルタイムのデータベース実績（売上・粗利・滞留日数）に基づき、論理的な改善施策を提示
          </p>
        </div>
      </div>

      {/* Query Input Box */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 text-white p-6 rounded-2xl shadow-lg border border-purple-800/40 space-y-4">
        <div className="flex items-center gap-2 text-purple-300 text-xs font-bold">
          <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
          <span>経営・仕入・価格設定に関する質問を入力してください</span>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk();
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="例: 在庫回転日数を短縮しつつ粗利率30%をキープするための改善案は？"
            className="flex-1 h-12 px-4 bg-slate-900/90 border border-purple-700/60 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-purple-400"
          />
          <button
            type="submit"
            disabled={loading || !question.trim()}
            className="h-12 px-6 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition cursor-pointer shadow-md"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span>分析実行</span>
          </button>
        </form>

        {/* Presets */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-slate-400 text-[11px]">クイック分析テーマ:</span>
          {presetQuestions.map((pq, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleAsk(pq)}
              className="px-3 py-1 bg-purple-900/40 hover:bg-purple-800/60 text-purple-200 border border-purple-700/50 rounded-lg text-[11px] font-medium transition cursor-pointer"
            >
              {pq}
            </button>
          ))}
        </div>
      </div>

      {/* Analysis Results Stream */}
      <div className="space-y-6">
        {history.map((item, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-5"
          >
            {/* Question Bar */}
            <div className="flex items-center gap-2 text-sm font-black text-purple-950 pb-3 border-b border-slate-100">
              <BrainCircuit className="w-5 h-5 text-purple-600 shrink-0" />
              <span>質問: {item.question}</span>
            </div>

            {/* 3 Structured Columns / Blocks */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Block 1: Database Facts */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 pb-1 border-b border-slate-200">
                  <Database className="w-4 h-4 text-blue-600" />
                  <span>1. データベース実績数値 (DB Facts)</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-700 pt-1">
                  {item.databaseFacts.map((fact, i) => (
                    <li key={i} className="flex items-start gap-1.5 leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0 mt-1.5" />
                      <span>{fact}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Block 2: Cause & Factor Analysis */}
              <div className="bg-purple-50/50 p-4 rounded-xl border border-purple-200/60 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-purple-950 pb-1 border-b border-purple-200">
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                  <span>2. 要因分析・現状評価 (Analysis)</span>
                </div>
                <p className="text-xs text-purple-900 leading-relaxed pt-1">
                  {item.analysis}
                </p>
              </div>

              {/* Block 3: Actionable Strategic Recommendations */}
              <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-200/60 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-950 pb-1 border-b border-emerald-200">
                  <Lightbulb className="w-4 h-4 text-emerald-600" />
                  <span>3. 改善アクションプラン (Recommendations)</span>
                </div>
                <ul className="space-y-2 text-xs text-emerald-900 pt-1">
                  {item.actionableRecommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-1.5 leading-relaxed">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
