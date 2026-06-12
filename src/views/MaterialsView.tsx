import { useWallStore } from '../store/useWallStore';
import { Settings2 } from 'lucide-react';
import { runCalculations } from '../utils/calculationEngine';

export const MaterialsView = () => {
  const store = useWallStore();
  const results = runCalculations(store);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    store.updateMaterials({
      [e.target.name]: parseFloat(e.target.value) || 0,
    });
  };

  return (
    <div className="max-w-[1280px] mx-auto px-10 py-10">
      <header className="mb-8 flex justify-between items-end border-b border-border-card pb-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-sans">Materials</h1>
          <p className="text-sm text-slate-500 mt-1 font-sans">Configure concrete and steel properties.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-surface border border-border-card rounded-2xl p-6 relative overflow-hidden group focus-within:ring-2 focus-within:ring-primary focus-within:shadow-[0_0_8px_rgba(30,64,175,0.1)] transition-shadow">
            <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-primary"></div>
            <h2 className="text-xl font-bold text-slate-900 mb-4 font-sans flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-primary" />
              Material Strengths
            </h2>
            
            <div className="flex flex-col gap-4">
              <div>
                <label className="label-caps text-slate-500 block mb-1">Concrete Compressive Strength (fc')</label>
                <div className="relative flex items-center border border-border-card rounded-2xl bg-surface focus-within:border-primary transition-all focus-within:shadow-[0_0_0_2px_rgba(30,64,175,0.1)]">
                  <input 
                    name="concreteCompressiveStrength"
                    type="number" 
                    className="w-full bg-transparent border-none focus:ring-0 font-mono text-slate-900 py-2 pl-3 pr-14 outline-none"
                    value={store.materials.concreteCompressiveStrength}
                    onChange={handleChange}
                  />
                  <span className="absolute right-3 font-mono text-slate-400">ksc</span>
                </div>
              </div>
              
              <div>
                <label className="label-caps text-slate-500 block mb-1">Steel Yield Strength (fy)</label>
                <div className="relative flex items-center border border-border-card rounded-2xl bg-surface focus-within:border-primary transition-all focus-within:shadow-[0_0_0_2px_rgba(30,64,175,0.1)]">
                  <input 
                    name="steelYieldStrength"
                    type="number" 
                    className="w-full bg-transparent border-none focus:ring-0 font-mono text-slate-900 py-2 pl-3 pr-14 outline-none"
                    value={store.materials.steelYieldStrength}
                    onChange={handleChange}
                  />
                  <span className="absolute right-3 font-mono text-slate-400">ksc</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 flex flex-col h-full">
          <div className="bg-[#F1F5F9] border border-border-card rounded-2xl p-4 flex-1 flex flex-col min-h-[500px] relative overflow-hidden shadow-sm">
            <div className="absolute top-4 left-4 bg-surface/80 backdrop-blur px-3 py-1.5 rounded-2xl border border-border-card z-10 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              <span className="label-caps text-slate-900">Material Limits</span>
            </div>
            
            <div className="flex-1 w-full h-full border-2 border-dashed border-border-card rounded-2xl flex items-center justify-center relative bg-gradient-to-b from-slate-200/30 to-slate-300/30">
              <div className="text-center opacity-60">
                <Settings2 className="w-10 h-10 mx-auto mb-2 text-slate-500" />
                <p className="font-mono text-slate-600">Material Engine</p>
                <p className="label-caps text-slate-500 mt-1">Concrete Shear Capacity & Steel ratios...</p>
              </div>
            </div>

            <div className="mt-4 bg-surface border border-border-card rounded-2xl p-4 grid grid-cols-2 gap-4">
              <div>
                <div className="label-caps text-slate-500 mb-1">Concrete Shear Capacity (φVc)</div>
                <div className="font-mono text-lg text-slate-900">{(results.structural.stem?.phi_Vc ?? 0).toFixed(0)} kg</div>
              </div>
              <div>
                <div className="label-caps text-slate-500 mb-1">Max Ultimate Shear (Vu)</div>
                <div className="font-mono text-lg text-slate-900">{Math.max(results.structural.stem?.V_u ?? 0, results.structural.toe?.V_u ?? 0, results.structural.heel?.V_u ?? 0).toFixed(0)} kg</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
