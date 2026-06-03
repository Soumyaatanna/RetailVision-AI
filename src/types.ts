export interface Store {
  id: string;
  name: string;
  location: string;
}

export interface KPIMetric {
  id: string;
  title: string;
  value: string;
  trend: number; // positive or negative percentage
  trendLabel: string;
  icon: string;
}

export type SeverityLevel = 'INFO' | 'WARN' | 'CRITICAL';

export interface Anomaly {
  id: string;
  title: string;
  zone: string;
  severity: SeverityLevel;
  timestamp: string;
  description: string;
}

export interface FunnelStep {
  name: string;
  count: number;
  percentage: number;
  dropOffRate?: number;
}

export interface ZoneHeatmap {
  id: string;
  name: string;
  visitFrequency: number;
  avgDwellTime: string; // e.g. "12m 45s"
  popularityScore: number; // 0 to 100
  intensityColor: string; // Tailwind bg color class
}

export type EventType = 'ENTRY' | 'EXIT' | 'REENTRY' | 'ZONE_ENTER' | 'ZONE_EXIT' | 'BILLING_QUEUE_JOIN';

export interface LiveEvent {
  id: string;
  timestamp: string;
  type: EventType;
  subjectId: string;
  details: string;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  service: string;
  level: 'INFO' | 'WARN' | 'ERROR';
  message: string;
}

export interface SystemStatus {
  apiStatus: string; // "Operational" | "High Load" | "Degraded"
  apiUptime: string; // "99.99%"
  databaseStatus: string; // "Operational"
  databaseLatency: string; // "12ms"
  aiInferenceLoad: number; // 0-100 percentage
  feedLiveStreams: string; // "24/24"
  lastEventTimestamp: string;
}

export type ProcessingStageId =
  | 'upload'
  | 'video'
  | 'detection'
  | 'tracking'
  | 'mapping'
  | 'events'
  | 'metrics';

export interface ProcessingStage {
  id: ProcessingStageId;
  label: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
}

export interface PipelineJob {
  id: string;
  storeId: string;
  cameraSelection: string;
  progress: number;
  estimatedSecondsRemaining: number;
  stages: ProcessingStage[];
  status: 'IDLE' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  uploadedVideoName?: string;
  savedVideoFilename?: string;
  uploadedLayoutName?: string;
  uploadedPosName?: string;
}
