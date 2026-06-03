import React from 'react';
import { useStore } from '../context/StoreContext';
import { CameraPreview } from '../components/CameraPreview';
import { generatePdfReport } from '../utils/pdfGenerator';
import { 
  Users, 
  ShoppingCart, 
  Timer, 
  TrendingUp, 
  TrendingDown, 
  Layers, 
  Tv, 
  Skull, 
  AlertOctagon, 
  Pause, 
  Play, 
  Terminal, 
  ArrowRight,
  Flame,
  UserCheck,
  FileDown
} from 'lucide-react';

export const DashboardSection: React.FC = () => {
  const { 
    activeStore, 
    kpis, 
    funnel, 
    heatmap, 
    liveEvents, 
    isFeedPaused, 
    setIsFeedPaused, 
    anomalies 
  } = useStore();

  const [isExporting, setIsExporting] = React.useState(false);

  const handleExportPdf = () => {
    setIsExporting(true);
    try {
      generatePdfReport(activeStore, kpis, funnel, heatmap, anomalies);
    } catch (e) {
      console.error('Failed to generate PDF:', e);
    } finally {
      // Small timeout for nice visual UX feedback
      setTimeout(() => {
        setIsExporting(false);
      }, 750);
    }
  };

  // Helper matching Lucide icon to label
  const getKpiIcon = (iconName: string) => {
    switch (iconName) {
      case 'group': return Users;
      case 'shopping_cart_checkout': return ShoppingCart;
      case 'timer': return Timer;
      case 'people_alt': return Users;
      case 'directions_run': return UserCheck;
      default: return Users;
    }
  };

  return (
    <div className="space-y-6 font-sans text-purple-950 animate-fadeIn bg-transparent pb-10">
      {/* Top Welcome Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-purple-950 tracking-tight">Intelligence Dashboard</h2>
          <p className="text-xs text-purple-700/80">
            Real-time computer vision analytics dashboard for <span className="text-purple-600 font-semibold">{activeStore.name}</span>
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 bg-purple-50 border border-purple-150 px-3 py-1.5 rounded-lg text-xs font-mono text-purple-700 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Feed synchronized 2026</span>
          </div>

          <button
            onClick={handleExportPdf}
            disabled={isExporting}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold border shadow-sm transition-all focus:outline-none cursor-pointer ${
              isExporting
                ? 'bg-purple-150 text-purple-400 border-purple-200 cursor-not-allowed'
                : 'bg-purple-650 hover:bg-purple-700 text-white border-purple-600 active:scale-[0.98]'
            }`}
          >
            {isExporting ? (
              <>
                <svg className="animate-spin h-3.5 w-3.5 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Generating Report...</span>
              </>
            ) : (
              <>
                <FileDown className="w-4 h-4 shrink-0" />
                <span>Export PDF Report</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* KPI Cards section */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {kpis.map((kpi) => {
          const KpiIcon = getKpiIcon(kpi.icon);
          const isUp = kpi.trend > 0;
          const isDown = kpi.trend < 0;

          return (
            <div 
              key={kpi.id} 
              className="bg-white border border-purple-100 rounded-xl p-4 flex flex-col justify-between min-h-[120px] relative overflow-hidden group hover:border-purple-300 transition-all font-sans shadow-xs"
            >
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 font-mono">{kpi.title}</span>
                <KpiIcon className="w-4 h-4 text-purple-400 group-hover:text-purple-600 transition-colors" />
              </div>
              
              <div className="mt-3">
                <div className="text-xl md:text-2xl font-bold font-mono tracking-tight text-purple-950 leading-tight">
                  {kpi.value}
                </div>
                {kpi.trend !== 0 && (
                  <div className="flex items-center gap-1 mt-1">
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md ${
                      isUp 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                        : 'bg-red-50 text-red-700 border border-red-100'
                    }`}>
                      {kpi.trendLabel}
                    </span>
                  </div>
                )}
              </div>

              {/* Decorative mini Sparkline vector inside card base */}
              <div className="absolute bottom-0 left-0 w-full h-6 opacity-30 group-hover:opacity-50 transition-all pointer-events-none">
                <svg className="w-full h-full stroke-purple-605 fill-none" preserveAspectRatio="none" strokeWidth="2" viewBox="0 0 100 20">
                  <path d={isDown 
                    ? "M0,3 L20,7 L40,5 L60,15 L80,11 L100,18" 
                    : "M0,16 L20,12 L40,14 L60,6 L80,9 L100,2"
                  } />
                </svg>
              </div>
            </div>
          );
        })}
      </div>

      {/* Middle Row: Funnel & Heatmap intensities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Live Conversion Funnel diagram */}
        <div className="bg-white border border-purple-100 rounded-xl p-5 md:p-6 flex flex-col justify-between h-[360px] relative overflow-hidden shadow-xs">
          <div className="flex justify-between items-center mb-4 z-10">
            <h3 className="font-bold text-purple-950 text-sm flex items-center gap-2">
              <Layers className="w-4.5 h-4.5 text-purple-600" />
              <span>Live Conversion Funnel</span>
            </h3>
            <span className="text-[10px] font-mono text-purple-400 font-bold">Based on Camera CV</span>
          </div>

          <div className="flex-grow flex items-center justify-between relative z-10 py-2">
            {funnel.map((step, idx) => {
              const percentages = [100, 65, 40, 32];
              const stepPercent = step.percentage || percentages[idx];
              return (
                <React.Fragment key={idx}>
                  {/* Step block */}
                  <div className="flex flex-col items-center w-1/4">
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-purple-50/50 border border-purple-100 flex items-center justify-center mb-2 shadow-xs transition-colors">
                      <span className="text-xs font-mono font-bold text-purple-600">
                        {idx + 1}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-purple-900/80 text-center uppercase tracking-wide truncate max-w-[80px]">
                      {step.name}
                    </span>
                    <span className="text-xs font-mono font-bold text-purple-950 mt-1">
                      {step.count}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md mt-0.5 border border-emerald-200">
                      {stepPercent}%
                    </span>
                  </div>

                  {/* Visual flow indicator */}
                  {idx < funnel.length - 1 && (
                    <div className="flex-grow h-0.5 bg-purple-100 relative top-[-6px]">
                      <div className="h-full bg-gradient-to-r from-purple-500 to-purple-100 animate-pulse" style={{ width: '100%' }}></div>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Transparent backend layout helper */}
          <div className="absolute inset-0 pointer-events-none opacity-5 overflow-hidden">
            <svg className="w-full h-full fill-purple-600" preserveAspectRatio="none" viewBox="0 0 100 100">
              <polygon points="0,0 100,35 100,65 0,100" />
            </svg>
          </div>
        </div>

        {/* Zone Intensities ring map */}
        <div className="bg-white border border-purple-100 rounded-xl p-5 md:p-6 flex flex-col justify-between h-[360px] relative overflow-hidden shadow-xs">
          <div className="flex justify-between items-center mb-4 z-10">
            <h3 className="font-bold text-purple-950 text-sm flex items-center gap-2">
              <Flame className="w-4.5 h-4.5 text-red-500" />
              <span>Zone Intensity</span>
            </h3>
            <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full text-xxs font-mono text-emerald-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-ping"></span>
              <span>LIVE FEED</span>
            </div>
          </div>

          {/* Zones loop */}
          <div className="grid grid-cols-2 gap-3 overflow-y-auto pr-1">
            {heatmap.slice(0, 4).map((zone, idx) => {
              const mockScores = [85, 60, 35, 15];
              return (
                <div 
                  key={zone.id} 
                  className="bg-purple-50/20 border border-purple-100/70 rounded-xl p-3 flex justify-between items-center transition-all cursor-pointer hover:border-purple-300 hover:bg-purple-50/50"
                >
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-purple-950 block truncate">{zone.name}</span>
                    <span className="text-[10px] font-mono text-purple-500">
                      {zone.visitFrequency} <span className="text-purple-400 font-sans">visitors</span>
                    </span>
                  </div>
                  
                  {/* Radial ring score */}
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center relative border border-purple-100 shadow-xs">
                    <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path 
                        className="stroke-purple-50" 
                        strokeWidth="3" 
                        fill="none" 
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                      />
                      <path 
                        className={idx === 0 ? 'stroke-purple-600' : idx === 1 ? 'stroke-purple-400' : idx === 2 ? 'stroke-emerald-450' : 'stroke-zinc-350'}
                        strokeDasharray={`${mockScores[idx]}, 100`}
                        strokeWidth="3" 
                        strokeLinecap="round"
                        fill="none" 
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                      />
                    </svg>
                    <span className="text-[9px] font-mono font-bold text-purple-950">{mockScores[idx]}</span>
                  </div>
                </div>
              );
            })}

            {/* Billing Queue wide block for exact visual layout symmetry matches */}
            {heatmap[4] && (
              <div className="bg-purple-50/20 border border-purple-100/70 rounded-xl p-3 flex justify-between items-center col-span-2">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-purple-950 block">{heatmap[4].name}</span>
                  <span className="text-[10px] font-mono text-purple-500">
                    Average wait time: <span className="text-purple-700 font-bold">{heatmap[4].avgDwellTime}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-mono font-bold text-purple-800">{heatmap[4].popularityScore}</span>
                  <span className="text-[9px] font-bold text-purple-600 uppercase tracking-widest leading-none bg-white px-2 py-1 rounded-md border border-purple-200">Score</span>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Bottom Row: Camera Preview, Events Feed & Anomalies */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">

        {/* Processed Camera View */}
        <div className="bg-white border border-purple-100 rounded-xl xl:col-span-2 flex flex-col overflow-hidden shadow-xs">
          <div className="px-5 py-4 border-b border-purple-100 flex justify-between items-center bg-white">
            <h3 className="font-bold text-purple-950 text-sm flex items-center gap-2">
              <Tv className="w-4.5 h-4.5 text-purple-600" />
              <span>Processed Camera Feed</span>
            </h3>
            <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-250 font-bold">
              Cam Active
            </span>
          </div>
          <div className="p-4 bg-purple-50/20 flex-grow flex items-center justify-center">
            <CameraPreview storeId={activeStore.id} />
          </div>
        </div>

        {/* Real-time Event Feed */}
        <div className="bg-white border border-purple-100 rounded-xl xl:col-span-1 flex flex-col h-[350px] xl:h-[460px] overflow-hidden shadow-xs">
          <div className="px-5 py-4 border-b border-purple-100 flex justify-between items-center bg-white">
            <h3 className="font-bold text-purple-950 text-sm flex items-center gap-2">
              <Terminal className="w-4.5 h-4.5 text-purple-400" />
              <span>Real-time Event Feed</span>
            </h3>
            
            <button 
              id="btn-pause-feed"
              onClick={() => setIsFeedPaused(!isFeedPaused)}
              className="text-[10px] font-mono text-purple-600 hover:text-purple-900 flex items-center gap-1 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-150 cursor-pointer"
            >
              {isFeedPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
              <span>{isFeedPaused ? 'Play' : 'Pause'}</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-1.5 font-mono text-[10px]">
            {liveEvents.map((event) => {
              const colors: Record<string, string> = {
                'ENTRY': 'text-emerald-700 bg-emerald-50 border-emerald-200',
                'EXIT': 'text-red-700 bg-red-50 border-red-200',
                'REENTRY': 'text-amber-700 bg-amber-50 border-amber-200',
                'ZONE_ENTER': 'text-purple-700 bg-purple-50 border-purple-150',
                'ZONE_EXIT': 'text-purple-500/80 bg-stone-50 border-purple-100',
                'BILLING_QUEUE_JOIN': 'text-indigo-700 bg-indigo-50 border-indigo-200'
              };

              return (
                <div key={event.id} className="flex flex-col gap-1 py-1 px-2 border-b border-purple-50/55 last:border-b-0 hover:bg-purple-50/20 rounded transition-colors">
                  <div className="flex justify-between items-center">
                    <span className="text-purple-400">{event.timestamp.split('.')[0]}</span>
                    <span className={`px-1.5 py-0.2 rounded border text-[8px] font-bold tracking-wide ${
                      colors[event.type] || 'text-purple-700 bg-purple-50 border-purple-100'
                    }`}>
                      {event.type}
                    </span>
                  </div>
                  <div className="flex flex-col mt-0.5">
                    <span className="font-bold text-purple-900">{event.subjectId}</span>
                    <span className="text-purple-650 text-[9.5px] leading-tight truncate">{event.details}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Anomalies Center */}
        <div className="bg-white border border-purple-100 rounded-xl p-5 flex flex-col h-[350px] xl:h-[460px] shadow-xs">
          <div className="flex justify-between items-center mb-4 border-b border-purple-100 pb-2">
            <h3 className="font-bold text-purple-950 text-sm flex items-center gap-2">
              <AlertOctagon className="w-4.5 h-4.5 text-red-500" />
              <span>Anomalies Center</span>
            </h3>
            <span className="text-[10px] font-mono text-red-750 font-bold bg-red-50 px-2.5 py-0.5 border border-red-200 rounded-full">
              {anomalies.length} ACTIVE
            </span>
          </div>

          <div className="flex-grow space-y-3 overflow-y-auto pr-1">
            {anomalies.map((anom) => {
              const borderColors = {
                'INFO': 'border-l-purple-400',
                'WARN': 'border-l-amber-500',
                'CRITICAL': 'border-l-red-500'
              };

              return (
                <div 
                  key={anom.id} 
                  className={`bg-purple-50/15 border-l-3 ${borderColors[anom.severity] || 'border-l-purple-500'} border-y border-r border-purple-100 rounded-r p-3 relative overflow-hidden group hover:bg-purple-50/50 transition-all`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded-md ${
                      anom.severity === 'CRITICAL' 
                        ? 'bg-red-50 text-red-700 border border-red-200' 
                        : anom.severity === 'WARN'
                          ? 'bg-amber-50 text-amber-700 border border-amber-250'
                          : 'bg-purple-50 text-purple-750 border border-purple-200'
                    }`}>
                      {anom.severity}
                    </span>
                    <span className="text-[10px] font-mono text-purple-400">{anom.timestamp}</span>
                  </div>
                  <h4 className="text-xs font-bold text-purple-950 leading-tight mb-1">{anom.title}</h4>
                  <p className="text-purple-800/80 text-[10.5px] leading-relaxed">{anom.description}</p>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
