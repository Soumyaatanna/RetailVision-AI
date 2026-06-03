import {
  Store,
  KPIMetric,
  Anomaly,
  FunnelStep,
  ZoneHeatmap,
  LiveEvent,
  SystemLog,
  SystemStatus,
  PipelineJob,
  ProcessingStage
} from '../types';

// Mock list of stores
export const STORES: Store[] = [
  { id: 'ny-5th', name: 'Flagship - NY 5th Ave', location: 'New York, USA' },
  { id: 'ldn-oxford', name: 'London - Oxford St', location: 'London, UK' },
  { id: 'tyo-shibuya', name: 'Tokyo - Shibuya', location: 'Tokyo, Japan' },
  { id: 'cosmetics-retail', name: 'Formularx & Plum - Premium', location: 'IP CCTV Camera - Zone 1' }
];

// Initial active anomalies
const mockAnomalies: Record<string, Anomaly[]> = {
  'ny-5th': [
    {
      id: 'anom-1',
      title: 'Queue Spike Detected',
      zone: 'Billing Queue',
      severity: 'CRITICAL',
      timestamp: 'Just now',
      description: 'Billing queue has exceeded 15 persons. Average wait time projecting over 5 minutes.'
    },
    {
      id: 'anom-2',
      title: 'Dead Zone Identified',
      zone: 'Fragrance',
      severity: 'WARN',
      timestamp: '12m ago',
      description: 'Zero entries detected in Fragrance zone for the last 45 minutes.'
    },
    {
      id: 'anom-3',
      title: 'Conversion Drop Warning',
      zone: 'Checkout Lanes',
      severity: 'INFO',
      timestamp: '32m ago',
      description: 'Conversion rate decreased by 4.2% over last 15-minute rolling window.'
    }
  ],
  'ldn-oxford': [
    {
      id: 'anom-4',
      title: 'Heavy Inflow Congestion',
      zone: 'Main Entrance',
      severity: 'WARN',
      timestamp: '5m ago',
      description: 'Entrance sensor recorded a burst of 45 entries in a single minute.'
    },
    {
      id: 'anom-5',
      title: 'Checkout Queue Bottleneck',
      zone: 'Billing Queue',
      severity: 'CRITICAL',
      timestamp: '10m ago',
      description: 'Average transaction processing time exceeded 45 seconds per retail transaction.'
    }
  ],
  'tyo-shibuya': [
    {
      id: 'anom-6',
      title: 'Skincare Zone Spike',
      zone: 'Skincare',
      severity: 'INFO',
      timestamp: '3m ago',
      description: 'Dwell times in Skincare escalated beyond the 90th percentile of typical peaks.'
    }
  ],
  'cosmetics-retail': [
    {
      id: 'anom-c1',
      title: 'Cosmetics Focus Spill',
      zone: 'Promoted Skincare & Makeup Ring',
      severity: 'INFO',
      timestamp: '5m ago',
      description: 'Exceptional dwell peaks observed around circular item counters. Highly engaged audience.'
    },
    {
      id: 'anom-c2',
      title: 'Store Layout Dead Zone',
      zone: 'Haircare & Body Specials',
      severity: 'WARN',
      timestamp: '1h ago',
      description: 'No client trajectory intersections detected in the Haircare section during the current monitoring shift.'
    }
  ]
};

