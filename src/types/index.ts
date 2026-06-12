export type WallType = 'T-Shape' | 'L-Shape';
export type LShapeOrientation = 'Heel-only' | 'Toe-only' | null;

export interface WallGeometry {
  totalHeight: number;
  baseWidth: number;
  baseThickness: number;
  stemThickness: number;
  toeWidth: number;
  heelWidth: number;
}

export interface SoilLayer {
  id: string;
  name: string;
  unitWeight: number; // gamma
  frictionAngle: number; // phi
  cohesion: number; // c
  thickness: number; // meters
  soilType: string;
}

export interface SoilProperties {
  layers: SoilLayer[];
  tensionCrackAssumption: 'ignore_negative' | 'include_negative';
  layerClipping: 'clip_to_wall' | 'no_clip';

  allowableBearingPressure: number;
  frictionCoefficient: number;
  backfillInclination: number;
  backfillProfileType: 'Sloped' | 'Horizontal' | 'Broken';
}

export interface Loads {
  surchargeActive: boolean;
  surchargeLoad: number;
  surchargeType: string;
  distanceFromWall: number;
  loadWidth: number;
  hydrostaticActive: boolean;
}

export interface MaterialProperties {
  concreteCompressiveStrength: number; // fc'
  steelYieldStrength: number; // fy
}

export type TabType = 'Geometry' | 'Soil' | 'Loads' | 'Materials' | 'Reinforcement' | 'Dashboard';

export interface WallState {
  activeTab: TabType;
  wallType: 'T-Shape' | 'L-Shape' | 'Gravity';
  lShapeOrientation: LShapeOrientation;
  hasShearKey: boolean;
  geometry: WallGeometry;
  soilProperties: SoilProperties;
  loads: Loads;
  materials: MaterialProperties;
}
