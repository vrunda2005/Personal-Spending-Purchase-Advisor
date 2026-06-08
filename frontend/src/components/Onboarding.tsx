import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useFinanceStore } from '../store/useFinanceStore';
import { Card, CardHeader, CardBody } from './common/Card';
import { Sparkles, AlertTriangle } from 'lucide-react';

export const Onboarding: React.FC = () => {
  const { updateProfile } = useAuthStore();
  const { fetchBudgetAllocation } = useFinanceStore();
  
  const [age, setAge] = useState<number>(25);
  const [occupation, setOccupation] = useState<string>('');
  const [income, setIncome] = useState<number>(30000);
  const [savings, setSavings] = useState<number>(10000);
  const [riskProfile, setRiskProfile] = useState<string>('Moderate');
  const [allocationMode, setAllocationMode] = useState<'default' | 'custom'>('default');

  // Allocation sliders
  const [needs, setNeeds] = useState<number>(50);
  const [wants, setWants] = useState<number>(25);
  const [savingsPct, setSavingsPct] = useState<number>(15);
  const [investing, setInvesting] = useState<number>(10);
  
  const [validationError, setValidationError] = useState<string | null>(null);

  // Default allocations mapped to risk profiles
  // Conservative: 60 Needs, 20 Wants, 15 Savings, 5 Investing
  // Moderate: 50 Needs, 25 Wants, 15 Savings, 10 Investing
  // Aggressive: 40 Needs, 20 Wants, 15 Savings, 25 Investing
  useEffect(() => {
    if (allocationMode === 'default') {
      if (riskProfile === 'Conservative') {
        setNeeds(60); setWants(20); setSavingsPct(15); setInvesting(5);
      } else if (riskProfile === 'Moderate') {
        setNeeds(50); setWants(25); setSavingsPct(15); setInvesting(10);
      } else {
        setNeeds(40); setWants(20); setSavingsPct(15); setInvesting(25);
      }
    }
  }, [riskProfile, allocationMode]);

  const totalPercentage = needs + wants + savingsPct + investing;
  const isSumValid = Math.abs(totalPercentage - 100) < 0.01;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!isSumValid) {
      setValidationError('Budget allocations must sum to exactly 100%. Current sum: ' + totalPercentage + '%');
      return;
    }

    if (income <= 0) {
      setValidationError('Income must be a positive number.');
      return;
    }

    const payload = {
      age,
      occupation: occupation || null,
      income,
      savings,
      available_budget: income, // Default starting budget is income
      risk_profile: riskProfile,
      needs_percentage: needs,
      wants_percentage: wants,
      savings_percentage: savingsPct,
      investing_percentage: investing,
    };

    const success = await updateProfile(payload);
    if (success) {
      await fetchBudgetAllocation();
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.08)_0px,transparent_50%)] pointer-events-none" />
      
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-white text-gradient-primary">
          Let's Customize Your Financial Strategy
        </h1>
        <p className="text-slate-400 mt-2 text-sm max-w-md mx-auto">
          We need a few details to build your deterministic forecasting metrics and custom AI coach modules.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="shadow-2xl">
          <CardHeader className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-neonViolet" />
            <h2 className="text-xl font-bold text-white">Financial Onboarding</h2>
          </CardHeader>
          
          <CardBody className="space-y-6">
            {validationError && (
              <div className="flex items-start gap-3 p-3 rounded-xl bg-neonCoral/15 border border-neonCoral/20 text-neonCoral text-sm">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{validationError}</span>
              </div>
            )}

            {/* Demographics Group */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase block">Age</label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={age}
                  onChange={(e) => setAge(parseInt(e.target.value) || 25)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900/50 border border-darkBorder text-white focus:outline-none focus:border-neonViolet/50 text-sm"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase block">Occupation</label>
                <input
                  type="text"
                  placeholder="e.g. Software Engineer, Student"
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900/50 border border-darkBorder text-white focus:outline-none focus:border-neonViolet/50 text-sm"
                />
              </div>
            </div>

            {/* Income and Savings Group */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase block">Monthly Net Income (₹)</label>
                <div className="relative">
                  <span className="absolute left-4 top-2.5 text-slate-400 text-sm font-semibold">₹</span>
                  <input
                    type="number"
                    min="0"
                    value={income}
                    onChange={(e) => setIncome(parseFloat(e.target.value) || 0)}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-slate-900/50 border border-darkBorder text-white focus:outline-none focus:border-neonViolet/50 text-sm"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase block">Current Cash Savings (₹)</label>
                <div className="relative">
                  <span className="absolute left-4 top-2.5 text-slate-400 text-sm font-semibold">₹</span>
                  <input
                    type="number"
                    min="0"
                    value={savings}
                    onChange={(e) => setSavings(parseFloat(e.target.value) || 0)}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-slate-900/50 border border-darkBorder text-white focus:outline-none focus:border-neonViolet/50 text-sm"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Risk Profile Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase block">Investment Risk Profile</label>
              <div className="grid grid-cols-3 gap-3">
                {['Conservative', 'Moderate', 'Aggressive'].map((profile) => (
                  <button
                    key={profile}
                    type="button"
                    onClick={() => setRiskProfile(profile)}
                    className={`py-3 px-4 rounded-xl border text-center font-semibold text-sm transition-all ${
                      riskProfile === profile
                        ? 'border-neonViolet bg-neonViolet/10 text-white shadow-glass-glow'
                        : 'border-darkBorder bg-slate-900/20 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {profile}
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Changing risk profile modifies your default percentage guidelines automatically.
              </p>
            </div>

            {/* Allocation Method Toggles */}
            <div className="pt-4 border-t border-darkBorder space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white">Monthly Budget Allocations</h3>
                  <p className="text-xs text-slate-400">Specify standard percentages for monthly allocations</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setAllocationMode('default')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      allocationMode === 'default'
                        ? 'bg-slate-800 border-slate-700 text-white'
                        : 'bg-transparent border-transparent text-slate-500 hover:text-slate-400'
                    }`}
                  >
                    Risk-based Guideline
                  </button>
                  <button
                    type="button"
                    onClick={() => setAllocationMode('custom')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      allocationMode === 'custom'
                        ? 'bg-slate-800 border-slate-700 text-white'
                        : 'bg-transparent border-transparent text-slate-500 hover:text-slate-400'
                    }`}
                  >
                    Custom Values
                  </button>
                </div>
              </div>

              {/* Slider list */}
              <div className="space-y-4 bg-slate-900/20 p-4 rounded-xl border border-darkBorder">
                {/* Needs */}
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-slate-300">Needs (Rent, Groceries, Utility)</span>
                    <span className="font-semibold text-white">{needs}% (₹{((needs / 100) * income).toFixed(0)})</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="80"
                    disabled={allocationMode === 'default'}
                    value={needs}
                    onChange={(e) => setNeeds(parseInt(e.target.value) || 0)}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-neonViolet disabled:opacity-50"
                  />
                </div>

                {/* Wants */}
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-slate-300">Wants (Dining out, Entertainment)</span>
                    <span className="font-semibold text-white">{wants}% (₹{((wants / 100) * income).toFixed(0)})</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="60"
                    disabled={allocationMode === 'default'}
                    value={wants}
                    onChange={(e) => setWants(parseInt(e.target.value) || 0)}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-neonViolet disabled:opacity-50"
                  />
                </div>

                {/* Savings */}
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-slate-300">Goal Savings (Cash accumulation)</span>
                    <span className="font-semibold text-white">{savingsPct}% (₹{((savingsPct / 100) * income).toFixed(0)})</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    disabled={allocationMode === 'default'}
                    value={savingsPct}
                    onChange={(e) => setSavingsPct(parseInt(e.target.value) || 0)}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-neonViolet disabled:opacity-50"
                  />
                </div>

                {/* Investing */}
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-slate-300">Investing (Stocks, Mutual Funds)</span>
                    <span className="font-semibold text-white">{investing}% (₹{((investing / 100) * income).toFixed(0)})</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    disabled={allocationMode === 'default'}
                    value={investing}
                    onChange={(e) => setInvesting(parseInt(e.target.value) || 0)}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-neonViolet disabled:opacity-50"
                  />
                </div>

                {/* Dynamic sum indicator */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-800/40 text-xs">
                  <span className="text-slate-400">Total Allocated:</span>
                  <span className={`font-semibold px-2 py-0.5 rounded ${isSumValid ? 'text-neonMint bg-neonMint/10' : 'text-neonCoral bg-neonCoral/10 animate-pulse'}`}>
                    {totalPercentage}% / 100%
                  </span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={!isSumValid}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-white font-semibold shadow-lg active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none text-sm block text-center"
            >
              Complete Setup & Enter Dashboard
            </button>
          </CardBody>
        </Card>
      </form>
    </div>
  );
};