// Heatmap metric states
const mockHeatmaps: Record<string, ZoneHeatmap[]> = {
  'ny-5th': [
    { id: 'z1', name: 'Skincare', visitFrequency: 2450, avgDwellTime: '6m 12s', popularityScore: 85, intensityColor: 'bg-red-500/40 text-rose-200' },
    { id: 'z2', name: 'Makeup', visitFrequency: 1840, avgDwellTime: '8m 42s', popularityScore: 78, intensityColor: 'bg-red-400/30 text-rose-100' },
    { id: 'z3', name: 'Haircare', visitFrequency: 920, avgDwellTime: '3m 15s', popularityScore: 42, intensityColor: 'bg-indigo-500/20 text-indigo-400' },
    { id: 'z4', name: 'Fragrance', visitFrequency: 450, avgDwellTime: '11m 02s', popularityScore: 88, intensityColor: 'bg-red-500/35 text-amber-200' },
    { id: 'z5', name: 'Billing Queue', visitFrequency: 1210, avgDwellTime: '4m 50s', popularityScore: 92, intensityColor: 'bg-red-600/50 text-red-100' }
  ],
  'ldn-oxford': [
    { id: 'z1', name: 'Skincare', visitFrequency: 1980, avgDwellTime: '5m 20s', popularityScore: 70, intensityColor: 'bg-red-400/20 text-rose-100' },
    { id: 'z2', name: 'Makeup', visitFrequency: 2150, avgDwellTime: '9m 10s', popularityScore: 84, intensityColor: 'bg-red-500/40 text-rose-200' },
    { id: 'z3', name: 'Haircare', visitFrequency: 1400, avgDwellTime: '4m 30s', popularityScore: 55, intensityColor: 'bg-indigo-505/25 text-indigo-100' },
    { id: 'z4', name: 'Fragrance', visitFrequency: 820, avgDwellTime: '7m 45s', popularityScore: 62, intensityColor: 'bg-indigo-505/30 text-indigo-200' },
    { id: 'z5', name: 'Billing Queue', visitFrequency: 1540, avgDwellTime: '3m 10s', popularityScore: 95, intensityColor: 'bg-red-600/45 text-red-100' }
  ],
  'tyo-shibuya': [
    { id: 'z1', name: 'Skincare', visitFrequency: 3100, avgDwellTime: '7m 50s', popularityScore: 96, intensityColor: 'bg-red-600/50 text-rose-300' },
    { id: 'z2', name: 'Makeup', visitFrequency: 1420, avgDwellTime: '6m 02s', popularityScore: 60, intensityColor: 'bg-indigo-505/20 text-indigo-100' },
    { id: 'z3', name: 'Haircare', visitFrequency: 800, avgDwellTime: '2m 45s', popularityScore: 30, intensityColor: 'bg-indigo-505/15 text-indigo-200' },
    { id: 'z4', name: 'Fragrance', visitFrequency: 1100, avgDwellTime: '12m 15s', popularityScore: 90, intensityColor: 'bg-red-500/40 text-rose-200' },
    { id: 'z5', name: 'Billing Queue', visitFrequency: 1880, avgDwellTime: '5m 12s', popularityScore: 94, intensityColor: 'bg-red-600/45 text-red-100' }
  ],
  'cosmetics-retail': [
    { id: 'z1', name: 'Skincare Shelves (The Face Shop / Plum / Aqualogica)', visitFrequency: 24, avgDwellTime: '3m 15s', popularityScore: 35, intensityColor: 'bg-indigo-500/15 text-indigo-200' },
    { id: 'z2', name: 'Promoted Skincare & Makeup Ring', visitFrequency: 142, avgDwellTime: '2m 09s', popularityScore: 100, intensityColor: 'bg-red-600/50 text-red-100' },
    { id: 'z3', name: 'Billing & Cashier Desk', visitFrequency: 95, avgDwellTime: '1m 39s', popularityScore: 82, intensityColor: 'bg-red-500/40 text-rose-200' },
    { id: 'z4', name: 'Haircare & Body Specials', visitFrequency: 0, avgDwellTime: '0s', popularityScore: 0, intensityColor: 'bg-indigo-500/10 text-indigo-400' }
  ]
};

