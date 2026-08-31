import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { useAuth } from '../context/AuthContext';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated, isLoading: authLoading } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Redirect if already authenticated
  React.useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [authLoading, isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    setIsSubmitting(true);
    try {
      await register(name.trim(), email.trim().toLowerCase(), password);
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPasswordLongEnough = password.length >= 6;
  const doPasswordsMatch = password.length > 0 && password === confirmPassword;

  if (authLoading) {
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
            Create Your Account
          </h2>
          <p className="text-xs text-charcoal-500">
            Join SmartSpace AI to start scanning rooms and generating personalized 3D designs.
          </p>
        </div>

        {/* Register Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-softBorder shadow-warm-lg space-y-5">
          {/* Security Notice Badge */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#FAF7F2] border border-softBorder text-xs">
            <div className="flex items-center gap-2 text-charcoal-700 font-medium">
              <ShieldCheck className="w-4 h-4 text-sage-600 shrink-0" />
              <span>Standard Designer Account</span>
            </div>
            <Badge variant="sage" size="sm">Role: USER</Badge>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2.5 animate-fade-in">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-charcoal-800 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Alex Vance"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="pl-9"
                  autoComplete="name"
                />
                <User className="w-4 h-4 text-charcoal-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal-800 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Input
                  type="email"
                  placeholder="alex.vance@example.com"
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
              <label className="block text-xs font-bold text-charcoal-800 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-9 pr-10"
                  autoComplete="new-password"
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

            <div>
              <label className="block text-xs font-bold text-charcoal-800 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="pl-9 pr-10"
                  autoComplete="new-password"
                />
                <Lock className="w-4 h-4 text-charcoal-400 absolute left-3 top-3" />
              </div>
            </div>

            {/* Live Password Hints */}
            <div className="space-y-1 text-[11px] font-medium pt-1">
              <div className={`flex items-center gap-1.5 ${isPasswordLongEnough ? 'text-sage-700' : 'text-charcoal-400'}`}>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>At least 6 characters</span>
              </div>
              {confirmPassword.length > 0 && (
                <div className={`flex items-center gap-1.5 ${doPasswordsMatch ? 'text-sage-700' : 'text-terracotta-600'}`}>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{doPasswordsMatch ? 'Passwords match' : 'Passwords do not match'}</span>
                </div>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full shadow-terracotta font-semibold mt-2"
              isLoading={isSubmitting}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Create Account
            </Button>
          </form>

          {/* Footer Link */}
          <div className="text-center text-xs text-charcoal-600 pt-2 border-t border-softBorder">
            <span>Already have an account? </span>
            <Link
              to="/login"
              className="text-terracotta-600 hover:text-terracotta-700 font-bold hover:underline"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Security Notice */}
        <div className="flex items-center justify-center gap-2 text-[11px] text-charcoal-500 font-medium">
          <ShieldCheck className="w-4 h-4 text-sage-600" />
          <span>PBKDF2-HMAC-SHA256 Encrypted &middot; Zero Plaintext Storage</span>
        </div>
      </div>
    </div>
  );
};
