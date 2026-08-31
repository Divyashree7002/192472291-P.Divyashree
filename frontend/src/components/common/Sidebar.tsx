import React from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Camera,
  Layers,
  Sparkles,
  History,
  Sliders,
  Settings,
  Compass,
  Box,
  X,
  Shield,
  GraduationCap,
  User as UserIcon,
  LogOut,
  LogIn
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { user, role, isAuthenticated, logout } = useAuth();

  const handleLogout = async () => {
    onClose();
    await logout();
    navigate('/login', { replace: true });
  };

  const mainNavItems = [
    { label: 'Home', path: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'Scan Room', path: '/camera', icon: <Camera className="w-4 h-4" /> },
    { label: 'Design Studio', path: '/studio', icon: <Layers className="w-4 h-4" /> },
    { label: 'Renovation Planner', path: '/renovation', icon: <Sliders className="w-4 h-4" /> },
    { label: 'Whole Home Overview', path: '/home-planning', icon: <Compass className="w-4 h-4" /> },
    { label: 'My Designs', path: '/history', icon: <History className="w-4 h-4" /> },
    { label: 'Settings', path: '/settings', icon: <Settings className="w-4 h-4" /> },
  ];

  const roleUpper = (role || 'USER').toUpperCase();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#1F1A18]/40 backdrop-blur-sm lg:hidden animate-fade-in"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex w-64 flex-col border-r border-softBorder bg-[#F8F5F0] transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header / Brand Logo */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-softBorder bg-[#FAF8F5]">
          <NavLink to="/" className="flex items-center gap-2.5 group" onClick={onClose}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-terracotta-500 to-sand-400 flex items-center justify-center text-white shadow-warm-sm group-hover:scale-105 transition-transform">
              <Box className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm tracking-tight text-charcoal-900">SmartSpace</span>
                <span className="text-[11px] font-bold text-terracotta-700 bg-terracotta-100 px-1.5 py-0.2 rounded border border-terracotta-300">
                  AI
                </span>
              </div>
              <p className="text-[10px] text-charcoal-500 font-medium tracking-tight">Interior Intelligence</p>
            </div>
          </NavLink>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-charcoal-500 hover:text-charcoal-900 lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation links */}
        <div className="flex-1 overflow-y-auto px-3 py-5 space-y-4">
          <div className="space-y-1">
            <div className="px-3 pb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-400">
                Main Workspace
              </span>
            </div>

            {mainNavItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-terracotta-500 text-white shadow-terracotta'
                      : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-[#EDE6DC]'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <span className="shrink-0">{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {item.path === '/camera' && (
                  <Badge variant="sage" size="sm">Live</Badge>
                )}
              </NavLink>
            ))}
          </div>

          {/* Role-Protected Navigation Section (Exclusively rendered based on verified authenticated role) */}
          {isAuthenticated && (roleUpper === 'ADMIN' || roleUpper === 'RESEARCH') && (
            <div className="space-y-1 pt-2 border-t border-softBorder">
              <div className="px-3 pb-2 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-400">
                  Specialized Portals
                </span>
                <span className="text-[9px] font-mono text-terracotta-600 font-semibold uppercase">
                  {roleUpper}
                </span>
              </div>

              {roleUpper === 'ADMIN' && (
                <NavLink
                  to="/admin"
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 ${
                      isActive
                        ? 'bg-terracotta-500 text-white shadow-terracotta'
                        : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-[#EDE6DC]'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Shield className="w-4 h-4 text-terracotta-600" />
                    <span>Admin Console</span>
                  </div>
                  <Badge variant="terracotta" size="sm">ADMIN</Badge>
                </NavLink>
              )}

              {roleUpper === 'RESEARCH' && (
                <NavLink
                  to="/research"
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 ${
                      isActive
                        ? 'bg-terracotta-500 text-white shadow-terracotta'
                        : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-[#EDE6DC]'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <GraduationCap className="w-4 h-4 text-sage-600" />
                    <span>Research Portal</span>
                  </div>
                  <Badge variant="sage" size="sm">RESEARCH</Badge>
                </NavLink>
              )}
            </div>
          )}
        </div>

        {/* Authenticated User Profile & Working Logout Footer */}
        <div className="p-3 m-3 rounded-2xl bg-white border border-softBorder text-xs text-charcoal-600 shadow-warm-sm space-y-2">
          {isAuthenticated && user ? (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-terracotta-500 to-sand-400 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-warm-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="truncate">
                    <span className="font-bold text-charcoal-900 block truncate text-xs">
                      {user.name}
                    </span>
                    <span className="text-[10px] text-charcoal-400 block truncate font-mono">
                      {user.email}
                    </span>
                  </div>
                </div>
                <Badge
                  variant={roleUpper === 'ADMIN' ? 'terracotta' : roleUpper === 'RESEARCH' ? 'sage' : 'sand'}
                  size="sm"
                >
                  {roleUpper}
                </Badge>
              </div>

              <button
                onClick={handleLogout}
                className="w-full mt-2 py-1.5 px-3 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </>
          ) : (
            <div className="space-y-2 text-center py-1">
              <p className="text-[11px] text-charcoal-500 font-medium">
                Sign in to access your saved room projects and custom 3D plans.
              </p>
              <Link
                to="/login"
                onClick={onClose}
                className="w-full py-1.5 px-3 rounded-xl bg-terracotta-500 hover:bg-terracotta-600 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-terracotta"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In / Register</span>
              </Link>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
