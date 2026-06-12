import { ArrowDown, Droplets, Mountain, Info, Search } from 'lucide-react';
import { useWallStore } from '../store/useWallStore';
import { runCalculations } from '../utils/calculationEngine';
import { WallGraphic } from '../components/WallGraphic';

export const LoadsView = () => {
  const store = useWallStore();
  
  const handleLoadChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      useWallStore.setState({
        loads: {
          ...store.loads,
          [name]: checked
        }
      });
    } else {
      useWallStore.setState({
        loads: {
          ...store.loads,
          [name]: type === 'number' ? parseFloat(value) || 0 : value
        }
      });
    }
  };

  const handleSoilChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    useWallStore.setState({
      soilProperties: {
        ...store.soilProperties,
        [name]: parseFloat(value) || 0
      }
    });
  };

  const setProfileType = (type: 'Sloped' | 'Horizontal' | 'Broken') => {
    useWallStore.setState({
      soilProperties: {
        ...store.soilProperties,
        backfillProfileType: type
      }
    });
  };

  const results = runCalculations(store);

  return (
    <div className="max-w-[1280px] mx-auto p-6 md:p-8 pt-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2 font-sans tracking-tight">Loads Configuration</h1>
        <p className="text-slate-600 max-w-3xl font-sans text-sm">
          Define external forces, surcharge loads, and hydrostatic pressures acting on the retaining structure.
          Values will dynamically update the analysis model.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column - Inputs */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Surcharge Load Card */}
          <div className="bg-surface border border-border-card rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-primary">
                  <ArrowDown className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Surcharge Load</h3>
              </div>
              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" name="surchargeActive" checked={store.loads.surchargeActive} onChange={handleLoadChange} className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
                <span className="text-sm font-bold text-slate-500 uppercase tracking-wide">{store.loads.surchargeActive ? 'Active' : 'Inactive'}</span>
              </div>
            </div>

            <div className={`grid grid-cols-2 gap-4 ${!store.loads.surchargeActive ? 'opacity-50 pointer-events-none' : ''}`}>
              <div>
                <label className="block label-caps text-slate-500 mb-2">Uniform Load (q)</label>
                <div className="relative flex items-center border border-border-card rounded-2xl bg-surface focus-within:border-primary transition-all">
                  <input 
                    type="number" 
                    name="surchargeLoad" 
                    value={store.loads.surchargeLoad} 
                    onChange={handleLoadChange}
                    className="w-full bg-transparent border-none focus:ring-0 font-mono text-slate-900 py-2.5 pl-4 pr-16 outline-none"
                  />
                  <span className="absolute right-4 text-slate-400 font-mono text-sm">kg/m²</span>
                </div>
              </div>
              <div>
                <label className="block label-caps text-slate-500 mb-2">Load Type</label>
                <select 
                  name="surchargeType" 
                  value={store.loads.surchargeType} 
                  onChange={handleLoadChange}
                  className="w-full bg-surface border border-border-card rounded-2xl px-4 py-2.5 font-sans text-slate-900 focus:border-primary outline-none appearance-none"
                >
                  <option value="Dead Load">Dead Load</option>
                  <option value="Live Load">Live Load</option>
                </select>
              </div>
              <div>
                <label className="block label-caps text-slate-500 mb-2">Distance from wall (X)</label>
                <div className="relative flex items-center border border-border-card rounded-2xl bg-surface focus-within:border-primary transition-all">
                  <input 
                    type="number" 
                    name="distanceFromWall" 
                    value={store.loads.distanceFromWall} 
                    onChange={handleLoadChange}
                    step="0.1"
                    className="w-full bg-transparent border-none focus:ring-0 font-mono text-slate-900 py-2.5 pl-4 pr-12 outline-none"
                  />
                  <span className="absolute right-4 text-slate-400 font-mono text-sm">m</span>
                </div>
              </div>
              <div>
                <label className="block label-caps text-slate-500 mb-2">Load width (W)</label>
                <div className="relative flex items-center border border-border-card rounded-2xl bg-surface focus-within:border-primary transition-all">
                  <input 
                    type="number" 
                    name="loadWidth" 
                    value={store.loads.loadWidth} 
                    onChange={handleLoadChange}
                    step="0.1"
                    className="w-full bg-transparent border-none focus:ring-0 font-mono text-slate-900 py-2.5 pl-4 pr-12 outline-none"
                  />
                  <span className="absolute right-4 text-slate-400 font-mono text-sm">m</span>
                </div>
              </div>
            </div>
          </div>

          {/* Backfill Profile Card */}
          <div className="bg-surface border border-border-card rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <Mountain className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Backfill Profile</h3>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block label-caps text-slate-500 mb-2">Inclination Angle (β)</label>
                <div className="relative flex items-center border border-border-card rounded-2xl bg-surface focus-within:border-indigo-500 transition-all">
                  <input 
                    type="number" 
                    name="backfillInclination" 
                    value={store.soilProperties.backfillInclination} 
                    onChange={handleSoilChange}
                    className="w-full bg-transparent border-none focus:ring-0 font-mono text-slate-900 py-2.5 pl-4 pr-12 outline-none"
                  />
                  <span className="absolute right-4 text-slate-400 font-mono text-sm">deg</span>
                </div>
              </div>
              <div>
                <label className="block label-caps text-slate-500 mb-2">Profile Type</label>
                <div className="flex bg-slate-100 p-1 rounded-2xl border border-border-card">
                  {(['Sloped', 'Horizontal', 'Broken'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setProfileType(type)}
                      className={`flex-1 py-1.5 text-sm font-medium rounded-xl transition-all ${store.soilProperties.backfillProfileType === type ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-end mb-4">
                <label className="block label-caps text-slate-500">Unit Weight of Soil (γ)</label>
              </div>
              <div className="relative px-2">
                <input 
                  type="range" 
                  name="unitWeight"
                  min="1500" 
                  max="2200" 
                  step="10"
                  value={store.soilProperties.unitWeight}
                  onChange={handleSoilChange}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-2 font-mono">
                  <span>1500 kg/m³</span>
                  <span className="text-indigo-600 font-bold text-sm bg-indigo-50 px-2 py-0.5 rounded-full">{store.soilProperties.unitWeight} kg/m³</span>
                  <span>2200 kg/m³</span>
                </div>
              </div>
            </div>
          </div>

          {/* Hydrostatic Pressure Card */}
          <div className="bg-surface border border-border-card rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-cyan-50 flex items-center justify-center text-cyan-500">
                  <Droplets className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Hydrostatic Pressure</h3>
              </div>
              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" name="hydrostaticActive" checked={store.loads.hydrostaticActive} onChange={handleLoadChange} className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                </label>
                <span className="text-sm font-bold text-slate-500 uppercase tracking-wide">{store.loads.hydrostaticActive ? 'Active' : 'Inactive'}</span>
              </div>
            </div>

            {!store.loads.hydrostaticActive && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center flex flex-col items-center justify-center">
                <Info className="w-6 h-6 text-slate-400 mb-3" />
                <p className="text-slate-500 text-sm max-w-sm">
                  Hydrostatic pressure is currently disabled. Enable to define water table levels on the active and passive sides of the wall.
                </p>
              </div>
            )}
            
            {store.loads.hydrostaticActive && (
              <div className="bg-cyan-50 border border-cyan-100 rounded-2xl p-6 text-center">
                <p className="text-cyan-700 text-sm">
                  Hydrostatic pressure is actively applying a force of <strong>{(results.loads.P_hydro).toLocaleString(undefined, {maximumFractionDigits:0})} kg</strong> to the wall.
                </p>
              </div>
            )}
          </div>

        </div>

        {/* Right Column - Visuals & Summary */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Diagram */}
          <div className="bg-surface border border-border-card rounded-2xl p-4 flex flex-col relative overflow-hidden shadow-sm h-[400px]">
            <div className="flex justify-between items-center mb-2 px-2">
              <h4 className="font-bold text-slate-800">Load Diagram</h4>
              <div className="flex gap-2">
                <button className="text-slate-400 hover:text-slate-600"><Search className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="flex-1 w-full border border-border-card rounded-2xl flex items-center justify-center relative bg-slate-50 overflow-hidden">
              <WallGraphic />
            </div>
          </div>

          {/* Summary Card */}
          <div className="bg-surface border border-border-card rounded-2xl p-6 shadow-sm">
            <h4 className="font-bold text-slate-800 mb-4">Active Forces Summary</h4>
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center py-2 border-b border-border-card">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-sm font-medium text-slate-700">Surcharge</span>
                </div>
                <span className="font-mono text-sm font-bold text-slate-900">{results.loads.P_surcharge.toLocaleString(undefined, {maximumFractionDigits:0})} kg</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border-card">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                  <span className="text-sm font-medium text-slate-700">Soil Pressure</span>
                </div>
                <span className="font-mono text-sm font-bold text-slate-900">{results.loads.Pa.toLocaleString(undefined, {maximumFractionDigits:0})} kg</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
                  <span className="text-sm font-medium text-slate-700">Hydrostatic</span>
                </div>
                <span className="font-mono text-sm font-bold text-slate-900">{results.loads.P_hydro.toLocaleString(undefined, {maximumFractionDigits:0})} kg</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
