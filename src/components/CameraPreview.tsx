import React, { useEffect, useState, useRef } from 'react';
import { Camera, Shield, Radio, Users, Expand, RefreshCw, Download, Eye, User, Landmark, HelpCircle, MapPin, AlertCircle } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface CameraPreviewProps {
  isProcessing?: boolean;
  storeId?: string;
  videoFile?: File | null;
}

interface InteractiveFeed {
  id: string;
  name: string;
  type: string;
  videoUrl: string;
  visitorsCount: number;
  avgDwell: string;
  desc: string;
}

const PRESET_FEEDS: InteractiveFeed[] = [
  {
    id: 'entrance',
    name: 'CCTV Cam 01: Shopper Entrance Queue',
    type: 'Main Stream',
    videoUrl: 'https://player.vimeo.com/external/371433846.sd.mp4?s=236da2f3c05427d2c6dca406cf6365b6ec645719&profile_id=139&oauth2_token_id=57447761',
    visitorsCount: 12,
    avgDwell: '3m 45s',
    desc: 'Biometric tracking at main vestibule lines'
  },
  {
    id: 'aisles',
    name: 'CCTV Cam 02: Cosmetics & Premium Shelves',
    type: 'Floor Stream',
    videoUrl: 'https://player.vimeo.com/external/435674703.sd.mp4?s=7fdf18c15f1d009fe027db9ca37d5a570f7bdf01&profile_id=139&oauth2_token_id=57447761',
    visitorsCount: 7,
    avgDwell: '8m 20s',
    desc: 'Live telemetry over product tester counters'
  },
  {
    id: 'register',
    name: 'CCTV Cam 03: Cashier Waiting Line',
    type: 'Queue Stream',
    videoUrl: 'https://player.vimeo.com/external/517613589.sd.mp4?s=4e4fbd733cbde5cb4dca2161f5f24f0c4366cb66&profile_id=139&oauth2_token_id=57447761',
    visitorsCount: 4,
    avgDwell: '1m 50s',
    desc: 'Cart conversion and checkout lane monitor'
  }
];

