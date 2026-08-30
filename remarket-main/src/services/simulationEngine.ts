/**
 * Re:Market - Live Simulation Engine
 * Manages dynamic multi-stage automation jobs, background workers, AI pipelines,
 * multi-channel synchronization, and real-time streaming activity logs.
 */

import {
  SimulationJob,
  SimulationJobStage,
  SimulationWorker,
  SimulationChannel,
  SimulationAiProvider,
  SimulationActivityLog,
  SimulationMetrics,
} from '../types/simulation';

const STAGES_SEQUENCE: SimulationJobStage[] = [
  'Intake OCR',
  'Cosmetic AI Vision',
  'Diagnostic 20-Pt Check',
  'Market Pricing & Margin',
  'SEO Listing Generation',
  'Multi-Channel Publish',
];

class SimulationEngine {
  private jobs: SimulationJob[] = [];
  private workers: SimulationWorker[] = [];
  private channels: SimulationChannel[] = [];
  private aiProviders: SimulationAiProvider[] = [];
  private activityLogs: SimulationActivityLog[] = [];
  private metrics: SimulationMetrics = {
    totalJobsProcessed: 1428,
    activeJobsCount: 3,
    pipelineThroughputPerMin: 14.8,
    avgInspectionDurationSec: 4.2,
    aiGradingAccuracy: 99.4,
    liveActiveUsers: 84,
  };

  private timer: any = null;
  private listeners: Set<() => void> = new Set();
  private isRunning: boolean = false;

  constructor() {
    this.initDefaultState();
  }

  private getTimeString(): string {
    const now = new Date();
    return now.toTimeString().split(' ')[0];
  }

