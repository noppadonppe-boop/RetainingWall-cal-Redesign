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
  
  // Layer Management
  updateSoilLayer: (id: string, layer: Partial<import('../types').SoilLayer>) => void;
  addSoilLayer: () => void;
  removeSoilLayer: (id: string) => void;
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
    layers: [
      {
        id: '1',
        name: 'Upper Sand Layer',
        unitWeight: 1800,
        frictionAngle: 32,
        cohesion: 0,
        thickness: 2.5,
        soilType: 'Silty Sand (SM)'
      },
      {
        id: '2',
        name: 'Stiff Clay',
        unitWeight: 1950,
        frictionAngle: 0,
        cohesion: 2500,
        thickness: 6.0,
        soilType: 'High Plasticity Clay (CH)'
      }
    ],
    tensionCrackAssumption: 'ignore_negative',
    layerClipping: 'clip_to_wall',
    allowableBearingPressure: 15000,
    frictionCoefficient: 0.45,
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
    
  // Layer Management
  updateSoilLayer: (id, layerUpdates) => 
    set((state) => ({
      soilProperties: {
        ...state.soilProperties,
        layers: state.soilProperties.layers.map(layer => 
          layer.id === id ? { ...layer, ...layerUpdates } : layer
        )
      }
    })),
    
  addSoilLayer: () => 
    set((state) => {
      const newId = (Math.max(...state.soilProperties.layers.map(l => parseInt(l.id) || 0), 0) + 1).toString();
      const newLayer = {
        id: newId,
        name: `Soil Layer ${newId}`,
        unitWeight: 1800,
        frictionAngle: 30,
        cohesion: 0,
        thickness: 2.0,
        soilType: 'New Soil'
      };
      return {
        soilProperties: {
          ...state.soilProperties,
          layers: [...state.soilProperties.layers, newLayer]
        }
      };
    }),
    
  removeSoilLayer: (id) => 
    set((state) => ({
      soilProperties: {
        ...state.soilProperties,
        layers: state.soilProperties.layers.filter(layer => layer.id !== id)
      }
    })),
}));
