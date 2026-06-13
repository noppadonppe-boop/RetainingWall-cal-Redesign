import type { PropsWithChildren } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import type { UserRole } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { LoadingScreen } from './LoadingScreen';

interface ProtectedRouteProps extends PropsWithChildren {
  requireApproved?: boolean;
  requireRoles?: UserRole[];
}

export const ProtectedRoute = ({
  children,
  requireApproved = true,
  requireRoles,
}: ProtectedRouteProps) => {
  const location = useLocation();
  const { firebaseUser, userProfile, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!firebaseUser) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!userProfile) {
    return <LoadingScreen message="Loading profile..." />;
  }

  if (userProfile.status === 'pending') {
    return <Navigate to="/pending" replace />;
  }

  if (userProfile.status === 'rejected') {
    return <Navigate to="/login" replace state={{ rejected: true }} />;
  }

  if (requireApproved && userProfile.status !== 'approved') {
    return <Navigate to="/pending" replace />;
  }

  if (requireRoles && !requireRoles.some((role) => userProfile.role.includes(role))) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
