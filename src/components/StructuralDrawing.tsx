
import { useWallStore } from '../store/useWallStore';
import { runCalculations } from '../utils/calculationEngine';
import { PenTool } from 'lucide-react';

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
  const viewWidth = 1000;
  const viewHeight = 650;
  
  // Find max dimension to scale drawing
  const maxDim = Math.max(H, actualBaseWidth); // removed * 1.5 padding to make it larger
  const scale = (viewHeight * 0.65) / maxDim; // use 65% of SVG height
  
  // Center drawing vertically and horizontally
  const baseY = viewHeight * 0.8; 
  
  // Left Drawing (Geometry) Origin
  const leftOriginX = 280;
  
  // Right Drawing (Reinforcement) Origin
  const rightOriginX = 720;

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

  const drawDimension = (xStart: number, yStart: number, xEnd: number, yEnd: number, label1: string, label2: string, isVertical = false) => {
    const midX = (xStart + xEnd) / 2;
    const midY = (yStart + yEnd) / 2;
    
    return (
      <g className="text-[#64748b] font-sans text-[10px]">
        {/* Main Line with Arrows */}
        <line x1={xStart} y1={yStart} x2={xEnd} y2={yEnd} stroke="currentColor" strokeWidth="1" markerStart="url(#arrow-start)" markerEnd="url(#arrow-end)" />
        
        {/* End Tick extensions */}
        {isVertical ? (
          <>
            <line x1={xStart} y1={yStart} x2={xStart + 30} y2={yStart} stroke="#cbd5e1" strokeWidth="1" />
            <line x1={xEnd} y1={yEnd} x2={xEnd + 30} y2={yEnd} stroke="#cbd5e1" strokeWidth="1" />
            
            <g transform={`translate(${midX}, ${midY}) rotate(-90)`}>
              <rect x="-55" y="-15" width="110" height="30" fill="white" />
              <text x="0" y="-3" textAnchor="middle">{label1}</text>
              <text x="0" y="8" textAnchor="middle" className="font-bold">{label2}</text>
            </g>
          </>
        ) : (
          <>
            <line x1={xStart} y1={yStart} x2={xStart} y2={yStart - 30} stroke="#cbd5e1" strokeWidth="1" />
            <line x1={xEnd} y1={yEnd} x2={xEnd} y2={yEnd - 30} stroke="#cbd5e1" strokeWidth="1" />
            
            <rect x={midX - 45} y={midY - 10} width="90" height="20" fill="white" />
            <text x={midX} y={midY - 2} textAnchor="middle">{label1}</text>
            <text x={midX} y={midY + 8} textAnchor="middle" className="font-bold">{label2}</text>
          </>
        )}
      </g>
    );
  };

  const drawGroundLevel = (x: number, y: number, label: string) => (
    <g>
      <line x1={x} y1={y} x2={x + 100} y2={y} stroke="#64748b" strokeWidth="1" />
      <polygon points={`${x + 10},${y} ${x + 15},${y - 8} ${x + 5},${y - 8}`} fill="none" stroke="#64748b" strokeWidth="1" />
      <text x={x + 20} y={y - 4} className="text-[10px] text-[#64748b] font-sans">{label}</text>
      {/* Hatching */}
      <line x1={x + 30} y1={y} x2={x + 25} y2={y + 8} stroke="#cbd5e1" strokeWidth="1" />
      <line x1={x + 50} y1={y} x2={x + 45} y2={y + 8} stroke="#cbd5e1" strokeWidth="1" />
      <line x1={x + 70} y1={y} x2={x + 65} y2={y + 8} stroke="#cbd5e1" strokeWidth="1" />
      <line x1={x + 90} y1={y} x2={x + 85} y2={y + 8} stroke="#cbd5e1" strokeWidth="1" />
    </g>
  );

  const drawCallout = (startX: number, startY: number, midX: number, midY: number, endX: number, text1: string, text2: string, text3?: string, alignRight = false) => {
    return (
      <g className="text-[#334155] font-sans text-[9px]">
        <circle cx={startX} cy={startY} r="2" fill="#64748b" />
        <polyline points={`${startX},${startY} ${midX},${midY} ${endX},${midY}`} fill="none" stroke="#64748b" strokeWidth="1" />
        <text x={alignRight ? endX - 5 : endX + 5} y={midY - 12} textAnchor={alignRight ? "end" : "start"}>{text1}</text>
        <text x={alignRight ? endX - 5 : endX + 5} y={midY - 2} textAnchor={alignRight ? "end" : "start"}>{text2}</text>
        {text3 && <text x={alignRight ? endX - 5 : endX + 5} y={midY + 8} textAnchor={alignRight ? "end" : "start"}>{text3}</text>}
      </g>
    );
  };

  // Rebar text from calculations
  const stemRebarText = results.structural.stem?.rebar?.label || "DB20 @ 15 cm c/c";
  const distRebarText = results.structural.stem?.rebar_dist?.label || "DB12 @ 20 cm c/c";
  const heelRebarText = results.structural.heel?.rebar?.label || "DB16 @ 15 cm c/c";
  const toeRebarText = results.structural.toe?.rebar?.label || "DB16 @ 15 cm c/c";

  // Coordinates for left drawing
  const l_baseL = leftOriginX - (actualBaseWidth * scale) / 2;
  const l_baseR = leftOriginX + (actualBaseWidth * scale) / 2;
  const l_stemL = l_baseL + activeToe * scale;
  const l_stemR = l_stemL + t_stem * scale;

  // Coordinates for right drawing
  const r_baseL = rightOriginX - (actualBaseWidth * scale) / 2;
  const r_baseR = rightOriginX + (actualBaseWidth * scale) / 2;
  const r_stemL = r_baseL + activeToe * scale;
  const r_stemR = r_stemL + t_stem * scale;
  
  const topY = baseY - H * scale;
  const topBaseY = baseY - t_base * scale;
  
  const cover = 10;

  return (
    <div className="w-full flex flex-col gap-6">
      
      {/* Visual Engineering Diagrams Wrapper */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <PenTool className="w-6 h-6 text-blue-700" />
          <h2 className="text-2xl font-bold text-[#0f172a] font-sans tracking-tight">Visual Engineering Diagrams</h2>
        </div>

        <div className="border border-[#e2e8f0] rounded-2xl bg-white p-6 shadow-sm">
          
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-[#1e293b]">Technical Drawing & Reinforcement Details</h3>
              <p className="text-sm text-[#64748b] font-mono mt-1">Compliant with Thai Engineering Standards (EIT)</p>
            </div>
            <div className="flex gap-3">
              <span className="bg-[#eff6ff] text-[#1d4ed8] text-xs font-bold px-4 py-1.5 rounded-full">Scale 1:25</span>
              <span className="bg-[#eff6ff] text-[#1d4ed8] text-xs font-bold px-4 py-1.5 rounded-full">Unit: Meters</span>
            </div>
          </div>

          {/* SVG Container */}
          <div className="w-full border border-[#e2e8f0] rounded-xl overflow-x-auto bg-white mb-6 p-4">
            <svg viewBox={`0 0 ${viewWidth} ${viewHeight}`} className="w-full h-auto min-w-[800px]">
              <defs>
                <marker id="arrow-start" viewBox="0 0 10 10" refX="2" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 10 0 L 0 5 L 10 10 z" fill="#64748b" />
                </marker>
                <marker id="arrow-end" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b" />
                </marker>
                <pattern id="concrete-fill" patternUnits="userSpaceOnUse" width="20" height="20">
                  <circle cx="2" cy="2" r="1" fill="#cbd5e1" />
                  <circle cx="10" cy="10" r="0.5" fill="#cbd5e1" />
                  <circle cx="18" cy="18" r="1" fill="#cbd5e1" />
                </pattern>
              </defs>

              <rect width={viewWidth} height={viewHeight} fill="white" />

              {/* ========================================================= */}
              {/* === LEFT DRAWING (Geometry) === */}
              {/* ========================================================= */}
              <g>
                {/* Outline */}
                <path d={getConcretePath(leftOriginX)} fill="#f1f5f9" stroke="#475569" strokeWidth="1.5" />
                
                {/* Backfill Level */}
                {drawGroundLevel(l_stemR + 10, topY + 20, "BACKFILL LEVEL")}
                
                {/* Existing Ground Level */}
                {drawGroundLevel(l_baseR + 20, baseY, "EXISTING GROUND LEVEL")}

                {/* Dimensions */}
                {/* Wall Height */}
                {drawDimension(
                  l_baseL - 50, baseY, 
                  l_baseL - 50, topY, 
                  "WALL HEIGHT:", `${H.toFixed(2)} m`, true
                )}

                {/* Base Width */}
                {drawDimension(
                  l_baseL, baseY + 60, 
                  l_baseR, baseY + 60, 
                  "BASE WIDTH:", `${actualBaseWidth.toFixed(2)} m`
                )}

                {/* Toe Length */}
                {activeToe > 0 && drawDimension(
                  l_baseL, baseY + 25, 
                  l_stemL, baseY + 25, 
                  "TOE LENGTH:", `${activeToe.toFixed(2)} m`
                )}

                {/* Heel Length */}
                {activeHeel > 0 && drawDimension(
                  l_stemL, baseY + 25, 
                  l_baseR, baseY + 25, 
                  "HEEL LENGTH:", `${(actualBaseWidth - activeToe).toFixed(2)} m`
                )}

                {/* Stem Thickness Top */}
                <g className="text-[#64748b] font-sans text-[10px]">
                  <line x1={l_stemL} y1={topY - 20} x2={l_stemR} y2={topY - 20} stroke="currentColor" strokeWidth="1" markerStart="url(#arrow-start)" markerEnd="url(#arrow-end)" />
                  <line x1={l_stemL} y1={topY} x2={l_stemL} y2={topY - 30} stroke="#cbd5e1" strokeWidth="1" />
                  <line x1={l_stemR} y1={topY} x2={l_stemR} y2={topY - 30} stroke="#cbd5e1" strokeWidth="1" />
                  <text x={l_stemR + 10} y={topY - 25} textAnchor="start">STEM THICKNESS (TOP):</text>
                  <text x={l_stemR + 10} y={topY - 13} textAnchor="start" className="font-bold">{t_stem.toFixed(2)} m</text>
                </g>

                {/* Stem Thickness Bottom */}
                <g className="text-[#64748b] font-sans text-[10px]">
                  <line x1={l_stemL} y1={topBaseY - 20} x2={l_stemR} y2={topBaseY - 20} stroke="currentColor" strokeWidth="1" markerStart="url(#arrow-start)" markerEnd="url(#arrow-end)" />
                  <line x1={l_stemL} y1={topBaseY} x2={l_stemL} y2={topBaseY - 30} stroke="#cbd5e1" strokeWidth="1" />
                  <line x1={l_stemR} y1={topBaseY} x2={l_stemR} y2={topBaseY - 30} stroke="#cbd5e1" strokeWidth="1" />
                  <text x={l_stemR + 10} y={topBaseY - 25} textAnchor="start">STEM THICKNESS (BOTTOM):</text>
                  <text x={l_stemR + 10} y={topBaseY - 13} textAnchor="start" className="font-bold">{t_stem.toFixed(2)} m</text>
                </g>
              </g>

              {/* ========================================================= */}
              {/* === RIGHT DRAWING (Reinforcement) === */}
              {/* ========================================================= */}
              <g>
                {/* Outline */}
                <path d={getConcretePath(rightOriginX)} fill="#f8fafc" stroke="#64748b" strokeWidth="1" />
                <path d={getConcretePath(rightOriginX)} fill="url(#concrete-fill)" />
                
                {/* Backfill Level */}
                <line x1={r_stemR + 10} y1={topY + 20} x2={r_stemR + 100} y2={topY + 20} stroke="#94a3b8" strokeWidth="1" />
                <line x1={r_baseL - 50} y1={baseY} x2={r_baseL - 10} y2={baseY} stroke="#94a3b8" strokeWidth="1" />

                {/* ================= REBARS ================= */}
                
                {/* Main Vertical Rebar (Tension side - Soil side) */}
                <path d={`
                  M ${r_stemR - cover - 5} ${topY + cover + 15}
                  C ${r_stemR - cover - 5} ${topY + cover}, ${r_stemR - cover} ${topY + cover}, ${r_stemR - cover} ${topY + cover + 10}
                  L ${r_stemR - cover} ${baseY - cover}
                  L ${r_baseR - cover} ${baseY - cover}
                  C ${r_baseR - cover + 5} ${baseY - cover}, ${r_baseR - cover + 5} ${baseY - cover - 10}, ${r_baseR - cover} ${baseY - cover - 10}
                `} fill="none" stroke="#1d4ed8" strokeWidth="2.5" />

                {/* Secondary Vertical Rebar (Compression side) */}
                <path d={`
                  M ${r_stemL + cover + 5} ${topY + cover + 15}
                  C ${r_stemL + cover + 5} ${topY + cover}, ${r_stemL + cover} ${topY + cover}, ${r_stemL + cover} ${topY + cover + 10}
                  L ${r_stemL + cover} ${topBaseY + cover}
                `} fill="none" stroke="#60a5fa" strokeWidth="1.5" />

                {/* Top Heel Rebar */}
                <path d={`
                  M ${r_stemL + cover} ${topBaseY + cover}
                  L ${r_baseR - cover} ${topBaseY + cover}
                  C ${r_baseR - cover + 5} ${topBaseY + cover}, ${r_baseR - cover + 5} ${topBaseY + cover + 10}, ${r_baseR - cover} ${topBaseY + cover + 10}
                `} fill="none" stroke="#2563eb" strokeWidth="2" />

                {/* Bottom Toe Rebar */}
                {activeToe > 0 && (
                  <path d={`
                    M ${r_baseL + cover} ${baseY - cover - 10}
                    C ${r_baseL + cover - 5} ${baseY - cover - 10}, ${r_baseL + cover - 5} ${baseY - cover}, ${r_baseL + cover} ${baseY - cover}
                    L ${r_stemR - cover} ${baseY - cover}
                  `} fill="none" stroke="#2563eb" strokeWidth="2" />
                )}

                {/* Hooks for the bottom toe bar */}
                <path d={`
                  M ${r_baseL + cover} ${topBaseY + cover}
                  C ${r_baseL + cover - 5} ${topBaseY + cover}, ${r_baseL + cover - 5} ${topBaseY + cover + 10}, ${r_baseL + cover} ${topBaseY + cover + 10}
                `} fill="none" stroke="#2563eb" strokeWidth="2" />

                {/* Distribution Dots */}
                {Array.from({ length: Math.floor(H / 0.5) }).map((_, i) => {
                  const yPos = topY + 40 + i * 40;
                  if (yPos > baseY - t_base * scale - 20) return null;
                  return (
                    <g key={i}>
                      <circle cx={r_stemR - cover - 3} cy={yPos} r="2.5" fill="#1e40af" />
                      <circle cx={r_stemL + cover + 2} cy={yPos} r="2" fill="#3b82f6" />
                    </g>
                  );
                })}
                {/* Distribution Dots in Base */}
                <circle cx={r_baseR - 40} cy={topBaseY + cover + 3} r="2.5" fill="#1e40af" />
                <circle cx={r_baseR - 80} cy={topBaseY + cover + 3} r="2.5" fill="#1e40af" />
                <circle cx={r_baseR - 40} cy={baseY - cover - 3} r="2.5" fill="#1e40af" />
                <circle cx={r_baseR - 80} cy={baseY - cover - 3} r="2.5" fill="#1e40af" />

                {activeToe > 0 && (
                  <>
                    <circle cx={r_baseL + 40} cy={baseY - cover - 3} r="2.5" fill="#1e40af" />
                    <circle cx={r_baseL + 40} cy={topBaseY + cover + 3} r="2.5" fill="#1e40af" />
                  </>
                )}


                {/* ================= CALLOUTS ================= */}

                {/* Main Vertical Rebar */}
                {drawCallout(
                  r_stemL + 15, topY + 120, 
                  r_stemL - 30, topY + 90, 
                  r_stemL - 40,
                  "MAIN VERTICAL REBARS:",
                  stemRebarText,
                  "(TENSION SIDE)",
                  true
                )}

                {/* Distribution Rebar */}
                {drawCallout(
                  r_stemR - 10, topY + 180, 
                  r_stemR + 40, topY + 170, 
                  r_stemR + 50,
                  "HORIZONTAL",
                  `DISTRIBUTION BARS:`,
                  distRebarText
                )}

                {/* Top Heel Rebar */}
                {drawCallout(
                  r_baseR - 60, topBaseY + 15, 
                  r_baseR + 40, topBaseY - 20, 
                  r_baseR + 50,
                  "TOP HEEL",
                  "REINFORCEMENT:",
                  heelRebarText
                )}

                {/* Bottom Toe Rebar */}
                {activeToe > 0 && drawCallout(
                  r_baseL + 50, baseY - 15, 
                  r_baseL + 30, baseY + 30, 
                  r_baseL + 20,
                  "BOTTOM TOE",
                  "REINFORCEMENT:",
                  toeRebarText,
                  true
                )}

                {/* Drawing Label Box */}
                <g transform={`translate(${rightOriginX - 180}, ${baseY + 40})`}>
                  <rect x="0" y="0" width="360" height="40" fill="none" stroke="#94a3b8" strokeWidth="1" />
                  <line x1="0" y1="20" x2="360" y2="20" stroke="#94a3b8" strokeWidth="1" />
                  <line x1="240" y1="20" x2="240" y2="40" stroke="#94a3b8" strokeWidth="1" />
                  
                  <text x="5" y="14" className="text-[9px] font-sans text-[#334155]">PROJECT: CONCRETE RETAINING WALL - CROSS SECTION & REINFORCEMENT DETAILS</text>
                  <text x="5" y="33" className="text-[8px] font-sans text-[#475569]">DRAWING NO: C-101   REV: A   DATE: OCT 26, 2023</text>
                  <text x="245" y="33" className="text-[8px] font-sans text-[#475569]">ENGINEER: J. SMITH, P.E.</text>
                </g>
              </g>
            </svg>
          </div>

          {/* Info Boxes */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-5 shadow-sm">
              <h4 className="text-[13px] font-bold text-[#1d4ed8] mb-2 font-mono">Geometry Reference</h4>
              <p className="text-[13px] text-[#475569]">Standard {wallType} cantilever wall with {H.toFixed(2)}m height and {actualBaseWidth.toFixed(2)}m base width.</p>
            </div>
            <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-5 shadow-sm">
              <h4 className="text-[13px] font-bold text-[#1d4ed8] mb-2 font-mono">Reinforcement Schedule</h4>
              <p className="text-[13px] text-[#475569]">Main tension bars {stemRebarText}. Distribution bars {distRebarText}.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
