/**
 * Re:Market - Live Simulation Status Ribbon
 * Displays real-time live ticker, active jobs status, and quick trigger for Simulation Live Monitor.
 */

import React from 'react';
import { Activity, Zap, Layers, ChevronRight, Radio } from 'lucide-react';
import { useSimulation } from '../../context/SimulationContext';
import { useLanguage } from '../../context/LanguageContext';

export const SimulationStatusRibbon: React.FC = () => {
  const { isSimulationMode, activityLogs, metrics, setIsLiveMonitorOpen } = useSimulation();
  const { language } = useLanguage();

  if (!isSimulationMode) return null;

  const latestLog = activityLogs[0];

  return (
    <div className="bg-slate-950 text-slate-300 border-b border-slate-800/80 px-4 py-1 text-xs">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        {/* Left: Live Indicator & Streaming Log Ticker */}
        <div className="flex items-center gap-2.5 overflow-hidden flex-1 min-w-[280px]">
          <div className="flex items-center gap-1.5 shrink-0 px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 text-[11px] font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>{language === 'ja' ? '自動化LIVE' : 'AUTO-PILOT LIVE'}</span>
          </div>

          {latestLog ? (
            <div className="flex items-center gap-2 truncate text-slate-300 text-[11px]">
              <span className="text-slate-500 font-mono shrink-0">[{latestLog.timeFormatted}]</span>
              <span className="font-bold text-slate-400 shrink-0 uppercase text-[10px] bg-slate-800 px-1.5 py-0.2 rounded">
                {latestLog.category}
              </span>
              <span className="truncate text-slate-200">{latestLog.message}</span>
            </div>
          ) : (
            <span className="text-slate-500 text-[11px]">
              {language === 'ja' ? '自動検品・相場更新パイプライン稼働中...' : 'Inspection & Pricing Pipeline Active...'}
            </span>
          )}
        </div>

        {/* Right: Quick Stats & Monitor Launcher */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden md:flex items-center gap-3 text-[11px] text-slate-400 border-r border-slate-800 pr-3">
            <span>
              {language === 'ja' ? '稼働ジョブ:' : 'Active Jobs:'}{' '}
              <strong className="text-emerald-400 font-mono">{metrics.activeJobsCount}</strong>
            </span>
            <span>
              {language === 'ja' ? '処理能力:' : 'Throughput:'}{' '}
              <strong className="text-purple-300 font-mono">{metrics.pipelineThroughputPerMin}/m</strong>
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsLiveMonitorOpen(true)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-600/90 hover:bg-emerald-500 text-white font-bold text-[11px] transition shadow-xs cursor-pointer"
            title="Open Live Automation & Simulation Monitor"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>{language === 'ja' ? '自動化モニター' : 'Live Monitor'}</span>
            <ChevronRight className="w-3 h-3 text-emerald-200" />
          </button>
        </div>
      </div>
    </div>
  );
};
