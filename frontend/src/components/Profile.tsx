import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useFinanceStore } from '../store/useFinanceStore';
import { Card, CardHeader, CardBody } from './common/Card';
import { User, LogOut, CheckCircle, AlertTriangle, Shield, Sliders } from 'lucide-react';

export const Profile: React.FC = () => {
  const { user, updateProfile, logout, isLoading: authLoading, error: authError, clearError } = useAuthStore();
  const { fetchBudgetAllocation } = useFinanceStore();

  const [name, setName] = useState(user?.name || '');
  const [age, setAge] = useState<number>(user?.age || 25);
  const [occupation, setOccupation] = useState(user?.occupation || '');
  const [income, setIncome] = useState<number>(user?.income || 0);
  const [savings, setSavings] = useState<number>(user?.savings || 0);
  const [riskProfile, setRiskProfile] = useState(user?.risk_profile || 'Moderate');

  // Allocation Sliders
  const [needs, setNeeds] = useState<number>(user?.needs_percentage || 50);
  const [wants, setWants] = useState<number>(user?.wants_percentage || 25);
  const [savingsPct, setSavingsPct] = useState<number>(user?.savings_percentage || 15);
  const [investing, setInvesting] = useState<number>(user?.investing_percentage || 10);

  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const totalPercentage = needs + wants + savingsPct + investing;
  const isSumValid = Math.abs(totalPercentage - 100) < 0.01;

  useEffect(() => {
    clearError();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateSuccess(false);
    setLocalError(null);
    clearError();

    if (!isSumValid) {
      setLocalError(`Custom allocations must sum to exactly 100%. Current sum: ${totalPercentage}%`);
      return;
    }

    if (income <= 0) {
      setLocalError('Monthly income must be a positive number.');
      return;
    }

    const payload = {
      name,
      age,
      occupation: occupation || null,
      income,
      savings,
      risk_profile: riskProfile,
      needs_percentage: needs,
      wants_percentage: wants,
      savings_percentage: savingsPct,
      investing_percentage: investing,
    };

    const success = await updateProfile(payload);
    if (success) {
      setUpdateSuccess(true);
      await fetchBudgetAllocation();
      setTimeout(() => setUpdateSuccess(false), 3000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white text-gradient-primary">Profile & Configurations</h1>
          <p className="text-xs text-slate-400">Manage your income sources, budget percentage rules, and active account settings.</p>
        </div>
        
        <button
          onClick={logout}
          className="flex items-center gap-1.5 px-4 py-2 bg-slate-900/50 hover:bg-neonCoral/15 text-slate-400 hover:text-neonCoral border border-darkBorder hover:border-neonCoral/20 rounded-xl text-xs font-semibold transition-all shrink-0"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Side: General Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader className="flex items-center gap-2">
              <User className="w-5 h-5 text-neonViolet" />
              <h2 className="text-base font-bold text-white">General Profile</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Email</span>
                <p className="text-sm font-semibold text-slate-200">{user?.email}</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900/50 border border-darkBorder text-white text-xs focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Age</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(parseInt(e.target.value) || 25)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900/50 border border-darkBorder text-white text-xs focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Occupation</label>
                <input
                  type="text"
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900/50 border border-darkBorder text-white text-xs focus:outline-none"
                />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader className="flex items-center gap-2 border-none pb-0">
              <Shield className="w-4 h-4 text-neonAmber" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Risk Profile</h2>
            </CardHeader>
            <CardBody className="pt-2.5 space-y-3">
              <div className="grid grid-cols-3 gap-2">
                {['Conservative', 'Moderate', 'Aggressive'].map((profile) => (
                  <button
                    key={profile}
                    type="button"
                    onClick={() => setRiskProfile(profile)}
                    className={`py-2 px-1 rounded-xl border text-center font-bold text-xs transition-all ${
                      riskProfile === profile
                        ? 'border-neonViolet bg-neonViolet/10 text-white'
                        : 'border-darkBorder bg-slate-900/20 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {profile}
                  </button>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Right Side: Financial configurations & Sliders */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-neonViolet" />
              <h2 className="text-base font-bold text-white">Financial Details & Allocations</h2>
            </CardHeader>
            <CardBody className="space-y-6">
              {/* Feedback messages */}
              {updateSuccess && (
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-neonMint/15 border border-neonMint/20 text-neonMint text-xs font-semibold">
                  <CheckCircle className="w-4.5 h-4.5" />
                  <span>Profile updated successfully!</span>
                </div>
              )}

              {(localError || authError) && (
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-neonCoral/15 border border-neonCoral/20 text-neonCoral text-xs font-semibold">
                  <AlertTriangle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                  <span>{localError || authError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Monthly Net Income (₹)</label>
                  <input
                    type="number"
                    value={income}
                    onChange={(e) => setIncome(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900/50 border border-darkBorder text-white text-sm focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Current Savings (₹)</label>
                  <input
                    type="number"
                    value={savings}
                    onChange={(e) => setSavings(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900/50 border border-darkBorder text-white text-sm focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Custom Sliders */}
              <div className="space-y-4 pt-4 border-t border-darkBorder">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Custom Budget Percentages</h3>
                
                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-300">Needs</span>
                      <span className="font-semibold text-white">{needs}% (₹{((needs / 100) * income).toFixed(0)})</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="80"
                      value={needs}
                      onChange={(e) => setNeeds(parseInt(e.target.value) || 0)}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-neonViolet"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-300">Wants</span>
                      <span className="font-semibold text-white">{wants}% (₹{((wants / 100) * income).toFixed(0)})</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="60"
                      value={wants}
                      onChange={(e) => setWants(parseInt(e.target.value) || 0)}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-neonViolet"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-300">Savings</span>
                      <span className="font-semibold text-white">{savingsPct}% (₹{((savingsPct / 100) * income).toFixed(0)})</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      value={savingsPct}
                      onChange={(e) => setSavingsPct(parseInt(e.target.value) || 0)}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-neonViolet"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-300">Investing</span>
                      <span className="font-semibold text-white">{investing}% (₹{((investing / 100) * income).toFixed(0)})</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      value={investing}
                      onChange={(e) => setInvesting(parseInt(e.target.value) || 0)}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-neonViolet"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-900 text-xs">
                    <span className="text-slate-400 font-medium">Total:</span>
                    <span className={`font-bold px-2 py-0.5 rounded ${isSumValid ? 'text-neonMint bg-neonMint/10' : 'text-neonCoral bg-neonCoral/10 animate-pulse'}`}>
                      {totalPercentage}% / 100%
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={authLoading || !isSumValid}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold shadow-lg hover:shadow-violet-500/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none text-sm flex items-center justify-center gap-2"
              >
                {authLoading ? 'Saving Changes...' : 'Save Configuration Changes'}
              </button>
            </CardBody>
          </Card>
        </div>
      </form>
    </div>
  );
};
