import { create } from 'zustand';
import type {
  Loads,
  MaterialProperties,
  ProjectSections,
  SoilLayer,
  SoilProperties,
  TabType,
  WallGeometry,
  WallState,
} from '../types';
import { normalizeGeometry } from '../utils/geometry';

export interface WallStore extends WallState {
  setProjectName: (projectName: string) => void;
  setWallType: (type: WallState['wallType']) => void;
  setLShapeOrientation: (orientation: WallState['lShapeOrientation']) => void;
  setHasShearKey: (hasKey: boolean) => void;
  setActiveTab: (tab: TabType) => void;
  updateGeometry: (geometry: Partial<WallGeometry>) => void;
  updateSoilProperties: (properties: Partial<SoilProperties>) => void;
  updateLoads: (loads: Partial<Loads>) => void;
  updateMaterials: (materials: Partial<MaterialProperties>) => void;
  updateSoilLayer: (id: string, layer: Partial<SoilLayer>) => void;
  addSoilLayer: () => void;
  removeSoilLayer: (id: string) => void;
  hydrateState: (state: Partial<WallState>) => void;
  applyProjectSections: (sections: ProjectSections, projectName?: string) => void;
  resetState: () => void;
}

export const initialWallState: WallState = {
  activeTab: 'Geometry',
  projectName: 'Wall Section A-1',
  wallType: 'T-Shape',
  lShapeOrientation: null,
  hasShearKey: false,
  geometry: normalizeGeometry({
    totalHeight: 4.0,
    frontFillHeight: 1.0,
    waterTableHeight: 2.0,
    topStemWidth: 0.25,
    bottomStemWidth: 0.4,
    frontHeelWidth: 0.5,
    baseWidth: 2.5,
    baseThickness: 0.5,
    shearKeyDepth: 0.4,
    shearKeyWidth: 0.3,
  }),
  soilProperties: {
    layers: [
      {
        id: '1',
        name: 'Upper Sand Layer',
        unitWeight: 1800,
        frictionAngle: 32,
        cohesion: 0,
        thickness: 2.5,
        soilType: 'Silty Sand (SM)',
      },
      {
        id: '2',
        name: 'Stiff Clay',
        unitWeight: 1950,
        frictionAngle: 0,
        cohesion: 2500,
        thickness: 6.0,
        soilType: 'High Plasticity Clay (CH)',
      },
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
    concreteCompressiveStrength: 25,
    steelYieldStrength: 400,
  },
};

const mergeWallState = (state: WallState, incoming: Partial<WallState>): WallState => ({
  ...state,
  ...incoming,
  geometry: normalizeGeometry(
    {
      ...state.geometry,
      ...(incoming.geometry ?? {}),
    },
    incoming.wallType ?? state.wallType,
    incoming.lShapeOrientation ?? state.lShapeOrientation,
  ),
  soilProperties: {
    ...state.soilProperties,
    ...(incoming.soilProperties ?? {}),
    layers: incoming.soilProperties?.layers ?? state.soilProperties.layers,
  },
  loads: {
    ...state.loads,
    ...(incoming.loads ?? {}),
  },
  materials: {
    ...state.materials,
    ...(incoming.materials ?? {}),
  },
});

export const buildProjectSectionsFromState = (state: WallState): ProjectSections => ({
  geometryMenu: {
    wallType: state.wallType,
    lShapeOrientation: state.lShapeOrientation,
    hasShearKey: state.hasShearKey,
    geometry: state.geometry,
  },
  soilMenu: state.soilProperties,
  loadsMenu: state.loads,
  materialsMenu: state.materials,
  dashboardMenu: {
    activeTab: state.activeTab,
  },
});

export const buildWallStateFromSections = (
  sections: ProjectSections,
  current: WallState = initialWallState,
  projectName?: string,
): WallState => ({
  ...current,
  ...(projectName ? { projectName } : {}),
  wallType: sections.geometryMenu.wallType,
  lShapeOrientation: sections.geometryMenu.lShapeOrientation,
  hasShearKey: sections.geometryMenu.hasShearKey,
  geometry: normalizeGeometry(
    sections.geometryMenu.geometry,
    sections.geometryMenu.wallType,
    sections.geometryMenu.lShapeOrientation,
  ),
  soilProperties: sections.soilMenu,
  loads: sections.loadsMenu,
  materials: sections.materialsMenu,
  activeTab: sections.dashboardMenu.activeTab ?? 'Geometry',
});

export const useWallStore = create<WallStore>((set) => ({
  ...initialWallState,
  setProjectName: (projectName) => set({ projectName }),
  setWallType: (wallType) =>
    set((state) => ({
      wallType,
      geometry: normalizeGeometry(state.geometry, wallType, state.lShapeOrientation),
    })),
  setLShapeOrientation: (lShapeOrientation) =>
    set((state) => ({
      lShapeOrientation,
      geometry: normalizeGeometry(state.geometry, state.wallType, lShapeOrientation),
    })),
  setHasShearKey: (hasShearKey) => set({ hasShearKey }),
  setActiveTab: (activeTab) => set({ activeTab }),
  updateGeometry: (geometry) =>
    set((state) => ({
      geometry: normalizeGeometry(
        { ...state.geometry, ...geometry },
        state.wallType,
        state.lShapeOrientation,
      ),
    })),
  updateSoilProperties: (soilProperties) =>
    set((state) => ({
      soilProperties: {
        ...state.soilProperties,
        ...soilProperties,
      },
    })),
  updateLoads: (loads) =>
    set((state) => ({
      loads: {
        ...state.loads,
        ...loads,
      },
    })),
  updateMaterials: (materials) =>
    set((state) => ({
      materials: {
        ...state.materials,
        ...materials,
      },
    })),
  updateSoilLayer: (id, layerUpdates) =>
    set((state) => ({
      soilProperties: {
        ...state.soilProperties,
        layers: state.soilProperties.layers.map((layer) =>
          layer.id === id ? { ...layer, ...layerUpdates } : layer,
        ),
      },
    })),
  addSoilLayer: () =>
    set((state) => {
      const newId = (
        Math.max(
          ...state.soilProperties.layers.map((layer) => Number.parseInt(layer.id, 10) || 0),
          0,
        ) + 1
      ).toString();

      return {
        soilProperties: {
          ...state.soilProperties,
          layers: [
            ...state.soilProperties.layers,
            {
              id: newId,
              name: `Soil Layer ${newId}`,
              unitWeight: 1800,
              frictionAngle: 30,
              cohesion: 0,
              thickness: 2.0,
              soilType: 'New Soil',
            },
          ],
        },
      };
    }),
  removeSoilLayer: (id) =>
    set((state) => ({
      soilProperties: {
        ...state.soilProperties,
        layers: state.soilProperties.layers.filter((layer) => layer.id !== id),
      },
    })),
  hydrateState: (incoming) =>
    set((state) => mergeWallState(state, incoming)),
  applyProjectSections: (sections, projectName) =>
    set((state) => buildWallStateFromSections(sections, state, projectName)),
  resetState: () => set({ ...initialWallState }),
}));
