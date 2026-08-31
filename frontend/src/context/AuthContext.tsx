import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useToast } from './ToastContext';
import {
  AuthUser,
  apiLogin,
  apiRegister,
  apiGetMe,
  apiLogout,
  getAuthToken,
  getStoredUser,
  setStoredSession,
  clearAuthSession,
  isTokenExpired,
} from '../services/api';

export type UserRole = 'USER' | 'ADMIN' | 'RESEARCH' | 'user' | 'admin' | 'research';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN' | 'RESEARCH';
  createdAt?: string;
  lastLoginAt?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  role: 'USER' | 'ADMIN' | 'RESEARCH';
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<UserProfile>;
  register: (name: string, email: string, password: string) => Promise<UserProfile>;
  logout: () => Promise<void>;
  hasRole: (allowedRoles: (UserRole | string)[]) => boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapAuthUserToProfile(rawUser: AuthUser): UserProfile {
  const normalizedRole = (rawUser.role || 'USER').toUpperCase() as 'USER' | 'ADMIN' | 'RESEARCH';
  return {
    id: rawUser.id,
    name: rawUser.name,
    email: rawUser.email,
    role: normalizedRole,
    createdAt: rawUser.created_at,
    lastLoginAt: rawUser.last_login_at,
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Synchronously initialize state from persistent localStorage so refreshing never flashes logged-out
  const [token, setToken] = useState<string | null>(() => {
    const existing = getAuthToken();
    if (existing && !isTokenExpired(existing)) {
      return existing;
    }
    return null;
  });

  const [user, setUser] = useState<UserProfile | null>(() => {
    const existingToken = getAuthToken();
    if (!existingToken || isTokenExpired(existingToken)) {
      clearAuthSession();
      return null;
    }
    const cached = getStoredUser();
    if (cached) {
      return mapAuthUserToProfile(cached);
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { addToast } = useToast();

  const refreshUser = useCallback(async () => {
    const currentToken = getAuthToken();
    if (!currentToken || isTokenExpired(currentToken)) {
      clearAuthSession();
      setUser(null);
      setToken(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await apiGetMe();
      const userProfile = mapAuthUserToProfile(res.user);
      setUser(userProfile);
      setToken(currentToken);
    } catch (err: unknown) {
      const isAuthExpired = (err as { isAuthExpired?: boolean })?.isAuthExpired;
      const isNetworkError = (err as { isNetworkError?: boolean })?.isNetworkError;

      if (isAuthExpired) {
        // Genuinely expired session on the server
        clearAuthSession();
        setUser(null);
        setToken(null);
        addToast({
          title: 'Session Expired',
          description: 'Your session has expired. Please sign in again.',
          type: 'warning',
        });
      } else if (isNetworkError) {
        // Server unreachable, but JWT is not expired: retain cached authenticated user
        console.warn('[SmartSpace Auth] Backend unreachable during session verification. Retaining cached session.');
      } else {
        console.warn('[SmartSpace Auth] Profile refresh failed:', err);
      }
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string, rememberMe: boolean = true): Promise<UserProfile> => {
    setIsLoading(true);
    try {
      const data = await apiLogin(email, password, rememberMe);
      const userProfile = mapAuthUserToProfile(data.user);

      setToken(data.access_token);
      setUser(userProfile);

      addToast({
        title: 'Authentication Successful',
        description: `Welcome back, ${userProfile.name}!`,
        type: 'success',
      });
      return userProfile;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid credentials';
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string): Promise<UserProfile> => {
    setIsLoading(true);
    try {
      const data = await apiRegister(name, email, password);
      const userProfile = mapAuthUserToProfile(data.user);

      setToken(data.access_token);
      setUser(userProfile);

      addToast({
        title: 'Account Registered',
        description: `Welcome to SmartSpace AI, ${userProfile.name}!`,
        type: 'success',
      });
      return userProfile;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed';
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiLogout();
    } catch {
      clearAuthSession();
    } finally {
      clearAuthSession();
      setUser(null);
      setToken(null);
      addToast({
        title: 'Logged Out',
        description: 'You have been safely signed out.',
        type: 'info',
      });
    }
  };

  const hasRole = (allowedRoles: (UserRole | string)[]): boolean => {
    if (!user || !user.role) return false;
    const userRole = user.role.toUpperCase();
    return allowedRoles.map((r) => r.toUpperCase()).includes(userRole);
  };

  const activeRole: 'USER' | 'ADMIN' | 'RESEARCH' = user?.role || 'USER';

  return (
    <AuthContext.Provider
      value={{
        user,
        role: activeRole,
        token,
        isAuthenticated: Boolean(user && token),
        isLoading,
        login,
        register,
        logout,
        hasRole,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