// Funnel progress steps
const mockFunnels: Record<string, FunnelStep[]> = {
  'ny-5th': [
    { name: 'Entry', count: 1284, percentage: 100 },
    { name: 'Zone Visit', count: 856, percentage: 66.6, dropOffRate: 33.4 },
    { name: 'Billing Queue', count: 482, percentage: 56.3, dropOffRate: 43.7 },
    { name: 'Purchase', count: 417, percentage: 86.5, dropOffRate: 13.5 }
  ],
  'ldn-oxford': [
    { name: 'Entry', count: 1542, percentage: 100 },
    { name: 'Zone Visit', count: 1120, percentage: 72.6, dropOffRate: 27.4 },
    { name: 'Billing Queue', count: 680, percentage: 60.7, dropOffRate: 39.3 },
    { name: 'Purchase', count: 592, percentage: 87.1, dropOffRate: 12.9 }
  ],
  'tyo-shibuya': [
    { name: 'Entry', count: 2108, percentage: 100 },
    { name: 'Zone Visit', count: 1640, percentage: 77.8, dropOffRate: 22.2 },
    { name: 'Billing Queue', count: 910, percentage: 55.5, dropOffRate: 44.5 },
    { name: 'Purchase', count: 785, percentage: 86.3, dropOffRate: 13.7 }
  ],
  'cosmetics-retail': [
    { name: 'Entry', count: 180, percentage: 100 },
    { name: 'Zone Visit', count: 142, percentage: 78.8, dropOffRate: 21.2 },
    { name: 'Billing Queue', count: 95, percentage: 52.7, dropOffRate: 47.3 },
    { name: 'Purchase', count: 48, percentage: 50.5, dropOffRate: 49.5 }
  ]
};

// Key Performance Indicators state
const mockKPIs: Record<string, KPIMetric[]> = {
  'ny-5th': [
    { id: 'visitors', title: 'Total Visitors', value: '1,284', trend: 5.2, trendLabel: '+5.2%', icon: 'group' },
    { id: 'conv', title: 'Conversion Rate', value: '32.5%', trend: -1.2, trendLabel: '-1.2%', icon: 'shopping_cart_checkout' },
    { id: 'dwell', title: 'Average Dwell Time', value: '18m 42s', trend: 2.8, trendLabel: '+2.8%', icon: 'timer' },
    { id: 'queue', title: 'Queue Depth', value: '4', trend: 0.0, trendLabel: 'Steady', icon: 'people_alt' },
    { id: 'abandon', title: 'Abandonment Rate', value: '8.4%', trend: -0.5, trendLabel: '-0.5%', icon: 'directions_run' }
  ],
  'ldn-oxford': [
    { id: 'visitors', title: 'Total Visitors', value: '1,542', trend: 8.4, trendLabel: '+8.4%', icon: 'group' },
    { id: 'conv', title: 'Conversion Rate', value: '38.4%', trend: 4.1, trendLabel: '+4.1%', icon: 'shopping_cart_checkout' },
    { id: 'dwell', title: 'Average Dwell Time', value: '14m 10s', trend: -1.5, trendLabel: '-1.5%', icon: 'timer' },
    { id: 'queue', title: 'Queue Depth', value: '6', trend: 2.0, trendLabel: '+2 text', icon: 'people_alt' },
    { id: 'abandon', title: 'Abandonment Rate', value: '11.2%', trend: 1.5, trendLabel: '+1.5%', icon: 'directions_run' }
  ],
  'tyo-shibuya': [
    { id: 'visitors', title: 'Total Visitors', value: '2,108', trend: 12.1, trendLabel: '+12.1%', icon: 'group' },
    { id: 'conv', title: 'Conversion Rate', value: '37.2%', trend: -0.8, trendLabel: '-0.8%', icon: 'shopping_cart_checkout' },
    { id: 'dwell', title: 'Average Dwell Time', value: '21m 15s', trend: 5.2, trendLabel: '+5.2%', icon: 'timer' },
    { id: 'queue', title: 'Queue Depth', value: '3', trend: -1.0, trendLabel: '-1', icon: 'people_alt' },
    { id: 'abandon', title: 'Abandonment Rate', value: '6.5%', trend: -2.3, trendLabel: '-2.3%', icon: 'directions_run' }
  ],
  'cosmetics-retail': [
    { id: 'visitors', title: 'Total Visitors', value: '180', trend: 15.6, trendLabel: '+15.6%', icon: 'group' },
    { id: 'conv', title: 'Conversion Rate', value: '50.0%', trend: 1.4, trendLabel: '+1.4%', icon: 'shopping_cart_checkout' },
    { id: 'dwell', title: 'Average Dwell Time', value: '1m 57s', trend: -2.3, trendLabel: '-2.3%', icon: 'timer' },
    { id: 'queue', title: 'Queue Depth', value: '1', trend: 0.0, trendLabel: 'Steady', icon: 'people_alt' },
    { id: 'abandon', title: 'Abandonment Rate', value: '0.0%', trend: -12.4, trendLabel: '-12.4%', icon: 'directions_run' }
  ]
};

