import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { 
  AlertTriangle, 
  ShieldAlert, 
  BellRing, 
  CheckCircle2, 
  Trash2, 
  HeartPulse, 
  CheckCircle,
  EyeOff
} from 'lucide-react';

export const AnomaliesSection: React.FC = () => {
  const { anomalies, activeStore } = useStore();
  const [localAnomalies, setLocalAnomalies] = useState(anomalies);
  const [acknowledgedIds, setAcknowledgedIds] = useState<string[]>([]);

  // Capture local change when external store changes
  React.useEffect(() => {
    setLocalAnomalies(anomalies);
    setAcknowledgedIds([]);
  }, [anomalies]);

  const handleAcknowledge = (id: string) => {
    if (acknowledgedIds.includes(id)) {
      setAcknowledgedIds(prev => prev.filter(x => x !== id));
    } else {
      setAcknowledgedIds(prev => [...prev, id]);
    }
  };

  const handleDismiss = (id: string) => {
    setLocalAnomalies(prev => prev.filter(x => x.id !== id));
  };

  return (
    <div className="space-y-6 font-sans text-purple-950 animate-fadeIn bg-transparent pb-10">
      {/* Page Header banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-purple-950 tracking-tight">Active Retail Anomalies</h2>
          <p className="text-xs text-purple-705">
            Automated alerts indicating structural operational, congestion, or leakage limits exceeded at <span className="text-purple-650 font-extrabold">{activeStore.name}</span>
          </p>
        </div>

        <div className="flex items-center gap-2 bg-purple-50 border border-purple-200 px-3 py-1.5 rounded-lg text-xs font-bold text-purple-700 shadow-xs">
          <ShieldAlert className="w-3.5 h-3.5 text-purple-600 animate-pulse" />
          <span>Active monitors: 08 active threads</span>
        </div>
      </div>

      {/* Main Anomalies layout desk */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Anomalies List */}
        <div className="lg:col-span-2 space-y-4">
          {localAnomalies.length > 0 ? (
            <div className="space-y-3">
              {localAnomalies.map((anom) => {
                const isAcked = acknowledgedIds.includes(anom.id);
                
                const severityBgs: Record<string, string> = {
                  'CRITICAL': 'bg-red-50 border-red-200 text-red-700',
                  'WARN': 'bg-amber-50 border-amber-200 text-amber-700',
                  'INFO': 'bg-purple-50 border-purple-150 text-purple-750'
                };

                return (
                  <div 
                    key={anom.id} 
                    className={`bg-white border border-purple-100 rounded-xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xs transition-all ${
                      isAcked ? 'opacity-50 grayscale select-none' : 'hover:border-purple-300'
                    }`}
                  >
                    <div className="space-y-2 flex-grow">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[9px] font-mono font-extrabold uppercase px-2 py-0.5 rounded-md border ${
                          severityBgs[anom.severity] || severityBgs['INFO']
                        }`}>
                          {anom.severity}
                        </span>
                        <span className="text-[10px] font-mono text-purple-400 font-bold">{anom.timestamp}</span>
                        <span className="text-[10px] font-mono text-purple-700 bg-purple-50/50 border border-purple-100 px-2 py-0.2 rounded-md font-bold">
                          {anom.zone}
                        </span>
                      </div>
                      
                      <h3 className="text-sm font-bold text-purple-950 leading-tight">{anom.title}</h3>
                      <p className="text-purple-800/80 text-xs leading-relaxed max-w-xl">{anom.description}</p>
                    </div>

                    {/* Operational desk buttons */}
                    <div className="flex items-center gap-2 shrink-0 md:justify-end w-full md:w-auto">
                      <button
                        onClick={() => handleAcknowledge(anom.id)}
                        className={`flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs font-mono uppercase font-bold tracking-brand transition-all cursor-pointer ${
                          isAcked 
                            ? 'bg-emerald-50 border-emerald-255 text-emerald-700 shadow-xs' 
                            : 'bg-purple-50 border border-purple-200 hover:border-purple-350 text-purple-700 hover:bg-purple-100/50'
                        }`}
                      >
                        {isAcked ? <CheckCircle className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        <span>{isAcked ? 'Acknowledged' : 'Silence Alert'}</span>
                      </button>

                      <button
                        onClick={() => handleDismiss(anom.id)}
                        className="p-2 border border-purple-200 hover:border-red-200 hover:bg-red-50 text-purple-400 hover:text-red-700 rounded-lg transition-all cursor-pointer bg-white shadow-xs"
                        title="Dismiss alert"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white border border-purple-100 rounded-xl p-12 text-center text-purple-500 flex flex-col items-center justify-center gap-3 shadow-xs">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 animate-bounce" />
              <div>
                <p className="text-sm font-bold text-purple-950">All Operations Clear</p>
                <p className="text-xs text-purple-500 mt-1">Zero unsolved machine alerts recorded on live channels.</p>
              </div>
            </div>
          )}
        </div>

        {/* Diagnostic Monitor summary sidebar */}
        <div className="space-y-4">
          <div className="bg-white border border-purple-100 rounded-xl p-5 space-y-4 shadow-xs">
            <h3 className="font-bold text-purple-950 text-sm border-b border-purple-105 pb-2">
              Anomaly Desk Intelligence
            </h3>

            <div className="space-y-3 font-mono text-[10px]">
              <div className="flex justify-between items-center text-purple-700 py-1.5 border-b border-purple-50 font-bold">
                <span>Alerts Resolved Today:</span>
                <span className="text-emerald-600 font-extrabold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">14 resolutions</span>
              </div>
              <div className="flex justify-between items-center text-purple-700 py-1.5 border-b border-purple-50 font-bold">
                <span>Mean Response Latency:</span>
                <span className="text-purple-950 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">1m 15s</span>
              </div>
              <div className="flex justify-between items-center text-purple-700 py-1.5 border-b border-purple-50 font-bold">
                <span>Monitoring Channels:</span>
                <span className="text-purple-950 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">03 video pipelines</span>
              </div>
            </div>

            <div className="p-3.5 bg-red-50 border border-red-150 rounded-lg text-xs text-red-805 leading-relaxed font-sans">
              ⚠️ <strong>Critical Operations Alert rules:</strong> Dwell peaks exceeding 15 minutes in dead zones trigger automatic alarms routed immediately to floor associates.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
