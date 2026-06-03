import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { 
  HeartPulse, 
  RefreshCw, 
  CheckCircle, 
  Database, 
  Cpu, 
  Rss, 
  Download, 
  Terminal,
  Activity
} from 'lucide-react';

export const SystemHealthSection: React.FC = () => {
  const { systemStatus, systemLogs, activeStore, refreshAll } = useStore();
  const [localLogs, setLocalLogs] = useState(systemLogs);
  const [isRefreshing, setIsRefreshing] = useState(false);

  React.useEffect(() => {
    setLocalLogs(systemLogs);
  }, [systemLogs]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshAll();
    setTimeout(() => {
      // simulate appending new system log
      const newLog = {
        id: 'log-' + Math.random().toString(36).substring(2, 7),
        timestamp: 'Just now',
        service: 'API-Gateway',
        level: 'INFO' as const,
        message: 'System health diagnostic sweep manually completed by operator.'
      };
      setLocalLogs(prev => [newLog, ...prev]);
      setIsRefreshing(false);
    }, 1200);
  };

  const downloadDiagnosticLogs = () => {
    const rawData = {
      store: activeStore,
      status: systemStatus,
      timestamp: new Date().toISOString(),
      logs: localLogs
    };
    const blob = new Blob([JSON.stringify(rawData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `system_health_diagnostics_${activeStore.id}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!systemStatus) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-purple-500 font-sans">
        <RefreshCw className="w-8 h-8 animate-spin mb-3 text-purple-600" />
        <p className="font-bold text-sm">Analyzing system infrastructure...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans text-purple-950 animate-fadeIn bg-transparent pb-10">
      {/* Immersive Section Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-purple-950 tracking-tight">System Infrastructure Health</h2>
          <p className="text-xs text-purple-705">
            Real-time monitoring of raw compute stacks, database nodes, and CCTV ingress tunnels at <span className="text-purple-700 font-extrabold">{activeStore.name}</span>
          </p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-700 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>All Systems Operational</span>
        </div>
      </div>

      {/* Bento Grid: 4 Core Infrastructure Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* API Stack Status */}
        <div className="bg-white border border-purple-100 rounded-xl p-4 flex flex-col justify-between h-32 relative overflow-hidden group hover:border-purple-300 transition-all shadow-xs font-sans">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 font-mono">API Gateway Status</span>
            <CheckCircle className="w-4.5 h-4.5 text-emerald-500" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-purple-950 leading-none">99.99%</div>
            <div className="text-[10px] font-mono text-emerald-700 font-bold mt-1 leading-none">Operational Status</div>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-100"></div>
        </div>

        {/* Database Latency */}
        <div className="bg-white border border-purple-100 rounded-xl p-4 flex flex-col justify-between h-32 relative overflow-hidden group hover:border-purple-300 transition-all shadow-xs font-sans">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 font-mono">Spanner Latency</span>
            <Database className="w-4.5 h-4.5 text-purple-600" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-purple-950 leading-none">12ms</div>
            <div className="text-[10px] font-mono text-emerald-700 font-bold mt-1 leading-none">Nominal (Avg Latency)</div>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-100"></div>
        </div>

        {/* AI Inference Cluster Load */}
        <div className="bg-white border border-purple-100 rounded-xl p-4 flex flex-col justify-between h-32 relative overflow-hidden group hover:border-purple-300 transition-all shadow-xs font-sans">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 font-mono">Inference Clusters</span>
            <Cpu className="w-4.5 h-4.5 text-purple-600" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-purple-950 leading-none">87%</div>
            <div className="text-[10px] font-mono text-amber-700 font-bold mt-1 leading-none">High Compute Load</div>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-100/50 animate-pulse"></div>
        </div>

        {/* RT CCTV Feeds Streams */}
        <div className="bg-white border border-purple-100 rounded-xl p-4 flex flex-col justify-between h-32 relative overflow-hidden group hover:border-purple-300 transition-all shadow-xs font-sans">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 font-mono">CCTV Feed Status</span>
            <Rss className="w-4.5 h-4.5 text-emerald-500" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-purple-950 leading-none font-extrabold text-purple-950">Active</div>
            <div className="text-[10px] font-mono text-emerald-700 font-bold mt-1 leading-none">24/24 Streams Online</div>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-100"></div>
        </div>
      </div>

      {/* Logs section & Meta data panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Core diagnostics server logs */}
        <div className="lg:col-span-2 bg-white border border-purple-100 rounded-xl overflow-hidden flex flex-col shadow-xs">
          <div className="px-5 py-4 border-b border-purple-100 flex justify-between items-center bg-purple-50/50">
            <h3 className="font-bold text-purple-950 text-sm flex items-center gap-2">
              <Terminal className="w-4.5 h-4.5 text-purple-600" />
              <span>Diagnostic System Logs</span>
            </h3>
            
            <button 
              id="btn-logs-refresh"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="text-[10px] font-mono text-purple-700 hover:text-purple-950 flex items-center gap-1.5 bg-white border border-purple-200 px-3 py-1.5 rounded-lg transition-all cursor-pointer font-bold shadow-xxs"
            >
              <RefreshCw className={`w-3 h-3 text-purple-500 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Refreshing Logs...' : 'Refresh Logs'}</span>
            </button>
          </div>

          <div className="flex-grow overflow-x-auto">
            <table className="w-full text-left border-collapse font-sans">
              <thead>
                <tr className="border-b border-purple-100 bg-purple-50">
                  <th className="p-3 px-4 text-xxs font-mono text-purple-400 uppercase font-bold">Timestamp</th>
                  <th className="p-3 px-4 text-xxs font-mono text-purple-400 uppercase font-bold">System Node</th>
                  <th className="p-3 px-4 text-xxs font-mono text-purple-400 uppercase font-bold">Severity</th>
                  <th className="p-3 px-4 text-xxs font-mono text-purple-400 uppercase font-bold">Log Message</th>
                </tr>
              </thead>
              <tbody className="font-mono text-[10px] divide-y divide-purple-50">
                {localLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-purple-50/30 transition-colors group">
                    <td className="p-3 px-4 text-purple-400 font-bold">{log.timestamp}</td>
                    <td className="p-3 px-4 text-purple-900 font-extrabold">{log.service}</td>
                    <td className="p-3 px-4">
                      <span className={`px-2 py-0.5 rounded-md border text-[9px] font-black ${
                        log.level === 'ERROR' 
                          ? 'border-red-200 bg-red-50 text-red-750' 
                          : log.level === 'WARN'
                            ? 'border-amber-200 bg-amber-50 text-amber-700' 
                            : 'border-purple-200 bg-purple-50 text-purple-700'
                      }`}>
                        {log.level}
                      </span>
                    </td>
                    <td className="p-3 px-4 text-purple-800/80 max-w-xs truncate group-hover:text-purple-950 font-medium">
                      {log.message}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Diagnostic Meta info */}
        <div className="bg-white border border-purple-100 rounded-xl p-5 flex flex-col justify-between max-h-[380px] shadow-xs">
          <div className="space-y-4">
            <h3 className="font-bold text-purple-950 text-sm border-b border-purple-100 pb-2">
              Hardware Meta Info
            </h3>

            <div className="space-y-3 font-mono text-[10px] text-purple-800">
              <div className="flex justify-between items-center text-xs font-bold">
                <span>Cluster Uptime:</span>
                <span className="text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full font-bold">99.98%</span>
              </div>
              <div className="flex justify-between items-center font-bold">
                <span>Build ID:</span>
                <span className="text-purple-950 bg-purple-50 px-2.5 py-0.5 rounded-md border border-purple-100">v2.4-NY-RETAIL-AI</span>
              </div>
              <div className="flex justify-between items-center font-bold">
                <span>Last Cold Boot:</span>
                <span className="text-purple-950 bg-purple-50 px-2.5 py-0.5 rounded-md border border-purple-100">May 15, 08:30 UTC</span>
              </div>
              <div className="flex justify-between items-center font-bold">
                <span>Core Nodes:</span>
                <span className="text-purple-950 bg-purple-50 px-2.5 py-0.5 rounded-md border border-purple-100">08 nodes</span>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              id="btn-diagnostics-download"
              onClick={downloadDiagnosticLogs}
              className="w-full bg-purple-50 border border-purple-200 hover:border-purple-305 text-purple-700 hover:text-purple-950 font-bold py-2.5 px-4 rounded-lg text-xs font-mono uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <Download className="w-4 h-4 text-purple-650" />
              <span>Download Health Bundle</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