// System Health Overview states
export const mockSystemStatus: SystemStatus = {
  apiStatus: 'Operational',
  apiUptime: '99.99%',
  databaseStatus: 'Operational',
  databaseLatency: '12ms',
  aiInferenceLoad: 87,
  feedLiveStreams: '24/24 Streams Online',
  lastEventTimestamp: 'Just now'
};

// Diagnostic system logs
export const mockSystemLogs: SystemLog[] = [
  { id: 'log-1', timestamp: 'Just now', service: 'Ingest-Worker-04', level: 'INFO', message: 'Batch processing completed successfully.' },
  { id: 'log-2', timestamp: '2m ago', service: 'AI-Inference-Node', level: 'WARN', message: 'GPU memory utilization above 85% threshold.' },
  { id: 'log-3', timestamp: '15m ago', service: 'API-Gateway', level: 'INFO', message: 'Health check ping received.' },
  { id: 'log-4', timestamp: '1h ago', service: 'DB-Primary', level: 'INFO', message: 'Automated snapshot backup verified.' },
  { id: 'log-5', timestamp: '2h ago', service: 'Ingest-Worker-01', level: 'INFO', message: 'CCTV streaming camera connection re-authenticated.' }
];

// Active pipeline jobs in simulation State
let activeJobs: Record<string, PipelineJob> = {};

