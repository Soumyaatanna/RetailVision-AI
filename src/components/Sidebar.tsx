import React from 'react';
import { useStore } from '../context/StoreContext';
import { 
  UploadCloud, 
  LayoutDashboard, 
  Filter, 
  Flame, 
  Activity, 
  AlertTriangle, 
  HeartPulse, 
  BookOpen, 
  HelpCircle,
  ShieldCheck,
  X
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, activeJob, mobileSidebarOpen, setMobileSidebarOpen } = useStore();

  const navItems = [
    { id: 'upload', label: 'Upload & Analysis', icon: UploadCloud },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'funnel', label: 'Funnel Analytics', icon: Filter },
    { id: 'heatmap', label: 'Heatmap', icon: Flame },
    { id: 'events', label: 'Live Events', icon: Activity },
    { id: 'anomalies', label: 'Anomalies', icon: AlertTriangle },
    { id: 'health', label: 'System Health', icon: HeartPulse },
  ];

  return (
    <>
      {/* Mobile Sidebar overlay/backdrop when open */}
      {mobileSidebarOpen && (
        <div 
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden cursor-pointer"
        />
      )}

      <aside 
        id="sidebar-nav" 
        className={`${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 fixed inset-y-0 left-0 w-64 bg-white border-r border-purple-100 text-purple-950 shrink-0 z-50 font-sans flex flex-col h-screen transition-transform duration-300 ease-in-out`}
      >
        {/* Branding Header Area */}
        <div className="p-6 border-b border-purple-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-purple-600 text-white flex items-center justify-center font-bold text-lg shadow-sm shadow-purple-200">
              A
            </div>
            <div>
              <h1 className="text-base font-semibold tracking-tight text-purple-950 leading-tight">Aether Intelligence</h1>
              <p className="text-[10px] font-mono text-purple-550 mt-0.5">Enterprise AI v2.4</p>
            </div>
          </div>
 
          {/* Close button for Mobile */}
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-md border border-purple-100 text-purple-600 hover:text-purple-900 hover:bg-purple-50 transition-all cursor-pointer animate-fadeIn"
            title="Close Menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
 
        {/* Navigation list */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-100">
          <div className="px-2 mb-3 text-[10px] font-bold uppercase tracking-widest text-purple-400 font-mono">
            Core Operations
          </div>
          
          {navItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.id || (item.id === 'upload' && activeTab === 'processing');
            
            return (
              <button
                id={`nav-link-${item.id}`}
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id === 'upload' && activeJob ? 'processing' : item.id);
                  setMobileSidebarOpen(false); // Auto close sidebar on mobile navigation selection
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all group duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-purple-50/70 border border-purple-100 text-purple-900 font-semibold shadow-sm'
                    : 'text-purple-800/80 hover:text-purple-950 hover:bg-purple-50/50'
                }`}
              >
                <IconComponent 
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-purple-600' : 'text-purple-400 group-hover:text-purple-600'
                  }`} 
                />
                <span className="truncate">{item.label}</span>
                {item.id === 'anomalies' && (
                  <span className="ml-auto text-[10px] bg-red-100 text-red-600 font-bold px-1.5 py-0.2 rounded-full font-sans">
                    3
                  </span>
                )}
              </button>
            );
          })}
        </nav>
 
        {/* CTA upgrade plan & Help Metadata */}
        <div className="p-6 border-t border-purple-105 space-y-4 bg-purple-50/20">
          {/* Simulative Enterprise license badge */}
          <div className="flex items-center gap-2 px-3 py-2 rounded bg-emerald-50 border border-emerald-250 text-emerald-700 text-xs shadow-xs font-medium">
            <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
            <span className="font-semibold">Scale License Active</span>
          </div>
 
          <button 
            id="btn-upgrade-plan"
            onClick={() => {
              alert("Enterprise Scale features fully unlocked in the preview tier.");
              setMobileSidebarOpen(false);
            }}
            className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded text-xs tracking-wider uppercase transition-all duration-100 active:scale-95 cursor-pointer shadow-sm shadow-purple-100"
          >
            Upgrade Capacity
          </button>
          
          <div className="flex flex-col gap-1.5 px-1 pt-1">
            <a 
              href="#docs" 
              onClick={(e) => {
                e.preventDefault(); 
                setActiveTab('health');
                setMobileSidebarOpen(false);
               }} 
              className="flex items-center gap-2.5 text-xs text-purple-800 hover:text-purple-950 transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5 text-purple-400" />
              <span>Diagnostics Docs</span>
            </a>
            <a 
              href="#support" 
              onClick={(e) => {
                e.preventDefault(); 
                alert("AI Operator support queue is fully integrated.");
                setMobileSidebarOpen(false);
              }} 
              className="flex items-center gap-2.5 text-xs text-purple-800 hover:text-purple-950 transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5 text-purple-400" />
              <span>Operator Support</span>
            </a>
          </div>
        </div>
      </aside>
    </>
  );
};
