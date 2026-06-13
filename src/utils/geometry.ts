import type { LShapeOrientation, WallGeometry, WallType } from '../types';

const fallbackNumber = (value: number | undefined, fallback: number) =>
  Number.isFinite(value) && value !== undefined ? Math.max(value, 0) : fallback;

export const normalizeGeometry = (
  geometry: Partial<WallGeometry>,
  wallType: WallType = 'T-Shape',
  lShapeOrientation: LShapeOrientation = null,
): WallGeometry => {
  const bottomStemWidth = fallbackNumber(geometry.bottomStemWidth ?? geometry.stemThickness, 0.4);
  const frontHeelWidth = fallbackNumber(geometry.frontHeelWidth ?? geometry.toeWidth, 0.5);
  const rawBaseWidth = fallbackNumber(
    geometry.baseWidth,
    frontHeelWidth + bottomStemWidth + fallbackNumber(geometry.heelWidth, 1.6),
  );
  const isLShapeHeelOnly = wallType === 'L-Shape' && lShapeOrientation === 'Heel-only';
  const isLShapeToeOnly = wallType === 'L-Shape' && lShapeOrientation === 'Toe-only';
  const toeWidth = isLShapeHeelOnly ? 0 : frontHeelWidth;
  const heelWidth = isLShapeToeOnly ? 0 : Math.max(rawBaseWidth - toeWidth - bottomStemWidth, 0);
  const baseWidth = Math.max(rawBaseWidth, toeWidth + heelWidth + bottomStemWidth);

  return {
    totalHeight: fallbackNumber(geometry.totalHeight, 4),
    frontFillHeight: fallbackNumber(geometry.frontFillHeight, 1),
    waterTableHeight: fallbackNumber(geometry.waterTableHeight, 2),
    topStemWidth: fallbackNumber(geometry.topStemWidth, 0.25),
    bottomStemWidth,
    frontHeelWidth,
    baseWidth,
    baseThickness: fallbackNumber(geometry.baseThickness, 0.5),
    shearKeyDepth: fallbackNumber(geometry.shearKeyDepth, 0.4),
    shearKeyWidth: fallbackNumber(geometry.shearKeyWidth, 0.3),
    stemThickness: bottomStemWidth,
    toeWidth,
    heelWidth,
  };
};

export const getEffectiveGeometry = (
  geometry: WallGeometry,
  wallType: WallType,
  lShapeOrientation: LShapeOrientation,
) => {
  const normalized = normalizeGeometry(geometry, wallType, lShapeOrientation);

  return {
    ...normalized,
    activeToeWidth: normalized.toeWidth,
    activeHeelWidth: normalized.heelWidth,
    actualBaseWidth: normalized.toeWidth + normalized.bottomStemWidth + normalized.heelWidth,
  };
};

export const getShearKeyGeometry = (
  geometry: WallGeometry,
  hasShearKey: boolean,
) => ({
  depth: hasShearKey ? geometry.shearKeyDepth : 0,
  width: hasShearKey ? geometry.shearKeyWidth : 0,
});

export const getWallTypeSelectionKey = (
  wallType: WallType,
  hasShearKey: boolean,
) => {
  if (wallType === 'L-Shape') {
    return hasShearKey ? 'L_SHAPE_SHEAR_KEY' : 'L_SHAPE';
  }

  return hasShearKey ? 'T_SHAPE_SHEAR_KEY' : 'T_SHAPE';
};

export const getWallTypeSummaryLabel = (
  wallType: WallType,
  hasShearKey: boolean,
) => {
  const baseLabel = wallType === 'L-Shape' ? 'L Shape' : 'T Shape';

  return hasShearKey ? `${baseLabel} with Shear Key` : baseLabel;
};

export const getWallTypeFigureLabel = (
  wallType: WallType,
  hasShearKey: boolean,
) => {
  const baseLabel = wallType === 'L-Shape' ? 'L Shape' : 'T Shape';

  return hasShearKey ? `${baseLabel} include Shear Key` : `${baseLabel} without Shear Key`;
};
