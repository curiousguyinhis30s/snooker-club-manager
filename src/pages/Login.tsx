import { useState } from 'react';
import { LogIn, User, Lock, Settings, ArrowLeft } from 'lucide-react';
import { login } from '../lib/auth';

interface LoginProps {
  onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [showSuperAdmin, setShowSuperAdmin] = useState(false);
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    setError('');

    if (!username || !pin) {
      setError('Please enter both username/ID and PIN');
      return;
    }

    if (pin.length !== 6) {
      setError('PIN must be 6 digits');
      return;
    }

    let role: 'owner' | 'employee' | 'superadmin';

    if (showSuperAdmin) {
      role = 'superadmin';
    } else {
      const ownerAttempt = login(username, pin, 'owner');
      if (ownerAttempt) {
        onLogin();
        return;
      }

      const employeeAttempt = login(username, pin, 'employee');
      if (employeeAttempt) {
        onLogin();
        return;
      }

      setError('Invalid credentials. Please try again.');
      return;
    }

    const user = login(username, pin, role);

    if (user) {
      onLogin();
    } else {
      setError('Invalid credentials. Please try again.');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Animated Gradient with Grain */}
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
              <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center">
                <span className="text-xl">🎱</span>
              </div>
              <span className="text-xl font-bold">Club Manager</span>
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

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">🎱</span>
            </div>
            <h2 className="text-xl font-bold text-slate-800">Club Manager</h2>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              {showSuperAdmin ? 'SuperAdmin Access' : 'Welcome back'}
            </h2>
            <p className="text-slate-500">
              {showSuperAdmin
                ? 'Enter your admin credentials to continue'
                : 'Sign in to access your club dashboard'}
            </p>
          </div>

          {/* SuperAdmin Mode Toggle */}
          {showSuperAdmin && (
            <button
              onClick={() => setShowSuperAdmin(false)}
              className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to staff login
            </button>
          )}

          {/* Login Form */}
          <div className="space-y-5">
            {/* Username Input */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {showSuperAdmin ? 'Admin Username' : 'Username or Employee ID'}
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
                  placeholder={showSuperAdmin ? 'superadmin' : 'Enter your username'}
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
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  onKeyPress={handleKeyPress}
                  maxLength={6}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:border-slate-800 focus:ring-4 focus:ring-slate-800/10 outline-none transition-all tracking-widest"
                  placeholder="••••••"
                />
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
              className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white shadow-sm py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-800/20"
            >
              <LogIn className="w-5 h-5" />
              Sign In
            </button>
          </div>

          {/* SuperAdmin Toggle */}
          {!showSuperAdmin && (
            <div className="mt-8 pt-6 border-t border-slate-100">
              <button
                onClick={() => setShowSuperAdmin(true)}
                className="w-full flex items-center justify-center gap-2 py-3 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-xl transition-all"
              >
                <Settings className="w-4 h-4" />
                <span className="text-sm">SuperAdmin Login</span>
              </button>
            </div>
          )}

          {/* Footer */}
          <p className="text-center text-xs text-slate-400 mt-8">
            Secure access • Encrypted connection
          </p>
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
