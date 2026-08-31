import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
  Camera,
  Server,
  Menu,
  Sparkles,
  Shield,
  GraduationCap,
  User as UserIcon,
  ChevronDown,
  LogOut,
  Settings,
  LogIn,
  Layers
} from 'lucide-react';
import { checkBackendHealth } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../ui/Badge';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, role, isAuthenticated, logout } = useAuth();
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [latency, setLatency] = useState<number | undefined>(undefined);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const check = async () => {
    try {
      const res = await checkBackendHealth();
      setBackendStatus(res.status === 'online' ? 'online' : 'offline');
      setLatency(res.latencyMs);
    } catch {
      setBackendStatus('offline');
    }
  };

  useEffect(() => {
    let isMounted = true;
    check();
    const interval = setInterval(() => {
      if (isMounted) check();
    }, 6000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleLogout = async () => {
    setShowProfileMenu(false);
    await logout();
    navigate('/login', { replace: true });
  };

  const getPageTitle = (path: string) => {
    switch (path) {
      case '/':
        return 'Overview';
      case '/dashboard':
        return 'Home';
      case '/camera':
        return 'Scan My Room';
      case '/studio':
        return 'Design Studio';
      case '/recommendations':
        return 'AI Recommendations';
      case '/history':
        return 'My Designs';
      case '/preferences':
        return 'Preferences';
      case '/settings':
        return 'Settings';
      case '/admin':
        return 'Admin Console';
      case '/research':
        return 'Research Portal';
      case '/login':
        return 'Sign In';
      case '/register':
        return 'Create Account';
      default:
        return 'SmartSpace AI';
    }
  };

  const roleUpper = (role || 'USER').toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-softBorder bg-[#FAF8F5]/90 px-4 sm:px-6 backdrop-blur-md">
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-charcoal-600 hover:text-charcoal-900 hover:bg-cream-200 lg:hidden focus:outline-none"
          aria-label="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Page Title & Breadcrumb */}
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-terracotta-600 uppercase tracking-widest hidden sm:inline">
              SmartSpace
            </span>
            <span className="text-charcoal-300 text-xs hidden sm:inline">/</span>
            <h1 className="text-base sm:text-lg font-bold text-charcoal-900 tracking-tight">
              {getPageTitle(location.pathname)}
            </h1>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* System Status Pill - Exclusively visible to authorized Administrator role */}
        {roleUpper === 'ADMIN' && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-softBorder text-xs shadow-warm-sm font-medium">
            <span className="flex items-center gap-1.5 text-sage-800">
              <span className="w-2 h-2 rounded-full bg-sage-500 inline-block" />
              <span>Frontend: Ready</span>
            </span>
            <span className="text-charcoal-300">|</span>
            <span className="flex items-center gap-1.5">
              <Server className={`w-3.5 h-3.5 ${backendStatus === 'online' ? 'text-sage-600' : backendStatus === 'checking' ? 'text-sand-600 animate-spin' : 'text-terracotta-500'}`} />
              <span className={
                backendStatus === 'online'
                  ? 'text-sage-700 font-semibold flex items-center gap-1'
                  : backendStatus === 'checking'
                  ? 'text-sand-700 font-medium'
                  : 'text-terracotta-600 font-semibold'
              }>
                <span className={`w-2 h-2 rounded-full inline-block ${
                  backendStatus === 'online'
                    ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                    : backendStatus === 'checking'
                    ? 'bg-amber-400 animate-pulse'
                    : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]'
                }`} />
                Backend: {backendStatus === 'online' ? `Online (${latency ?? 12}ms)` : backendStatus === 'checking' ? 'Checking...' : 'Offline'}
              </span>
            </span>
          </div>
        )}

        {/* Quick Scan Action */}
        <Link
          to="/camera"
          className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-terracotta-500 hover:bg-terracotta-600 text-white text-xs font-semibold shadow-terracotta transition-all active:scale-95 border border-terracotta-600"
        >
          <Camera className="w-3.5 h-3.5" />
          <span>Scan Room</span>
        </Link>

        {/* User Profile / Authentication Menu */}
        {isAuthenticated && user ? (
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-2xl hover:bg-cream-200 transition-colors border border-transparent hover:border-softBorder"
              aria-label="User account profile options"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-terracotta-500 via-sand-400 to-sage-500 flex items-center justify-center text-white text-xs font-bold shadow-warm-sm">
                {roleUpper === 'ADMIN' ? (
                  <Shield className="w-4 h-4 text-white" />
                ) : roleUpper === 'RESEARCH' ? (
                  <GraduationCap className="w-4 h-4 text-white" />
                ) : (
                  <UserIcon className="w-4 h-4 text-white" />
                )}
              </div>
              <div className="hidden xl:flex flex-col text-left">
                <span className="text-xs font-bold text-charcoal-800 flex items-center gap-1">
                  <span>{user.name}</span>
                  <ChevronDown className="w-3 h-3 text-charcoal-400" />
                </span>
                <span className="text-[10px] text-charcoal-500 font-medium capitalize">
                  {roleUpper.toLowerCase()}
                </span>
              </div>
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl p-2 border border-softBorder shadow-warm-lg z-50 animate-fade-in text-xs space-y-1">
                <div className="px-3 py-2.5 border-b border-softBorder">
                  <span className="text-[10px] font-bold text-charcoal-400 uppercase tracking-wider block">
                    Signed in as
                  </span>
                  <span className="font-bold text-charcoal-900 block truncate text-xs">
                    {user.name}
                  </span>
                  <span className="text-[11px] text-charcoal-500 block truncate font-mono">
                    {user.email}
                  </span>
                  <div className="pt-1">
                    <Badge
                      variant={roleUpper === 'ADMIN' ? 'terracotta' : roleUpper === 'RESEARCH' ? 'sage' : 'sand'}
                      size="sm"
                    >
                      Role: {roleUpper}
                    </Badge>
                  </div>
                </div>

                <div className="py-1 space-y-0.5">
                  <Link
                    to="/dashboard"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-charcoal-700 hover:bg-cream-100 transition-colors font-medium"
                  >
                    <Layers className="w-3.5 h-3.5 text-terracotta-600" />
                    <span>Project Dashboard</span>
                  </Link>

                  {roleUpper === 'ADMIN' && (
                    <Link
                      to="/admin"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-charcoal-700 hover:bg-cream-100 transition-colors font-medium"
                    >
                      <Shield className="w-3.5 h-3.5 text-terracotta-600" />
                      <span>Admin Console</span>
                    </Link>
                  )}

                  {roleUpper === 'RESEARCH' && (
                    <Link
                      to="/research"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-charcoal-700 hover:bg-cream-100 transition-colors font-medium"
                    >
                      <GraduationCap className="w-3.5 h-3.5 text-sage-600" />
                      <span>Research Portal</span>
                    </Link>
                  )}

                  <Link
                    to="/settings"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-charcoal-700 hover:bg-cream-100 transition-colors font-medium"
                  >
                    <Settings className="w-3.5 h-3.5 text-charcoal-500" />
                    <span>System Settings</span>
                  </Link>
                </div>

                <div className="border-t border-softBorder pt-1">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 transition-colors font-semibold flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5 text-red-600" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-cream-100 text-charcoal-800 text-xs font-bold border border-softBorder shadow-warm-sm transition-all"
          >
            <LogIn className="w-3.5 h-3.5 text-terracotta-600" />
            <span>Sign In</span>
          </Link>
        )}
      </div>
    </header>
  );
};
