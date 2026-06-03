import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { 
  Bell, 
  Settings, 
  Clock, 
  ChevronDown, 
  Menu,
  Sparkles,
  LogOut
} from 'lucide-react';

export const Header: React.FC = () => {
  const { 
    stores, 
    selectedStoreId, 
    setSelectedStoreId, 
    activeStore,
    dateRange,
    setDateRange,
    mobileSidebarOpen,
    setMobileSidebarOpen
  } = useStore();

  const [notificationOpen, setNotificationOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const notifications = [
    { id: 'n-1', text: 'Queue Spike in billing lane 1', time: 'Just now', type: 'error' },
    { id: 'n-2', text: 'Dead Zone warning in Fragrances', time: '12m ago', type: 'warning' },
    { id: 'n-3', text: 'Analysis completed for raw 1080p stream', time: '1h ago', type: 'info' }
  ];

  return (
    <header className="h-16 px-6 w-full flex justify-between items-center bg-white/90 backdrop-blur-md border-b border-purple-100 sticky top-0 z-20 font-sans text-purple-950 shadow-xs">
      {/* Left items */}
      <div className="flex items-center gap-4">
        {/* Toggle mobile sidebar */}
        <button 
          id="btn-mobile-toggle"
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)} 
          className="lg:hidden p-1.5 rounded-md border border-purple-150 hover:bg-purple-50 text-purple-700 hover:text-purple-900 transition-all cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        <div className="flex items-baseline gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-400 font-mono">VISION PROTOCOL</span>
          <span className="hidden sm:inline text-purple-200 text-xs">/</span>
          <span className="hidden sm:inline text-xs font-mono text-purple-700 bg-purple-50/70 px-2.5 py-0.5 rounded border border-purple-100">
            Node-US-East
          </span>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-4">
        {/* Active Store selector */}
        <div className="relative flex items-center bg-white border border-purple-200 rounded-lg px-3 py-1.5 text-xs hover:border-purple-400 transition-all shadow-xs">
          <span className="text-purple-500 font-medium mr-1.5">Store:</span>
          <select
            id="store-dropdown-selector"
            value={selectedStoreId}
            onChange={(e) => setSelectedStoreId(e.target.value)}
            className="bg-transparent font-semibold text-purple-950 focus:outline-none pr-6 appearance-none cursor-pointer"
          >
            {stores.map(store => (
              <option key={store.id} value={store.id} className="bg-white text-purple-950">
                {store.name}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-purple-600 absolute right-3 pointer-events-none" />
        </div>

        {/* Date Selector */}
        <div className="hidden md:flex items-center bg-white border border-purple-200 rounded-lg px-3 py-1.5 text-xs shadow-xs relative">
          <Clock className="w-3.5 h-3.5 text-purple-600 mr-2 shrink-0" />
          <select
            id="date-dropdown-selector"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="bg-transparent font-medium text-purple-950 focus:outline-none pr-6 appearance-none cursor-pointer"
          >
            <option value="Today, May 31" className="bg-white text-purple-950">Today, May 31 (Live)</option>
            <option value="Yesterday" className="bg-white text-purple-950">Yesterday</option>
            <option value="Last 7 Days" className="bg-white text-purple-950">Last 7 Days</option>
            <option value="Month to Date" className="bg-white text-purple-950">Month to Date</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-purple-600 absolute right-3 pointer-events-none" />
        </div>

        {/* Dynamic connection indicator */}
        <div className="hidden sm:flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full text-xxs font-bold text-emerald-700 font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>PIPELINE_LIVE</span>
        </div>

        {/* Notification bell dropdown list */}
        <div className="relative">
          <button 
            id="btn-notifications-toggle"
            onClick={() => setNotificationOpen(!notificationOpen)}
            className="w-8 h-8 flex items-center justify-center text-purple-700 hover:text-purple-900 rounded-lg hover:bg-purple-50 border border-purple-250 transition-all relative cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {notificationOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white border border-purple-100 rounded-xl shadow-xl p-3.5 text-xs space-y-2.5 animate-fadeIn z-50 text-purple-950">
              <div className="flex justify-between items-center border-b border-purple-100 pb-2">
                <span className="font-bold text-purple-950">Operational Alerts</span>
                <button className="text-purple-600 hover:underline text-xxs font-semibold">Clear</button>
              </div>
              <div className="space-y-1.5">
                {notifications.map(n => (
                  <div key={n.id} className="p-2 bg-purple-50/50 rounded-lg border border-purple-100/60 hover:bg-purple-100/35 transition-colors flex flex-col gap-0.5">
                    <div className="flex justify-between items-center">
                      <span className={`h-1.5 w-1.5 rounded-full ${n.type === 'error' ? 'bg-red-500' : 'bg-amber-500'}`}></span>
                      <span className="text-[10px] font-mono text-purple-500">{n.time}</span>
                    </div>
                    <p className="text-purple-900 font-medium">{n.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Settings button */}
        <button 
          id="btn-settings-toggle"
          onClick={() => alert("Enterprise parameters configured natively by deployment environment.")}
          className="w-8 h-8 flex items-center justify-center text-purple-700 hover:text-purple-900 rounded-lg hover:bg-purple-50 border border-purple-250 transition-all cursor-pointer"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Profile Card and Droplist */}
        <div className="relative">
          <button 
            id="btn-profile-toggle"
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 text-left focus:outline-none group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-purple-50 overflow-hidden border border-purple-200 group-hover:border-purple-600 transition-all shrink-0">
              <img 
                alt="Store Manager Headshot" 
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=120"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-purple-100 rounded-xl shadow-xl p-4 text-xs space-y-3 animate-fadeIn z-50 text-purple-800">
              <div className="border-b border-purple-100 pb-2.5">
                <p className="font-bold text-purple-950 text-sm">Elena Rostova</p>
                <p className="text-purple-500 text-xxs font-mono">Senior Operations Analyst</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-purple-500 font-mono text-[10px]">
                  <span>Operator ID:</span>
                  <span className="text-purple-900 font-semibold">OP-982</span>
                </div>
                <div className="flex items-center justify-between text-purple-500 font-mono text-[10px]">
                  <span>Tier:</span>
                  <span className="text-purple-600 flex items-center gap-0.5 font-bold">
                    <Sparkles className="w-3 h-3 text-purple-600" /> SCALE
                  </span>
                </div>
              </div>
              <button 
                onClick={() => alert("Simulation session closed.")}
                className="w-full mt-2 py-1.5 bg-purple-50 hover:bg-red-50 hover:text-red-600 border border-purple-200 hover:border-red-200 rounded-lg flex items-center justify-center gap-1.5 transition-all text-xs font-semibold cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Operator Logout</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};
