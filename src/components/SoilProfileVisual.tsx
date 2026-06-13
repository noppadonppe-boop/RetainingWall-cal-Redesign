import { useMemo } from 'react';
import { useWallStore } from '../store/useWallStore';
import { getEffectiveGeometry } from '../utils/geometry';

interface LayerBand {
  id: string;
  name: string;
  topDepth: number;
  bottomDepth: number;
}

const layerPalette = [
  { fill: '#fde68a', text: '#78350f' },
  { fill: '#bfdbfe', text: '#1e3a8a' },
  { fill: '#d9f99d', text: '#365314' },
  { fill: '#fecaca', text: '#7f1d1d' },
  { fill: '#ddd6fe', text: '#4c1d95' },
];

const formatElevation = (depth: number) => {
  if (Math.abs(depth) < 0.0001) {
    return 'EL+0.00';
  }

  return `EL-${depth.toFixed(2)} m.`;
};

const buildLayerBands = (
  layers: ReturnType<typeof useWallStore.getState>['soilProperties']['layers'],
  maxDepth: number,
) => {
  const bands: LayerBand[] = [];
  let currentDepth = 0;

  for (const layer of layers) {
    if (currentDepth >= maxDepth) {
      break;
    }

    const nextDepth = Math.min(currentDepth + layer.thickness, maxDepth);
    bands.push({
      id: layer.id,
      name: layer.name,
      topDepth: currentDepth,
      bottomDepth: nextDepth,
    });
    currentDepth = nextDepth;
  }

  return bands;
};

const intersectBands = (bands: LayerBand[], startDepth: number, endDepth: number) =>
  bands
    .map((band) => ({
      ...band,
      topDepth: Math.max(startDepth, band.topDepth),
      bottomDepth: Math.min(endDepth, band.bottomDepth),
    }))
    .filter((band) => band.bottomDepth > band.topDepth);

