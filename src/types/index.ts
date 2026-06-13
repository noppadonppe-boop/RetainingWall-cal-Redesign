import type { Timestamp } from 'firebase/firestore';

export type WallType = 'T-Shape' | 'L-Shape' | 'Gravity';
export type LShapeOrientation = 'Heel-only' | 'Toe-only' | null;

export interface WallGeometry {
  totalHeight: number;
  frontFillHeight: number;
  waterTableHeight: number;
  topStemWidth: number;
  bottomStemWidth: number;
  frontHeelWidth: number;
  baseWidth: number;
  baseThickness: number;
  shearKeyDepth: number;
  shearKeyWidth: number;
  stemThickness: number;
  toeWidth: number;
  heelWidth: number;
}

export interface SoilLayer {
  id: string;
  name: string;
  unitWeight: number;
  frictionAngle: number;
  cohesion: number;
  thickness: number;
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
  concreteCompressiveStrength: number;
  steelYieldStrength: number;
}

export type TabType =
  | 'Geometry'
  | 'Soil'
  | 'Loads'
  | 'Materials'
  | 'Reinforcement'
  | 'Dashboard';

export interface WallState {
  activeTab: TabType;
  projectName: string;
  wallType: WallType;
  lShapeOrientation: LShapeOrientation;
  hasShearKey: boolean;
  geometry: WallGeometry;
  soilProperties: SoilProperties;
  loads: Loads;
  materials: MaterialProperties;
}

export type UserRole = 'MasterAdmin' | 'Admin' | 'User';

export const USER_ROLES: UserRole[] = ['MasterAdmin', 'Admin', 'User'];

export const DEPARTMENTS = [
  'Engineering',
  'Design',
  'QA/QC',
  'Project Controls',
  'Management',
] as const;

export type Department = (typeof DEPARTMENTS)[number];
export type UserStatus = 'pending' | 'approved' | 'rejected';

export interface UserProfile {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  position: string;
  department: Department | '';
  role: UserRole[];
  status: UserStatus;
  assignedProjects: string[];
  createdAt: Timestamp | null;
  updatedAt?: Timestamp | null;
  photoURL?: string;
  isFirstUser: boolean;
}

export interface AppMetaConfig {
  firstUserRegistered: boolean;
  totalUsers: number;
  createdAt: Timestamp | null;
  updatedAt?: Timestamp | null;
}

export interface ProjectSections {
  geometryMenu: {
    wallType: WallType;
    lShapeOrientation: LShapeOrientation;
    hasShearKey: boolean;
    geometry: WallGeometry;
  };
  soilMenu: SoilProperties;
  loadsMenu: Loads;
  materialsMenu: MaterialProperties;
  dashboardMenu: {
    activeTab: TabType;
  };
}

export interface ProjectDocument {
  id?: string;
  projectName: string;
  ownerUid: string;
  ownerEmail: string;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
  version: number;
  lastEditedByUid: string;
  lastEditedByEmail: string;
  sections: ProjectSections;
}

export interface ProjectSnapshot extends ProjectDocument {
  id: string;
}

export interface SaveProjectInput {
  projectId?: string;
  projectName: string;
  ownerUid: string;
  ownerEmail: string;
  state: WallState;
  lastKnownVersion?: number | null;
}

export interface ActivityLogEntry {
  type: 'REGISTER' | 'LOGIN';
  uid: string;
  email: string;
  createdAt: Timestamp | null;
  method: 'email' | 'google';
}
