import { useWallStore } from '../store/useWallStore';
import { WallGraphic } from '../components/WallGraphic';

export const GeometryView = () => {
  const store = useWallStore();

  const handleGeometryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    store.updateGeometry({
      [e.target.name]: parseFloat(e.target.value) || 0,
    });
  };

  return (
    <div className="max-w-[1280px] mx-auto px-10 py-10">
      <header className="mb-8 flex justify-between items-end border-b border-border-card pb-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-sans">Geometry</h1>
          <p className="text-sm text-slate-500 mt-1 font-sans">Configure wall dimensions and structure type.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input Forms */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          <div className="bg-surface border border-border-card rounded-2xl p-6 relative overflow-hidden group focus-within:ring-2 focus-within:ring-primary focus-within:shadow-[0_0_8px_rgba(30,64,175,0.1)] transition-shadow">
            <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-primary"></div>
            <h2 className="text-xl font-bold text-slate-900 mb-4 font-sans">Configuration</h2>
            
            <div className="flex flex-col gap-4">
              <div>
                <label className="label-caps text-slate-500 block mb-1">Wall Type</label>
                <select 
                  className="w-full bg-surface border border-border-card rounded-2xl px-3 py-2 text-sm text-slate-900 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  value={store.wallType}
                  onChange={(e) => store.setWallType(e.target.value as any)}
                >
                  <option value="T-Shape">Cantilever (T-Shape)</option>
                  <option value="L-Shape">Cantilever (L-Shape)</option>
                  <option value="Gravity">Gravity</option>
                </select>
              </div>

              {store.wallType === 'L-Shape' && (
                <div>
                  <label className="label-caps text-slate-500 block mb-1">L-Shape Orientation</label>
                  <select 
                    className="w-full bg-surface border border-border-card rounded-2xl px-3 py-2 text-sm text-slate-900 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    value={store.lShapeOrientation || 'Heel-only'}
                    onChange={(e) => store.setLShapeOrientation(e.target.value as any)}
                  >
                    <option value="Heel-only">Heel-only (Soil on Heel)</option>
                    <option value="Toe-only">Toe-only (Soil on Toe)</option>
                  </select>
                </div>
              )}

              <div className="flex items-center justify-between mt-2">
                <label className="label-caps text-slate-500">Include Shear Key</label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={store.hasShearKey}
                    onChange={(e) => store.setHasShearKey(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          </div>

          <div className="bg-surface border border-border-card rounded-2xl p-6 hover:shadow-soft-glow transition-shadow">
            <h2 className="text-xl font-bold text-slate-900 mb-4 font-sans">Dimensions</h2>
            
            <div className="flex flex-col gap-4">
              <div className="relative">
                <label className="label-caps text-slate-500 block mb-1">Total Height (H)</label>
                <input 
                  type="number" 
                  name="totalHeight"
                  className="w-full bg-surface border border-border-card rounded-2xl px-3 py-2 font-mono text-slate-900 focus:border-primary focus:ring-1 focus:ring-primary outline-none pr-10"
                  value={store.geometry.totalHeight}
                  onChange={handleGeometryChange}
                />
                <span className="absolute right-3 top-[28px] text-slate-500 text-sm">m</span>
              </div>
              
              <div className="relative">
                <label className="label-caps text-slate-500 block mb-1">Toe Width</label>
                <input 
                  type="number" 
                  name="toeWidth"
                  className="w-full bg-surface border border-border-card rounded-2xl px-3 py-2 font-mono text-slate-900 focus:border-primary focus:ring-1 focus:ring-primary outline-none pr-10"
                  value={store.geometry.toeWidth}
                  onChange={handleGeometryChange}
                  disabled={store.wallType === 'L-Shape' && store.lShapeOrientation === 'Heel-only'}
                />
                <span className="absolute right-3 top-[28px] text-slate-500 text-sm">m</span>
              </div>

              <div className="relative">
                <label className="label-caps text-slate-500 block mb-1">Heel Width</label>
                <input 
                  type="number" 
                  name="heelWidth"
                  className="w-full bg-surface border border-border-card rounded-2xl px-3 py-2 font-mono text-slate-900 focus:border-primary focus:ring-1 focus:ring-primary outline-none pr-10"
                  value={store.geometry.heelWidth}
                  onChange={handleGeometryChange}
                  disabled={store.wallType === 'L-Shape' && store.lShapeOrientation === 'Toe-only'}
                />
                <span className="absolute right-3 top-[28px] text-slate-500 text-sm">m</span>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <label className="label-caps text-slate-500 block mb-1">Stem Thickness</label>
                  <input 
                    type="number" 
                    name="stemThickness"
                    className="w-full bg-surface border border-border-card rounded-2xl px-3 py-2 font-mono text-slate-900 focus:border-primary focus:ring-1 focus:ring-primary outline-none pr-10"
                    value={store.geometry.stemThickness}
                    onChange={handleGeometryChange}
                  />
                  <span className="absolute right-2 top-[28px] text-slate-500 label-caps">m</span>
                </div>
                <div className="relative">
                  <label className="label-caps text-slate-500 block mb-1">Base Thickness</label>
                  <input 
                    type="number" 
                    name="baseThickness"
                    className="w-full bg-surface border border-border-card rounded-2xl px-3 py-2 font-mono text-slate-900 focus:border-primary focus:ring-1 focus:ring-primary outline-none pr-10"
                    value={store.geometry.baseThickness}
                    onChange={handleGeometryChange}
                  />
                  <span className="absolute right-2 top-[28px] text-slate-500 label-caps">m</span>
                </div>
              </div>
            </div>
          </div>
          
        </div>

        {/* Right Column: Visualization */}
        <div className="lg:col-span-7 flex flex-col h-full">
          <WallGraphic />
        </div>
      </div>
    </div>
  );
};
