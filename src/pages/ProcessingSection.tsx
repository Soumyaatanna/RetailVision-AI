import React from 'react';
import { useStore } from '../context/StoreContext';
import { CameraPreview } from '../components/CameraPreview';
import { RefreshCw, Play, X, CheckCircle, Radio, Clock } from 'lucide-react';

export const ProcessingSection: React.FC = () => {
  const { activeJob, cancelJob, activeStore } = useStore();

  if (!activeJob) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-purple-500 font-sans">
        <RefreshCw className="w-10 h-10 animate-spin mb-4 text-purple-600" />
        <p className="font-bold text-sm">Awaiting pipeline initialization...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-6 font-sans text-purple-950 animate-fadeIn space-y-6 bg-transparent pb-10">
      
      {/* Header section overlay */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 border-b border-purple-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-purple-950 tracking-tight">Active Ingestion Pipeline</h2>
          <p className="text-xs text-purple-700">
            Camera node feedback processing and visitor path projection indexer
          </p>
        </div>
        <div className="flex items-center gap-2 bg-purple-50 border border-purple-200 px-3 py-1.5 rounded-lg text-xs font-bold text-purple-700 shadow-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-pulse inline-block"></span>
          <span>PIPELINE_RESOLVING: TRUE</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        
        {/* Left Column - Live Camera Preview (Spans 3 Columns) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white border border-purple-100 rounded-xl p-4 shadow-xs">
            <h3 className="font-bold text-purple-950 text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-600 animate-ping inline-block"></span>
              <span>Ingested Camera Feed (Object Tracking Render)</span>
            </h3>
            <CameraPreview isProcessing={true} storeId={activeStore.id} />
          </div>
        </div>

        {/* Right Column - Status Metrics (Spans 2 Columns) */}
        <div className="lg:col-span-2 bg-white border border-purple-100 rounded-xl p-5 md:p-6 flex flex-col gap-6 shadow-xs">
          
          {/* Loading Header */}
          <div className="text-center flex flex-col items-center gap-3">
            <div className="relative w-14 h-14 flex items-center justify-center">
              {/* Pulsing ring */}
              <div className="absolute inset-0 rounded-full border border-purple-500/10 animate-pulse"></div>
              {/* Spinning ring */}
              <div className="absolute inset-[-4px] rounded-full border-t border-l border-purple-600 animate-spin" style={{ animationDuration: '2s' }}></div>
              <RefreshCw className="w-6 h-6 text-purple-505 animate-pulse" />
            </div>
            <h3 className="text-base font-bold text-purple-950 tracking-tight">AI Pipeline Metrics</h3>
            <p className="text-[9px] font-mono uppercase tracking-widest text-purple-400 font-bold">
              STREAM: {activeJob.cameraSelection}
            </p>
          </div>

          {/* Progress bar metrics */}
          <div className="space-y-2 pt-2 border-t border-purple-100">
            <div className="flex justify-between items-baseline">
              <span className="text-2xl font-bold font-mono text-purple-600 leading-none">{activeJob.progress}%</span>
              <span className="text-[10px] font-mono text-emerald-700 flex items-center gap-1 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold">
                <Clock className="w-3 h-3" />
                <span>ETA remaining: {activeJob.estimatedSecondsRemaining}s</span>
              </span>
            </div>
            
            <div className="h-2 w-full bg-purple-50 border border-purple-100 rounded-full overflow-hidden p-0.5">
              <div 
                style={{ width: `${activeJob.progress}%` }}
                className="h-full bg-purple-600 rounded-full transition-all duration-1000"
              ></div>
            </div>
          </div>

          {/* Stages Workflow container */}
          <div className="bg-purple-50/20 rounded-xl border border-purple-100 p-4 space-y-2">
            {activeJob.stages.map((stage) => {
              const isCompleted = stage.status === 'COMPLETED';
              const isProcessing = stage.status === 'PROCESSING';

              return (
                <div 
                  key={stage.id} 
                  className={`flex items-center gap-3 py-1.5 px-2.5 rounded-lg border border-transparent transition-all ${
                    isProcessing 
                      ? 'bg-purple-100/60 border-l-3 border-purple-600 font-bold text-purple-950' 
                      : 'opacity-80'
                  }`}
                >
                  {/* Stage status indicator icon */}
                  {isCompleted ? (
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : isProcessing ? (
                    <div className="relative w-4 h-4 flex items-center justify-center shrink-0">
                      <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-purple-400 opacity-75"></span>
                      <Radio className="w-4 h-4 text-purple-605 relative" />
                    </div>
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-purple-200 shrink-0 bg-transparent"></div>
                  )}

                  <span className={`text-xs ${
                    isCompleted 
                      ? 'text-purple-400 line-through font-bold' 
                      : isProcessing
                        ? 'text-purple-950 font-extrabold'
                        : 'text-purple-400 font-bold'
                  }`}>{stage.label}</span>
                </div>
              );
            })}
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end pt-2 border-t border-purple-100">
            <button
              id="btn-cancel-pipeline"
              onClick={cancelJob}
              className="flex items-center gap-1.5 px-4 py-2 border border-purple-200 hover:border-red-200 text-[10px] font-mono tracking-wider uppercase text-purple-605 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all cursor-pointer shadow-xs"
            >
              <X className="w-3.5 h-3.5" />
              <span>Cancel Pipeline</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
