import React from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { UploadSection } from './pages/UploadSection';
import { ProcessingSection } from './pages/ProcessingSection';
import { DashboardSection } from './pages/DashboardSection';
import { FunnelSection } from './pages/FunnelSection';
import { HeatmapSection } from './pages/HeatmapSection';
import { LiveEventsSection } from './pages/LiveEventsSection';
import { AnomaliesSection } from './pages/AnomaliesSection';
import { SystemHealthSection } from './pages/SystemHealthSection';

const MainLayout: React.FC = () => {
  const { activeTab } = useStore();

  const renderActiveSection = () => {
    switch (activeTab) {
      case 'upload':
        return <UploadSection />;
      case 'processing':
        return <ProcessingSection />;
      case 'dashboard':
        return <DashboardSection />;
      case 'funnel':
        return <FunnelSection />;
      case 'heatmap':
        return <HeatmapSection />;
      case 'events':
        return <LiveEventsSection />;
      case 'anomalies':
        return <AnomaliesSection />;
      case 'health':
        return <SystemHealthSection />;
      default:
        return <UploadSection />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#FBF9FE] font-sans text-purple-950 antialiased relative">
      
      {/* Sidebar - Desktop Left Pane */}
      <Sidebar />

      {/* Main Core Viewport Panel */}
      <div className="flex-grow lg:ml-64 flex flex-col h-full bg-gradient-to-tr from-[#FAF8FE] via-[#F5F2FA] to-[#FAF8FE] overflow-hidden relative">
        
        {/* Ambient light grids overlaying the background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(124,58,237,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(124,58,237,0.015)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none z-0"></div>


        {/* Header App Menu */}
        <Header />

        {/* Scrollable View Content */}
        <main className="flex-grow overflow-y-auto p-4 md:p-6 z-10">
          <div className="max-w-7xl mx-auto">
            {renderActiveSection()}
          </div>
        </main>
      </div>

    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <MainLayout />
    </StoreProvider>
  );
}
