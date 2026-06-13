import {
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type {
  ActivityLogEntry,
  AppMetaConfig,
  ProjectDocument,
  ProjectSnapshot,
  SaveProjectInput,
  UserProfile,
  UserRole,
  UserStatus,
  WallState,
} from '../types';
import { buildProjectSectionsFromState } from '../store/useWallStore';
import {
  activityLogsCollectionRef,
  appMetaDocRef,
  normalizeEmailId,
  projectDocRef,
  projectsCollectionRef,
  userProfileDocRef,
  usersCollectionRef,
} from '../utils/firestorePaths';

export class ProjectConflictError extends Error {
  constructor(message = 'This project has been updated by another user. Reload it before saving again.') {
    super(message);
    this.name = 'ProjectConflictError';
  }
}

const mapProjectSnapshot = (snapshot: Awaited<ReturnType<typeof getDoc>>) => {
  const data = snapshot.data() as ProjectDocument | undefined;

  if (!data) {
    return null;
  }

  return {
    id: snapshot.id,
    ...data,
  } satisfies ProjectSnapshot;
};

export const fetchUserProfile = async (email: string) => {
  const snapshot = await getDoc(userProfileDocRef(email));
  return snapshot.exists() ? (snapshot.data() as UserProfile) : null;
};

export const updateUserProfile = async (
  email: string,
  updates: Partial<Pick<UserProfile, 'firstName' | 'lastName' | 'position' | 'department' | 'photoURL'>>,
) => {
  await updateDoc(userProfileDocRef(email), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

export const updateManagedUserProfile = async (
  email: string,
  updates: Partial<Pick<UserProfile, 'role' | 'status' | 'assignedProjects' | 'department' | 'position'>>,
) => {
  await updateDoc(userProfileDocRef(email), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

export const subscribeUsers = (callback: (users: UserProfile[]) => void): Unsubscribe =>
  onSnapshot(query(usersCollectionRef(), orderBy('createdAt', 'desc')), (snapshot) => {
    callback(snapshot.docs.map((docSnapshot) => docSnapshot.data() as UserProfile));
  });

export const subscribePendingUsersCount = (callback: (count: number) => void): Unsubscribe =>
  onSnapshot(query(usersCollectionRef(), where('status', '==', 'pending')), (snapshot) => {
    callback(snapshot.size);
  });

export const createActivityLog = async (
  payload: Omit<ActivityLogEntry, 'createdAt'>,
) => {
  await setDoc(doc(activityLogsCollectionRef()), {
    ...payload,
    createdAt: serverTimestamp(),
  });
};

export const ensureUserProfileDocument = async ({
  uid,
  email,
  firstName,
  lastName,
  position,
  department = '',
  photoURL,
}: {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  position: string;
  department?: UserProfile['department'];
  photoURL?: string | null;
}) => {
  const profileRef = userProfileDocRef(email);
  const metaRef = appMetaDocRef();

  await runTransaction(db, async (transaction) => {
    const [profileSnapshot, metaSnapshot] = await Promise.all([
      transaction.get(profileRef),
      transaction.get(metaRef),
    ]);

    if (profileSnapshot.exists()) {
      return;
    }

    const appMeta = metaSnapshot.exists()
      ? (metaSnapshot.data() as AppMetaConfig)
      : null;
    const isFirstUser = !appMeta?.firstUserRegistered;
    const role: UserRole[] = isFirstUser ? ['MasterAdmin'] : ['User'];
    const status: UserStatus = isFirstUser ? 'approved' : 'pending';

    transaction.set(profileRef, {
      uid,
      email: normalizeEmailId(email),
      firstName,
      lastName,
      position,
      department,
      role,
      status,
      assignedProjects: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      photoURL: photoURL ?? '',
      isFirstUser,
    } satisfies Omit<UserProfile, 'createdAt' | 'updatedAt'> & {
      createdAt: ReturnType<typeof serverTimestamp>;
      updatedAt: ReturnType<typeof serverTimestamp>;
    });

    transaction.set(
      metaRef,
      {
        firstUserRegistered: true,
        totalUsers: (appMeta?.totalUsers ?? 0) + 1,
        createdAt: appMeta?.createdAt ?? serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
  });

  return fetchUserProfile(email);
};

export const subscribeProjects = (
  callback: (projects: ProjectSnapshot[]) => void,
): Unsubscribe =>
  onSnapshot(query(projectsCollectionRef(), orderBy('updatedAt', 'desc')), (snapshot) => {
    callback(
      snapshot.docs.map((docSnapshot) => ({
        id: docSnapshot.id,
        ...(docSnapshot.data() as ProjectDocument),
      })),
    );
  });

export const fetchProjectById = async (projectId: string) => {
  const snapshot = await getDoc(projectDocRef(projectId));
  return mapProjectSnapshot(snapshot);
};

export const subscribeProject = (
  projectId: string,
  callback: (project: ProjectSnapshot | null) => void,
): Unsubscribe =>
  onSnapshot(projectDocRef(projectId), (snapshot) => {
    if (!snapshot.exists()) {
      callback(null);
      return;
    }

    callback({
      id: snapshot.id,
      ...(snapshot.data() as ProjectDocument),
    });
  });

export const saveProjectToFirestore = async ({
  projectId,
  projectName,
  ownerUid,
  ownerEmail,
  state,
  lastKnownVersion,
}: SaveProjectInput) => {
  const targetRef = projectId ? projectDocRef(projectId) : doc(projectsCollectionRef());
  let nextVersion = 1;

  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(targetRef);
    const currentVersion = snapshot.exists()
      ? ((snapshot.data() as ProjectDocument).version ?? 0)
      : 0;

    if (snapshot.exists() && lastKnownVersion !== null && lastKnownVersion !== undefined && currentVersion !== lastKnownVersion) {
      throw new ProjectConflictError();
    }

    nextVersion = currentVersion + 1;

    const payload = {
      projectName,
      ownerUid,
      ownerEmail,
      updatedAt: serverTimestamp(),
      createdAt: snapshot.exists()
        ? (snapshot.data() as ProjectDocument).createdAt
        : serverTimestamp(),
      version: nextVersion,
      lastEditedByUid: ownerUid,
      lastEditedByEmail: ownerEmail,
      sections: buildProjectSectionsFromState(state),
    };

    transaction.set(targetRef, payload, { merge: true });
  });

  return {
    projectId: targetRef.id,
    version: nextVersion,
  };
};

export const deleteProjectFromFirestore = async (projectId: string) => {
  await deleteDoc(projectDocRef(projectId));
};

export const loadProjectIntoState = (project: ProjectSnapshot): WallState => ({
  activeTab: project.sections.dashboardMenu.activeTab ?? 'Geometry',
  projectName: project.projectName,
  wallType: project.sections.geometryMenu.wallType,
  lShapeOrientation: project.sections.geometryMenu.lShapeOrientation,
  hasShearKey: project.sections.geometryMenu.hasShearKey,
  geometry: project.sections.geometryMenu.geometry,
  soilProperties: project.sections.soilMenu,
  loads: project.sections.loadsMenu,
  materials: project.sections.materialsMenu,
});
