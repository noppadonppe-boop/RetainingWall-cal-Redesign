import { useWallStore } from '../store/useWallStore';

export const WallGraphic = () => {
  const { wallType, lShapeOrientation, hasShearKey, geometry } = useWallStore();

  let toe = geometry.toeWidth;
  let heel = geometry.heelWidth;

  if (wallType === 'L-Shape') {
    if (lShapeOrientation === 'Heel-only') {
      toe = 0;
    } else if (lShapeOrientation === 'Toe-only') {
      heel = 0;
    }
  }

  const stem = geometry.stemThickness;
  const H = geometry.totalHeight;
  const tb = geometry.baseThickness;
  const B = toe + stem + heel;
  
  // Shear key geometry (assume 0.5m deep x stem width, directly under stem)
  const shearKeyDepth = hasShearKey ? 0.5 : 0;
  
  const minX = -1;
  const maxX = B + 2;
  const minY = -shearKeyDepth - 1;
  const maxY = H + 1;
  
  const viewBoxWidth = maxX - minX;
  const viewBoxHeight = maxY - minY;

  // Convert real coordinates to SVG viewBox coordinates
  const scale = 100; // 1m = 100 SVG units
  const vbW = viewBoxWidth * scale;
  const vbH = viewBoxHeight * scale;
  
  const cx = (x: number) => (x - minX) * scale;
  const cy = (y: number) => vbH - ((y - minY) * scale); // SVG Y goes down

  // Wall Polygon Path
  let path = `M ${cx(0)} ${cy(0)}`;
  if (hasShearKey) {
    path += ` L ${cx(toe)} ${cy(0)}`;
    path += ` L ${cx(toe)} ${cy(-shearKeyDepth)}`;
    path += ` L ${cx(toe + stem)} ${cy(-shearKeyDepth)}`;
    path += ` L ${cx(toe + stem)} ${cy(0)}`;
  }
  path += ` L ${cx(B)} ${cy(0)}`;
  path += ` L ${cx(B)} ${cy(tb)}`;
  path += ` L ${cx(toe + stem)} ${cy(tb)}`;
  path += ` L ${cx(toe + stem)} ${cy(H)}`;
  path += ` L ${cx(toe)} ${cy(H)}`;
  path += ` L ${cx(toe)} ${cy(tb)}`;
  path += ` L ${cx(0)} ${cy(tb)} Z`;

  // Soil Polygon Path (Retained soil on the Heel side)
  const soilStartX = toe + stem;
  const soilPath = `M ${cx(soilStartX)} ${cy(tb)} L ${cx(soilStartX)} ${cy(H)} L ${cx(maxX)} ${cy(H)} L ${cx(maxX)} ${cy(tb)} Z`;
  
  // Ground line (Toe side)
  const groundLeftPath = `M ${cx(minX)} ${cy(tb)} L ${cx(toe)} ${cy(tb)}`;

  return (
    <div className="bg-[#F1F5F9] border border-border-card rounded-2xl h-[400px] w-full relative overflow-hidden flex items-center justify-center shadow-sm">
      <div className="absolute top-4 left-4 bg-surface px-3 py-1 rounded-2xl border border-border-card label-caps text-slate-700 shadow-sm z-10">
        Cross Section View
      </div>
      
      <svg className="w-full h-full p-4" viewBox={`0 0 ${vbW} ${vbH}`} preserveAspectRatio="xMidYMid meet">
        {/* Grid Background */}
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" strokeWidth="1" />
          </pattern>
          <pattern id="soil" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 0 20 L 20 0 M -5 5 L 5 -5 M 15 25 L 25 15" fill="none" stroke="#cbd5e1" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Retained Soil */}
        <path d={soilPath} fill="url(#soil)" opacity="0.8" />
        <path d={soilPath} fill="#1e40af" opacity="0.05" />
        <line x1={cx(soilStartX)} y1={cy(H)} x2={cx(maxX)} y2={cy(H)} stroke="#94a3b8" strokeWidth="2" strokeDasharray="8 4" />

        {/* Ground Line Left */}
        <path d={groundLeftPath} stroke="#94a3b8" strokeWidth="2" strokeDasharray="8 4" />

        {/* Concrete Wall */}
        <path d={path} fill="#cbd5e1" stroke="#334155" strokeWidth="3" className="drop-shadow-md" />

        {/* Dimension Lines */}
        {/* Total Height H */}
        <line x1={cx(-0.4)} y1={cy(0)} x2={cx(-0.4)} y2={cy(H)} stroke="#7c3aed" strokeWidth="2" />
        <line x1={cx(-0.5)} y1={cy(0)} x2={cx(-0.3)} y2={cy(0)} stroke="#7c3aed" strokeWidth="2" />
        <line x1={cx(-0.5)} y1={cy(H)} x2={cx(-0.3)} y2={cy(H)} stroke="#7c3aed" strokeWidth="2" />
        <text x={cx(-0.5)} y={cy(H / 2)} fill="#7c3aed" fontSize="16" fontFamily="JetBrains Mono" fontWeight="bold" transform={`rotate(-90, ${cx(-0.5)}, ${cy(H / 2)})`} textAnchor="middle" dy="-10">
          H = {H.toFixed(2)}m
        </text>

        {/* Base Width B */}
        <line x1={cx(0)} y1={cy(-0.3 - shearKeyDepth)} x2={cx(B)} y2={cy(-0.3 - shearKeyDepth)} stroke="#7c3aed" strokeWidth="2" />
        <line x1={cx(0)} y1={cy(-0.2 - shearKeyDepth)} x2={cx(0)} y2={cy(-0.4 - shearKeyDepth)} stroke="#7c3aed" strokeWidth="2" />
        <line x1={cx(B)} y1={cy(-0.2 - shearKeyDepth)} x2={cx(B)} y2={cy(-0.4 - shearKeyDepth)} stroke="#7c3aed" strokeWidth="2" />
        <text x={cx(B / 2)} y={cy(-0.3 - shearKeyDepth)} fill="#7c3aed" fontSize="16" fontFamily="JetBrains Mono" fontWeight="bold" textAnchor="middle" dy="20">
          B = {B.toFixed(2)}m
        </text>
        
        {/* Stem Width */}
        <line x1={cx(toe)} y1={cy(H + 0.3)} x2={cx(toe + stem)} y2={cy(H + 0.3)} stroke="#7c3aed" strokeWidth="2" />
        <line x1={cx(toe)} y1={cy(H + 0.2)} x2={cx(toe)} y2={cy(H + 0.4)} stroke="#7c3aed" strokeWidth="2" />
        <line x1={cx(toe + stem)} y1={cy(H + 0.2)} x2={cx(toe + stem)} y2={cy(H + 0.4)} stroke="#7c3aed" strokeWidth="2" />
        <text x={cx(toe + stem / 2)} y={cy(H + 0.3)} fill="#7c3aed" fontSize="14" fontFamily="JetBrains Mono" fontWeight="bold" textAnchor="middle" dy="-10">
          {stem.toFixed(2)}m
        </text>

      </svg>
    </div>
  );
};
