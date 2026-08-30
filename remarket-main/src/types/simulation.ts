/**
 * Re:Market - Simulation Mode Types
 * Live Automation, Background Workers, AI Pipeline & Multi-Channel Sync
 */

export type SimulationJobStage =
  | 'Intake OCR'
  | 'Cosmetic AI Vision'
  | 'Diagnostic 20-Pt Check'
  | 'Market Pricing & Margin'
  | 'SEO Listing Generation'
  | 'Multi-Channel Publish';

export type SimulationJobStatus = 'queued' | 'processing' | 'completed' | 'failed';

export interface SimulationJob {
  id: string; // e.g. JOB-2026-8801
  title: string;
  category: string;
  brand: string;
  stage: SimulationJobStage;
  status: SimulationJobStatus;
  progress: number; // 0 to 100
  workerId: string;
  channel: string;
  startedAt: string;
  completedAt?: string;
  logs: string[];
  error?: string;
}

export interface SimulationWorker {
  id: string; // e.g. worker-tokyo-01
  name: string;
  role: string;
  location: string;
  status: 'online' | 'busy' | 'idle';
  cpuUsage: number; // %
  memoryUsage: number; // %
  lastHeartbeat: string;
  activeJobTitle?: string;
  processedCount: number;
}

export interface SimulationChannel {
  id: string;
  name: string;
  platform: 'ReMarket Direct' | 'Yahoo! Auction' | 'Mercari B2C' | 'Rakuten Ichiba';
  status: 'Connected' | 'Active' | 'Syncing';
  activeListings: number;
  lastSync: string;
  dailyRevenue: number;
}

export interface SimulationAiProvider {
  id: string;
  name: string;
  model: string;
  purpose: string;
  status: 'Operational' | 'Optimal' | 'Degraded';
  latencyMs: number;
  successRate: number; // e.g. 99.9%
  requestsProcessed: number;
}

export interface SimulationActivityLog {
  id: string;
  timestamp: string;
  timeFormatted: string;
  category: 'AI Pipeline' | 'Worker' | 'Channel' | 'Trade-in' | 'Inspection' | 'Order' | 'Pricing';
  level: 'info' | 'success' | 'warning' | 'error';
  message: string;
  details?: string;
}

export interface SimulationMetrics {
  totalJobsProcessed: number;
  activeJobsCount: number;
  pipelineThroughputPerMin: number;
  avgInspectionDurationSec: number;
  aiGradingAccuracy: number; // %
  liveActiveUsers: number;
}
