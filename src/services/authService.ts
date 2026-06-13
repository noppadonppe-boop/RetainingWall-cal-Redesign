import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import type { UserProfile } from '../types';
import {
  createActivityLog,
  ensureUserProfileDocument,
  fetchUserProfile,
} from './firebaseService';

const SESSION_EXPIRY_KEY = 'retaincalc-session-expiry';
const SESSION_DURATION_MS = 1000 * 60 * 60 * 12;

const splitDisplayName = (displayName: string | null) => {
  if (!displayName) {
    return {
      firstName: 'New',
      lastName: 'User',
    };
  }

  const parts = displayName.trim().split(/\s+/);

  return {
    firstName: parts[0] || 'New',
    lastName: parts.slice(1).join(' ') || 'User',
  };
};

export const setSessionExpiry = () => {
  localStorage.setItem(SESSION_EXPIRY_KEY, `${Date.now() + SESSION_DURATION_MS}`);
};

export const clearSessionExpiry = () => {
  localStorage.removeItem(SESSION_EXPIRY_KEY);
};

export const isSessionExpired = () => {
  const rawValue = localStorage.getItem(SESSION_EXPIRY_KEY);

  if (!rawValue) {
    return false;
  }

  return Number(rawValue) < Date.now();
};

const ensureProfileForUser = async (
  user: User,
  seed?: Partial<Pick<UserProfile, 'firstName' | 'lastName' | 'position' | 'department'>>,
) => {
  if (!user.email) {
    throw new Error('missing-email');
  }

  let profile = await fetchUserProfile(user.email);

  if (!profile) {
    const fallbackName = splitDisplayName(user.displayName);
    profile = await ensureUserProfileDocument({
      uid: user.uid,
      email: user.email,
      firstName: seed?.firstName ?? fallbackName.firstName,
      lastName: seed?.lastName ?? fallbackName.lastName,
      position: seed?.position ?? 'Engineer',
      department: seed?.department ?? '',
      photoURL: user.photoURL,
    });
  }

  if (!profile) {
    throw new Error('profile-not-found');
  }

  return profile;
};

export const loginWithEmail = async (email: string, password: string) => {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  setSessionExpiry();

  const profile = await ensureProfileForUser(credential.user);
  createActivityLog({
    type: 'LOGIN',
    uid: credential.user.uid,
    email: credential.user.email ?? email,
    method: 'email',
  }).catch(() => {});

  return profile;
};

export const loginWithGoogle = async () => {
  const credential = await signInWithPopup(auth, googleProvider);
  setSessionExpiry();

  const profile = await ensureProfileForUser(credential.user, {
    position: 'Engineer',
  });

  createActivityLog({
    type: 'LOGIN',
    uid: credential.user.uid,
    email: credential.user.email ?? '',
    method: 'google',
  }).catch(() => {});

  return profile;
};

export const registerWithEmail = async (
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  position: string,
  department: UserProfile['department'],
) => {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  setSessionExpiry();

  await updateProfile(credential.user, {
    displayName: `${firstName} ${lastName}`.trim(),
  });

  const profile = await ensureUserProfileDocument({
    uid: credential.user.uid,
    email,
    firstName,
    lastName,
    position,
    department,
    photoURL: credential.user.photoURL,
  });

  createActivityLog({
    type: 'REGISTER',
    uid: credential.user.uid,
    email,
    method: 'email',
  }).catch(() => {});

  if (!profile) {
    throw new Error('profile-not-created');
  }

  return profile;
};

export const logoutUser = async () => {
  clearSessionExpiry();
  await signOut(auth);
};

export const getAuthErrorMessage = (error: unknown) => {
  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? String(error.code)
      : '';

  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'Email or password is incorrect.';
    case 'auth/email-already-in-use':
      return 'This email is already registered.';
    case 'auth/popup-closed-by-user':
      return 'Google sign-in was cancelled before completion.';
    case 'auth/unauthorized-domain':
      return 'This domain is not authorized in Firebase Authentication.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    default:
      return 'Unable to complete authentication right now.';
  }
};
