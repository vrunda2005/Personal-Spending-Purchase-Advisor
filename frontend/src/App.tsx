import { useState, useEffect } from 'react';
import { useAuthStore } from './store/useAuthStore';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { Onboarding } from './components/Onboarding';
import { Dashboard } from './components/Dashboard';
import { PurchaseAdvisor } from './components/PurchaseAdvisor';
import { AICoach } from './components/AICoach';
import { Profile } from './components/Profile';
import { 
  TrendingUp, 
  Bot, 
  Sliders, 
  ShoppingBag,
  Menu,
  X,
  CreditCard
} from 'lucide-react';

function App() {
  const { isAuthenticated, user, fetchProfile, isLoading } = useAuthStore();
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'advisor' | 'coach' | 'profile'>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Sync profile details on page mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
    }
  }, [isAuthenticated]);

  if (isLoading && !user && isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-darkBg text-slate-100">
        <div className="relative w-12 h-12 mb-4">
          <div className="absolute inset-0 border-4 border-violet-500/10 rounded-full" />
          <div className="absolute inset-0 border-4 border-t-neonViolet rounded-full animate-spin" />
        </div>
        <p className="text-xs text-slate-400 font-semibold tracking-wider uppercase animate-pulse">
          Loading Financial Profile...
        </p>
      </div>
    );
  }

  // Not authenticated view
  if (!isAuthenticated) {
    return authView === 'login' ? (
      <Login onNavigateToRegister={() => setAuthView('register')} />
    ) : (
      <Register onNavigateToLogin={() => setAuthView('login')} />
    );
  }

  // First-time signup check (redirect to Onboarding page)
  const isProfileEmpty = user && user.income === 0 && user.available_budget === 0;
  if (isProfileEmpty) {
    return <Onboarding />;
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
    { id: 'advisor', label: 'Purchase Advisor', icon: ShoppingBag },
    { id: 'coach', label: 'AI Coach', icon: Bot },
    { id: 'profile', label: 'Settings', icon: Sliders },
  ] as const;

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-darkBg text-slate-100 font-sans">
      {/* Background radial effects */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.02)_0px,transparent_60%)] pointer-events-none z-0" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(16,185,129,0.015)_0px,transparent_60%)] pointer-events-none z-0" />

      {/* Mobile Header Bar */}
      <header className="lg:hidden flex items-center justify-between px-6 py-4 bg-darkSurface/60 backdrop-blur-md border-b border-darkBorder z-20 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 shadow-md">
            <CreditCard className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-black text-white tracking-wide text-sm">
            Advisify.AI
          </span>
        </div>
        
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded-lg bg-slate-900 border border-darkBorder text-slate-400 hover:text-white"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-darkBg/90 backdrop-blur-sm z-30 lg:hidden flex flex-col justify-center px-8 space-y-6">
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="absolute top-6 right-6 p-2 rounded-xl bg-slate-900 border border-darkBorder text-slate-400"
          >
            <X className="w-5 h-5" />
          </button>
          
          <nav className="flex flex-col gap-4 text-center">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`py-4 px-6 rounded-2xl flex items-center justify-center gap-3.5 text-base font-bold transition-all border ${
                    activeTab === item.id
                      ? 'border-neonViolet/30 bg-neonViolet/10 text-white'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
      )}

      {/* Sidebar Layout for Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-darkSurface/30 border-r border-darkBorder px-6 py-8 shrink-0 z-10">
        <div className="flex items-center gap-2.5 mb-10 px-2">
          <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 shadow-lg shadow-violet-500/20">
            <CreditCard className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-extrabold text-lg text-white tracking-wide">
            Advisify.AI
          </span>
        </div>

        {/* Sidebar Nav Links */}
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full py-3.5 px-4 rounded-xl flex items-center gap-3 text-xs font-bold transition-all border ${
                  isActive
                    ? 'border-neonViolet/20 bg-neonViolet/10 text-white shadow-glass-glow'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/20'
                }`}
              >
                <Icon className={`w-4 h-4 transition-all ${isActive ? 'text-neonViolet' : 'text-slate-500'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* User Card Bottom Sidebar */}
        {user && (
          <div className="pt-6 border-t border-darkBorder flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs font-bold text-white block truncate">{user.name}</span>
              <span className="text-[10px] text-slate-500 block truncate">{user.email}</span>
            </div>
          </div>
        )}
      </aside>

      {/* Main Panel Content container */}
      <main className="flex-1 overflow-y-auto px-6 py-8 lg:px-10 lg:py-10 z-10 max-h-screen">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'advisor' && <PurchaseAdvisor />}
        {activeTab === 'coach' && <AICoach />}
        {activeTab === 'profile' && <Profile />}
      </main>
    </div>
  );
}

export default App;
