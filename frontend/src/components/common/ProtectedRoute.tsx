import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, UserRole } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Activity, ShieldAlert } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: (UserRole | string)[];
  requireAuth?: boolean;
  redirectPath?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  requireAuth = true,
  redirectPath = '/dashboard',
}) => {
  const { user, isAuthenticated, isLoading, hasRole } = useAuth();
  const location = useLocation();
  const { addToast } = useToast();
  const [safetyTimeoutExpired, setSafetyTimeoutExpired] = React.useState(false);

  const isRolePermitted = !allowedRoles || allowedRoles.length === 0 || hasRole(allowedRoles);

  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        console.warn('[SmartSpace Auth] ProtectedRoute safety timeout reached.');
        setSafetyTimeoutExpired(true);
      }, 6000);
      return () => clearTimeout(timer);
    } else {
      setSafetyTimeoutExpired(false);
    }
  }, [isLoading]);

  useEffect(() => {
    if (!isLoading && isAuthenticated && !isRolePermitted) {
      addToast({
        title: 'Access denied',
        description: `Your account role (${user?.role || 'USER'}) is not authorized to access this section. Redirected to your dashboard.`,
        type: 'warning',
      });
    }
  }, [isLoading, isAuthenticated, isRolePermitted, allowedRoles, user?.role, addToast]);

  if (isLoading && !safetyTimeoutExpired) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 space-y-3 animate-fade-in">
        <div className="w-10 h-10 rounded-2xl bg-terracotta-50 border border-terracotta-200 text-terracotta-600 flex items-center justify-center shadow-warm-sm">
          <Activity className="w-5 h-5 animate-spin" />
        </div>
        <p className="text-xs font-mono text-charcoal-600 font-medium">Checking your session...</p>
      </div>
    );
  }

  if ((requireAuth && !isAuthenticated) || (safetyTimeoutExpired && !isAuthenticated)) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isRolePermitted) {
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};
