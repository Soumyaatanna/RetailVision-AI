import React, { createContext, useContext, useState, useEffect } from 'react';
import { Store, LiveEvent, PipelineJob, Anomaly, KPIMetric, FunnelStep, ZoneHeatmap, SystemLog, SystemStatus } from '../types';
import { apiService, STORES } from '../services/api';

interface StoreContextType {
  stores: Store[];
  selectedStoreId: string;
  setSelectedStoreId: (id: string) => void;
  activeStore: Store;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  dateRange: string;
  setDateRange: (range: string) => void;
  activeJob: PipelineJob | null;
  processedVideoFilename: string | null;
  setProcessedVideoFilename: (filename: string | null) => void;
  startJob: (videoName: string, layoutName: string | null, posName: string | null, camera: string) => Promise<void>;
  cancelJob: () => void;
  liveEvents: LiveEvent[];
  isFeedPaused: boolean;
  setIsFeedPaused: (paused: boolean) => void;
  anomalies: Anomaly[];
  kpis: KPIMetric[];
  funnel: FunnelStep[];
  heatmap: ZoneHeatmap[];
  systemStatus: SystemStatus | null;
  systemLogs: SystemLog[];
  loading: boolean;
  refreshAll: () => Promise<void>;
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const INITIAL_EVENTS: LiveEvent[] = [
  { id: 'ev-1', timestamp: '14:23:45.012', type: 'ENTRY', subjectId: 'Customer #492', details: 'Subject_ID: 982A3 • Confidence: 0.98' },
  { id: 'ev-2', timestamp: '14:23:42.884', type: 'ZONE_ENTER', subjectId: 'Customer #441', details: 'Zone: Makeup • Subject_ID: 441B9 • Dwell_Start' },
  { id: 'ev-3', timestamp: '14:23:38.105', type: 'EXIT', subjectId: 'Customer #480', details: 'Subject_ID: 112C4 • Total_Dwell: 22m14s' },
  { id: 'ev-4', timestamp: '14:23:35.992', type: 'ZONE_ENTER', subjectId: 'Customer #481', details: 'Zone: Skincare • Subject_ID: 885D1 • Dwell_Start' },
  { id: 'ev-5', timestamp: '14:23:31.440', type: 'BILLING_QUEUE_JOIN', subjectId: 'Customer #471', details: 'Reg: 04 • Amount: $142.50 • Subject_ID: 771A2' },
  { id: 'ev-6', timestamp: '14:23:28.001', type: 'ENTRY', subjectId: 'Customer #552', details: 'Subject_ID: 552E9 • Confidence: 0.95' },
  { id: 'ev-7', timestamp: '14:23:20.111', type: 'ZONE_EXIT', subjectId: 'Customer #480', details: 'Zone: Fragrance • Subject_ID: 334F2' }
];

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedStoreId, setSelectedStoreId] = useState<string>('ny-5th');
  const [activeTab, setActiveTab] = useState<string>('upload');
  const [dateRange, setDateRange] = useState<string>('Today, May 31');
  const [activeJob, setActiveJob] = useState<PipelineJob | null>(null);
  const [processedVideoFilename, setProcessedVideoFilename] = useState<string | null>("1780245337045-CAM 1.mp4");
  const [liveEvents, setLiveEvents] = useState<LiveEvent[]>(INITIAL_EVENTS);
  const [isFeedPaused, setIsFeedPaused] = useState<boolean>(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);
  
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [kpis, setKpis] = useState<KPIMetric[]>([]);
  const [funnel, setFunnel] = useState<FunnelStep[]>([]);
  const [heatmap, setHeatmap] = useState<ZoneHeatmap[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Derive active store
  const activeStore = STORES.find(s => s.id === selectedStoreId) || STORES[0];

  // Fetch all state components from simulated API when selected store changes
  const refreshAll = async () => {
    setLoading(true);
    try {
      const [k, f, h, a, s, l, evs] = await Promise.all([
        apiService.getStoreMetrics(selectedStoreId),
        apiService.getStoreFunnel(selectedStoreId),
        apiService.getStoreHeatmap(selectedStoreId),
        apiService.getStoreAnomalies(selectedStoreId),
        apiService.getSystemHealth(),
        apiService.getSystemLogs(selectedStoreId),
        apiService.getStoreLiveEvents(selectedStoreId)
      ]);
      setKpis(k);
      setFunnel(f);
      setHeatmap(h);
      setAnomalies(a);
      setSystemStatus(s);
      setSystemLogs(l);
      if (evs && evs.length > 0) {
        setLiveEvents(evs);
      }
    } catch (err) {
      console.error("Error loading store metrics", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAll();
  }, [selectedStoreId]);

  // Simulation loop for ongoing Pipeline job
  useEffect(() => {
    if (!activeJob) return;

    let timer: NodeJS.Timeout;
    
    const pollJob = async () => {
      try {
        const stats = await apiService.getJobStatus(activeJob.id);
        setActiveJob(stats);
        
        if (stats.status === 'COMPLETED') {
          // Success! Automatically move to Dashboard visualizer
          if (stats.savedVideoFilename) {
            setProcessedVideoFilename(stats.savedVideoFilename);
          }
          await refreshAll();
          setTimeout(() => {
            setActiveTab('dashboard');
            setActiveJob(null);
          }, 1500); 
        } else if (stats.status === 'FAILED') {
          setActiveJob(null);
        } else {
          // Keep polling
          timer = setTimeout(pollJob, 2000);
        }
      } catch (err) {
        console.error("Pipeline job tracking error", err);
      }
    };

    timer = setTimeout(pollJob, 2000);
    return () => clearTimeout(timer);
  }, [activeJob?.id, activeJob?.progress]);

  // Simulation loop for Real-time ticker Event Feed
  useEffect(() => {
    if (isFeedPaused) return;

    const interval = setInterval(() => {
      const activeZones = selectedStoreId === 'cosmetics-retail'
        ? ['Promoted Cosmetics Ring', 'Billing & Cashier Desk', 'THE FACE SHOP Shelves', 'Plum display stand']
        : ['Skincare', 'Makeup', 'Haircare', 'Fragrance'];

      const types: { type: LiveEvent['type']; prefix: string; details: string }[] = [
        { type: 'ENTRY', prefix: 'Customer', details: 'Subject_ID: ' + Math.random().toString(36).substring(3, 8).toUpperCase() + ' • Confidence: 0.97' },
        { type: 'ZONE_ENTER', prefix: 'Customer', details: 'Zone: ' + activeZones[Math.floor(Math.random() * activeZones.length)] + ' • Dwell_Start' },
        { type: 'EXIT', prefix: 'Customer', details: 'Subject_ID: ' + Math.random().toString(36).substring(3, 8).toUpperCase() + ' • Confirmed Exit' },
        { type: 'BILLING_QUEUE_JOIN', prefix: 'Customer', details: 'Queue depth increased • Subject_ID: ' + Math.random().toString(36).substring(3, 8).toUpperCase() },
        { type: 'ZONE_EXIT', prefix: 'Customer', details: 'Left ' + activeZones[Math.floor(Math.random() * activeZones.length)] + ' Aisle' },
        { type: 'REENTRY', prefix: 'Staff', details: 'Re-entry via terminal aisle • Confirmed ID card scan' }
      ];

      const item = types[Math.floor(Math.random() * types.length)];
      const customerNum = Math.floor(Math.random() * 200) + 400;
      
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}.${String(now.getMilliseconds()).padStart(3, '0').slice(0, 3)}`;

      const newEvent: LiveEvent = {
        id: 'ev-' + Math.random().toString(36).substring(2, 7),
        timestamp: timeStr,
        type: item.type,
        subjectId: `${item.prefix} #${customerNum}`,
        details: item.details
      };

      setLiveEvents(prev => [newEvent, ...prev.slice(0, 19)]);
    }, 4500);

    return () => clearInterval(interval);
  }, [isFeedPaused, selectedStoreId]);

  // Method to launch a training or processing job
  const startJob = async (
    videoFile: File | string,
    layoutFile: File | string | null,
    posFile: File | string | null,
    camera: string
  ) => {
    try {
      setLoading(true);
      const storeId = selectedStoreId;
      const job = await apiService.uploadVideo(videoFile, layoutFile, posFile, storeId, camera);
      setActiveJob(job);
      setActiveTab('processing');
    } catch (err) {
      console.error("Job startup failed", err);
    } finally {
      setLoading(false);
    }
  };

  const cancelJob = () => {
    setActiveJob(null);
    setActiveTab('upload');
  };

  return (
    <StoreContext.Provider
      value={{
        stores: STORES,
        selectedStoreId,
        setSelectedStoreId,
        activeStore,
        activeTab,
        setActiveTab,
        dateRange,
        setDateRange,
        activeJob,
        processedVideoFilename,
        setProcessedVideoFilename,
        startJob,
        cancelJob,
        liveEvents,
        isFeedPaused,
        setIsFeedPaused,
        anomalies,
        kpis,
        funnel,
        heatmap,
        systemStatus,
        systemLogs,
        loading,
        refreshAll,
        mobileSidebarOpen,
        setMobileSidebarOpen
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
