/**
 * Re:Market - Live Simulation & Automation Control Center
 * Displays real-time pipeline jobs, background workers, AI providers,
 * multi-channel synchronization, and streaming activity logs.
 */

import React, { useState } from 'react';
import {
  Activity,
  Cpu,
  Server,
  Layers,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Play,
  RotateCcw,
  Sliders,
  X,
  ExternalLink,
  ShieldCheck,
  Zap,
  Globe,
  Radio,
} from 'lucide-react';
import { useSimulation } from '../../context/SimulationContext';
import { useLanguage } from '../../context/LanguageContext';

export const SimulationLiveMonitor: React.FC = () => {
  const {
    isSimulationMode,
    toggleSimulationMode,
    jobs,
    workers,
    channels,
    aiProviders,
    activityLogs,
    metrics,
    isLiveMonitorOpen,
    setIsLiveMonitorOpen,
    retryJob,
  } = useSimulation();

  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'pipeline' | 'workers' | 'channels' | 'ai' | 'logs'>('pipeline');

  if (!isLiveMonitorOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-slate-950 text-slate-100 border border-slate-800 rounded-2xl w-full max-w-5xl h-[88vh] max-h-[820px] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Top Header */}
        <div className="px-6 py-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  {language === 'ja' ? 'ライブ自動化・シミュレーション監視センター' : 'Live Automation & Simulation Monitor'}
                </h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  {isSimulationMode ? 'Simulation LIVE' : 'Real Mode'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {language === 'ja'
                  ? 'AI検品・画像解析・相場価格・他モール出品自動化のリアルタイム稼働状況'
                  : 'Real-time multi-stage inspection, AI vision grading, dynamic valuation & multi-channel sync'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Simulation Switch */}
            <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
              <span className="text-xs font-medium text-slate-300">
                {language === 'ja' ? 'シミュレーションモード' : 'Simulation Mode'}
              </span>
              <button
                type="button"
                onClick={toggleSimulationMode}
                className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  isSimulationMode ? 'bg-emerald-500' : 'bg-slate-600'
                }`}
                title="Toggle Simulation Mode"
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    isSimulationMode ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsLiveMonitorOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live KPI Quick Metrics Strip */}
        <div className="px-6 py-2.5 bg-slate-900/40 border-b border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">
              {language === 'ja' ? '実行中ジョブ:' : 'Active Jobs:'}
            </span>
            <span className="font-bold text-emerald-400">{metrics.activeJobsCount} 件</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">
              {language === 'ja' ? '累計処理数:' : 'Total Processed:'}
            </span>
            <span className="font-bold text-slate-200">{metrics.totalJobsProcessed.toLocaleString()} 件</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">
              {language === 'ja' ? 'AI判定精度:' : 'AI Accuracy:'}
            </span>
            <span className="font-bold text-purple-400">{metrics.aiGradingAccuracy}%</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">
              {language === 'ja' ? 'オンライン閲覧者:' : 'Live Shoppers:'}
            </span>
            <span className="font-bold text-blue-400">{metrics.liveActiveUsers} 名</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 border-b border-slate-800 bg-slate-900/20 flex gap-4 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('pipeline')}
            className={`py-3 border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'pipeline'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>{language === 'ja' ? '自動化パイプライン (Jobs)' : 'Automation Pipeline'}</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] text-slate-300">
              {jobs.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('workers')}
            className={`py-3 border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'workers'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>{language === 'ja' ? 'バックグラウンドワーカー' : 'Background Workers'}</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] text-slate-300">
              {workers.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('channels')}
            className={`py-3 border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'channels'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>{language === 'ja' ? '販売チャネル連携' : 'Channels Sync'}</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] text-slate-300">
              {channels.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ai')}
            className={`py-3 border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'ai'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>{language === 'ja' ? 'AIモデル稼働状況' : 'AI Models & APIs'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('logs')}
            className={`py-3 border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'logs'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>{language === 'ja' ? 'リアルタイムログ' : 'Live Activity Stream'}</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* TAB 1: PIPELINE JOBS */}
          {activeTab === 'pipeline' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>
                  {language === 'ja'
                    ? '多段階パイプライン（OCR受付 → 画像検品 → 20項目診断 → 相場査定 → 出品文生成 → マルチチャネル公開）'
                    : 'Multi-stage live workflow: Intake OCR → AI Vision → Diagnostic → Valuation → Listing Gen → Channel Sync'}
                </span>
                <span className="text-emerald-400 font-mono text-[11px]">
                  ● Live Progression Tick (2.5s)
                </span>
              </div>

              <div className="space-y-3">
                {jobs.map((job) => (
                  <div
                    key={job.id}
                    className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-slate-500 font-bold">
                            {job.id}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px] font-medium">
                            {job.category} ({job.brand})
                          </span>
                          <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 text-[11px] border border-indigo-800 font-medium">
                            Channel: {job.channel}
                          </span>
                        </div>
                        <h4 className="font-bold text-white text-sm mt-1">{job.title}</h4>
                      </div>

                      <div className="flex items-center gap-2">
                        {job.status === 'processing' && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1.5">
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>{job.stage} ({job.progress}%)</span>
                          </span>
                        )}
                        {job.status === 'completed' && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-950 text-blue-300 border border-blue-800 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Completed & Published</span>
                          </span>
                        )}
                        {job.status === 'failed' && (
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-950 text-rose-300 border border-rose-800 flex items-center gap-1.5">
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>Needs Attention</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => retryJob(job.id)}
                              className="px-2.5 py-1 rounded-lg bg-rose-800 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Retry</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden mb-3">
                      <div
                        className={`h-full transition-all duration-500 ${
                          job.status === 'failed'
                            ? 'bg-rose-500'
                            : job.status === 'completed'
                            ? 'bg-blue-500'
                            : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                        }`}
                        style={{ width: `${job.progress}%` }}
                      />
                    </div>

                    {/* Error Notice */}
                    {job.error && (
                      <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs mb-2">
                        {job.error}
                      </div>
                    )}

                    {/* Recent Job Step Log */}
                    <div className="text-[11px] font-mono text-slate-400 bg-slate-950/70 p-2 rounded-lg border border-slate-800/60">
                      {job.logs[0] || 'Awaiting stage initialization...'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: BACKGROUND WORKERS */}
          {activeTab === 'workers' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {workers.map((worker) => (
                <div
                  key={worker.id}
                  className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="font-bold text-white text-sm">{worker.name}</span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                        {worker.id}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 mb-1">{worker.role}</p>
                    <p className="text-[11px] text-slate-500 mb-4">{worker.location}</p>

                    {/* CPU & Memory Gauges */}
                    <div className="space-y-3 mb-4">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-400 flex items-center gap-1">
                            <Cpu className="w-3.5 h-3.5 text-slate-500" /> CPU Load
                          </span>
                          <span className="font-mono text-slate-200">{worker.cpuUsage}%</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-emerald-400 h-full transition-all duration-300"
                            style={{ width: `${worker.cpuUsage}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-400 flex items-center gap-1">
                            <Server className="w-3.5 h-3.5 text-slate-500" /> Memory Buffer
                          </span>
                          <span className="font-mono text-slate-200">{worker.memoryUsage}%</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-purple-400 h-full transition-all duration-300"
                            style={{ width: `${worker.memoryUsage}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 text-xs">
                      <span className="text-slate-500 text-[10px] block mb-0.5">Current Task:</span>
                      <span className="font-medium text-emerald-300 truncate block">
                        {worker.activeJobTitle || 'Idle - Listening to pipeline'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-800 mt-4 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Processed: {worker.processedCount} units</span>
                    <span className="text-emerald-400 font-medium">Heartbeat: {worker.lastHeartbeat}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: CHANNELS */}
          {activeTab === 'channels' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {channels.map((channel) => (
                <div
                  key={channel.id}
                  className="p-5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-white text-sm">{channel.name}</h4>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
                      {channel.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="text-slate-500 block mb-1">Active Synced Items</span>
                      <span className="text-base font-bold text-white font-mono">
                        {channel.activeListings} 件
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="text-slate-500 block mb-1">Today's Sales Volume</span>
                      <span className="text-base font-bold text-emerald-400 font-mono">
                        ¥{channel.dailyRevenue.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>Platform: {channel.platform}</span>
                    <span>Last Sync: {channel.lastSync}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: AI MODELS */}
          {activeTab === 'ai' && (
            <div className="space-y-3">
              {aiProviders.map((provider) => (
                <div
                  key={provider.id}
                  className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      <h4 className="font-bold text-white text-sm">{provider.name}</h4>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                        {provider.model}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{provider.purpose}</p>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Latency</span>
                      <span className="text-emerald-400 font-bold">{provider.latencyMs}ms</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Success</span>
                      <span className="text-purple-300 font-bold">{provider.successRate}%</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Requests</span>
                      <span className="text-slate-200 font-bold">
                        {provider.requestsProcessed.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 5: LOGS */}
          {activeTab === 'logs' && (
            <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 font-mono text-xs space-y-2 h-[450px] overflow-y-auto">
              <div className="text-slate-500 text-[11px] pb-2 border-b border-slate-800 flex justify-between">
                <span>[STREAMING EVENT BUFFER]</span>
                <span className="text-emerald-400">Listening to events...</span>
              </div>
              {activityLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-2 py-1 leading-relaxed">
                  <span className="text-slate-600 shrink-0">[{log.timeFormatted}]</span>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[10px] font-bold uppercase shrink-0 ${
                      log.category === 'AI Pipeline'
                        ? 'bg-purple-950 text-purple-300 border border-purple-800'
                        : log.category === 'Order'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : log.category === 'Trade-in'
                        ? 'bg-blue-950 text-blue-300 border border-blue-800'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {log.category}
                  </span>
                  <span
                    className={`${
                      log.level === 'error'
                        ? 'text-rose-400 font-semibold'
                        : log.level === 'success'
                        ? 'text-emerald-300'
                        : 'text-slate-300'
                    }`}
                  >
                    {log.message}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Bottom Footer */}
        <div className="px-6 py-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>
              {language === 'ja'
                ? 'デモ環境：APIキー設定不要で全機能（査定・検品・購入・AI出品）が完全動作します。'
                : 'Demo environment: Zero API setup required. All trading, inspection & AI flows fully functional.'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsLiveMonitorOpen(false)}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold transition cursor-pointer"
          >
            {language === 'ja' ? '閉じる' : 'Close Monitor'}
          </button>
        </div>
      </div>
    </div>
  );
};
