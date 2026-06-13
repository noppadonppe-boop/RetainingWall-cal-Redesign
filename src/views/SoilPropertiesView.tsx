import { useWallStore } from '../store/useWallStore';
import { Trash2, Plus, Info } from 'lucide-react';
import type { SoilLayer, SoilProperties } from '../types';
import { SoilProfileVisual } from '../components/SoilProfileVisual';


export const SoilPropertiesView = () => {
  const store = useWallStore();

  const updateGlobalField = <K extends keyof SoilProperties>(field: K, value: SoilProperties[K]) => {
    store.updateSoilProperties({
      [field]: value,
    } as Partial<SoilProperties>);
  };

  const handleLayerChange = <K extends keyof SoilLayer>(id: string, field: K, value: SoilLayer[K]) => {
    store.updateSoilLayer(id, { [field]: value });
  };

  return (
    <div className="max-w-[1280px] mx-auto px-10 py-10">
      <header className="mb-8 flex justify-between items-end border-b border-border-card pb-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-sans">Soil Properties</h1>
          <p className="text-sm text-slate-500 mt-1 font-sans">
            Configure soil layers and engineering assumptions for the retaining wall.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1.45fr_1fr] gap-8">
        
        {/* Left Column: Input Forms */}
        <div className="flex flex-col gap-6">
          
          {store.soilProperties.layers.map((layer, index) => (
            <div key={layer.id} className="bg-white border border-[#e2e8f0] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              
              {/* Card Header */}
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#e0e7ff] text-[#4f46e5] flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <input 
                    type="text"
                    value={layer.name}
                    onChange={(e) => handleLayerChange(layer.id, 'name', e.target.value)}
                    className="text-lg font-bold text-[#1e293b] bg-transparent border-none focus:ring-0 p-0 hover:bg-slate-50 rounded"
                  />
                </div>
                {store.soilProperties.layers.length > 1 && (
                  <button 
                    onClick={() => store.removeSoilLayer(layer.id)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
              
              {/* Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                
                {/* Unit Weight */}
                <div>
                  <label className="block text-[11px] font-medium text-[#64748b] mb-1.5 uppercase tracking-wider">
                    Unit Weight (γ)<br/>[kg/m³]
                  </label>
                  <input 
                    type="number"
                    value={layer.unitWeight}
                    onChange={(e) => handleLayerChange(layer.id, 'unitWeight', parseFloat(e.target.value) || 0)}
                    className="w-full border border-[#cbd5e1] rounded-xl px-4 py-2.5 text-[#334155] font-mono focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] outline-none"
                  />
                </div>

                {/* Friction Angle */}
                <div>
                  <label className="block text-[11px] font-medium text-[#64748b] mb-1.5 uppercase tracking-wider">
                    Friction Angle (φ)<br/>[degrees]
                  </label>
                  <input 
                    type="number"
                    value={layer.frictionAngle}
                    onChange={(e) => handleLayerChange(layer.id, 'frictionAngle', parseFloat(e.target.value) || 0)}
                    className="w-full border border-[#cbd5e1] rounded-xl px-4 py-2.5 text-[#334155] font-mono focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] outline-none"
                  />
                </div>

                {/* Cohesion */}
                <div>
                  <label className="block text-[11px] font-medium text-[#64748b] mb-1.5 uppercase tracking-wider">
                    Cohesion (c)<br/>[kg/m²]
                  </label>
                  <input 
                    type="number"
                    value={layer.cohesion}
                    onChange={(e) => handleLayerChange(layer.id, 'cohesion', parseFloat(e.target.value) || 0)}
                    className="w-full border border-[#cbd5e1] rounded-xl px-4 py-2.5 text-[#334155] font-mono focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] outline-none"
                  />
                </div>

                {/* Layer Thickness */}
                <div>
                  <label className="block text-[11px] font-medium text-[#64748b] mb-1.5 uppercase tracking-wider">
                    Layer Thickness<br/>[m]
                  </label>
                  <input 
                    type="number"
                    step="0.1"
                    value={layer.thickness}
                    onChange={(e) => handleLayerChange(layer.id, 'thickness', parseFloat(e.target.value) || 0)}
                    className="w-full border border-[#cbd5e1] rounded-xl px-4 py-2.5 text-[#334155] font-mono focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] outline-none"
                  />
                </div>

                {/* Soil Type */}
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-medium text-[#64748b] mb-1.5 uppercase tracking-wider">
                    Soil Type / ประเภทดิน
                  </label>
                  <select 
                    value={layer.soilType}
                    onChange={(e) => handleLayerChange(layer.id, 'soilType', e.target.value)}
                    className="w-full border border-[#cbd5e1] rounded-xl px-4 py-2.5 text-[#334155] focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] outline-none appearance-none bg-white"
                  >
                    <option value="Well Graded Sand (SW)">Well Graded Sand (SW)</option>
                    <option value="Silty Sand (SM)">Silty Sand (SM)</option>
                    <option value="Clayey Sand (SC)">Clayey Sand (SC)</option>
                    <option value="Low Plasticity Clay (CL)">Low Plasticity Clay (CL)</option>
                    <option value="High Plasticity Clay (CH)">High Plasticity Clay (CH)</option>
                  </select>
                </div>

              </div>
            </div>
          ))}

          {/* Add Layer Button */}
          <button 
            onClick={store.addSoilLayer}
            className="w-full py-6 border-2 border-dashed border-[#cbd5e1] rounded-2xl flex flex-col items-center justify-center gap-2 text-[#64748b] hover:text-[#4f46e5] hover:border-[#4f46e5] hover:bg-[#f8fafc] transition-all mb-8"
          >
            <Plus className="w-6 h-6" />
            <span className="font-medium">Add Soil Layer / เพิ่มชั้นดิน</span>
          </button>

          {/* Settings & Assumptions */}
          <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl p-6 shadow-sm">
            <h3 className="text-[14px] font-bold text-[#1e293b] mb-4 font-sans">Engineering Assumptions</h3>
            
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-[12px] font-medium text-[#475569] mb-2">Tension Crack Assumption (ดินเหนียว)</label>
                <div className="flex bg-white border border-[#cbd5e1] rounded-xl overflow-hidden p-1">
                  <button
                    onClick={() => updateGlobalField('tensionCrackAssumption', 'ignore_negative')}
                    className={`flex-1 py-2 text-[12px] font-medium rounded-lg transition-colors ${store.soilProperties.tensionCrackAssumption === 'ignore_negative' ? 'bg-[#4f46e5] text-white' : 'text-[#64748b] hover:bg-slate-50'}`}
                  >
                    Ignore Negative Pressure (Standard)
                  </button>
                  <button
                    onClick={() => updateGlobalField('tensionCrackAssumption', 'include_negative')}
                    className={`flex-1 py-2 text-[12px] font-medium rounded-lg transition-colors ${store.soilProperties.tensionCrackAssumption === 'include_negative' ? 'bg-[#4f46e5] text-white' : 'text-[#64748b] hover:bg-slate-50'}`}
                  >
                    Include Negative Pressure
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#475569] mb-2">Stratigraphy Depth Boundary</label>
                <div className="flex bg-white border border-[#cbd5e1] rounded-xl overflow-hidden p-1">
                  <button
                    onClick={() => updateGlobalField('layerClipping', 'clip_to_wall')}
                    className={`flex-1 py-2 text-[12px] font-medium rounded-lg transition-colors ${store.soilProperties.layerClipping === 'clip_to_wall' ? 'bg-[#4f46e5] text-white' : 'text-[#64748b] hover:bg-slate-50'}`}
                  >
                    Clip to Wall Depth
                  </button>
                  <button
                    onClick={() => updateGlobalField('layerClipping', 'no_clip')}
                    className={`flex-1 py-2 text-[12px] font-medium rounded-lg transition-colors ${store.soilProperties.layerClipping === 'no_clip' ? 'bg-[#4f46e5] text-white' : 'text-[#64748b] hover:bg-slate-50'}`}
                  >
                    Extend Beyond Wall
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Visualization */}
        <div className="h-full">
          <div className="sticky top-8 flex flex-col gap-4">
            <SoilProfileVisual />
            <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-4 flex items-start gap-3">
              <Info className="w-5 h-5 text-[#64748b] shrink-0 mt-0.5" />
              <p className="text-[12px] text-[#475569] leading-relaxed">
                The 2D soil profile shows front and back elevations based on the current geometry height, front fill level, and configured soil layers.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
