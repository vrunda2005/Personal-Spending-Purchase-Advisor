import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { Card, CardHeader, CardBody } from './common/Card';
import { Mail, Lock, LogIn, AlertTriangle } from 'lucide-react';

interface LoginProps {
  onNavigateToRegister: () => void;
}

export const Login: React.FC<LoginProps> = ({ onNavigateToRegister }) => {
  const { login, error, clearError, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    clearError();

    if (!email || !password) {
      setFormError('Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      setFormError('Password must be at least 6 characters.');
      return;
    }

    const success = await login(email, password);
    if (!success) {
      // Error will be shown via store state
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.05)_0px,transparent_60%)] pointer-events-none" />
      
      <div className="w-full max-w-md">
        {/* Brand Logo / Text */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 shadow-lg mb-4">
            <LogIn className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-white font-display">
            AI Purchase Advisor
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            Actively guide your spending, forecasts, and goal timelines.
          </p>
        </div>

        <Card className="shadow-2xl">
          <CardHeader className="text-center border-none pt-6">
            <h2 className="text-xl font-bold text-white">Sign In</h2>
            <p className="text-xs text-slate-400 mt-1">Welcome back! Please enter your details.</p>
          </CardHeader>
          
          <CardBody>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Display Validation Errors */}
              {(formError || error) && (
                <div className="flex items-start gap-3 p-3 rounded-xl bg-neonCoral/15 border border-neonCoral/20 text-neonCoral text-sm">
                  <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                  <span>{formError || error}</span>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/50 border border-darkBorder text-white placeholder-slate-500 focus:outline-none focus:border-neonViolet/50 focus:ring-1 focus:ring-neonViolet/30 transition-all text-sm"
                    placeholder="name@example.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/50 border border-darkBorder text-white placeholder-slate-500 focus:outline-none focus:border-neonViolet/50 focus:ring-1 focus:ring-neonViolet/30 transition-all text-sm"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 mt-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-medium shadow-lg hover:shadow-violet-500/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 text-sm"
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

            <div className="text-center mt-6 pt-4 border-t border-darkBorder text-sm">
              <span className="text-slate-400">Don't have an account? </span>
              <button
                onClick={onNavigateToRegister}
                className="text-violet-400 hover:text-violet-300 font-semibold transition-all hover:underline"
              >
                Sign Up
              </button>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};