  public initDefaultState() {
    const timeNow = this.getTimeString();

    // 1. Initial Automation Jobs
    this.jobs = [
      {
        id: 'JOB-2026-9041',
        title: 'Sony Alpha 7 IV (ILCE-7M4) Multi-Angle Inspection',
        category: 'カメラ',
        brand: 'Sony',
        stage: 'Diagnostic 20-Pt Check',
        status: 'processing',
        progress: 68,
        workerId: 'worker-tokyo-01',
        channel: 'ReMarket Direct',
        startedAt: '12:04:10',
        logs: [
          '[12:04:10] Job queued from trade-in desk ACQ-2026-0899',
          '[12:04:12] Neural OCR verified Serial: 48201948',
          '[12:04:14] Gemini 2.5 Vision scanned 6-axis photos: 0 dents, micro-dust on base',
          '[12:04:18] Running shutter count test & sensor diagnostic check (68%)',
        ],
      },
      {
        id: 'JOB-2026-9042',
        title: 'MacBook Pro 16-inch M3 Max Valuation & Grading',
        category: 'パソコン',
        brand: 'Apple',
        stage: 'Market Pricing & Margin',
        status: 'processing',
        progress: 42,
        workerId: 'worker-osaka-02',
        channel: 'Yahoo! Auction',
        startedAt: '12:04:30',
        logs: [
          '[12:04:30] Job queued from intake station #4',
          '[12:04:32] Battery health calculated: 94% (Cycle 38) -> Rank A criteria met',
          '[12:04:35] Fetching live market comps across Mercari & Yahoo Auction (42%)',
        ],
      },
      {
        id: 'JOB-2026-9043',
        title: 'Fujifilm X-T5 Silver Body Auto Listing Generation',
        category: 'カメラ',
        brand: 'Fujifilm',
        stage: 'SEO Listing Generation',
        status: 'processing',
        progress: 85,
        workerId: 'worker-cloud-03',
        channel: 'Mercari B2C',
        startedAt: '12:04:45',
        logs: [
          '[12:04:45] Inspection verified Rank S (Like New)',
          '[12:04:48] Gemini generated Japanese SEO description with condition warranty disclaimers (85%)',
        ],
      },
      {
        id: 'JOB-2026-9040',
        title: 'Nintendo Switch OLED Neon Blue Complete Set',
        category: 'ゲーム',
        brand: 'Nintendo',
        stage: 'Multi-Channel Publish',
        status: 'completed',
        progress: 100,
        workerId: 'worker-tokyo-01',
        channel: 'Rakuten Ichiba',
        startedAt: '12:02:15',
        completedAt: '12:03:50',
        logs: [
          '[12:02:15] Intake completed',
          '[12:02:40] Screen & Joy-Con drift check: PASS',
          '[12:03:20] Published to ReMarket Direct, Yahoo Auction & Rakuten',
        ],
      },
      {
        id: 'JOB-2026-9039',
        title: 'Bose QuietComfort Ultra Noise-Cancelling Headphones',
        category: 'オーディオ',
        brand: 'Bose',
        stage: 'Cosmetic AI Vision',
        status: 'failed',
        progress: 30,
        workerId: 'worker-osaka-02',
        channel: 'ReMarket Direct',
        startedAt: '12:01:10',
        error: 'Lighting reflection obscured ear-cushion stitch verification. Manual retry available.',
        logs: [
          '[12:01:10] Intake initialized',
          '[12:01:25] AI Vision flagged uncertain cosmetic flaw on left ear-cup pad',
        ],
      },
    ];

    // 2. Background Workers
    this.workers = [
      {
        id: 'worker-tokyo-01',
        name: 'Tokyo Diagnostic Cluster #1',
        role: 'Hardware Diagnostics & High-Speed OCR',
        location: 'Tokyo Facility (Shinagawa)',
        status: 'busy',
        cpuUsage: 28,
        memoryUsage: 46,
        lastHeartbeat: 'Just now',
        activeJobTitle: 'Sony Alpha 7 IV Diagnostic Suite',
        processedCount: 582,
      },
      {
        id: 'worker-osaka-02',
        name: 'Osaka Valuation & Comp Worker #2',
        role: 'Realtime Comps & Fair Price Analytics',
        location: 'Osaka Distribution Center',
        status: 'busy',
        cpuUsage: 22,
        memoryUsage: 38,
        lastHeartbeat: 'Just now',
        activeJobTitle: 'MacBook Pro M3 Max Valuation',
        processedCount: 479,
      },
      {
        id: 'worker-cloud-03',
        name: 'Gemini Multimodal Neural Worker #3',
        role: 'Multimodal Vision Grading & Copywriting',
        location: 'Google Cloud (asia-east1)',
        status: 'busy',
        cpuUsage: 34,
        memoryUsage: 54,
        lastHeartbeat: 'Just now',
        activeJobTitle: 'Fujifilm X-T5 Listing Generator',
        processedCount: 367,
      },
    ];

    // 3. Multi-Channel Synchronization
    this.channels = [
      {
        id: 'ch-remarket',
        name: 'Re:Market Official Storefront',
        platform: 'ReMarket Direct',
        status: 'Active',
        activeListings: 186,
        lastSync: 'Just now',
        dailyRevenue: 1420000,
      },
      {
        id: 'ch-yahoo',
        name: 'Yahoo! Auctions Store API',
        platform: 'Yahoo! Auction',
        status: 'Connected',
        activeListings: 142,
        lastSync: '12s ago',
        dailyRevenue: 980000,
      },
      {
        id: 'ch-mercari',
        name: 'Mercari Shops B2C Connector',
        platform: 'Mercari B2C',
        status: 'Active',
        activeListings: 118,
        lastSync: '8s ago',
        dailyRevenue: 750000,
      },
      {
        id: 'ch-rakuten',
        name: 'Rakuten Ichiba Merchant Gateway',
        platform: 'Rakuten Ichiba',
        status: 'Connected',
        activeListings: 95,
        lastSync: '24s ago',
        dailyRevenue: 620000,
      },
    ];

    // 4. AI Providers
    this.aiProviders = [
      {
        id: 'ai-gemini-vision',
        name: 'Google Gemini 2.5 Pro (Multimodal)',
        model: 'gemini-2.5-pro-vision',
        purpose: 'Cosmetic Grading, Scratch Depth Estimation & Defect Tagging',
        status: 'Operational',
        latencyMs: 145,
        successRate: 99.8,
        requestsProcessed: 3420,
      },
      {
        id: 'ai-gemini-flash',
        name: 'Google Gemini 2.5 Flash',
        model: 'gemini-2.5-flash',
        purpose: 'Instant Shopping Concierge Chat & Natural Search Parser',
        status: 'Optimal',
        latencyMs: 95,
        successRate: 100,
        requestsProcessed: 8910,
      },
      {
        id: 'ai-ocr-engine',
        name: 'ReMarket Neural Serial & Spec OCR',
        model: 'neural-ocr-v4.2',
        purpose: 'Serial Number Extraction & Anti-Fraud Verification',
        status: 'Operational',
        latencyMs: 40,
        successRate: 99.9,
        requestsProcessed: 6140,
      },
    ];

    // 5. Initial Activity Streaming Logs
    this.activityLogs = [
      {
        id: 'log-1',
        timestamp: new Date(Date.now() - 1000 * 20).toISOString(),
        timeFormatted: timeNow,
        category: 'AI Pipeline',
        level: 'success',
        message: 'Gemini Vision completed 6-axis surface analysis for Sony α7 IV (Rank A confirmed)',
        details: 'No sensor spots detected, shutter cycle: 3,420 count',
      },
      {
        id: 'log-2',
        timestamp: new Date(Date.now() - 1000 * 45).toISOString(),
        timeFormatted: '12:03:45',
        category: 'Order',
        level: 'info',
        message: 'Order ORD-20260825-0081 payment verified via PayPay -> Dispatched to packing bay #2',
        details: 'Buyer selected 24h express shipping',
      },
      {
        id: 'log-3',
        timestamp: new Date(Date.now() - 1000 * 75).toISOString(),
        timeFormatted: '12:03:15',
        category: 'Channel',
        level: 'info',
        message: 'Yahoo! Auction Gateway sync: Stock count decreased for Nintendo Switch OLED',
        details: 'Multi-channel inventory locked atomically',
      },
      {
        id: 'log-4',
        timestamp: new Date(Date.now() - 1000 * 110).toISOString(),
        timeFormatted: '12:02:40',
        category: 'Trade-in',
        level: 'success',
        message: 'Trade-in ACQ-2026-0902 received at Shinagawa intake counter: Canon EOS R6',
        details: 'Preliminary valuation ¥145,000 confirmed by customer',
      },
      {
        id: 'log-5',
        timestamp: new Date(Date.now() - 1000 * 150).toISOString(),
        timeFormatted: '12:02:00',
        category: 'Worker',
        level: 'info',
        message: 'Worker cluster tokyo-01 heartbeat ACK (CPU: 28%, 0 queue backlog)',
      },
    ];
  }

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.timer = setInterval(() => {
      this.tick();
    }, 2500);
  }

  public stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.isRunning = false;
  }

  // Simulation Clock Tick (runs every 2.5s)
  private tick() {
    const timeNow = this.getTimeString();

    // 1. Advance Processing Jobs
    this.jobs = this.jobs.map((job) => {
      if (job.status !== 'processing') return job;

      const increment = Math.floor(Math.random() * 12) + 8; // +8% to +20%
      const newProgress = Math.min(100, job.progress + increment);

      if (newProgress >= 100) {
        // Current stage finished! Check if more stages remain
        const currentStageIndex = STAGES_SEQUENCE.indexOf(job.stage);
        if (currentStageIndex < STAGES_SEQUENCE.length - 1) {
          const nextStage = STAGES_SEQUENCE[currentStageIndex + 1];
          const newLog = `[${timeNow}] Completed ${job.stage} -> Transitioned to ${nextStage} (0%)`;
          return {
            ...job,
            stage: nextStage,
            progress: 0,
            logs: [newLog, ...job.logs].slice(0, 10),
          };
        } else {
          // Finished entire pipeline
          const finishLog = `[${timeNow}] Pipeline completed successfully: Published to ${job.channel} with full inspection guarantee`;
          this.addLog({
            category: 'AI Pipeline',
            level: 'success',
            message: `Pipeline Completed: ${job.title} is now LIVE on ${job.channel}`,
            details: `Assigned condition rank and transparent diagnostic disclosures published.`,
          });
          return {
            ...job,
            status: 'completed',
            progress: 100,
            completedAt: timeNow,
            logs: [finishLog, ...job.logs].slice(0, 10),
          };
        }
      }

      return {
        ...job,
        progress: newProgress,
      };
    });

    // 2. Spawn a new job if all are completed or only 1 running
    const processingJobs = this.jobs.filter((j) => j.status === 'processing');
    if (processingJobs.length < 3) {
      this.spawnDynamicJob();
    }

    // 3. Fluctuating Worker CPU / RAM
    this.workers = this.workers.map((w) => {
      const cpuDelta = (Math.random() - 0.5) * 8;
      const memDelta = (Math.random() - 0.5) * 4;
      return {
        ...w,
        cpuUsage: Math.max(12, Math.min(75, Math.round(w.cpuUsage + cpuDelta))),
        memoryUsage: Math.max(25, Math.min(80, Math.round(w.memoryUsage + memDelta))),
        lastHeartbeat: 'Just now',
        processedCount: w.processedCount + (Math.random() > 0.6 ? 1 : 0),
      };
    });

    // 4. Update Metrics gently
    this.metrics.totalJobsProcessed += Math.random() > 0.7 ? 1 : 0;
    this.metrics.activeJobsCount = this.jobs.filter((j) => j.status === 'processing').length;
    this.metrics.liveActiveUsers = Math.max(
      60,
      Math.min(150, Math.round(this.metrics.liveActiveUsers + (Math.random() - 0.5) * 6))
    );

    // 5. Notify all React component subscribers
    this.notify();
  }

  private spawnDynamicJob() {
    const timeNow = this.getTimeString();
    const candidateItems = [
      { title: 'Canon EOS R5 Mark II High-Res Sensor Check', cat: 'カメラ', brand: 'Canon' },
      { title: 'iPad Pro 12.9 M2 Liquid Retina XDR Diagnostics', cat: 'パソコン', brand: 'Apple' },
      { title: 'Sennheiser HD800S High-End Audiophile Inspection', cat: 'オーディオ', brand: 'Sennheiser' },
      { title: 'Grand Seiko SBGA211 Snowflake Movement Verification', cat: '腕時計', brand: 'Grand Seiko' },
      { title: 'PlayStation 5 Pro Ray-Tracing GPU Benchmark', cat: 'ゲーム', brand: 'Sony (PlayStation)' },
    ];
    const item = candidateItems[Math.floor(Math.random() * candidateItems.length)];
    const randomWorker = this.workers[Math.floor(Math.random() * this.workers.length)];
    const randomChannel = this.channels[Math.floor(Math.random() * this.channels.length)].platform;
    const newJobId = `JOB-2026-${Math.floor(Math.random() * 8000) + 1000}`;

    const newJob: SimulationJob = {
      id: newJobId,
      title: item.title,
      category: item.cat,
      brand: item.brand,
      stage: 'Intake OCR',
      status: 'processing',
      progress: 5,
      workerId: randomWorker.id,
      channel: randomChannel,
      startedAt: timeNow,
      logs: [
        `[${timeNow}] Intake verified by OCR barcode scanner`,
        `[${timeNow}] Dispatched to ${randomWorker.name}`,
      ],
    };

    this.jobs = [newJob, ...this.jobs].slice(0, 8);

    this.addLog({
      category: 'Trade-in',
      level: 'info',
      message: `New Intake Initiated: ${item.title}`,
      details: `Enqueued into automated multi-stage inspection pipeline on ${randomWorker.name}`,
    });
  }

  public retryJob(jobId: string) {
    const timeNow = this.getTimeString();
    this.jobs = this.jobs.map((j) => {
      if (j.id === jobId) {
        return {
          ...j,
          status: 'processing',
          progress: 35,
          error: undefined,
          logs: [`[${timeNow}] Manual retry initiated by staff operator`, ...j.logs],
        };
      }
      return j;
    });

    this.addLog({
      category: 'Worker',
      level: 'info',
      message: `Job ${jobId} resumed: Rescanning with optimized lighting filter`,
    });
    this.notify();
  }

  public addLog(entry: Omit<SimulationActivityLog, 'id' | 'timestamp' | 'timeFormatted'>) {
    const timeNow = this.getTimeString();
    const newLog: SimulationActivityLog = {
      id: `log-${Date.now()}-${Math.random()}`,
      timestamp: new Date().toISOString(),
      timeFormatted: timeNow,
      ...entry,
    };
    this.activityLogs = [newLog, ...this.activityLogs].slice(0, 30);
    this.notify();
  }

  public getSnapshot() {
    return {
      jobs: this.jobs,
      workers: this.workers,
      channels: this.channels,
      aiProviders: this.aiProviders,
      activityLogs: this.activityLogs,
      metrics: this.metrics,
      isRunning: this.isRunning,
    };
  }

  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }
}

export const simulationEngine = new SimulationEngine();
// Auto-start simulation engine immediately on load
simulationEngine.start();
