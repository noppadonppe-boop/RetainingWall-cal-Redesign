import { useMemo } from 'react';
import { useWallStore } from '../store/useWallStore';
import {
  getEffectiveGeometry,
  getWallTypeFigureLabel,
  getShearKeyGeometry,
} from '../utils/geometry';

export const GeometryVisual = () => {
  const store = useWallStore();

  const geometry = useMemo(
    () => getEffectiveGeometry(store.geometry, store.wallType, store.lShapeOrientation),
    [store.geometry, store.lShapeOrientation, store.wallType],
  );

  const H = geometry.totalHeight;
  const h1 = Math.min(geometry.frontFillHeight, H);
  const hw = Math.min(geometry.waterTableHeight, H);
  const twt = geometry.topStemWidth;
  const twb = geometry.bottomStemWidth;
  const Bh = geometry.activeToeWidth;
  const B = geometry.actualBaseWidth;
  const tb = geometry.baseThickness;
  const heel = geometry.activeHeelWidth;
  const shearKey = getShearKeyGeometry(store.geometry, store.hasShearKey);
  const shearKeyDepth = shearKey.depth;
  const shearKeyWidth = shearKey.width;
  const title = getWallTypeFigureLabel(store.wallType, store.hasShearKey);
  const formatDim = (value: number) => `${value.toFixed(2)} m`;
  const dimensionTextColor = '#1d4ed8';
  const annotationTextColor = '#0f172a';

  const vbWidth = 1120;
  const vbHeight = 940;
  const drawingTop = 90;
  const drawingBottom = 320;
  const drawingWidth = 760;
  const drawingHeight = vbHeight - drawingTop - drawingBottom;
  const scale = Math.min(
    drawingWidth / Math.max(B + 0.8, 0.1),
    drawingHeight / Math.max(H + shearKeyDepth + 0.8, 0.1),
  ) * 1.22;
  const centerX = vbWidth / 2;
  const originY = drawingTop + H * scale + 40;
  const baseLeft = centerX - (B * scale) / 2;
  const baseRight = baseLeft + B * scale;
  const baseTop = originY - tb * scale;
  const wallTop = originY - H * scale;
  const stemLeft = baseLeft + Bh * scale;
  const stemRight = stemLeft + twb * scale;
  const stemTopLeft = stemLeft + Math.max(((twb - twt) * scale) / 2, 0);
  const stemTopRight = stemTopLeft + twt * scale;
  const shearKeyLeft = stemLeft + (twb * scale - shearKeyWidth * scale) / 2;
  const shearKeyRight = shearKeyLeft + shearKeyWidth * scale;
  const shearKeyBottom = originY + shearKeyDepth * scale;
  const frontGroundY = baseTop - h1 * scale;
  const waterLineY = baseTop - hw * scale;
  const twbLabelY = baseTop + 44;
  const bhLabelY = originY + 56;
  const bLabelY = originY + 150;
  const ktLabelY = shearKeyBottom + 74;
  const titleY = Math.max(store.hasShearKey ? ktLabelY + 78 : bLabelY + 78, originY + 210);
  const viewBoxLeft = Math.max(0, baseLeft - 170);
  const viewBoxTop = Math.max(0, wallTop - 120);
  const viewBoxRight = Math.min(vbWidth, baseRight + 210);
  const viewBoxBottom = Math.min(vbHeight, titleY + 50);
  const viewBoxWidth = viewBoxRight - viewBoxLeft;
  const viewBoxHeight = viewBoxBottom - viewBoxTop;

  const dimension = (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    label: string,
    vertical = false,
    textOffset = 0,
  ) => {
    const upperLabel = label.toUpperCase();
    const labelWidth = upperLabel.length * 8.8 + 16;

    return (
    <g stroke="#64748b" strokeWidth="1" fill="none">
      <line x1={x1} y1={y1} x2={x2} y2={y2} />
      {vertical ? (
        <>
          <line x1={x1 - 6} y1={y1} x2={x1 + 6} y2={y1} />
          <line x1={x2 - 6} y1={y2} x2={x2 + 6} y2={y2} />
          <rect
            x={(x1 + x2) / 2 - 22 + textOffset - labelWidth / 2}
            y={(y1 + y2) / 2 - 11}
            width={labelWidth}
            height="24"
            fill="white"
            stroke="none"
            transform={`rotate(-90 ${(x1 + x2) / 2 - 10 + textOffset} ${(y1 + y2) / 2})`}
          />
          <text
            x={(x1 + x2) / 2 - 10 + textOffset}
            y={(y1 + y2) / 2}
            fill={dimensionTextColor}
            fontSize="17"
            fontWeight="700"
            textAnchor="middle"
            transform={`rotate(-90 ${(x1 + x2) / 2 - 10 + textOffset} ${(y1 + y2) / 2})`}
          >
            {upperLabel}
          </text>
        </>
      ) : (
        <>
          <line x1={x1} y1={y1 - 6} x2={x1} y2={y1 + 6} />
          <line x1={x2} y1={y2 - 6} x2={x2} y2={y2 + 6} />
          <rect
            x={(x1 + x2) / 2 - labelWidth / 2}
            y={y1 - 28 + textOffset}
            width={labelWidth}
            height="24"
            fill="white"
            stroke="none"
          />
          <text
            x={(x1 + x2) / 2}
            y={y1 - 9 + textOffset}
            fill={dimensionTextColor}
            fontSize="17"
            fontWeight="700"
            textAnchor="middle"
          >
            {upperLabel}
          </text>
        </>
      )}
    </g>
    );
  };

  return (
    <div className="bg-surface border border-border-card rounded-2xl h-full min-h-[780px] w-full relative overflow-hidden shadow-sm p-6">
      <div className="absolute top-4 left-4 bg-surface px-3 py-1 rounded-2xl border border-border-card label-caps text-slate-700 shadow-sm z-10">
        Cross Section View
      </div>

      <svg viewBox={`${viewBoxLeft} ${viewBoxTop} ${viewBoxWidth} ${viewBoxHeight}`} className="w-full h-full">
        <line x1={baseLeft - 20} y1={frontGroundY} x2={stemLeft - 14} y2={frontGroundY} stroke="#475569" strokeWidth="1" />
        <line x1={stemTopRight + 18} y1={wallTop + 8} x2={baseRight + 110} y2={wallTop - 26} stroke="#475569" strokeWidth="1" />
        <line x1={stemTopRight + 44} y1={waterLineY} x2={baseRight + 150} y2={waterLineY} stroke="#475569" strokeWidth="1" />
        <text x={stemTopRight + 104} y={waterLineY - 14} fontSize="18" fontWeight="700" fill={annotationTextColor}>
          WATER TABLE
        </text>

        <path
          d={[
            `M ${baseLeft} ${originY}`,
            `L ${baseRight} ${originY}`,
            `L ${baseRight} ${baseTop}`,
            store.hasShearKey
              ? `L ${stemRight} ${baseTop} L ${stemRight} ${originY} L ${shearKeyRight} ${originY} L ${shearKeyRight} ${shearKeyBottom} L ${shearKeyLeft} ${shearKeyBottom} L ${shearKeyLeft} ${originY} L ${stemLeft} ${originY} L ${stemLeft} ${baseTop}`
              : '',
            `L ${stemRight} ${baseTop}`,
            `L ${stemTopRight} ${wallTop}`,
            `L ${stemTopLeft} ${wallTop}`,
            `L ${stemLeft} ${baseTop}`,
            `L ${baseLeft} ${baseTop}`,
            'Z',
          ].join(' ')}
          fill="none"
          stroke="#334155"
          strokeWidth="1.5"
        />

        <g stroke="#94a3b8" strokeWidth="1">
          <line x1={baseLeft + 18} y1={frontGroundY} x2={baseLeft + 36} y2={frontGroundY + 10} />
          <line x1={baseLeft + 34} y1={frontGroundY} x2={baseLeft + 52} y2={frontGroundY + 10} />
          <line x1={stemTopRight + 28} y1={wallTop - 3} x2={stemTopRight + 40} y2={wallTop + 10} />
          <line x1={stemTopRight + 42} y1={wallTop - 3} x2={stemTopRight + 54} y2={wallTop + 10} />
          <line x1={stemTopRight + 56} y1={wallTop - 3} x2={stemTopRight + 68} y2={wallTop + 10} />
        </g>

        <text x={baseLeft + 40} y={wallTop + 98} fontSize="18" fontWeight="700" fill={annotationTextColor}>
          FRONT RETAINING WALL
        </text>

        {dimension(baseLeft - 120, originY, baseLeft - 120, wallTop, `H = ${formatDim(H)}`, true, -8)}
        {dimension(baseLeft - 18, originY, baseLeft - 18, frontGroundY, `h1 = ${formatDim(h1)}`, true, -2)}
        {dimension(baseRight + 88, originY, baseRight + 88, waterLineY, `hw = ${formatDim(hw)}`, true, 4)}
        {dimension(stemTopLeft, wallTop - 58, stemTopRight, wallTop - 58, `twt = ${formatDim(twt)}`)}
        {dimension(stemLeft, twbLabelY, stemRight, twbLabelY, `twb = ${formatDim(twb)}`)}
        {Bh > 0 ? dimension(baseLeft, bhLabelY, stemLeft, bhLabelY, `Bh = ${formatDim(Bh)}`) : null}
        {dimension(baseLeft, bLabelY, baseRight, bLabelY, `B = ${formatDim(B)}`)}
        {dimension(baseRight + 56, originY, baseRight + 56, baseTop, `tb = ${formatDim(tb)}`, true, 8)}
        {store.hasShearKey ? dimension(shearKeyRight + 54, originY, shearKeyRight + 54, shearKeyBottom, `Kd = ${formatDim(shearKeyDepth)}`, true, 8) : null}
        {store.hasShearKey ? dimension(shearKeyLeft, ktLabelY, shearKeyRight, ktLabelY, `Kt = ${formatDim(shearKeyWidth)}`) : null}

        <line x1={baseLeft - 120} y1={originY} x2={baseLeft} y2={originY} stroke="#94a3b8" strokeWidth="1" />
        <line x1={baseLeft - 120} y1={wallTop} x2={stemTopLeft} y2={wallTop} stroke="#94a3b8" strokeWidth="1" />
        <line x1={baseLeft - 18} y1={originY} x2={baseLeft + 20} y2={originY} stroke="#94a3b8" strokeWidth="1" />
        <line x1={baseLeft - 18} y1={frontGroundY} x2={baseLeft + 20} y2={frontGroundY} stroke="#94a3b8" strokeWidth="1" />
        <line x1={baseRight + 88} y1={originY} x2={baseRight} y2={originY} stroke="#94a3b8" strokeWidth="1" />
        <line x1={baseRight + 88} y1={waterLineY} x2={baseRight} y2={waterLineY} stroke="#94a3b8" strokeWidth="1" />
        <line x1={baseRight + 56} y1={originY} x2={baseRight} y2={originY} stroke="#94a3b8" strokeWidth="1" />
        <line x1={baseRight + 56} y1={baseTop} x2={baseRight} y2={baseTop} stroke="#94a3b8" strokeWidth="1" />
        {store.hasShearKey ? <line x1={shearKeyRight + 54} y1={originY} x2={shearKeyRight} y2={originY} stroke="#94a3b8" strokeWidth="1" /> : null}
        {store.hasShearKey ? <line x1={shearKeyRight + 54} y1={shearKeyBottom} x2={shearKeyRight} y2={shearKeyBottom} stroke="#94a3b8" strokeWidth="1" /> : null}

        <text x={vbWidth / 2} y={titleY} textAnchor="middle" fontSize="16" fill="#334155">
          Cantilever {title}
        </text>

        {heel > 0 ? (
          <text
            x={stemRight + (heel * scale) / 2}
            y={baseTop - 10}
            textAnchor="middle"
            fontSize="17"
            fontWeight="700"
            fill={annotationTextColor}
          >
            REAR HEEL
          </text>
        ) : null}
      </svg>
    </div>
  );
};
