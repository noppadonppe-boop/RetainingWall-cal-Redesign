import { useWallStore } from '../store/useWallStore';
import { Layers, Trash2, Plus, Info } from 'lucide-react';
import type { SoilLayer, SoilProperties } from '../types';


export const SoilPropertiesView = () => {
  const store = useWallStore();
  
  // We need to pass the updated store to calculation engine to get live results, 
  // but since we are changing the engine next, we will just use the current layers.
  // const results = runCalculations(store);

  const updateGlobalField = <K extends keyof SoilProperties>(field: K, value: SoilProperties[K]) => {
    store.updateSoilProperties({
      [field]: value,
    } as Partial<SoilProperties>);
  };

  const handleLayerChange = <K extends keyof SoilLayer>(id: string, field: K, value: SoilLayer[K]) => {
    store.updateSoilLayer(id, { [field]: value });
  };

  // Render SVG Stratigraphy
  const renderStratigraphy = () => {
    const layers = store.soilProperties.layers;
    let totalDepth = layers.reduce((sum, l) => sum + l.thickness, 0);
    // Ensure minimum depth for drawing scale
    if (totalDepth < 5) totalDepth = 5;

    const viewBoxHeight = 400;
    const viewBoxWidth = 250;
    const scaleY = viewBoxHeight / totalDepth;

    let currentY = 0;
    let cumulativeDepth = 0;

    return (
      <svg viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`} className="w-full h-full rounded-xl" preserveAspectRatio="none">
        <defs>
          <pattern id="sand-pattern" width="10" height="10" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="#d4d4d8" />
            <circle cx="8" cy="8" r="0.5" fill="#d4d4d8" />
            <circle cx="4" cy="7" r="1" fill="#e4e4e7" />
          </pattern>
          <pattern id="clay-pattern" width="20" height="10" patternUnits="userSpaceOnUse">
            <line x1="0" y1="5" x2="20" y2="5" stroke="#d4d4d8" strokeWidth="0.5" />
            <line x1="10" y1="0" x2="10" y2="10" stroke="#d4d4d8" strokeWidth="0.5" strokeDasharray="2 2" />
          </pattern>
        </defs>

        {/* Base background */}
        <rect width="100%" height="100%" fill="#f8fafc" />

        {layers.map((layer, index) => {
          const height = layer.thickness * scaleY;
          const y = currentY;
          currentY += height;
          
          const isSand = layer.soilType.toLowerCase().includes('sand');
          const fillColor = isSand ? '#e7e5e4' : '#a8a29e';
          const patternId = isSand ? 'url(#sand-pattern)' : 'url(#clay-pattern)';

          return (
            <g key={layer.id}>
              <rect x="30" y={y} width={viewBoxWidth - 30} height={height} fill={fillColor} />
              <rect x="30" y={y} width={viewBoxWidth - 30} height={height} fill={patternId} />
              
              {/* Layer Boundary Line */}
              {index > 0 && (
                <line x1="30" y1={y} x2={viewBoxWidth} y2={y} stroke="#78716c" strokeWidth="1" strokeDasharray="4 2" />
              )}

              {/* Depth Label */}
              {index === 0 && (
                <text x="25" y={10} fontSize="10" textAnchor="end" fill="#64748b" fontFamily="monospace">0.0m</text>
              )}
              
              {/* Bottom Depth Label */}
              <text x="25" y={y + height + 3} fontSize="10" textAnchor="end" fill="#64748b" fontFamily="monospace">
                -{ (cumulativeDepth + layer.thickness).toFixed(1) }m
              </text>

              {/* Center Label Badge */}
              <g transform={`translate(${30 + (viewBoxWidth - 30)/2}, ${y + height/2})`}>
                <rect x="-40" y="-12" width="80" height="24" rx="12" fill="white" fillOpacity="0.8" />
                <text x="0" y="3" fontSize="12" fontWeight="bold" textAnchor="middle" fill="#475569" className="font-sans">
                  {index + 1}. {layer.name.split(' ').pop()}
                </text>
              </g>

              {/* If GWT is here (mock for first layer boundary) */}
              {index === 0 && store.loads.hydrostaticActive && (
                <g transform={`translate(30, ${y + height})`}>
                  <line x1="0" y1="0" x2={viewBoxWidth - 30} y2="0" stroke="#3b82f6" strokeWidth="2" />
                  <polygon points="5,0 10,-8 0,-8" fill="none" stroke="#3b82f6" strokeWidth="1.5" />
                  <text x={viewBoxWidth - 60} y="-5" fontSize="10" fill="#3b82f6" fontWeight="bold">GWT : ▽</text>
                </g>
              )}
              
              {/* Update cumulative depth */}
              <text style={{display: 'none'}}>{cumulativeDepth += layer.thickness}</text>
            </g>
          );
        })}
      </svg>
    );
  };

  return (
    <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-[#1e293b] font-sans">Soil Properties Configuration</h1>
        <p className="text-[13px] text-[#64748b] mt-2 font-sans max-w-3xl leading-relaxed">
          Define stratigraphy layers and mechanical parameters for the retaining structure analysis. / 
          กำหนดชั้นดินและพารามิเตอร์ทางกลสำหรับการวิเคราะห์โครงสร้างกันดิน
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-8">
        
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
          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 shadow-sm sticky top-8 flex flex-col min-h-[600px]">
            <h3 className="text-lg font-bold text-[#1e293b] mb-6 flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#4f46e5]" />
              Live Stratigraphy
            </h3>
            
            <div className="flex-1 w-full border border-[#cbd5e1] rounded-xl overflow-hidden bg-white">
              {renderStratigraphy()}
            </div>

            <div className="mt-6 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-4 flex items-start gap-3">
              <Info className="w-5 h-5 text-[#64748b] shrink-0 mt-0.5" />
              <p className="text-[12px] text-[#475569] leading-relaxed">
                Diagram updates automatically as parameters change. Water table is indicated if hydrostatic pressure is active in the Loads menu.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
