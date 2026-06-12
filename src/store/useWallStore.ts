import { create } from 'zustand';
import type { WallState } from '../types';

interface WallStore extends WallState {
  setWallType: (type: WallState['wallType']) => void;
  setLShapeOrientation: (orientation: WallState['lShapeOrientation']) => void;
  setHasShearKey: (hasKey: boolean) => void;
  setActiveTab: (tab: WallState['activeTab']) => void;
  updateGeometry: (geometry: Partial<WallState['geometry']>) => void;
  updateSoilProperties: (properties: Partial<WallState['soilProperties']>) => void;
  updateLoads: (loads: Partial<WallState['loads']>) => void;
  updateMaterials: (materials: Partial<WallState['materials']>) => void;
}

const initialState: WallState = {
  activeTab: 'Geometry',
  wallType: 'T-Shape',
  lShapeOrientation: null,
  hasShearKey: false,
  geometry: {
    totalHeight: 4.0,
    baseWidth: 2.5,
    baseThickness: 0.4,
    stemThickness: 0.3,
    toeWidth: 0.8,
    heelWidth: 1.4,
  },
  soilProperties: {
    unitWeight: 1800, // Update to match the screenshot scale (1500-2200 kg/m3)
    internalFrictionAngle: 30,
    allowableBearingPressure: 15000,
    frictionCoefficient: 0.4,
    backfillInclination: 15,
    backfillProfileType: 'Sloped',
  },
  loads: {
    surchargeActive: true,
    surchargeLoad: 500,
    surchargeType: 'Dead Load',
    distanceFromWall: 0.5,
    loadWidth: 3.0,
    hydrostaticActive: false,
  },
  materials: {
    concreteCompressiveStrength: 25, // MPa
    steelYieldStrength: 400, // MPa
  },
};

export const useWallStore = create<WallStore>((set) => ({
  ...initialState,
  setWallType: (type) => set({ wallType: type }),
  setLShapeOrientation: (orientation) => set({ lShapeOrientation: orientation }),
  setHasShearKey: (hasKey) => set({ hasShearKey: hasKey }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  updateGeometry: (geometry) =>
    set((state) => ({ geometry: { ...state.geometry, ...geometry } })),
  updateSoilProperties: (properties) =>
    set((state) => ({ soilProperties: { ...state.soilProperties, ...properties } })),
  updateLoads: (loads) => set((state) => ({ loads: { ...state.loads, ...loads } })),
  updateMaterials: (materials) =>
    set((state) => ({ materials: { ...state.materials, ...materials } })),
}));
