import React, { useState, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import { CameraPreview } from '../components/CameraPreview';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { 
  Video, 
  Map, 
  Receipt, 
  Play, 
  FileCode, 
  FileSpreadsheet, 
  CheckCircle, 
  RefreshCw,
  AlertCircle
} from 'lucide-react';

interface BandwidthChartProps {
  fileSize: number;
}

const BandwidthChart: React.FC<BandwidthChartProps> = ({ fileSize }) => {
  const fileSizeMB = fileSize / (1024 * 1024);
  const data = React.useMemo(() => {
    const points = [];
    const durationSeconds = 60;
    // Base average Mbps calculated from file size
    const averageMbps = Math.min(15, Math.max(1.8, (fileSizeMB * 6) / durationSeconds));
    
    for (let i = 0; i <= durationSeconds; i += 5) {
      const noise = Math.sin(i / 10) * (averageMbps * 0.25) + Math.cos(i / 4) * (averageMbps * 0.1);
      const spike = i >= 20 && i <= 35 ? (averageMbps * 0.5) : 0;
      const value = Math.max(0.4, parseFloat((averageMbps + noise + spike).toFixed(2)));
      
      points.push({
        time: `${i}s`,
        bandwidth: value,
      });
    }
    return points;
  }, [fileSizeMB]);

  return (
    <div className="bg-purple-50/20 border border-purple-150 rounded-xl p-4 mt-1.5 space-y-3">
      <div className="flex justify-between items-center">
        <div>
          <h4 className="text-xs font-bold text-purple-950 tracking-tight flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-pulse"></span>
            Estimated Bandwidth Load Projections
          </h4>
          <p className="text-[10px] text-purple-600 font-mono">
            Derived ingest stream load for {fileSizeMB.toFixed(2)} MB video size
          </p>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-mono text-purple-700 bg-white px-2 py-0.5 rounded border border-purple-150 font-bold">
            Resolution: {data.length} periods
          </span>
        </div>
      </div>

      <div className="h-28 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="bandwidthGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(139,92,246,0.06)" />
            <XAxis 
              dataKey="time" 
              stroke="#a855f7" 
              fontSize={8} 
              tickLine={false} 
              axisLine={false}
            />
            <YAxis 
              stroke="#a855f7" 
              fontSize={8} 
              tickLine={false} 
              axisLine={false} 
              unit="M"
            />
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white border border-purple-100 p-2.5 rounded-lg text-[10px] font-mono shadow-md text-purple-950">
                      <p className="text-purple-950 font-bold mb-0.5 text-[9px]">Timeline: {payload[0].payload.time}</p>
                      <p className="text-purple-600 font-extrabold">Load: {payload[0].value} Mbps</p>
                      <p className="text-purple-500">Ratio: {((payload[0].value as number) / fileSizeMB).toFixed(3)} M/MB</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area 
              type="monotone" 
              dataKey="bandwidth" 
              stroke="#8b5cf6" 
              strokeWidth={1.5}
              fillOpacity={1} 
              fill="url(#bandwidthGlow)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex justify-between items-center text-[9px] text-purple-500 border-t border-purple-100 pt-2 font-mono">
        <span>Min: {Math.min(...data.map(d => d.bandwidth))} Mbps</span>
        <span>Avg: {(data.reduce((acc, d) => acc + d.bandwidth, 0) / data.length).toFixed(1)} Mbps</span>
        <span>Max: {Math.max(...data.map(d => d.bandwidth))} Mbps</span>
      </div>
    </div>
  );
};

export const UploadSection: React.FC = () => {
  const { startJob, activeStore } = useStore();

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [layoutFile, setLayoutFile] = useState<File | null>(null);
  const [posFile, setPosFile] = useState<File | null>(null);
  
  const [camera, setCamera] = useState<string>('Entry Camera - Main Z1');
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [demoLoaded, setDemoLoaded] = useState<boolean>(false);

  const [errorText, setErrorText] = useState<string | null>(null);

  const videoInputRef = useRef<HTMLInputElement>(null);
  const layoutInputRef = useRef<HTMLInputElement>(null);
  const posInputRef = useRef<HTMLInputElement>(null);

  // Drag handler
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext && ['mp4', 'avi', 'mov'].includes(ext)) {
        setVideoFile(file);
        setErrorText(null);
      } else {
        setErrorText("Invalid format. Please drag or select an MP4, AVI, or MOV video stream.");
      }
    }
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setVideoFile(e.target.files[0]);
      setErrorText(null);
    }
  };

  const loadDemoTelemetry = () => {
    // Generate simulated File objects to let users run instantly
    const dummyVideo = new File(["video"], "CAM 1.mp4", { type: "video/mp4" });
    const dummyLayoutData = JSON.stringify({
      zones: [
        { id: 'z1', name: 'Skincare', polygon: [[10, 10], [40, 10], [40, 40], [10, 40]] },
        { id: 'z2', name: 'Makeup', polygon: [[45, 10], [80, 10], [80, 40], [45, 40]] },
        { id: 'z3', name: 'Haircare', polygon: [[10, 45], [40, 45], [40, 75], [10, 75]] },
        { id: 'z4', name: 'Fragrance', polygon: [[45, 45], [80, 45], [80, 75], [45, 75]] },
        { id: 'z5', name: 'Billing Queue', polygon: [[20, 80], [70, 80], [70, 95], [20, 95]] }
      ]
    });
    const dummyLayout = new File([dummyLayoutData], "store_402_layout_v2.json", { type: "application/json" });
    const dummyPosData = "timestamp,amount,transaction_id\n14:02:15,45.50,TXN-101\n14:05:30,89.99,TXN-102\n14:12:00,12.50,TXN-103";
    const dummyPos = new File([dummyPosData], "daily_transactions_may31.csv", { type: "text/csv" });

    setVideoFile(dummyVideo);
    setLayoutFile(dummyLayout);
    setPosFile(dummyPos);
    setDemoLoaded(true);
    setErrorText(null);
  };

  const resetUploads = () => {
    setVideoFile(null);
    setLayoutFile(null);
    setPosFile(null);
    setDemoLoaded(false);
    setErrorText(null);
  };

  const handleStartAnalysis = () => {
    let currentVideo = videoFile;
    let currentLayout = layoutFile;
    let currentPos = posFile;

    if (!currentVideo) {
      // Auto-load high-fidelity demo video and layout definitions so the user is never blocked
      const dummyVideo = new File(["video"], "CAM 1.mp4", { type: "video/mp4" });
      const dummyLayoutData = JSON.stringify({
        zones: [
          { id: 'z1', name: 'Skincare', polygon: [[10, 10], [40, 10], [40, 40], [10, 40]] },
          { id: 'z2', name: 'Makeup', polygon: [[45, 10], [80, 10], [80, 40], [45, 40]] },
          { id: 'z3', name: 'Haircare', polygon: [[10, 45], [40, 45], [40, 75], [10, 75]] },
          { id: 'z4', name: 'Fragrance', polygon: [[45, 45], [80, 45], [80, 75], [45, 75]] },
          { id: 'z5', name: 'Billing Queue', polygon: [[20, 80], [70, 80], [70, 95], [20, 95]] }
        ]
      });
      const dummyLayout = new File([dummyLayoutData], "store_402_layout_v2.json", { type: "application/json" });
      const dummyPosData = "timestamp,amount,transaction_id\n14:02:15,45.50,TXN-101\n14:05:30,89.99,TXN-102\n14:12:00,12.50,TXN-103";
      const dummyPos = new File([dummyPosData], "daily_transactions_may31.csv", { type: "text/csv" });

      currentVideo = dummyVideo;
      currentLayout = dummyLayout;
      currentPos = dummyPos;

      setVideoFile(dummyVideo);
      setLayoutFile(dummyLayout);
      setPosFile(dummyPos);
      setDemoLoaded(true);
    }
    
    setErrorText(null);

    // Launch job
    startJob(
      currentVideo,
      currentLayout,
      currentPos,
      camera
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4 font-sans text-purple-950 animate-fadeIn bg-transparent pb-10">
      {/* Intro info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-purple-950 mb-2">Upload Store Footage</h2>
          <p className="text-purple-800/80 text-sm max-w-2xl leading-relaxed">
            Submit surveillance cameras streams, store visual configurations, and point-of-sale timestamps to process live foot-traffic counts, heatmaps, and checkout queues.
          </p>
        </div>

        {/* Diagnostic pipeline instant demo button */}
        <button
          id="btn-demo-telemetry"
          onClick={demoLoaded ? resetUploads : loadDemoTelemetry}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all cursor-pointer shadow-xs ${
            demoLoaded 
              ? 'bg-purple-100 border-purple-300 text-purple-700' 
              : 'bg-white border-purple-200 text-purple-700 hover:text-purple-950 hover:bg-purple-50'
          }`}
        >
          {demoLoaded ? <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-600" /> : <Play className="w-3.5 h-3.5 text-purple-600" />}
          <span>{demoLoaded ? 'Reset Pipeline Upload' : 'Load Instant Telemetry Demo'}</span>
        </button>
      </div>

      {errorText && (
        <div id="upload-error-banner" className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm animate-pulse">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
          <span>{errorText}</span>
        </div>
      )}

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Drag & Drop Column (Video) */}
        <div className="lg:col-span-2 flex flex-col">
          <div className="bg-white border border-purple-100 rounded-xl p-5 flex flex-col flex-grow min-h-[340px] shadow-xs">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-purple-950">Upload CCTV Video</h3>
              </div>
              <span className="text-[10px] font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-150">
                MP4, AVI, MOV Support
              </span>
            </div>

            {/* Drag Zone */}
            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => videoInputRef.current?.click()}
              className={`flex-1 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-6 text-center transition-all cursor-pointer group ${
                dragActive 
                  ? 'border-purple-550 bg-purple-100' 
                  : 'border-purple-150 hover:border-purple-400 hover:bg-purple-50/20'
              }`}
            >
              <input 
                ref={videoInputRef}
                type="file"
                accept=".mp4,.avi,.mov"
                onChange={handleVideoSelect}
                className="hidden"
              />

              {videoFile ? (
                <div className="w-full flex flex-col gap-4" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-between items-center bg-purple-50/40 p-2.5 rounded-lg border border-purple-100 text-xs">
                    <div className="flex items-center gap-2 truncate text-purple-950">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></div>
                      <span className="font-bold text-purple-950 truncate font-semibold text-purple-900">{videoFile.name}</span>
                      <span className="text-purple-500 text-[10px] font-mono shrink-0">({(videoFile.size / (1024 * 1024)).toFixed(2)} MB)</span>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setVideoFile(null); }}
                      className="text-red-700 hover:text-red-800 font-mono text-[10px] uppercase font-bold bg-red-50 border border-red-200 px-3 py-1 rounded-lg transition-all hover:bg-red-100 cursor-pointer shrink-0"
                    >
                      Delete Source
                    </button>
                  </div>
                  <CameraPreview storeId={activeStore.id} videoFile={videoFile} />
                  <BandwidthChart fileSize={videoFile.size} />
                </div>
              ) : (
                <div className="flex flex-col items-center py-6">
                  <div className="w-14 h-14 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100 mb-4 group-hover:scale-105 group-hover:border-purple-300 transition-all shadow-xs">
                    <Video className="w-6 h-6 text-purple-500 group-hover:text-purple-600" />
                  </div>
                  <p className="font-bold text-purple-900 text-sm mb-1">Drag & Drop Video File Here</p>
                  <p className="text-purple-550 text-xs mb-3">or click to browse local computer storage</p>
                  <span className="px-4 py-1.5 bg-white border border-purple-200 rounded-lg text-xs font-bold text-purple-700 hover:bg-purple-50 shadow-xs">
                    Browse File
                  </span>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Right Secondary Columns */}
        <div className="flex flex-col gap-6">

          {/* Store Layout Upload */}
          <div className="bg-white border border-purple-100 rounded-xl p-5 flex-1 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <Map className="w-4.5 h-4.5 text-purple-600" />
                  <h3 className="font-bold text-purple-900 text-sm">Upload Store Layout</h3>
                </div>
                <span className="text-[10px] font-mono font-bold text-purple-550">JSON</span>
              </div>
              <p className="text-purple-700/80 text-xs mb-3">Provide a grid definition document mapping checkout paths to zones.</p>
            </div>

            <div 
              onClick={() => layoutInputRef.current?.click()}
              className="border border-dashed border-purple-150 rounded-xl p-3 text-center cursor-pointer hover:bg-purple-50/30 hover:border-purple-400 transition-all flex flex-col items-center justify-center gap-1.5"
            >
              <input 
                ref={layoutInputRef}
                type="file"
                accept=".json"
                onChange={(e) => e.target.files && setLayoutFile(e.target.files[0])}
                className="hidden"
              />
              {layoutFile ? (
                <>
                  <FileCode className="w-5 h-5 text-emerald-600" />
                  <span className="text-xs font-bold text-purple-900 truncate max-w-[180px]">{layoutFile.name}</span>
                </>
              ) : (
                <>
                  <FileCode className="w-5 h-5 text-purple-400" />
                  <span className="text-xs text-purple-600 font-bold">Attach Layout Definition</span>
                </>
              )}
            </div>
          </div>

          {/* POS Transactions Upload */}
          <div className="bg-white border border-purple-100 rounded-xl p-5 flex-1 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <Receipt className="w-4.5 h-4.5 text-purple-600" />
                  <h3 className="font-bold text-purple-900 text-sm">Upload POS Transactions</h3>
                </div>
                <span className="text-[10px] font-mono font-bold text-purple-555">CSV</span>
              </div>
              <p className="text-purple-700/80 text-xs mb-3">Include purchase ticket logs to evaluate exact transaction conversion offsets.</p>
            </div>

            <div 
              onClick={() => posInputRef.current?.click()}
              className="border border-purple-150 border-dashed rounded-xl p-3 text-center cursor-pointer hover:bg-purple-50/30 hover:border-purple-400 transition-all flex flex-col items-center justify-center gap-1.5"
            >
              <input 
                ref={posInputRef}
                type="file"
                accept=".csv"
                onChange={(e) => e.target.files && setPosFile(e.target.files[0])}
                className="hidden"
              />
              {posFile ? (
                <>
                  <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                  <span className="text-xs font-bold text-purple-900 truncate max-w-[180px]">{posFile.name}</span>
                </>
              ) : (
                <>
                  <FileSpreadsheet className="w-5 h-5 text-purple-400" />
                  <span className="text-xs text-purple-600 font-bold">Attach POS Transaction Log</span>
                </>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Target Store & Camera selection stripe */}
      <div className="bg-white border border-purple-100 rounded-xl p-5 flex flex-col md:flex-row justify-between items-end md:items-center gap-4 shadow-xs">
        
        {/* Selected Store Indicator info */}
        <div className="flex-grow space-y-1">
          <span className="text-[10px] font-mono uppercase text-purple-500 font-bold tracking-wider">Configured Target Store</span>
          <p className="text-base font-bold text-purple-900">{activeStore.name}</p>
          <p className="text-purple-650 text-xs">{activeStore.location}</p>
        </div>

        {/* Camera Selector dropdown */}
        <div className="w-full md:w-64">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-purple-400 font-mono mb-1.5">
            Surveillance Camera Selector
          </label>
          <select
            id="camera-dropdown-selection"
            value={camera}
            onChange={(e) => setCamera(e.target.value)}
            className="w-full bg-purple-50 border border-purple-200 rounded-lg px-3 py-2 text-xs font-semibold text-purple-950 focus:ring-1 focus:ring-purple-400 focus:outline-none cursor-pointer"
          >
            <option value="Entry Camera - Main Z1" className="bg-white text-purple-950">Entry Camera - Main Entrance Z1</option>
            <option value="Floor Camera - Aisle 4" className="bg-white text-purple-950">Floor Camera - Cosmetic Aisle 4</option>
            <option value="Billing Camera - Lane 2" className="bg-white text-purple-950">Billing Camera - Lanes 1 & 2</option>
          </select>
        </div>

        {/* Start Analysis Launch CTA Button */}
        <button
          id="btn-start-analysis"
          onClick={handleStartAnalysis}
          className="w-full md:w-auto bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-2.5 rounded-lg text-sm tracking-wide uppercase transition-all flex items-center justify-center gap-2 hover:scale-[1.01] cursor-pointer shadow-md shadow-purple-100"
        >
          <Play className="w-4 h-4 fill-white stroke-white" />
          <span>Start AI Pipeline</span>
        </button>

      </div>
    </div>
  );
};
