import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { 
  Activity, 
  Search, 
  Pause, 
  Play, 
  Download, 
  Trash2, 
  Terminal, 
  Sliders,
  Database
} from 'lucide-react';

export const LiveEventsSection: React.FC = () => {
  const { 
    liveEvents, 
    isFeedPaused, 
    setIsFeedPaused, 
    activeStore 
  } = useStore();

  const [search, setSearch] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('ALL');

  // Filter conditions
  const filteredEvents = liveEvents.filter(event => {
    const matchesSearch = 
      event.subjectId.toLowerCase().includes(search.toLowerCase()) ||
      event.details.toLowerCase().includes(search.toLowerCase());
    
    const matchesType = 
      filterType === 'ALL' || 
      event.type === filterType;

    return matchesSearch && matchesType;
  });

  const exportTelemetryCSV = () => {
    // Simulated File download
    const headers = "Timestamp,Event Type,Subject ID,Details\n";
    const rows = filteredEvents.map(e => `"${e.timestamp}","${e.type}","${e.subjectId}","${e.details}"`).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `telemetry_stream_${activeStore.id}_may31.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 font-sans text-purple-950 animate-fadeIn bg-transparent pb-10">
      {/* Page header banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-purple-950 tracking-tight">CCTV Inference Event Stream</h2>
          <p className="text-xs text-purple-700">
            Microsecond-precision stream logs compiled from direct camera tracking networks at <span className="text-purple-700 font-extrabold">{activeStore.name}</span>
          </p>
        </div>

        {/* Dynamic controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Play pause toggle */}
          <button
            id="btn-feed-pause-toggle"
            onClick={() => setIsFeedPaused(!isFeedPaused)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all cursor-pointer shadow-xs ${
              isFeedPaused 
                ? 'bg-purple-100 border-purple-300 text-purple-750' 
                : 'bg-white border-purple-200 text-purple-700 hover:text-purple-950 hover:bg-purple-50'
            }`}
          >
            {isFeedPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            <span>{isFeedPaused ? 'Synchronize Feed' : 'Freeze Telemetry'}</span>
          </button>

          {/* Exporter */}
          <button
            id="btn-export-telemetry"
            onClick={exportTelemetryCSV}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-white border border-purple-250 text-purple-705 hover:bg-purple-50 hover:text-purple-950 transition-all cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-purple-600" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Control & Search Bar strip */}
      <div className="bg-white border border-purple-100 rounded-xl p-4 flex flex-col md:flex-row gap-3 items-center shadow-xs">
        
        {/* Search Searchbar */}
        <div className="relative w-full md:flex-grow">
          <Search className="w-4 h-4 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="event-search-filter"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search events, customer ids, confidence scores, or zones..."
            className="w-full bg-purple-50 border border-purple-100 py-2 pl-9 pr-4 rounded-lg text-xs font-semibold text-purple-950 placeholder-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-400"
          />
        </div>

        {/* Type filter drop choices */}
        <div className="relative w-full md:w-52 flex items-center bg-purple-50 border border-purple-100 rounded-lg px-3 py-2 text-xs font-bold text-purple-950">
          <Sliders className="w-4 h-4 text-purple-600 mr-2 shrink-0" />
          <select
            id="type-filter-selector"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full bg-transparent text-purple-950 focus:outline-none pr-6 appearance-none cursor-pointer font-bold"
          >
            <option value="ALL" className="bg-white text-purple-950">All Event Types</option>
            <option value="ENTRY" className="bg-white text-purple-950">ENTRY</option>
            <option value="EXIT" className="bg-white text-purple-950">EXIT</option>
            <option value="ZONE_ENTER" className="bg-white text-purple-950">ZONE_ENTER</option>
            <option value="ZONE_EXIT" className="bg-white text-purple-950">ZONE_EXIT</option>
            <option value="BILLING_QUEUE_JOIN" className="bg-white text-purple-950">BILLING_QUEUE_JOIN</option>
          </select>
        </div>
      </div>

      {/* Main Terminal List Card */}
      <div className="bg-white border border-purple-100 rounded-xl flex flex-col h-[400px] overflow-hidden shadow-xs">
        
        {/* Stream metadata header */}
        <div className="px-5 py-3 border-b border-purple-100 bg-purple-50/50 text-purple-700 text-[10px] font-mono flex justify-between items-center font-bold">
          <span className="flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-purple-600" />
            <span>ACTIVE CCTV PIPELINE: CHANNEL 01_INF_RTL</span>
          </span>
          <span className="text-purple-650 bg-white px-2 py-0.5 border border-purple-100 rounded-full text-[9px]">
            Showing {filteredEvents.length} tracking records
          </span>
        </div>

        {/* Streaming Logs list */}
        <div className="flex-grow overflow-y-auto p-4 space-y-1 font-mono text-[10px] select-text">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event) => {
              const typesColors: Record<string, string> = {
                'ENTRY': 'text-emerald-700 bg-emerald-50 border-emerald-200',
                'EXIT': 'text-red-700 bg-red-50 border-red-200',
                'REENTRY': 'text-amber-700 bg-amber-50 border-amber-200',
                'ZONE_ENTER': 'text-purple-700 bg-purple-50 border-purple-200',
                'ZONE_EXIT': 'text-purple-500 bg-purple-50/30 border-purple-150',
                'BILLING_QUEUE_JOIN': 'text-purple-800 bg-purple-100/45 border-purple-200'
              };

              return (
                <div key={event.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 py-1.5 px-2.5 rounded-lg hover:bg-purple-50/40 border border-transparent hover:border-purple-100 transition-colors">
                  <span className="text-purple-400 min-w-[90px] font-bold">{event.timestamp}</span>
                  <span className={`px-2 py-0.5 rounded-md border font-extrabold min-w-[76px] text-center text-[9px] ${
                    typesColors[event.type] || 'text-purple-700 bg-purple-55 border-purple-200'
                  }`}>
                    {event.type}
                  </span>
                  <span className="font-extrabold text-purple-950 min-w-[100px]">{event.subjectId}</span>
                  <span className="text-purple-800/80 truncate flex-1">{event.details}</span>
                </div>
              );
            })
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-purple-400 gap-2">
              <Database className="w-8 h-8 text-purple-200 animate-pulse" />
              <p className="text-xs font-sans text-purple-600 font-bold">No records found matching current query boundaries.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