export const CameraPreview: React.FC<CameraPreviewProps> = ({ isProcessing = false, storeId = 'cosmetics-retail', videoFile = null }) => {
  const { processedVideoFilename, selectedStoreId, activeStore } = useStore();
  const [timestamp, setTimestamp] = useState<string>('');
  const [fps, setFps] = useState<number>(25);
  const [activeTab, setActiveTab] = useState<'rgb' | 'ir' | 'depth'>('rgb');

  // Pre-generate distinct random visitor counts between 1 and 10 for each feed on mount
  const [feedVisitors] = useState<Record<string, number>>(() => {
    const numbers = new Set<number>();
    while (numbers.size < 4) {
      numbers.add(Math.floor(Math.random() * 10) + 1);
    }
    const [entrance, aisles, register, uploaded] = Array.from(numbers);
    return { entrance, aisles, register, uploaded };
  });

  const dynamicFeeds = PRESET_FEEDS.map(feed => ({
    ...feed,
    visitorsCount: feedVisitors[feed.id] || feed.visitorsCount
  }));

  if (processedVideoFilename) {
    const exists = dynamicFeeds.some(f => f.id === 'uploaded');
    if (!exists) {
      dynamicFeeds.push({
        id: 'uploaded',
        name: `CCTV Uploaded Video: ${processedVideoFilename.split('-').slice(1).join('-') || 'Custom Stream'}`,
        type: 'Analyzed Stream',
        videoUrl: `/uploads/${processedVideoFilename}`,
        visitorsCount: feedVisitors['uploaded'] || 6,
        avgDwell: '2m 14s',
        desc: 'Custom uploaded video footage under active AI analysis'
      });
    }
  }

  const [selectedFeedId, setSelectedFeedId] = useState<string>(processedVideoFilename ? 'uploaded' : 'entrance');

  useEffect(() => {
    if (processedVideoFilename) {
      setSelectedFeedId('uploaded');
    }
  }, [processedVideoFilename]);

  const currentFeed = dynamicFeeds.find(f => f.id === selectedFeedId) || dynamicFeeds[0];

  const [localVideoUrl, setLocalVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    if (videoFile) {
      const url = URL.createObjectURL(videoFile);
      setLocalVideoUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setLocalVideoUrl(null);
    }
  }, [videoFile]);

  // Safe fallback if local or processed url is selected
  const videoSrc = localVideoUrl || (selectedFeedId === 'uploaded' ? `/uploads/${processedVideoFilename}` : currentFeed.videoUrl);

  const [elapsed, setElapsed] = useState<number>(0);
  const startTimeRef = useRef<number>(Date.now());

  // Dynamic visitors representation list based on the detected count for the current feed
  const visitorsList = Array.from({ length: currentFeed.visitorsCount }, (_, idx) => {
    const id = `VIS_40${idx + 1}`;
    const conf = (87.5 + (idx * 2.3) % 11.5).toFixed(1);
    
    let baseZone = 'General Floor';
    let baseDwell = `${Math.floor(1 + idx * 1.5)}m ${Math.floor(10 + idx * 7) % 60}s`;
    
    if (selectedFeedId === 'entrance') {
      baseZone = idx === 0 ? 'Queue Entrance' : idx % 2 === 0 ? 'Main Vestibule' : 'Aisle Entry';
    } else if (selectedFeedId === 'aisles') {
      baseZone = idx === 0 ? 'Cosmetics Ring' : idx % 2 === 0 ? 'Skincare Shelves' : 'Premium Row';
    } else if (selectedFeedId === 'register') {
      baseZone = idx === 0 ? 'Cashier Line A' : idx % 2 === 0 ? 'Billing Queue' : 'Register Area';
    } else {
      baseZone = idx % 2 === 0 ? 'Zone Alpha' : 'Zone Beta';
    }

    return {
      id,
      name: `Shopper #40${idx + 1}`,
      zone: baseZone,
      dwell: baseDwell,
      confidence: conf
    };
  });

  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Sync selectedId when the feed visitor count changes to avoid stale selections
  useEffect(() => {
    if (visitorsList.length > 0) {
      const exists = visitorsList.some(v => v.id === selectedId);
      if (!exists) {
        setSelectedId(visitorsList[0].id);
      }
    } else {
      setSelectedId(null);
    }
  }, [selectedFeedId, currentFeed.visitorsCount]);

  // Keep CCTV clock running in real-time
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const dateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-');
      const timeStr = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const ms = String(now.getMilliseconds()).padStart(3, '0').slice(0, 2);
      setTimestamp(`${dateStr} ${timeStr}.${ms}`);
    }, 40);

    return () => clearInterval(timer);
  }, []);

  // Soft organic trajectory coordinates generator
  useEffect(() => {
    let frameId: number;
    const animate = () => {
      setElapsed((Date.now() - startTimeRef.current) / 1000);
      
      if (Math.random() > 0.95) {
        setFps(24 + Math.floor(Math.random() * 2));
      }
      
      frameId = requestAnimationFrame(animate);
    };
    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, []);

  // Helper mapping distinct coordinates for each shopper inside the live footage frame
  const getVisitorCoordinates = (idx: number, ticks: number) => {
    let xBase = 20 + ((idx * 23) % 55);
    let yBase = 25 + ((idx * 17) % 50);

    if (selectedFeedId === 'register') {
      xBase = 72 + ((idx * 8) % 18);
      yBase = 28 + ((idx * 12) % 20);
    } else if (selectedFeedId === 'entrance') {
      xBase = 15 + ((idx * 18) % 40);
      yBase = 32 + ((idx * 14) % 35);
    } else if (selectedFeedId === 'aisles') {
      xBase = 35 + ((idx * 16) % 35);
      yBase = 38 + ((idx * 12) % 30);
    }

    const xMove = Math.sin(ticks * 0.45 + idx * 1.5) * 2.5;
    const yMove = Math.cos(ticks * 0.35 + idx * 1.1) * 2.0;

    return {
      x: Math.min(94, Math.max(6, xBase + xMove)),
      y: Math.min(90, Math.max(10, yBase + yMove)),
      width: 58 + ((idx * 12) % 22),
      height: 115 + ((idx * 18) % 30)
    };
  };

  const handleDownload = () => {
    const payload = {
      timestamp: new Date().toISOString(),
      video_metadata: {
        source_feed: currentFeed.name,
        type: currentFeed.type,
        origin: "Enterprise CCTV Live Frame",
        cctv_camera: currentFeed.id,
        retail_brand: activeStore?.name || "Aether Retail Partner Store",
      },
      store_id: selectedStoreId,
      feed_fps: fps,
      active_layer_view: activeTab,
      detection_analytics: {
        total_tracked_entities: visitorsList.length,
        detections: visitorsList.map((vis, idx) => {
          const coords = getVisitorCoordinates(idx, elapsed);
          return {
            entity_id: vis.id,
            class_label: vis.zone,
            location_coordinates: {
              x_percent: parseFloat(coords.x.toFixed(2)),
              y_percent: parseFloat(coords.y.toFixed(2)),
              width_pixels: coords.width,
              height_pixels: coords.height
            },
            model_confidence_score: `${vis.confidence}%`,
            dwell_metric_summary: vis.dwell
          };
        })
      }
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(payload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `telemetry_${currentFeed.id}_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="w-full flex flex-col bg-white border border-purple-100 rounded-2xl overflow-hidden select-none shadow-sm gap-0 font-sans">
      
      {/* CCTV Header info — Elite White and Purple Design */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gradient-to-r from-purple-900 to-indigo-900 text-white p-4 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center border border-white/20">
            <Camera className="w-4.5 h-4.5 text-purple-250 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm tracking-tight text-white">
                {videoFile ? `CCTV Local Preview: ${videoFile.name}` : currentFeed.name}
              </span>
              <span className="text-[9px] font-mono text-purple-200 bg-purple-800/60 border border-purple-700 px-1.5 py-0.5 rounded-md">
                {videoFile ? 'Local Preview' : currentFeed.type}
              </span>
            </div>
            <p className="text-[10px] text-purple-100 opacity-90 mt-0.5 font-mono">
              {videoFile ? `Size: ${(videoFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for AI processing` : currentFeed.desc}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 self-end sm:self-auto text-purple-100 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-1.5 bg-purple-850/80 border border-purple-700 px-2.5 py-1 rounded-md text-[10px] font-mono text-purple-200 shadow-sm leading-none">
            <Users className="w-3.5 h-3.5 text-purple-300 shrink-0 inline-block mr-1" />
            <span className="font-bold">LIVE VISITORS: {currentFeed.visitorsCount}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-emerald-450 rounded-full animate-ping"></span>
            <span className="text-[10px] text-emerald-420 font-bold tracking-wider font-mono">FLOW SYNC</span>
          </div>
          <span className="text-[11px] font-mono text-purple-200 px-2 py-0.5 bg-black/20 rounded border border-white/5">{fps} FPS</span>
        </div>
      </div>

      {/* Real-time Video Stream Input Selector Banner */}
      <div className="bg-purple-50/70 border-b border-purple-100 p-3 flex flex-wrap items-center justify-between gap-2.5">
        <span className="text-xs font-semibold text-purple-950 flex items-center gap-1.5">
          <Radio className="w-4 h-4 text-purple-650 shrink-0" />
          Select Live Surveillance Source:
        </span>
        <div className="flex gap-1.5 flex-wrap">
          {videoFile ? (
            <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-purple-600 text-white shadow-sm border border-purple-600">
              Active Video Upload
            </span>
          ) : (
            dynamicFeeds.map((feed) => (
              <button
                key={feed.id}
                onClick={() => setSelectedFeedId(feed.id)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  selectedFeedId === feed.id
                    ? 'bg-purple-600 text-white shadow-sm shadow-purple-200 border border-purple-600'
                    : 'bg-white text-purple-700 border border-purple-150 hover:bg-purple-50'
                }`}
              >
                {feed.id === 'uploaded' ? 'CCTV Uploaded' : `CCTV 0${feed.id === 'entrance' ? '1' : feed.id === 'aisles' ? '2' : '3'}`}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Vision Canvas Frame - Enclosed in a premium border */}
      <div className="relative aspect-[16/9] w-full bg-[#09080E] overflow-hidden">
        
        {/* Dynamic scanning feed video background */}
        <video
          key={videoSrc || 'empty'}
          src={videoSrc || undefined}
          autoPlay
          loop
          muted
          playsInline
          controls={false}
          className="absolute inset-0 w-full h-full object-cover opacity-70 z-0 pointer-events-none"
        />

        {/* Dynamic Scanning Grid Pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(167,139,250,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(167,139,250,0.015)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none z-10"></div>
        {/* Scanline pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,18,24,0)_50%,rgba(0,0,0,0.18)_50%)] bg-[size:100%_4px] pointer-events-none z-10 opacity-60"></div>

        {/* Mapped SVG Wireframe zones layer */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 opacity-70" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Skincare Shelves */}
          <rect x="5" y="15" width="22" height="25" fill="none" stroke="rgba(196,181,253,0.3)" strokeWidth="0.5" strokeDasharray="2,2" />
          <text x="16" y="27" fill="rgba(255,255,255,0.4)" fontSize="2.2" fontFamily="monospace" textAnchor="middle">SKINCARE SHELVES</text>
          
          {/* Promoted Skincare Ring center-bottom */}
          <ellipse cx="48" cy="66" rx="14" ry="9" fill="none" stroke="rgba(139,92,246,0.4)" strokeWidth="0.8" />
          <ellipse cx="48" cy="66" rx="2" ry="1.5" fill="none" stroke="rgba(167,139,250,0.5)" strokeWidth="0.5" />
          <text x="48" y="71" fill="rgba(167,139,250,0.7)" fontSize="2.2" fontStyle="oblique" fontFamily="monospace" textAnchor="middle">PROMOTED COSMETICS RING</text>

          {/* Billing queue zone box (top-right side) */}
          <rect x="74" y="25" width="20" height="32" fill="none" stroke="rgba(139,92,246,0.35)" strokeWidth="0.8" />
          <text x="84" y="38" fill="rgba(167,139,250,0.6)" fontSize="2.2" fontStyle="oblique" fontFamily="monospace" textAnchor="middle">BILLING CASHIER DESK</text>
          
          {/* Dead zone - Haircare specials */}
          <rect x="15" y="78" width="25" height="15" fill="none" stroke="rgba(139,92,246,0.15)" strokeWidth="0.4" strokeDasharray="1,2" />
          <text x="27.5" y="87" fill="rgba(196,181,253,0.2)" fontSize="2" fontFamily="monospace" textAnchor="middle">HAIRCARE DEAD ZONE</text>
        </svg>

        {/* Dynamic AI detection overlay targets */}
        <div className="absolute inset-0 z-20">
          {visitorsList.map((vis, idx) => {
            const coords = getVisitorCoordinates(idx, elapsed);
            const isSelected = selectedId === vis.id;
            
            const colors = [
              { border: 'border-rose-450 bg-rose-500/5', selected: 'border-purple-400 bg-purple-500/15 ring-2 ring-purple-500/40', badge: 'bg-rose-550 text-white', ping: 'bg-rose-500' },
              { border: 'border-indigo-400 bg-indigo-500/5', selected: 'border-purple-400 bg-purple-500/15 ring-2 ring-purple-500/40', badge: 'bg-indigo-600 text-white', ping: 'bg-indigo-500' },
              { border: 'border-emerald-450 bg-emerald-500/5', selected: 'border-purple-400 bg-purple-500/15 ring-2 ring-purple-500/40', badge: 'bg-emerald-600 text-white', ping: 'bg-emerald-500' },
              { border: 'border-amber-450 bg-amber-500/5', selected: 'border-purple-400 bg-purple-500/15 ring-2 ring-purple-500/40', badge: 'bg-amber-650 text-white', ping: 'bg-amber-500' },
              { border: 'border-sky-450 bg-sky-500/5', selected: 'border-purple-400 bg-purple-500/15 ring-2 ring-purple-500/40', badge: 'bg-sky-600 text-white', ping: 'bg-sky-500' }
            ];
            
            const colorTheme = colors[idx % colors.length];

            return (
              <div 
                key={vis.id}
                style={{ 
                  left: `${coords.x}%`, 
                  top: `${coords.y}%`,
                  transform: 'translate(-50%, -50%)',
                  width: `${coords.width}px`,
                  height: `${coords.height}px`
                }}
                onClick={() => setSelectedId(vis.id)}
                className={`absolute border rounded-lg transition-all duration-75 flex flex-col justify-between overflow-hidden cursor-pointer ${
                  isSelected ? colorTheme.selected : `${colorTheme.border} hover:border-purple-300`
                }`}
              >
                {/* Target Label top */}
                <div className={`absolute top-[-1px] left-[-1px] ${colorTheme.badge} text-[7.5px] font-mono px-1 py-0.5 rounded-b leading-none whitespace-nowrap select-none flex items-center gap-1.5 shadow-sm`}>
                  <span className="font-semibold">{vis.id}</span>
                  <span className="bg-black/35 px-1 rounded-[1px] font-bold">{vis.confidence}%</span>
                </div>
                
                {/* Crosshairs corners */}
                <span className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-white"></span>
                <span className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-white"></span>
                <span className="absolute bottom-0 left-0 w-1.5 h-1.5 border-b border-l border-white"></span>
                <span className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-white"></span>
                
                {isSelected && (
                  <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 ${colorTheme.ping} rounded-full animate-ping`}></div>
                )}

                <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/40 overflow-hidden">
                  <div style={{ width: `${vis.confidence}%` }} className={`h-full ${isSelected ? 'bg-purple-500' : colorTheme.ping} transition-all duration-300`}></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Video Feeds Camera HUD elements */}
        <div className="absolute top-3 left-4 tracking-tight leading-none text-[#E9E3F8] z-30 font-mono text-[9px] bg-black/50 px-2 py-1.5 rounded border border-white/10 text-left">
          <p className="font-extrabold uppercase text-purple-300">SURVEILLANCE NODE CH-0{currentFeed.id === 'entrance' ? '1' : currentFeed.id === 'aisles' ? '2' : '3'}</p>
          <p className="font-medium opacity-90 mt-0.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-emerald-555 rounded-full animate-ping"></span>
            <span>SYSTEM_LINK: FULLY_OPERATIONAL</span>
          </p>
          <p className="font-medium opacity-95 text-purple-200 mt-1 flex items-center gap-1">
            <Users className="w-3 h-3 text-purple-300" />
            <span>VISITORS IN BOUNDS: {currentFeed.visitorsCount}</span>
          </p>
        </div>

        <div className="absolute bottom-3 right-4 bg-black/70 px-2.5 py-1 rounded border border-white/10 text-white z-30 font-mono text-[10px]">
          {timestamp}
        </div>
        
        {/* Dynamic radar scanning vector sweep */}
        <div className="absolute top-0 bottom-0 left-0 w-[20%] bg-gradient-to-r from-purple-500/0 to-purple-500/10 border-r border-purple-500/20 pointer-events-none z-10 animate-pulse" style={{ animationDuration: '3.5s' }}></div>

        {/* Live CV Centroid tracking paths */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 100 100" preserveAspectRatio="none">
          {visitorsList.map((vis, idx) => {
            const coords = getVisitorCoordinates(idx, elapsed);
            const startX = 15 + (idx * 27) % 70;
            const startY = 85 - (idx * 16) % 30;
            return (
              <path 
                key={`path-${vis.id}`}
                d={`M ${startX} ${startY} Q ${startX + 5} ${startY - 15} ${coords.x} ${coords.y}`} 
                fill="none" 
                stroke={idx % 2 === 0 ? "rgba(244,63,94,0.3)" : "rgba(124,58,237,0.3)"} 
                strokeWidth="0.4" 
                strokeDasharray={idx % 2 === 0 ? "1,1" : "none"} 
              />
            );
          })}
        </svg>

      </div>

      {/* Camera Mode Settings Footer */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center bg-purple-50/50 border-t border-purple-100 px-4 py-3 gap-3 text-xs text-purple-950 font-mono">
        <div className="flex gap-1.5 overflow-x-auto">
          <button 
            onClick={() => setActiveTab('rgb')}
            className={`px-3 py-1 rounded-lg border text-[10px] tracking-wider transition-all ${
              activeTab === 'rgb' 
                ? 'bg-purple-600 border-purple-600 text-white font-bold' 
                : 'bg-white border-purple-150 text-purple-700 hover:bg-purple-100/50'
            }`}
          >
            RGB OPTICAL
          </button>
          <button 
            onClick={() => setActiveTab('ir')}
            className={`px-3 py-1 rounded-lg border text-[10px] tracking-wider transition-all ${
              activeTab === 'ir' 
                ? 'bg-purple-600 border-purple-600 text-white font-bold' 
                : 'bg-white border-purple-150 text-purple-700 hover:bg-purple-100/50'
            }`}
          >
            FLIR INFRARED
          </button>
          <button 
            onClick={() => setActiveTab('depth')}
            className={`px-3 py-1 rounded-lg border text-[10px] tracking-wider transition-all ${
              activeTab === 'depth' 
                ? 'bg-purple-600 border-purple-600 text-white font-bold' 
                : 'bg-white border-purple-150 text-purple-700 hover:bg-purple-100/50'
            }`}
          >
            SPATIAL DEPTH
          </button>
        </div>

        <div className="flex items-center justify-between md:justify-end gap-3.5">
          <button 
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-purple-200 bg-white text-purple-700 hover:bg-purple-600 hover:text-white transition-all active:scale-95 cursor-pointer font-bold text-[10px]"
            title="Download Live Detection Telemetry (JSON)"
          >
            <Download className="w-3.5 h-3.5" />
            <span>DOWNLOAD TELEMETRY</span>
          </button>
        </div>
      </div>

      {/* Visitor monitoring details panel — Highly Interactive */}
      <div className="border-t border-purple-105 p-4 bg-gradient-to-br from-white to-purple-50/20">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users className="w-4.5 h-4.5 text-purple-600" />
            <h4 className="text-xs font-bold text-purple-950 uppercase tracking-tight">Active Visitor Trajectory Monitor</h4>
          </div>
          <span className="text-[10px] font-mono text-purple-600 bg-purple-100/70 border border-purple-200/50 px-2 py-0.5 rounded-md">
            Selected: <span className="font-extrabold">{selectedId || 'None'}</span>
          </span>
        </div>

        {/* Visitors loop list */}
        <div className="max-h-[220px] overflow-y-auto pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {visitorsList.map((vis, idx) => {
              const coords = getVisitorCoordinates(idx, elapsed);
              const isSelected = selectedId === vis.id;
              
              const textColors = isSelected 
                ? 'text-white' 
                : 'text-purple-950';
              
              const badgeBg = isSelected
                ? 'bg-white/20 text-white'
                : idx % 3 === 0 
                  ? 'bg-rose-50 text-rose-600' 
                  : idx % 3 === 1 
                    ? 'bg-indigo-50 text-indigo-650' 
                    : 'bg-emerald-50 text-emerald-650';

              const badgeLabel = idx % 3 === 0 
                ? 'SHOPPER' 
                : idx % 3 === 1 
                  ? 'GUEST' 
                  : 'STAFF/OPERATOR';

              return (
                <div 
                  key={vis.id}
                  onClick={() => setSelectedId(vis.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-purple-600 border-purple-600 text-white shadow-md shadow-purple-100'
                      : 'bg-white border-purple-100 text-purple-950 hover:bg-purple-50/50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2 font-mono">
                    <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md ${badgeBg}`}>
                      {badgeLabel}_{vis.id.split('_')[1]}
                    </span>
                    <span className="text-[9px] opacity-80">Coord: {coords.x.toFixed(0)}%, {coords.y.toFixed(0)}%</span>
                  </div>
                  <div className="space-y-1">
                    <p className={`text-xs font-semibold leading-snug ${textColors}`}>{vis.zone}</p>
                    <div className="flex justify-between text-[10px] opacity-90 font-mono">
                      <span>Dwell duration:</span>
                      <span className="font-bold">{vis.dwell}</span>
                    </div>
                    <div className="flex justify-between text-[10px] opacity-90 font-mono">
                      <span>Confidence:</span>
                      <span className="font-bold">{vis.confidence}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detailed state telemetry box for selected entity */}
        {selectedId && (
          <div className="mt-3 bg-purple-50/30 border border-purple-100 rounded-xl p-3 text-xs text-purple-950 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping"></span>
              <span className="font-bold text-xs uppercase text-purple-900">{selectedId} Profile:</span>
              <span className="text-purple-700">Real-time vector trajectory tracing sync with spatial database</span>
            </div>
            <button
              onClick={() => alert(`Operational alert logged to senior analyst dashboard for visitor ${selectedId}`)}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold font-mono text-[10px] px-3 py-1 rounded-lg border border-purple-600 cursor-pointer shadow-sm ml-auto sm:ml-0"
            >
              LOG OPERATOR FLAG
            </button>
          </div>
        )}
      </div>

    </div>
  );
};

