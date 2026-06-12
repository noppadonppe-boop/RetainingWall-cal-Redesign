
import { useWallStore } from '../store/useWallStore';

export const LoadDiagramSVG = () => {
  const store = useWallStore();
  const { geometry, soilProperties, loads, wallType, lShapeOrientation } = store;

  // Geometry
  const H = geometry.totalHeight;
  const t_base = geometry.baseThickness;
  const t_stem = geometry.stemThickness;
  const toe = wallType === 'L-Shape' && lShapeOrientation === 'Heel-only' ? 0 : geometry.toeWidth;
  const heel = wallType === 'L-Shape' && lShapeOrientation === 'Toe-only' ? 0 : geometry.heelWidth;
  const actualBaseWidth = toe + t_stem + heel;

  // Scaling
  const viewBoxWidth = 400;
  const viewBoxHeight = 400;
  const maxDim = Math.max(H, actualBaseWidth) * 1.5;
  const scale = (viewBoxHeight * 0.6) / maxDim;

  const baseY = viewBoxHeight * 0.8;
  const originX = viewBoxWidth * 0.35; // Position wall on the left

  // Coordinates
  const x0 = originX - toe * scale;
  const x1 = originX;
  const x2 = originX + t_stem * scale;
  const x3 = originX + t_stem * scale + heel * scale;
  
  const y0 = baseY;
  const y1 = baseY - t_base * scale;
  const y2 = baseY - H * scale;

  // Backfill Profile
  const beta = soilProperties.backfillProfileType === 'Sloped' ? soilProperties.backfillInclination : 0;
  const betaRad = (beta * Math.PI) / 180;
  
  const groundStartX = x2; // top of stem right side
  const groundStartY = y2;
  const groundEndX = viewBoxWidth;
  // dy = dx * tan(beta)
  const groundEndY = groundStartY - (groundEndX - groundStartX) * Math.tan(betaRad);
  
  // Front Ground Profile
  const frontGroundStartX = 0;
  const frontGroundStartY = y1;
  const frontGroundEndX = originX - toe * scale;
  const frontGroundEndY = y1;

  // Soil Pressure Polygon (Purple area)
  // Drawn behind the wall (from heel to top of wall)
  const pressureWidth = 80; // fixed visual width for the pressure diagram
  
  // Surcharge
  const renderSurcharge = () => {
    if (!loads.surchargeActive) return null;

    const q = loads.surchargeLoad;
    const distanceX = loads.distanceFromWall * scale;
    const loadW = loads.loadWidth * scale;
    
    // Starting point of load on the ground surface
    // x position = groundStartX + distanceX
    const loadStartX = groundStartX + distanceX;
    let loadStartY = groundStartY;
    if (beta > 0) {
      loadStartY = groundStartY - distanceX * Math.tan(betaRad);
    }
    
    // Ending point of load
    const loadEndX = Math.min(loadStartX + loadW, viewBoxWidth - 20); // clip to view
    
    // Generate arrows
    const arrows = [];
    const numArrows = Math.max(3, Math.floor((loadEndX - loadStartX) / 20));
    const step = (loadEndX - loadStartX) / (numArrows > 1 ? numArrows - 1 : 1);
    
    for (let i = 0; i < numArrows; i++) {
      const ax = loadStartX + i * step;
      let ay = groundStartY;
      if (beta > 0) {
        ay = groundStartY - (ax - groundStartX) * Math.tan(betaRad);
      }
      
      arrows.push(
        <g key={i}>
          <line x1={ax} y1={ay - 40} x2={ax} y2={ay - 5} stroke="#2563eb" strokeWidth="2" markerEnd="url(#arrow-down)" />
        </g>
      );
    }

    return (
      <g>
        {arrows}
        {/* Load Line */}
        <line x1={loadStartX} y1={loadStartY - 40} x2={loadEndX} y2={loadStartY - (loadEndX - loadStartX)*Math.tan(betaRad) - 40} stroke="#2563eb" strokeWidth="1" />
        {/* Label */}
        <rect x={loadStartX + (loadEndX - loadStartX)/2 - 30} y={loadStartY - (loadEndX - loadStartX)/2 * Math.tan(betaRad) - 55} width="60" height="20" rx="4" fill="#eff6ff" />
        <text x={loadStartX + (loadEndX - loadStartX)/2} y={loadStartY - (loadEndX - loadStartX)/2 * Math.tan(betaRad) - 42} textAnchor="middle" className="text-[10px] font-bold fill-[#2563eb] font-mono">
          q = {q}
        </text>
      </g>
    );
  };

  return (
    <svg viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`} className="w-full h-full">
      <defs>
        <pattern id="dotGrid" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1" fill="#e2e8f0" />
        </pattern>
        <marker id="arrow-down" viewBox="0 0 10 10" refX="5" refY="10" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 0 L 5 10 z" fill="#2563eb" />
        </marker>
      </defs>

      {/* Grid Background */}
      <rect width="100%" height="100%" fill="url(#dotGrid)" />

      {/* Soil Pressure Visualization (Purple Zone) */}
      <g>
        <path d={`
          M ${x3} ${y1}
          L ${x3 + pressureWidth} ${y1}
          L ${x3 + pressureWidth} ${groundStartY}
          L ${x3} ${groundStartY}
          Z
        `} fill="#f3e8ff" fillOpacity="0.4" stroke="#a855f7" strokeWidth="1.5" />
        
        {/* Horizontal lines indicating pressure */}
        {Array.from({ length: 4 }).map((_, i) => (
          <line 
            key={i} 
            x1={x3} 
            y1={y1 - ((y1 - groundStartY) / 4) * (i + 1)} 
            x2={x3 + pressureWidth * (0.8 - i * 0.2)} 
            y2={y1 - ((y1 - groundStartY) / 4) * (i + 1)} 
            stroke="#d8b4fe" 
            strokeWidth="1" 
          />
        ))}
      </g>

      {/* Concrete Wall */}
      <path d={`
        M ${x0} ${y0}
        L ${x3} ${y0}
        L ${x3} ${y1}
        L ${x2} ${y1}
        L ${x2} ${y2}
        L ${x1} ${y2}
        L ${x1} ${y1}
        L ${x0} ${y1}
        Z
      `} fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.5" />

      {/* Ground Lines */}
      <line x1={groundStartX} y1={groundStartY} x2={groundEndX} y2={groundEndY} stroke="#94a3b8" strokeWidth="1.5" />
      <line x1={frontGroundStartX} y1={frontGroundStartY} x2={frontGroundEndX} y2={frontGroundEndY} stroke="#94a3b8" strokeWidth="1.5" />

      {/* Surcharge */}
      {renderSurcharge()}

    </svg>
  );
};
