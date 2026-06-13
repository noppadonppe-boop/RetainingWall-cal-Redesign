/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { auth } from '../config/firebase';
import type { UserProfile, UserRole } from '../types';
import { logoutUser, isSessionExpired } from '../services/authService';
import {
  fetchUserProfile,
  subscribePendingUsersCount,
  updateUserProfile,
} from '../services/firebaseService';

interface AuthContextValue {
  firebaseUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  pendingUsersCount: number;
  refreshProfile: () => Promise<UserProfile | null>;
  logout: () => Promise<void>;
  updateCurrentUserProfile: (
    updates: Partial<Pick<UserProfile, 'firstName' | 'lastName' | 'position' | 'department'>>,
  ) => Promise<void>;
  hasRole: (...roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [rawPendingUsersCount, setRawPendingUsersCount] = useState(0);

  const refreshProfile = async () => {
    if (!auth.currentUser?.email) {
      setUserProfile(null);
      return null;
    }

    try {
      const profile = await fetchUserProfile(auth.currentUser.email);
      setUserProfile(profile);
      return profile;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    if (isSessionExpired()) {
      signOut(auth).catch(() => {});
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);

      if (!user?.email) {
        setUserProfile(null);
        setLoading(false);
        return;
      }

      try {
        const profile = await fetchUserProfile(user.email);
        setUserProfile(profile);
      } catch {
        setUserProfile(null);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!userProfile?.role.includes('MasterAdmin')) {
      return;
    }

    return subscribePendingUsersCount(setRawPendingUsersCount);
  }, [userProfile]);

  const pendingUsersCount = userProfile?.role.includes('MasterAdmin')
    ? rawPendingUsersCount
    : 0;

  const value = useMemo<AuthContextValue>(
    () => ({
      firebaseUser,
      userProfile,
      loading,
      pendingUsersCount,
      refreshProfile,
      logout: logoutUser,
      updateCurrentUserProfile: async (updates) => {
        if (!auth.currentUser?.email) {
          return;
        }

        await updateUserProfile(auth.currentUser.email, updates);
        await refreshProfile();
      },
      hasRole: (...roles) => {
        if (!userProfile) {
          return false;
        }

        return roles.some((role) => userProfile.role.includes(role));
      },
    }),
    [firebaseUser, loading, pendingUsersCount, userProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
};