export const SoilProfileVisual = () => {
  const store = useWallStore();

  const geometry = useMemo(
    () => getEffectiveGeometry(store.geometry, store.wallType, store.lShapeOrientation),
    [store.geometry, store.lShapeOrientation, store.wallType],
  );

  const H = geometry.totalHeight;
  const frontFillDepth = Math.max(H - geometry.frontFillHeight, 0);
  const totalDepth = Math.max(
    store.soilProperties.layers.reduce((sum, layer) => sum + layer.thickness, 0),
    H,
    5,
  );

  const allBands = useMemo(
    () => buildLayerBands(store.soilProperties.layers, totalDepth),
    [store.soilProperties.layers, totalDepth],
  );

  const backBands = allBands;
  const frontBands = intersectBands(allBands, frontFillDepth, totalDepth);

  const view = {
    width: 1120,
    height: 860,
  };
  const leftBox = {
    x: 95,
    width: 320,
  };
  const wall = {
    x: 480,
    width: 16,
  };
  const rightBox = {
    x: 560,
    width: 390,
  };
  const topY = 120;
  const bottomY = 740;
  const scaleY = (bottomY - topY) / Math.max(totalDepth, 0.1);
  const yAtDepth = (depth: number) => topY + depth * scaleY;
  const frontGroundY = yAtDepth(frontFillDepth);
  const wallBottomY = yAtDepth(H);
  const rightGroundEndX = 980;
  const rightGroundEndY = 88;

  const renderBand = (
    band: LayerBand,
    side: 'front' | 'back',
    index: number,
  ) => {
    const y = yAtDepth(band.topDepth);
    const height = (band.bottomDepth - band.topDepth) * scaleY;
    const palette = layerPalette[index % layerPalette.length];
    const x = side === 'front' ? leftBox.x : rightBox.x;
    const width = side === 'front' ? leftBox.width : rightBox.width;
    const midY = y + height / 2;
    const label = `Layer ${allBands.findIndex((entry) => entry.id === band.id) + 1}`;

    return (
      <g key={`${side}-${band.id}`}>
        <rect x={x} y={y} width={width} height={height} fill={palette.fill} opacity="0.28" />
        <line x1={x} y1={y} x2={x + width} y2={y} stroke="#64748b" strokeWidth="1.4" />
        <line x1={x} y1={y + height} x2={x + width} y2={y + height} stroke="#64748b" strokeWidth="1.4" />
        <text
          x={x + width / 2}
          y={midY - 8}
          textAnchor="middle"
          fontSize="24"
          fontWeight="700"
          fill={palette.text}
        >
          {label.toUpperCase()}
        </text>
        <text
          x={x + width / 2}
          y={midY + 28}
          textAnchor="middle"
          fontSize="18"
          fill={palette.text}
        >
          {band.name}
        </text>
      </g>
    );
  };

  return (
    <div className="bg-surface border border-border-card rounded-2xl h-full min-h-[820px] w-full relative overflow-hidden shadow-sm p-4">
      <div className="absolute top-4 left-4 bg-surface px-3 py-1 rounded-2xl border border-border-card label-caps text-slate-700 shadow-sm z-10">
        Soil Type
      </div>

      <svg viewBox={`0 0 ${view.width} ${view.height}`} className="w-full h-full">
        <text x="80" y="72" fontSize="32" fontWeight="700" fill="#0f172a">
          SOIL TYPE
        </text>

        <text x={leftBox.x + leftBox.width / 2} y="118" textAnchor="middle" fontSize="18" fontWeight="700" fill="#334155">
          FRONT SIDE
        </text>
        <text x={rightBox.x + rightBox.width / 2} y="118" textAnchor="middle" fontSize="18" fontWeight="700" fill="#334155">
          BACK SIDE
        </text>

        <line x1={wall.x + wall.width} y1={topY} x2={rightGroundEndX} y2={rightGroundEndY} stroke="#334155" strokeWidth="2" />
        <rect x={wall.x} y={topY} width={wall.width} height={wallBottomY - topY} fill="#e2e8f0" stroke="#334155" strokeWidth="2" />

        <line x1={wall.x + wall.width} y1={topY} x2={rightBox.x + rightBox.width} y2={topY} stroke="#64748b" strokeWidth="1.4" />
        <line x1={leftBox.x} y1={frontGroundY} x2={wall.x} y2={frontGroundY} stroke="#64748b" strokeWidth="1.4" />

        <g stroke="#94a3b8" strokeWidth="1.3">
          <line x1={wall.x + 120} y1={topY - 5} x2={wall.x + 138} y2={topY + 22} />
          <line x1={wall.x + 136} y1={topY - 5} x2={wall.x + 154} y2={topY + 22} />
          <line x1={wall.x + 152} y1={topY - 5} x2={wall.x + 170} y2={topY + 22} />
          <line x1={leftBox.x + 52} y1={frontGroundY} x2={leftBox.x + 72} y2={frontGroundY + 20} />
          <line x1={leftBox.x + 72} y1={frontGroundY} x2={leftBox.x + 92} y2={frontGroundY + 20} />
          <line x1={leftBox.x + 92} y1={frontGroundY} x2={leftBox.x + 112} y2={frontGroundY + 20} />
        </g>

        {backBands.map((band, index) => renderBand(band, 'back', index))}
        {frontBands.map((band, index) => renderBand(band, 'front', index))}

        <text x={350} y={topY - 10} fontSize="22" fill="#1f2937">
          {formatElevation(0)}
        </text>
        <text x={205} y={frontGroundY - 12} fontSize="22" fill="#1f2937">
          {formatElevation(frontFillDepth)}
        </text>

        {backBands.slice(0, -1).map((band) => (
          <text
            key={`back-el-${band.id}`}
            x={650}
            y={yAtDepth(band.bottomDepth) - 12}
            fontSize="22"
            fill="#1f2937"
          >
            {formatElevation(band.bottomDepth)}
          </text>
        ))}

        {frontBands.map((band) => (
          <text
            key={`front-el-${band.id}`}
            x={245}
            y={yAtDepth(band.bottomDepth) - 12}
            fontSize="22"
            fill="#1f2937"
          >
            {formatElevation(band.bottomDepth)}
          </text>
        ))}

        <text x={145} y={(topY + frontGroundY) / 2 - 6} fontSize="22" fill="#111827">
          FRONT
        </text>
        <text x={235} y={(topY + frontGroundY) / 2 - 6} fontSize="22" fill="#111827">
          RETAINING WALL
        </text>
      </svg>
    </div>
  );
};
