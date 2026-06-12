
import { useWallStore } from '../store/useWallStore';
import { runCalculations } from '../utils/calculationEngine';

export const StructuralDrawing = () => {
  const store = useWallStore();
  const results = runCalculations(store);

  // Geometry
  const H = store.geometry.totalHeight;
  const t_base = store.geometry.baseThickness;
  const t_stem = store.geometry.stemThickness;
  const toe = store.geometry.toeWidth;
  const heel = store.geometry.heelWidth;

  const wallType = store.wallType;
  const lOrient = store.lShapeOrientation;
  
  const activeToe = wallType === 'L-Shape' && lOrient === 'Heel-only' ? 0 : toe;
  const activeHeel = wallType === 'L-Shape' && lOrient === 'Toe-only' ? 0 : heel;
  const actualBaseWidth = activeToe + t_stem + activeHeel;

  // SVG Scaling and Coordinates
  const viewHeight = 600;
  
  // Find max dimension to scale drawing
  const maxDim = Math.max(H, actualBaseWidth) * 1.4; // add padding
  const scale = (viewHeight * 0.7) / maxDim;
  
  // Center drawing vertically and horizontally
  const baseY = viewHeight * 0.8; 
  
  // Left Drawing (Geometry) Origin
  const leftOriginX = 250;
  
  // Right Drawing (Reinforcement) Origin
  const rightOriginX = 750;

  // Helper to draw the concrete outline
  const getConcretePath = (originX: number) => {
    const x0 = originX - (actualBaseWidth * scale) / 2; // Leftmost point of toe
    const x1 = x0 + activeToe * scale; // Left of stem
    const x2 = x1 + t_stem * scale; // Right of stem
    const x3 = x0 + actualBaseWidth * scale; // Rightmost point of heel
    
    const y0 = baseY; // Bottom of base
    const y1 = baseY - t_base * scale; // Top of base
    const y2 = baseY - H * scale; // Top of stem
    
    return `
      M ${x0} ${y0}
      L ${x3} ${y0}
      L ${x3} ${y1}
      L ${x2} ${y1}
      L ${x2} ${y2}
      L ${x1} ${y2}
      L ${x1} ${y1}
      L ${x0} ${y1}
      Z
    `;
  };

  const drawDimensionLine = (xStart: number, yStart: number, xEnd: number, yEnd: number, text: string, isVertical = false) => {
    // A simple dimension line with ticks
    return (
      <g className="text-slate-500 font-sans text-xs">
        <line x1={xStart} y1={yStart} x2={xEnd} y2={yEnd} stroke="currentColor" strokeWidth="1" />
        {/* Ticks */}
        {isVertical ? (
          <>
            <line x1={xStart - 5} y1={yStart} x2={xStart + 5} y2={yStart} stroke="currentColor" strokeWidth="1" />
            <line x1={xEnd - 5} y1={yEnd} x2={xEnd + 5} y2={yEnd} stroke="currentColor" strokeWidth="1" />
            <text x={xStart - 10} y={(yStart + yEnd)/2} textAnchor="end" dominantBaseline="middle" transform={`rotate(-90, ${xStart - 10}, ${(yStart + yEnd)/2})`}>{text}</text>
          </>
        ) : (
          <>
            <line x1={xStart} y1={yStart - 5} x2={xStart} y2={yStart + 5} stroke="currentColor" strokeWidth="1" />
            <line x1={xEnd} y1={yEnd - 5} x2={xEnd} y2={yEnd + 5} stroke="currentColor" strokeWidth="1" />
            <text x={(xStart + xEnd)/2} y={yStart + 15} textAnchor="middle">{text}</text>
          </>
        )}
      </g>
    );
  };

  // Rebar text from calculations
  const stemRebarText = results.structural.stem?.rebar?.label || "DB20 @ 15 cm";
  const distRebarText = results.structural.stem?.rebar_dist?.label || "DB12 @ 20 cm";
  const heelRebarText = results.structural.heel?.rebar?.label || "DB16 @ 15 cm";
  const toeRebarText = results.structural.toe?.rebar?.label || "DB16 @ 15 cm";

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Header */}
      <div className="flex justify-between items-center px-2">
        <div>
          <h3 className="text-sm font-bold text-slate-800">Technical Drawing & Reinforcement Details</h3>
          <p className="text-xs text-slate-500 font-mono">Compliant with Thai Engineering Standards (EIT)</p>
        </div>
        <div className="flex gap-2">
          <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">Scale 1:25</span>
          <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">Unit: Meters</span>
        </div>
      </div>

      {/* SVG Container */}
      <div className="w-full border border-border-card rounded-xl bg-white overflow-x-auto">
        <svg viewBox="0 0 1000 600" className="w-full h-auto min-w-[800px]">
          <defs>
            <pattern id="concrete" patternUnits="userSpaceOnUse" width="20" height="20">
              <circle cx="2" cy="2" r="1" fill="#cbd5e1" />
              <circle cx="10" cy="8" r="1.5" fill="#cbd5e1" />
              <circle cx="18" cy="18" r="1" fill="#cbd5e1" />
              <path d="M 4 14 L 8 18" stroke="#cbd5e1" strokeWidth="0.5" />
            </pattern>
            <pattern id="soil" patternUnits="userSpaceOnUse" width="10" height="10" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="10" stroke="#e2e8f0" strokeWidth="1" />
            </pattern>
          </defs>

          {/* === LEFT DRAWING (Geometry) === */}
          <g>
            {/* Ground lines */}
            <line x1={50} y1={baseY - t_base * scale} x2={leftOriginX - (actualBaseWidth * scale) / 2} y2={baseY - t_base * scale} stroke="#94a3b8" strokeWidth="1" />
            <line x1={leftOriginX + (actualBaseWidth * scale) / 2} y1={baseY - H * scale + 20} x2={450} y2={baseY - H * scale + 20} stroke="#94a3b8" strokeWidth="1" />
            <text x={430} y={baseY - H * scale + 15} textAnchor="end" className="text-[10px] text-slate-500 font-sans">BACKFILL LEVEL</text>
            
            {/* Concrete Outline */}
            <path d={getConcretePath(leftOriginX)} fill="#f8fafc" stroke="#334155" strokeWidth="2" />
            
            {/* Dimensions */}
            {/* Height */}
            {drawDimensionLine(
              leftOriginX - (actualBaseWidth * scale) / 2 - 40,
              baseY,
              leftOriginX - (actualBaseWidth * scale) / 2 - 40,
              baseY - H * scale,
              `WALL HEIGHT: ${H.toFixed(2)} m`,
              true
            )}
            
            {/* Base Width */}
            {drawDimensionLine(
              leftOriginX - (actualBaseWidth * scale) / 2,
              baseY + 40,
              leftOriginX + (actualBaseWidth * scale) / 2,
              baseY + 40,
              `BASE WIDTH: ${actualBaseWidth.toFixed(2)} m`
            )}

            {/* Toe Length */}
            {activeToe > 0 && drawDimensionLine(
              leftOriginX - (actualBaseWidth * scale) / 2,
              baseY + 15,
              leftOriginX - (actualBaseWidth * scale) / 2 + activeToe * scale,
              baseY + 15,
              `TOE: ${activeToe.toFixed(2)} m`
            )}

            {/* Heel Length */}
            {activeHeel > 0 && drawDimensionLine(
              leftOriginX - (actualBaseWidth * scale) / 2 + activeToe * scale + t_stem * scale,
              baseY + 15,
              leftOriginX + (actualBaseWidth * scale) / 2,
              baseY + 15,
              `HEEL: ${activeHeel.toFixed(2)} m`
            )}

            {/* Stem Top */}
            {drawDimensionLine(
              leftOriginX - (actualBaseWidth * scale) / 2 + activeToe * scale,
              baseY - H * scale - 15,
              leftOriginX - (actualBaseWidth * scale) / 2 + activeToe * scale + t_stem * scale,
              baseY - H * scale - 15,
              `STEM: ${t_stem.toFixed(2)} m`
            )}
          </g>


          {/* === RIGHT DRAWING (Reinforcement) === */}
          <g>
            {/* Concrete Outline */}
            <path d={getConcretePath(rightOriginX)} fill="url(#concrete)" stroke="#334155" strokeWidth="2" />
            
            {/* Rebars */}
            {/* Main vertical rebars (Tension side - soil side) */}
            {/* It's located on the right side of the stem, near the heel */}
            <line 
              x1={rightOriginX - (actualBaseWidth * scale) / 2 + activeToe * scale + t_stem * scale - 10} 
              y1={baseY - H * scale + 10} 
              x2={rightOriginX - (actualBaseWidth * scale) / 2 + activeToe * scale + t_stem * scale - 10} 
              y2={baseY - 20} 
              stroke="#2563eb" strokeWidth="3" 
            />
            {/* L-bend into the heel */}
            <line 
              x1={rightOriginX - (actualBaseWidth * scale) / 2 + activeToe * scale + t_stem * scale - 10} 
              y1={baseY - 20} 
              x2={rightOriginX + (actualBaseWidth * scale) / 2 - 20} 
              y2={baseY - 20} 
              stroke="#2563eb" strokeWidth="3" 
            />

            {/* Vertical compression rebars (front side) */}
            <line 
              x1={rightOriginX - (actualBaseWidth * scale) / 2 + activeToe * scale + 10} 
              y1={baseY - H * scale + 10} 
              x2={rightOriginX - (actualBaseWidth * scale) / 2 + activeToe * scale + 10} 
              y2={baseY - 20} 
              stroke="#60a5fa" strokeWidth="2" 
            />

            {/* Heel Top rebars */}
            <line 
              x1={rightOriginX - (actualBaseWidth * scale) / 2 + activeToe * scale} 
              y1={baseY - t_base * scale + 15} 
              x2={rightOriginX + (actualBaseWidth * scale) / 2 - 10} 
              y2={baseY - t_base * scale + 15} 
              stroke="#2563eb" strokeWidth="3" 
            />

            {/* Toe Bottom rebars */}
            {activeToe > 0 && (
              <line 
                x1={rightOriginX - (actualBaseWidth * scale) / 2 + 10} 
                y1={baseY - 10} 
                x2={rightOriginX - (actualBaseWidth * scale) / 2 + activeToe * scale + t_stem * scale} 
                y2={baseY - 10} 
                stroke="#2563eb" strokeWidth="3" 
              />
            )}

            {/* Distribution dots (Horizontal bars) */}
            {Array.from({ length: Math.floor(H / 0.5) }).map((_, i) => (
              <g key={i}>
                <circle cx={rightOriginX - (actualBaseWidth * scale) / 2 + activeToe * scale + t_stem * scale - 15} cy={baseY - t_base * scale - 30 - i * 40} r="3" fill="#1e40af" />
                <circle cx={rightOriginX - (actualBaseWidth * scale) / 2 + activeToe * scale + 15} cy={baseY - t_base * scale - 30 - i * 40} r="2" fill="#1e40af" />
              </g>
            ))}

            {/* Callouts */}
            <g className="text-[10px] font-sans font-bold text-slate-700">
              {/* Main Rebar Callout */}
              <line x1={rightOriginX - (actualBaseWidth * scale) / 2 + activeToe * scale + t_stem * scale - 10} y1={baseY - H * scale / 2 * scale} x2={rightOriginX + 100} y2={baseY - H * scale / 2 * scale - 50} stroke="#94a3b8" strokeWidth="1" />
              <text x={rightOriginX + 105} y={baseY - H * scale / 2 * scale - 55}>MAIN VERTICAL REBARS</text>
              <text x={rightOriginX + 105} y={baseY - H * scale / 2 * scale - 40} className="text-primary">{stemRebarText}</text>
              <text x={rightOriginX + 105} y={baseY - H * scale / 2 * scale - 25} className="font-normal text-slate-500">(TENSION SIDE)</text>

              {/* Distribution Rebar Callout */}
              <line x1={rightOriginX - (actualBaseWidth * scale) / 2 + activeToe * scale + t_stem * scale - 15} y1={baseY - t_base * scale - 70} x2={rightOriginX + 120} y2={baseY - t_base * scale - 30} stroke="#94a3b8" strokeWidth="1" />
              <text x={rightOriginX + 125} y={baseY - t_base * scale - 35}>HORIZONTAL DISTRIBUTION</text>
              <text x={rightOriginX + 125} y={baseY - t_base * scale - 20} className="text-primary">{distRebarText}</text>

              {/* Top Heel Rebar Callout */}
              <line x1={rightOriginX + (actualBaseWidth * scale) / 2 - 40} y1={baseY - t_base * scale + 15} x2={rightOriginX + 150} y2={baseY - t_base * scale - 10} stroke="#94a3b8" strokeWidth="1" />
              <text x={rightOriginX + 155} y={baseY - t_base * scale - 15}>TOP HEEL REINFORCEMENT</text>
              <text x={rightOriginX + 155} y={baseY - t_base * scale} className="text-primary">{heelRebarText}</text>

              {/* Bottom Toe Rebar Callout */}
              {activeToe > 0 && (
                <>
                  <line x1={rightOriginX - (actualBaseWidth * scale) / 2 + activeToe * scale / 2} y1={baseY - 10} x2={rightOriginX - 80} y2={baseY + 40} stroke="#94a3b8" strokeWidth="1" />
                  <text x={rightOriginX - 80} y={baseY + 55}>BOTTOM TOE REINFORCEMENT</text>
                  <text x={rightOriginX - 80} y={baseY + 70} className="text-primary">{toeRebarText}</text>
                </>
              )}
            </g>

            {/* Drawing Label Box */}
            <rect x={rightOriginX - 100} y={baseY + 80} width="350" height="40" fill="none" stroke="#94a3b8" strokeWidth="1" />
            <text x={rightOriginX - 90} y={baseY + 95} className="text-[10px] font-mono font-bold text-slate-800">PROJECT: CONCRETE RETAINING WALL - CROSS SECTION</text>
            <text x={rightOriginX - 90} y={baseY + 110} className="text-[10px] font-mono text-slate-600">DRAWING NO: S-101   REV: A   DATE: 2024   ENGINEER: AUTO</text>
          </g>
        </svg>
      </div>

      {/* Info Boxes */}
      <div className="grid grid-cols-2 gap-4 mt-2">
        <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4">
          <h4 className="text-sm font-bold text-blue-900 mb-1">Geometry Reference</h4>
          <p className="text-sm text-blue-800">Standard {wallType} cantilever wall with {H.toFixed(2)}m height and {actualBaseWidth.toFixed(2)}m base width.</p>
        </div>
        <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4">
          <h4 className="text-sm font-bold text-blue-900 mb-1">Reinforcement Schedule</h4>
          <p className="text-sm text-blue-800">Main tension bars {stemRebarText}. Distribution bars {distRebarText}.</p>
        </div>
      </div>
    </div>
  );
};
