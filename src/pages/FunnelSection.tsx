import React from 'react';
import { useStore } from '../context/StoreContext';
import { 
  Filter, 
  ArrowRight, 
  TrendingDown, 
  ShoppingBag, 
  Users, 
  Calculator,
  UserCheck,
  Percent
} from 'lucide-react';

export const FunnelSection: React.FC = () => {
  const { funnel, heatmap, activeStore } = useStore();

  const totalEntries = funnel[0]?.count || 1000;
  const lastStep = funnel[funnel.length - 1];
  const totalConversionYield = funnel.length > 0 && totalEntries > 0
    ? ((lastStep.count / totalEntries) * 100).toFixed(2)
    : "32.47";

  const averageMap: Record<string, string> = {
    'ny-5th': '29.5%',
    'ldn-oxford': '35.2%',
    'tyo-shibuya': '33.8%',
    'cosmetics-retail': '24.5%'
  };
  const storeAverage = averageMap[activeStore.id] || '30.0%';

  // Find the highest leakage step (drop off rate)
  let maxDropOffValue = 0;
  let maxDropOffName = "Billing Queue Entry";
  let maxDropOffPercentage = "43.7%";

  for (let idx = 1; idx < funnel.length; idx++) {
    const prev = funnel[idx - 1];
    const curr = funnel[idx];
    const dropPercent = prev.count > 0 ? ((prev.count - curr.count) / prev.count) * 100 : 0;
    if (dropPercent > maxDropOffValue) {
      maxDropOffValue = dropPercent;
      maxDropOffName = `${curr.name} Step`;
      maxDropOffPercentage = `${dropPercent.toFixed(1)}%`;
    }
  }

  // Recommendation based on highest drop off or queue dwell time
  const queueZone = heatmap.find(z => 
    z.name.toLowerCase().includes('queue') || 
    z.name.toLowerCase().includes('cashier') || 
    z.name.toLowerCase().includes('billing')
  );
  const queueDwell = queueZone?.avgDwellTime || '4m 50s';

  const recommendationText = queueZone && parseFloat(queueDwell) > 0
    ? `Visual processing exhibits high queue dwell limits (${queueDwell}) inside "${queueZone.name}". Expanding active checkout terminals or deploying self-purchase terminals would immediately reduce client abandonment.`
    : `High leakage observed around the "${maxDropOffName}" with a ${maxDropOffPercentage} drop-off rate. Optimizing navigation layouts and checkout staffing for high-leakage zones is recommended.`;

  return (
    <div className="space-y-6 font-sans text-purple-950 animate-fadeIn bg-transparent pb-10">
      {/* Immersive Subheader */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-purple-950 tracking-tight">Conversion Funnel Analytics</h2>
        <p className="text-xs text-purple-705">
          Granular analysis of raw customer conversion, drop-offs, and store checkout efficiency at <span className="text-purple-750 font-extrabold">{activeStore.name}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Full Size Visual Funnel Stepper Card */}
        <div className="lg:col-span-2 bg-white border border-purple-100 rounded-xl p-5 md:p-6 space-y-6 shadow-xs">
          <h3 className="font-bold text-purple-950 text-sm flex items-center gap-2">
            <Filter className="w-4.5 h-4.5 text-purple-600" />
            <span>Interactive Funnel Ratios</span>
          </h3>

          <div className="space-y-4">
            {funnel.map((step, idx) => {
              const previousStep = idx > 0 ? funnel[idx - 1] : null;
              const ratioOfTotal = ((step.count / totalEntries) * 100).toFixed(1);
              const ratioOfPrev = previousStep 
                ? ((step.count / previousStep.count) * 100).toFixed(1) 
                : "100.0";
              const dropOff = previousStep 
                ? (100 - parseFloat(ratioOfPrev)).toFixed(1) 
                : "0.0";

              // Width sizing for styled stepper funnel look
              const stepWidths = ["w-full", "w-[80%]", "w-[60%]", "w-[44%]"];
              const bgTones = [
                "bg-purple-600 border-purple-700 text-white", 
                "bg-purple-500 border-purple-600 text-white", 
                "bg-purple-400 border-purple-300 text-purple-950", 
                "bg-emerald-600 border-emerald-500 text-white font-bold"
              ];

              return (
                <div key={idx} className="space-y-2">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-1.5 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded bg-purple-50 border border-purple-200 flex items-center justify-center font-mono font-bold text-purple-700 text-[10px]">
                        0{idx + 1}
                      </span>
                      <span className="font-extrabold text-purple-950 text-sm">{step.name}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] text-purple-500 font-bold">
                      <span>Volume: <strong className="text-purple-900 bg-purple-50 px-1.5 py-0.2 rounded border border-purple-100">{step.count}</strong></span>
                      <span>•</span>
                      <span>Total: <strong className="text-purple-600">{ratioOfTotal}%</strong></span>
                      {idx > 0 && (
                        <>
                          <span>•</span>
                          <span>Retention: <strong className="text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-100">{ratioOfPrev}%</strong></span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Funnel step progress column bar */}
                  <div className="flex items-center gap-3">
                    <div className="flex-grow bg-purple-50 border border-purple-100 h-9 rounded-lg overflow-hidden flex items-center p-0.5">
                      <div className={`h-full ${stepWidths[idx]} ${bgTones[idx]} rounded px-4 font-mono font-bold text-xs flex items-center justify-end shadow-sm border`}>
                        {ratioOfTotal}%
                      </div>
                    </div>

                    {idx > 0 && (
                      <div className="w-24 flex items-center gap-1 bg-red-50 border border-red-200 px-2 py-1.5 rounded-lg text-[10px] font-mono text-red-700 font-extrabold shadow-xxs">
                        <TrendingDown className="w-3.5 h-3.5 text-red-505" />
                        <span>-{dropOff}% Loss</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Funnel Summary Intelligence Panel */}
        <div className="bg-white border border-purple-100 rounded-xl p-5 md:p-6 flex flex-col gap-5 justify-between shadow-xs">
          <div className="space-y-4">
            <h3 className="font-bold text-purple-950 text-sm border-b border-purple-100 pb-2">
              Funnel Health Insights
            </h3>

            <div className="space-y-4">
              {/* Stat Card */}
              <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100 flex items-center gap-3.5">
                <div className="p-2 bg-purple-100 text-purple-700 rounded-lg border border-purple-200">
                  <Users className="w-4.5 h-4.5" />
                </div>
                <div>
                  <p className="text-[10px] font-mono uppercase text-purple-400 font-bold leading-none">Total Conversion Yield</p>
                  <p className="text-lg font-bold font-mono text-purple-950 mt-1">{totalConversionYield}%</p>
                  <p className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 border border-emerald-100 rounded-full mt-1 inline-block">{activeStore.name} average: {storeAverage}</p>
                </div>
              </div>

              {/* Step drop off metrics */}
              <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100 flex items-center gap-3.5">
                <div className="p-2 bg-red-100 text-red-650 rounded-lg border border-red-200">
                  <Calculator className="w-4.5 h-4.5 text-red-600" />
                </div>
                <div>
                  <p className="text-[10px] font-mono uppercase text-purple-400 font-bold leading-none">Highest Leakage Zone</p>
                  <p className="text-lg font-bold font-mono text-red-700 mt-1">{maxDropOffName}</p>
                  <p className="text-[10px] text-red-650 mt-0.5 font-semibold">Holds {maxDropOffPercentage} drop-off rate</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-purple-50 border border-purple-150 rounded-lg text-xs text-purple-800 leading-relaxed font-semibold">
            💡 <strong>Recommendation:</strong> {recommendationText}
          </div>
        </div>

      </div>
    </div>
  );
};
