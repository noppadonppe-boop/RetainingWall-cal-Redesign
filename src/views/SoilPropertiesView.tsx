import { useWallStore } from '../store/useWallStore';
import { Layers, Mountain } from 'lucide-react';
import { runCalculations } from '../utils/calculationEngine';

export const SoilPropertiesView = () => {
  const store = useWallStore();
  const results = runCalculations(store);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    store.updateSoilProperties({
      [e.target.name]: parseFloat(e.target.value) || 0,
    });
  };

  return (
    <div className="max-w-[1280px] mx-auto px-10 py-10">
      <header className="mb-8 flex justify-between items-end border-b border-border-card pb-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-sans">Soil Properties</h1>
          <p className="text-sm text-slate-500 mt-1 font-sans">Configure backfill and foundation soil parameters.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input Forms */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Backfill Soil Card */}
          <div className="bg-surface border border-border-card rounded-2xl p-6 relative overflow-hidden group focus-within:ring-2 focus-within:ring-primary focus-within:shadow-[0_0_8px_rgba(30,64,175,0.1)] transition-shadow">
            <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-primary"></div>
            <h2 className="text-xl font-bold text-slate-900 mb-4 font-sans flex items-center gap-2">
              <Layers className="w-5 h-5 text-primary fill-primary" />
              Retained Soil (Backfill)
            </h2>
            
            <div className="flex flex-col gap-4">
              <div>
                <label className="label-caps text-slate-500 block mb-1">Unit Weight (γ)</label>
                <div className="relative flex items-center border border-border-card rounded-2xl bg-surface focus-within:border-primary transition-all focus-within:shadow-[0_0_0_2px_rgba(30,64,175,0.1)]">
                  <input 
                    name="unitWeight"
                    type="number" 
                    className="w-full bg-transparent border-none focus:ring-0 font-mono text-slate-900 py-2 pl-3 pr-16 outline-none"
                    value={store.soilProperties.unitWeight}
                    onChange={handleChange}
                  />
                  <span className="absolute right-3 font-mono text-slate-400">kg/m³</span>
                </div>
              </div>

              <div>
                <label className="label-caps text-slate-500 block mb-1">Internal Friction Angle (φ)</label>
                <div className="relative flex items-center border border-border-card rounded-2xl bg-surface focus-within:border-primary transition-all focus-within:shadow-[0_0_0_2px_rgba(30,64,175,0.1)]">
                  <input 
                    name="internalFrictionAngle"
                    type="number" 
                    className="w-full bg-transparent border-none focus:ring-0 font-mono text-slate-900 py-2 pl-3 pr-10 outline-none"
                    value={store.soilProperties.internalFrictionAngle}
                    onChange={handleChange}
                  />
                  <span className="absolute right-3 font-mono text-slate-400">deg</span>
                </div>
              </div>
            </div>
          </div>

          {/* Foundation Soil Card */}
          <div className="bg-surface border border-border-card rounded-2xl p-6 hover:shadow-soft-glow transition-shadow focus-within:ring-2 focus-within:ring-primary focus-within:shadow-[0_0_8px_rgba(30,64,175,0.1)]">
            <h2 className="text-xl font-bold text-slate-900 mb-4 font-sans flex items-center gap-2">
              <Mountain className="w-5 h-5 text-slate-400" />
              Foundation Soil
            </h2>
            
            <div className="flex flex-col gap-4">
              <div>
                <label className="label-caps text-slate-500 block mb-1">Allowable Bearing Pressure</label>
                <div className="relative flex items-center border border-border-card rounded-2xl bg-surface focus-within:border-primary transition-all focus-within:shadow-[0_0_0_2px_rgba(30,64,175,0.1)]">
                  <input 
                    name="allowableBearingPressure"
                    type="number" 
                    className="w-full bg-transparent border-none focus:ring-0 font-mono text-slate-900 py-2 pl-3 pr-14 outline-none"
                    value={store.soilProperties.allowableBearingPressure}
                    onChange={handleChange}
                  />
                  <span className="absolute right-3 font-mono text-slate-400">kg/cm²</span>
                </div>
              </div>

              <div>
                <label className="label-caps text-slate-500 block mb-1">Base Friction Coefficient (μ)</label>
                <div className="relative flex items-center border border-border-card rounded-2xl bg-surface focus-within:border-primary transition-all focus-within:shadow-[0_0_0_2px_rgba(30,64,175,0.1)]">
                  <input 
                    name="frictionCoefficient"
                    type="number" 
                    step="0.05"
                    className="w-full bg-transparent border-none focus:ring-0 font-mono text-slate-900 py-2 pl-3 pr-10 outline-none"
                    value={store.soilProperties.frictionCoefficient}
                    onChange={handleChange}
                  />
                  <span className="absolute right-3 font-mono text-slate-400">-</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Visualization / Diagram */}
        <div className="lg:col-span-7 flex flex-col h-full">
          <div className="bg-[#F1F5F9] border border-border-card rounded-2xl p-4 flex-1 flex flex-col min-h-[500px] relative overflow-hidden shadow-sm">
            <div className="absolute top-4 left-4 bg-surface/80 backdrop-blur px-3 py-1.5 rounded-2xl border border-border-card z-10 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              <span className="label-caps text-slate-900">Live Stratigraphy</span>
            </div>
            
            {/* Diagram Area */}
            <div className="flex-1 w-full h-full border-2 border-dashed border-border-card rounded-2xl flex items-center justify-center relative bg-gradient-to-b from-slate-200/30 to-slate-300/30">
              
              <div className="text-center opacity-60">
                <Layers className="w-10 h-10 mx-auto mb-2 text-slate-500" />
                <p className="font-mono text-slate-600">2D Profile Render Engine</p>
                <p className="label-caps text-slate-500 mt-1">Live from calculation engine...</p>
              </div>

              {/* Mock Wall Profile Vectors */}
              <div className="absolute bottom-[20%] left-1/4 w-1/2 h-[40%] border-l-4 border-b-8 border-slate-700 opacity-80" style={{ clipPath: 'polygon(0 0, 10% 0, 10% 90%, 100% 90%, 100% 100%, 0 100%)' }}></div>
              
              {/* Mock Soil Strata Lines */}
              <div className="absolute top-1/4 right-0 w-3/4 h-px bg-primary border-t border-dashed border-primary/50"></div>
              <div className="absolute right-4 top-[22%] font-mono text-primary text-[10px]">Backfill (γ={store.soilProperties.unitWeight})</div>
              
              <div className="absolute bottom-[20%] right-0 w-full h-px bg-slate-400 border-t border-dashed border-slate-400"></div>
              <div className="absolute left-4 bottom-[17%] font-mono text-slate-500 text-[10px]">Foundation (q_all={store.soilProperties.allowableBearingPressure})</div>
            </div>

            {/* Diagram Legend/Data Overlay */}
            <div className="mt-4 bg-surface border border-border-card rounded-2xl p-4 grid grid-cols-2 gap-4">
              <div>
                <div className="label-caps text-slate-500 mb-1">Active Pressure Coefficient (Ka)</div>
                <div className="font-mono text-lg text-slate-900">{results.loads.Ka.toFixed(4)}</div>
              </div>
              <div>
                <div className="label-caps text-slate-500 mb-1">Active Pressure (Pa)</div>
                <div className="font-mono text-lg text-slate-900">{results.loads.Pa.toFixed(0)} kg</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
