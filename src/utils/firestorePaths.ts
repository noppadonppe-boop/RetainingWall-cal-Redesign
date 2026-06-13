import { collection, doc } from 'firebase/firestore';
import { APP_NAME, db } from '../config/firebase';

export const normalizeEmailId = (email: string) => email.trim().toLowerCase();

export const rootDocRef = () => doc(db, APP_NAME, 'root');
export const usersCollectionRef = () => collection(db, APP_NAME, 'root', 'users');
export const userProfileDocRef = (email: string) =>
  doc(db, APP_NAME, 'root', 'users', normalizeEmailId(email));
export const projectsCollectionRef = () => collection(db, APP_NAME, 'root', 'projects');
export const projectDocRef = (projectId: string) =>
  doc(db, APP_NAME, 'root', 'projects', projectId);
export const appMetaDocRef = () => doc(db, APP_NAME, 'root', 'appMeta', 'config');
export const activityLogsCollectionRef = () =>
  collection(db, APP_NAME, 'root', 'activityLogs');
