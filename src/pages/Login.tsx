import { useState, useEffect } from 'react';
import { LogIn, User, Lock, ArrowLeft, Eye } from 'lucide-react';
import { login } from '../lib/auth';
import SnookerBallIcon from '../components/icons/SnookerBallIcon';
import { initializeDemoData } from '../lib/demoData';

interface LoginProps {
  onLogin: () => void;
}

// Demo credentials - visible to users
const DEMO_CREDENTIALS = {
  username: 'superadmin',
  pin: '999999'
};

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [showPin, setShowPin] = useState(false);

  // Initialize demo data on first load
  useEffect(() => {
    initializeDemoData();
  }, []);

  const handleLogin = () => {
    setError('');

    if (!username || !pin) {
      setError('Please enter both username and PIN');
      return;
    }

    if (pin.length !== 6) {
      setError('PIN must be 6 digits');
      return;
    }

    // Try superadmin first
    const superadminAttempt = login(username, pin, 'superadmin');
    if (superadminAttempt) {
      onLogin();
      return;
    }

    // Try owner
    const ownerAttempt = login(username, pin, 'owner');
    if (ownerAttempt) {
      onLogin();
      return;
    }

    // Try employee
    const employeeAttempt = login(username, pin, 'employee');
    if (employeeAttempt) {
      onLogin();
      return;
    }

    setError('Invalid credentials. Please try again.');
  };

  const fillDemoCredentials = () => {
    setUsername(DEMO_CREDENTIALS.username);
    setPin(DEMO_CREDENTIALS.pin);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ===================== DESKTOP LAYOUT ===================== */}
      {/* Left Side - Animated Gradient with Grain (Desktop Only) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 animate-gradient-shift" />

        {/* Gradient Blobs */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-slate-500/30 rounded-full blur-3xl animate-blob" />
          <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-slate-500/20 rounded-full blur-3xl animate-blob animation-delay-2000" />
          <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-slate-800/20 rounded-full blur-3xl animate-blob animation-delay-4000" />
        </div>

        {/* Grain Overlay */}
        <div
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            mixBlendMode: 'overlay'
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center p-2">
                <SnookerBallIcon className="w-full h-full" />
              </div>
              <span className="text-xl font-bold">Club Manager</span>
              <span className="px-2 py-0.5 bg-amber-500 text-amber-950 text-xs font-bold rounded-full">DEMO</span>
            </div>
          </div>

          <div>
            <h1 className="text-5xl font-bold mb-4 leading-tight">
              Manage Your<br />
              <span className="text-slate-400">Snooker Club</span><br />
              With Ease
            </h1>
            <p className="text-slate-400 text-lg max-w-md">
              Complete billing, session tracking, customer management, and financial reporting in one powerful platform.
            </p>
          </div>

          <div className="flex items-center gap-8 text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-slate-500 rounded-full" />
              <span>Real-time tracking</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-slate-500 rounded-full" />
              <span>Secure & reliable</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-slate-500 rounded-full" />
              <span>Cloud backup</span>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Right Side - Login Form */}
      <div className="hidden lg:flex flex-1 items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Demo Credentials Box */}
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-semibold text-amber-800">Demo Credentials</span>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div>
                <span className="text-amber-700">Username:</span>
                <code className="ml-1 px-1.5 py-0.5 bg-amber-100 rounded text-amber-900 font-mono">{DEMO_CREDENTIALS.username}</code>
              </div>
              <div>
                <span className="text-amber-700">PIN:</span>
                <code className="ml-1 px-1.5 py-0.5 bg-amber-100 rounded text-amber-900 font-mono">{DEMO_CREDENTIALS.pin}</code>
              </div>
            </div>
            <button
              onClick={fillDemoCredentials}
              className="mt-3 text-xs text-amber-700 hover:text-amber-900 underline"
            >
              Click to auto-fill credentials
            </button>
          </div>

          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              Welcome to the Demo
            </h2>
            <p className="text-slate-500">
              Explore all features with pre-loaded sample data
            </p>
          </div>

          {/* Login Form */}
          <div className="space-y-5">
            {/* Username Input */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyPress={handleKeyPress}
                  autoFocus
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:border-slate-800 focus:ring-4 focus:ring-slate-800/10 outline-none transition-all"
                  placeholder="superadmin"
                />
              </div>
            </div>

            {/* PIN Input */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                PIN Code
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showPin ? 'text' : 'password'}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  onKeyPress={handleKeyPress}
                  maxLength={6}
                  className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:border-slate-800 focus:ring-4 focus:ring-slate-800/10 outline-none tracking-widest"
                  placeholder="999999"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <Eye className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-2">Enter your 6-digit PIN</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Login Button */}
            <button
              onClick={handleLogin}
              className="w-full bg-slate-800 hover:bg-slate-900 text-white py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-800/20"
            >
              <LogIn className="w-5 h-5" />
              Sign In
            </button>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-slate-400 mt-8">
            This is a demo version with sample data
          </p>
        </div>
      </div>

      {/* ===================== MOBILE LAYOUT ===================== */}
      <div className="lg:hidden min-h-screen w-full bg-gray-50 flex flex-col">
        {/* Demo Badge - Top Right */}
        <div className="absolute top-4 right-4 z-20 px-2 py-1 bg-amber-500 text-amber-950 text-xs font-bold rounded-full">
          DEMO
        </div>

        {/* Main Content - Centered */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-sm">
            {/* Logo & Title */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-sm border border-gray-200 mb-4 p-3">
                <SnookerBallIcon className="w-full h-full" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Club Manager</h1>
              <p className="text-sm text-gray-500 mt-1">Demo Version</p>
            </div>

            {/* Demo Credentials Card */}
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="text-xs">
                  <span className="text-amber-700">User:</span>
                  <code className="ml-1 text-amber-900 font-mono font-bold">{DEMO_CREDENTIALS.username}</code>
                </div>
                <div className="text-xs">
                  <span className="text-amber-700">PIN:</span>
                  <code className="ml-1 text-amber-900 font-mono font-bold">{DEMO_CREDENTIALS.pin}</code>
                </div>
              </div>
              <button
                onClick={fillDemoCredentials}
                className="w-full mt-2 py-1.5 text-xs text-amber-800 bg-amber-100 hover:bg-amber-200 rounded-lg font-medium transition-colors"
              >
                Tap to auto-fill
              </button>
            </div>

            {/* Login Card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              {/* Form */}
              <div className="space-y-4">
                {/* Username */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Username
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      onKeyPress={handleKeyPress}
                      autoFocus
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:bg-white focus:border-gray-900 focus:ring-2 focus:ring-gray-900/5 outline-none transition-all"
                      placeholder="superadmin"
                    />
                  </div>
                </div>

                {/* PIN */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    PIN
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type={showPin ? 'text' : 'password'}
                      value={pin}
                      onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                      onKeyPress={handleKeyPress}
                      maxLength={6}
                      className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:bg-white focus:border-gray-900 focus:ring-2 focus:ring-gray-900/5 outline-none tracking-[0.25em] transition-all"
                      placeholder="999999"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="p-3 bg-red-50 border border-red-100 rounded-xl">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  onClick={handleLogin}
                  className="w-full bg-gray-900 hover:bg-gray-800 active:scale-[0.98] text-white py-3 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In
                </button>
              </div>
            </div>

            {/* Footer */}
            <p className="text-center text-xs text-gray-400 mt-6">
              Demo with sample data
            </p>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -30px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(30px, 10px) scale(1.05); }
        }

        .animate-gradient-shift {
          background-size: 200% 200%;
          animation: gradient-shift 15s ease infinite;
        }

        .animate-blob {
          animation: blob 10s ease-in-out infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
