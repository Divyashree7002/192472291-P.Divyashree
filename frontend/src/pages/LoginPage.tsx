import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  Shield,
  GraduationCap,
  User,
  Info
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, user, isLoading: authLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showDemoAccounts, setShowDemoAccounts] = useState(false);
  const [authCheckTimedOut, setAuthCheckTimedOut] = useState(false);

  const fromState = (location.state as { from?: { pathname?: string } })?.from?.pathname;

  React.useEffect(() => {
    if (authLoading) {
      const timer = setTimeout(() => {
        setAuthCheckTimedOut(true);
      }, 6000);
      return () => clearTimeout(timer);
    } else {
      setAuthCheckTimedOut(false);
    }
  }, [authLoading]);

  // Redirect if already authenticated
  React.useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      if (fromState && fromState !== '/dashboard' && fromState !== '/login') {
        navigate(fromState, { replace: true });
      } else if (user.role === 'ADMIN') {
        navigate('/admin', { replace: true });
      } else if (user.role === 'RESEARCH') {
        navigate('/research', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [authLoading, isAuthenticated, user, fromState, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const loggedUser = await login(email.trim(), password, rememberMe);
      if (fromState && fromState !== '/dashboard' && fromState !== '/login') {
        navigate(fromState, { replace: true });
      } else if (loggedUser?.role === 'ADMIN') {
        navigate('/admin', { replace: true });
      } else if (loggedUser?.role === 'RESEARCH') {
        navigate('/research', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid credentials';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFillDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMessage(null);
  };

  if (authLoading && !authCheckTimedOut) {
    return (
      <div className="min-h-screen bg-[#F8F5F0] bg-drafting-grid flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 border border-softBorder shadow-warm-lg flex flex-col items-center justify-center space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-terracotta-50 border border-terracotta-200 text-terracotta-600 flex items-center justify-center shadow-warm-sm">
            <Box className="w-5 h-5 animate-spin" />
          </div>
          <p className="text-xs font-mono text-charcoal-600 font-medium">Checking your session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F5F0] bg-drafting-grid flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="max-w-md w-full space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-terracotta-500 to-sand-400 flex items-center justify-center text-white shadow-warm-md group-hover:scale-105 transition-transform">
              <Box className="w-6 h-6" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg tracking-tight text-charcoal-900">SmartSpace</span>
                <span className="text-xs font-bold text-terracotta-700 bg-terracotta-100 px-1.5 py-0.5 rounded border border-terracotta-300">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-charcoal-500 font-medium">Interior Intelligence</p>
            </div>
          </Link>
          <h2 className="text-xl font-bold text-charcoal-900 tracking-tight pt-2">
            Sign In to Your Workspace
          </h2>
          <p className="text-xs text-charcoal-500">
            Access 3D spatial scanning, layout alternatives, and budget allocation.
          </p>
        </div>

        {/* Login Form Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-softBorder shadow-warm-lg space-y-5">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2.5 animate-fade-in">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-charcoal-800 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Input
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-9"
                  autoComplete="email"
                />
                <Mail className="w-4 h-4 text-charcoal-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-charcoal-800">
                  Password
                </label>
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-9 pr-10"
                  autoComplete="current-password"
                />
                <Lock className="w-4 h-4 text-charcoal-400 absolute left-3 top-3" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-charcoal-400 hover:text-charcoal-700"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-charcoal-700">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-softBorder text-terracotta-500 focus:ring-terracotta-400"
                />
                <span>Remember me for 30 days</span>
              </label>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full shadow-terracotta font-semibold mt-2"
              isLoading={isSubmitting}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In
            </Button>
          </form>

          {/* Quick Demo Seed Accounts Helper */}
          <div className="pt-2 border-t border-softBorder">
            <button
              type="button"
              onClick={() => setShowDemoAccounts(!showDemoAccounts)}
              className="w-full flex items-center justify-between text-xs text-charcoal-600 hover:text-charcoal-900 py-1 font-semibold"
            >
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-terracotta-600" />
                <span>Test Credentials & Seed Accounts</span>
              </span>
              <span className="text-[10px] font-mono text-terracotta-600">
                {showDemoAccounts ? 'Hide' : 'Show Accounts'}
              </span>
            </button>

            {showDemoAccounts && (
              <div className="mt-2.5 space-y-2 p-3 rounded-2xl bg-[#FAF7F2] border border-softBorder text-xs animate-fade-in font-mono">
                <div
                  onClick={() => handleFillDemo('admin@smartspace.ai', 'Admin@12345')}
                  className="p-2 rounded-xl bg-white border border-softBorder hover:border-terracotta-300 cursor-pointer flex items-center justify-between group transition-all"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-terracotta-600" />
                      <span className="font-bold text-charcoal-900">Administrator</span>
                    </div>
                    <div className="text-[10px] text-charcoal-500">admin@smartspace.ai</div>
                  </div>
                  <Badge variant="terracotta" size="sm">ADMIN</Badge>
                </div>

                <div
                  onClick={() => handleFillDemo('research@smartspace.ai', 'Research@SmartSpace2026!')}
                  className="p-2 rounded-xl bg-white border border-softBorder hover:border-sage-300 cursor-pointer flex items-center justify-between group transition-all"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-sage-600" />
                      <span className="font-bold text-charcoal-900">Research Scientist</span>
                    </div>
                    <div className="text-[10px] text-charcoal-500">research@smartspace.ai</div>
                  </div>
                  <Badge variant="sage" size="sm">RESEARCH</Badge>
                </div>

                <div
                  onClick={() => handleFillDemo('user@smartspace.ai', 'User@SmartSpace2026!')}
                  className="p-2 rounded-xl bg-white border border-softBorder hover:border-sand-300 cursor-pointer flex items-center justify-between group transition-all"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-sand-600" />
                      <span className="font-bold text-charcoal-900">Standard Designer</span>
                    </div>
                    <div className="text-[10px] text-charcoal-500">user@smartspace.ai</div>
                  </div>
                  <Badge variant="sand" size="sm">USER</Badge>
                </div>
              </div>
            )}
          </div>

          {/* Footer Link */}
          <div className="text-center text-xs text-charcoal-600 pt-2 border-t border-softBorder">
            <span>Don&apos;t have an account? </span>
            <Link
              to="/register"
              className="text-terracotta-600 hover:text-terracotta-700 font-bold hover:underline"
            >
              Create an Account
            </Link>
          </div>
        </div>

        {/* Security Notice */}
        <div className="flex items-center justify-center gap-2 text-[11px] text-charcoal-500 font-medium">
          <ShieldCheck className="w-4 h-4 text-sage-600" />
          <span>PBKDF2-HMAC-SHA256 Encrypted &middot; JWT Bearer Authorized</span>
        </div>
      </div>
    </div>
  );
};