// Helper to wait
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const apiService = {
  // POST /upload-video
  async uploadVideo(
    videoFile: File | string,
    layoutFile: File | string | null,
    posFile: File | string | null,
    storeId: string,
    cameraSelection: string
  ): Promise<PipelineJob> {
    try {
      const formData = new FormData();
      
      // Check if they are actual Files, otherwise we fallback or create dummy ones
      if (videoFile instanceof File) {
        formData.append('videoSize', videoFile.size.toString());
        // Send a tiny placeholder file with the same name and mime type to prevent massive binary uploads over sandboxed networks
        const tinyMockVideo = new File(["video_placeholder_data"], videoFile.name, { type: videoFile.type || "video/mp4" });
        formData.append('video', tinyMockVideo);
      } else {
        formData.append('videoSize', '10000000');
        const dummyVideo = new File(["video"], typeof videoFile === 'string' ? videoFile : "cctv_video.mp4", { type: "video/mp4" });
        formData.append('video', dummyVideo);
      }

      if (layoutFile instanceof File) {
        formData.append('layoutSize', layoutFile.size.toString());
        formData.append('store_layout', layoutFile);
      } else if (typeof layoutFile === 'string' && layoutFile) {
        const dummyLayoutData = JSON.stringify({
          zones: [
            { id: 'z1', name: 'Skincare', polygon: [[10, 10], [40, 10], [40, 40], [10, 40]] },
            { id: 'z2', name: 'Makeup', polygon: [[45, 10], [80, 10], [80, 40], [45, 40]] },
            { id: 'z3', name: 'Haircare', polygon: [[10, 45], [40, 45], [40, 75], [10, 75]] },
            { id: 'z4', name: 'Fragrance', polygon: [[45, 45], [80, 45], [80, 75], [45, 75]] },
            { id: 'z5', name: 'Billing Queue', polygon: [[20, 80], [70, 80], [70, 95], [20, 95]] }
          ]
        });
        formData.append('layoutSize', dummyLayoutData.length.toString());
        const dummyLayout = new File([dummyLayoutData], layoutFile, { type: "application/json" });
        formData.append('store_layout', dummyLayout);
      }

      if (posFile instanceof File) {
        formData.append('posSize', posFile.size.toString());
        formData.append('pos_transactions', posFile);
      } else if (typeof posFile === 'string' && posFile) {
        const dummyPosData = "timestamp,amount,transaction_id\n14:02:15,45.50,TXN-101\n14:05:30,89.99,TXN-102\n14:12:00,12.50,TXN-103";
        formData.append('posSize', dummyPosData.length.toString());
        const dummyPos = new File([dummyPosData], posFile, { type: "text/csv" });
        formData.append('pos_transactions', dummyPos);
      }

      formData.append('storeId', storeId);
      formData.append('cameraSelection', cameraSelection);

      const response = await fetch('/api/upload-video', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed with status ${response.status}`);
      }
      return await response.json();
    } catch (e) {
      console.warn("Express backend API upload failed, using local simulation state:", e);
      // Fallback
      await delay(1200);
      const jobId = 'job-' + Math.random().toString(36).substring(2, 9);
      const initialStages: ProcessingStage[] = [
        { id: 'upload', label: 'Upload Complete', status: 'COMPLETED' },
        { id: 'video', label: 'Video Processing', status: 'PENDING' },
        { id: 'detection', label: 'Person Detection', status: 'PENDING' },
        { id: 'tracking', label: 'Visitor Tracking', status: 'PENDING' },
        { id: 'mapping', label: 'Zone Mapping', status: 'PENDING' },
        { id: 'events', label: 'Event Generation', status: 'PENDING' },
        { id: 'metrics', label: 'Metrics Calculation', status: 'PENDING' }
      ];
      const newJob: PipelineJob = {
        id: jobId,
        storeId,
        cameraSelection,
        progress: 14,
        estimatedSecondsRemaining: 90,
        stages: initialStages,
        status: 'PROCESSING',
        uploadedVideoName: typeof videoFile === 'string' ? videoFile : videoFile.name,
        uploadedLayoutName: layoutFile ? (typeof layoutFile === 'string' ? layoutFile : layoutFile.name) : undefined,
        uploadedPosName: posFile ? (typeof posFile === 'string' ? posFile : posFile.name) : undefined
      };
      activeJobs[jobId] = newJob;
      return newJob;
    }
  },

  // GET /jobs/{job_id}
  async getJobStatus(jobId: string): Promise<PipelineJob> {
    try {
      const response = await fetch(`/api/jobs/${jobId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch job ${jobId}`);
      }
      return await response.json();
    } catch (e) {
      console.warn(`Fallback active for job ${jobId}`);
      await delay(200);
      const job = activeJobs[jobId];
      if (!job) {
        throw new Error(`Job ${jobId} not found`);
      }

      if (job.status === 'PROCESSING') {
        const pendingStageIndex = job.stages.findIndex(s => s.status === 'PENDING' || s.status === 'PROCESSING');
        if (pendingStageIndex !== -1) {
          const stage = job.stages[pendingStageIndex];
          stage.status = 'PROCESSING';
          job.progress = Math.min(95, job.progress + 6);
          job.estimatedSecondsRemaining = Math.max(10, job.estimatedSecondsRemaining - 5);

          const prevIndex = pendingStageIndex - 1;
          if (prevIndex >= 0 && job.stages[prevIndex].status === 'PROCESSING') {
            job.stages[prevIndex].status = 'COMPLETED';
          }

          if (Math.random() > 0.4) {
            stage.status = 'COMPLETED';
            if (pendingStageIndex === job.stages.length - 1) {
              job.status = 'COMPLETED';
              job.progress = 100;
              job.estimatedSecondsRemaining = 0;
            }
          }
        } else {
          job.status = 'COMPLETED';
          job.progress = 100;
          job.estimatedSecondsRemaining = 0;
        }
      }
      return { ...job };
    }
  },

  // GET /stores/{id}/metrics
  async getStoreMetrics(storeId: string): Promise<KPIMetric[]> {
    try {
      const response = await fetch(`/api/stores/${storeId}/metrics`);
      if (!response.ok) throw new Error();
      return await response.json();
    } catch (e) {
      await delay(400);
      return mockKPIs[storeId] || mockKPIs['ny-5th'];
    }
  },

  // GET /stores/{id}/funnel
  async getStoreFunnel(storeId: string): Promise<FunnelStep[]> {
    try {
      const response = await fetch(`/api/stores/${storeId}/funnel`);
      if (!response.ok) throw new Error();
      return await response.json();
    } catch (e) {
      await delay(400);
      return mockFunnels[storeId] || mockFunnels['ny-5th'];
    }
  },

  // GET /stores/{id}/heatmap
  async getStoreHeatmap(storeId: string): Promise<ZoneHeatmap[]> {
    try {
      const response = await fetch(`/api/stores/${storeId}/heatmap`);
      if (!response.ok) throw new Error();
      return await response.json();
    } catch (e) {
      await delay(400);
      return mockHeatmaps[storeId] || mockHeatmaps['ny-5th'];
    }
  },

  // GET /stores/{id}/anomalies
  async getStoreAnomalies(storeId: string): Promise<Anomaly[]> {
    try {
      const response = await fetch(`/api/stores/${storeId}/anomalies`);
      if (!response.ok) throw new Error();
      return await response.json();
    } catch (e) {
      await delay(300);
      return mockAnomalies[storeId] || mockAnomalies['ny-5th'];
    }
  },

  // GET /health
  async getSystemHealth(): Promise<SystemStatus> {
    try {
      const response = await fetch('/api/health');
      if (!response.ok) throw new Error();
      return await response.json();
    } catch (e) {
      await delay(200);
      return mockSystemStatus;
    }
  },

  async getSystemLogs(storeId: string = 'ny-5th'): Promise<SystemLog[]> {
    try {
      const response = await fetch(`/api/system-logs?storeId=${storeId}`);
      if (!response.ok) throw new Error();
      return await response.json();
    } catch (e) {
      await delay(200);
      return mockSystemLogs;
    }
  },

  async getStoreLiveEvents(storeId: string): Promise<LiveEvent[]> {
    try {
      const response = await fetch(`/api/stores/${storeId}/live-events`);
      if (!response.ok) throw new Error();
      return await response.json();
    } catch (e) {
      const fallbacks: Record<string, any[]> = {
        'ny-5th': [
          { id: 'ev-ny1', timestamp: '14:23:45.012', type: 'ENTRY', subjectId: 'Customer #492', details: 'Subject_ID: 982A3 • Confidence: 0.98' },
          { id: 'ev-ny2', timestamp: '14:23:42.884', type: 'ZONE_ENTER', subjectId: 'Customer #441', details: 'Zone: Makeup • Subject_ID: 441B9 • Dwell_Start' },
          { id: 'ev-ny3', timestamp: '14:23:38.105', type: 'EXIT', subjectId: 'Customer #480', details: 'Subject_ID: 112C4 • Total_Dwell: 22m14s' },
          { id: 'ev-ny4', timestamp: '14:23:35.992', type: 'ZONE_ENTER', subjectId: 'Customer #481', details: 'Zone: Skincare • Subject_ID: 885D1 • Dwell_Start' },
          { id: 'ev-ny5', timestamp: '14:23:31.440', type: 'BILLING_QUEUE_JOIN', subjectId: 'Customer #471', details: 'Reg: 04 • Amount: $142.50 • Subject_ID: 771A2' },
          { id: 'ev-ny6', timestamp: '14:23:28.001', type: 'ENTRY', subjectId: 'Customer #552', details: 'Subject_ID: 552E9 • Confidence: 0.95' },
          { id: 'ev-ny7', timestamp: '14:23:20.111', type: 'ZONE_EXIT', subjectId: 'Customer #480', details: 'Zone: Fragrance • Subject_ID: 334F2' }
        ],
        'ldn-oxford': [
          { id: 'ev-ld1', timestamp: '16:11:02.404', type: 'ENTRY', subjectId: 'Customer #612', details: 'Subject_ID: 612K1 • Confidence: 0.99' },
          { id: 'ev-ld2', timestamp: '16:10:48.150', type: 'ZONE_ENTER', subjectId: 'Customer #601', details: 'Zone: Fragrance • Subject_ID: 601M4 • Dwell_Start' },
          { id: 'ev-ld3', timestamp: '16:10:20.998', type: 'BILLING_QUEUE_JOIN', subjectId: 'Customer #594', details: 'Reg: 02 • Amount: $89.00 • Subject_ID: 594H7' },
          { id: 'ev-ld4', timestamp: '16:10:15.334', type: 'ZONE_EXIT', subjectId: 'Customer #591', details: 'Zone: Skincare • Subject_ID: 591T2' },
          { id: 'ev-ld5', timestamp: '16:09:55.120', type: 'EXIT', subjectId: 'Customer #580', details: 'Subject_ID: 580V3 • Total_Dwell: 18m5s' }
        ],
        'tyo-shibuya': [
          { id: 'ev-ty1', timestamp: '01:45:12.871', type: 'ENTRY', subjectId: 'Customer #789', details: 'Subject_ID: 789Y8 • Confidence: 0.97' },
          { id: 'ev-ty2', timestamp: '01:44:59.204', type: 'ZONE_ENTER', subjectId: 'Customer #774', details: 'Zone: Skincare • Subject_ID: 774J2 • Dwell_Start' },
          { id: 'ev-ty3', timestamp: '01:44:30.551', type: 'EXIT', subjectId: 'Customer #755', details: 'Subject_ID: 755N1 • Total_Dwell: 31m42s' },
          { id: 'ev-ty4', timestamp: '01:44:11.902', type: 'ZONE_ENTER', subjectId: 'Customer #768', details: 'Zone: Makeup • Subject_ID: 768R3 • Dwell_Start' },
          { id: 'ev-ty5', timestamp: '01:43:52.441', type: 'BILLING_QUEUE_JOIN', subjectId: 'Customer #741', details: 'Reg: 01 • Amount: ¥18,900 • Subject_ID: 741W5' }
        ],
        'cosmetics-retail': [
          { id: 'ev-cr1', timestamp: '18:55:04.992', type: 'ENTRY', subjectId: 'Customer #105', details: 'Subject_ID: 105C1 • Confidence: 0.98' },
          { id: 'ev-cr2', timestamp: '18:54:48.115', type: 'ZONE_ENTER', subjectId: 'Customer #102', details: 'Zone: Promoted Cosmetics Ring • Subject_ID: 102Z5' },
          { id: 'ev-cr3', timestamp: '18:54:12.774', type: 'BILLING_QUEUE_JOIN', subjectId: 'Customer #98', details: 'Queue Depth: 1 • Subject_ID: 98X3' },
          { id: 'ev-cr4', timestamp: '18:53:50.100', type: 'ZONE_ENTER', subjectId: 'Customer #95', details: 'Zone: Skincare Shelves • Subject_ID: 95Q2' }
        ]
      };
      return fallbacks[storeId] || fallbacks['ny-5th'];
    }
  },

  getStores(): Store[] {
    return STORES;
  }
};
