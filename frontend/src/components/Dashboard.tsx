import React, { useState, useEffect } from 'react';
import { useFinanceStore } from '../store/useFinanceStore';
import { useAuthStore } from '../store/useAuthStore';
import { Card, CardHeader, CardBody } from './common/Card';
import { 
  TrendingUp, 
  Plus, 
  Trash2, 
  Activity, 
  Calendar, 
  ShoppingBag, 
  Target, 
  Frown, 
  CheckCircle,
  Percent
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const {
    goals,
    purchases,
    healthScore,
    budgetAllocation,
    fetchGoals,
    fetchPurchases,
    fetchHealthScore,
    fetchBudgetAllocation,
    addGoal,
    deleteGoal,
    addPurchase,
    deletePurchase,
    updatePurchase
  } = useFinanceStore();

  // Load dashboard data on mount
  useEffect(() => {
    fetchGoals();
    fetchPurchases();
    fetchHealthScore();
    fetchBudgetAllocation();
  }, []);

  // Goal Form State
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [goalName, setGoalName] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [goalCurrent, setGoalCurrent] = useState('0');
  const [goalDeadline, setGoalDeadline] = useState('');

  // Transaction Form State
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);
  const [purchaseName, setPurchaseName] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [purchaseCategory, setPurchaseCategory] = useState('Needs');
  const [purchaseIsImpulse, setPurchaseIsImpulse] = useState(false);

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalName || !goalTarget) return;
    
    const success = await addGoal({
      goal_name: goalName,
      target_amount: parseFloat(goalTarget),
      current_amount: parseFloat(goalCurrent) || 0,
      deadline: goalDeadline || null
    });

    if (success) {
      setGoalName('');
      setGoalTarget('');
      setGoalCurrent('0');
      setGoalDeadline('');
      setShowGoalForm(false);
    }
  };

  const handleAddPurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!purchaseName || !purchasePrice) return;

    const success = await addPurchase({
      name: purchaseName,
      price: parseFloat(purchasePrice),
      category: purchaseCategory,
      date: new Date().toISOString().split('T')[0],
      is_impulse: purchaseIsImpulse,
      was_regretted: null
    });

    if (success) {
      setPurchaseName('');
      setPurchasePrice('');
      setPurchaseCategory('Needs');
      setPurchaseIsImpulse(false);
      setShowPurchaseForm(false);
    }
  };

  const toggleRegret = async (id: number, currentVal: boolean | null) => {
    // Toggles whether a purchase was regretted or not
    await updatePurchase(id, { was_regretted: currentVal === true ? false : true });
  };

  // Prepare Pie Chart Data for Budget Allocations
  const pieData = budgetAllocation ? [
    { name: 'Needs', value: budgetAllocation.allocations.needs.amount, color: '#6366F1' },
    { name: 'Wants', value: budgetAllocation.allocations.wants.amount, color: '#F59E0B' },
    { name: 'Savings', value: budgetAllocation.allocations.savings.amount, color: '#10B981' },
    { name: 'Investing', value: budgetAllocation.allocations.investing.amount, color: '#3B82F6' },
  ].filter(item => item.value > 0) : [];

  // Get total spent in current month
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlySpending = purchases
    .filter(p => {
      const pDate = new Date(p.date);
      return pDate.getMonth() === currentMonth && pDate.getFullYear() === currentYear;
    })
    .reduce((sum, p) => sum + p.price, 0);

  return (
    <div className="space-y-6">
      {/* Upper overview section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Financial Health Score Panel */}
        <Card className="lg:col-span-2 relative overflow-hidden" glowColor={healthScore && healthScore.score >= 70 ? 'emerald' : healthScore && healthScore.score >= 50 ? 'amber' : 'coral'}>
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-violet-600/10 to-transparent rounded-bl-full pointer-events-none" />
          <CardHeader className="border-none flex items-center justify-between pb-0">
            <div>
              <h2 className="text-lg font-bold text-white">Financial Health Score</h2>
              <p className="text-xs text-slate-400">Based on savings rate, budget discipline, and impulse choices.</p>
            </div>
            <Activity className="w-5 h-5 text-neonViolet" />
          </CardHeader>
          <CardBody className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Circle Score */}
            <div className="flex flex-col items-center justify-center p-4">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="64" cy="64" r="54" className="stroke-slate-800" strokeWidth="8" fill="transparent" />
                  <circle 
                    cx="64" 
                    cy="64" 
                    r="54" 
                    className="stroke-neonViolet transition-all duration-1000" 
                    strokeWidth="8" 
                    fill="transparent" 
                    strokeDasharray={2 * Math.PI * 54} 
                    strokeDashoffset={2 * Math.PI * 54 * (1 - (healthScore?.score || 0) / 100)} 
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-3xl font-extrabold text-white font-display">
                    {healthScore?.score ?? '--'}
                  </span>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Health</p>
                </div>
              </div>
              <span className="mt-3 text-xs font-bold px-2.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {healthScore?.rating || 'Calculating...'}
              </span>
            </div>

            {/* Breakdown */}
            <div className="md:col-span-2 space-y-3">
              <h3 className="text-sm font-semibold text-slate-300">Score Metrics Breakdown</h3>
              
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-0.5">
                    <span>Savings Rate Score</span>
                    <span className="font-semibold text-white">{healthScore?.breakdown.savings_rate_score ?? 0}/100</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${healthScore?.breakdown.savings_rate_score ?? 0}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-0.5">
                    <span>Impulse Purchase Control</span>
                    <span className="font-semibold text-white">{healthScore?.breakdown.impulse_control_score ?? 0}/100</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-violet-500 rounded-full" style={{ width: `${healthScore?.breakdown.impulse_control_score ?? 0}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-0.5">
                    <span>Goal Adherence</span>
                    <span className="font-semibold text-white">{healthScore?.breakdown.goal_adherence_score ?? 0}/100</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${healthScore?.breakdown.goal_adherence_score ?? 0}%` }} />
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-400 italic pt-1">
                "{healthScore?.summary || 'Log transactions and establish clear savings goals to start receiving detailed AI insights.'}"
              </p>
            </div>
          </CardBody>
        </Card>

        {/* Budget Allocation Pie */}
        <Card>
          <CardHeader className="border-none flex items-center justify-between pb-0">
            <h2 className="text-base font-bold text-white">Monthly Allocation Guide</h2>
            <Percent className="w-4 h-4 text-neonAmber" />
          </CardHeader>
          <CardBody className="flex flex-col items-center justify-center p-3">
            {pieData.length > 0 ? (
              <div className="w-full h-36 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={36}
                      outerRadius={48}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `₹${value}`} contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#2D3748', borderRadius: '8px' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xs text-slate-400">Total Budget</span>
                  <span className="text-sm font-bold text-white">₹{user?.income}</span>
                </div>
              </div>
            ) : (
              <div className="h-36 flex items-center justify-center text-xs text-slate-500">
                No budget allocation rules set.
              </div>
            )}
            
            {/* Donut Legend */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 w-full text-xs">
              {pieData.map((item, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-400 shrink-0">{item.name}:</span>
                  <span className="font-semibold text-white ml-auto">₹{item.value}</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Basic Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center gap-4 bg-slate-900/30">
          <div className="p-3 rounded-xl bg-violet-600/10 border border-violet-500/20 text-violet-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium">Monthly Income</span>
            <span className="text-lg font-bold text-white">₹{user?.income.toLocaleString()}</span>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4 bg-slate-900/30">
          <div className="p-3 rounded-xl bg-emerald-600/10 border border-emerald-500/20 text-emerald-400">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium">Current Cash Savings</span>
            <span className="text-lg font-bold text-white">₹{user?.savings.toLocaleString()}</span>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4 bg-slate-900/30">
          <div className="p-3 rounded-xl bg-amber-600/10 border border-amber-500/20 text-neonAmber">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium">Spent This Month</span>
            <span className="text-lg font-bold text-white">₹{monthlySpending.toLocaleString()}</span>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4 bg-slate-900/30">
          <div className="p-3 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium">Available Budget</span>
            <span className={`text-lg font-bold ${user && user.available_budget < (user.income * 0.1) ? 'text-neonCoral' : 'text-white'}`}>
              ₹{user?.available_budget.toLocaleString()}
            </span>
          </div>
        </Card>
      </div>

      {/* Main Body Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Goals Management Panel */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-bold text-white">Financial Goals</h2>
            </div>
            <button
              onClick={() => setShowGoalForm(!showGoalForm)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
            >
              <Plus className="w-4 h-4" />
            </button>
          </CardHeader>
          
          <CardBody className="space-y-4">
            {/* Inline Add Goal Form */}
            {showGoalForm && (
              <form onSubmit={handleAddGoal} className="p-4 rounded-xl bg-slate-900/50 border border-darkBorder space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Add Savings Goal</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-semibold text-slate-400">Goal Name</label>
                    <input
                      type="text"
                      placeholder="e.g. MacBook, Emergency Fund"
                      value={goalName}
                      onChange={(e) => setGoalName(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-darkBorder text-white text-xs focus:outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-semibold text-slate-400">Target Amount (₹)</label>
                    <input
                      type="number"
                      placeholder="₹50,000"
                      value={goalTarget}
                      onChange={(e) => setGoalTarget(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-darkBorder text-white text-xs focus:outline-none"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-semibold text-slate-400">Current Saved (₹)</label>
                    <input
                      type="number"
                      value={goalCurrent}
                      onChange={(e) => setGoalCurrent(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-darkBorder text-white text-xs focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-semibold text-slate-400">Deadline Date</label>
                    <input
                      type="date"
                      value={goalDeadline}
                      onChange={(e) => setGoalDeadline(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-darkBorder text-white text-xs focus:outline-none"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowGoalForm(false)}
                    className="px-3 py-1.5 rounded-lg text-xs bg-slate-800 text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-lg text-xs bg-emerald-600 text-white hover:bg-emerald-500 font-semibold"
                  >
                    Create Goal
                  </button>
                </div>
              </form>
            )}

            {/* Goals List */}
            {goals.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs flex flex-col items-center gap-2">
                <Target className="w-8 h-8 text-slate-700" />
                <span>No saving goals created yet. Let's make one!</span>
              </div>
            ) : (
              <div className="space-y-3.5 max-h-[350px] overflow-y-auto pr-1">
                {goals.map((g) => {
                  const pct = Math.min(100, Math.max(0, (g.current_amount / g.target_amount) * 100));
                  return (
                    <div key={g.id} className="p-3.5 rounded-xl bg-slate-900/30 border border-darkBorder hover:border-slate-800 transition-all flex items-center gap-4">
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-white text-sm">{g.goal_name}</span>
                          <span className="text-slate-400">
                            ₹{g.current_amount.toLocaleString()} / ₹{g.target_amount.toLocaleString()}
                          </span>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-emerald-500 to-indigo-500 rounded-full" 
                            style={{ width: `${pct}%` }} 
                          />
                        </div>
                        
                        <div className="flex justify-between text-[10px] text-slate-400">
                          <span>{pct.toFixed(0)}% Saved</span>
                          {g.deadline && (
                            <span>Target Deadline: {new Date(g.deadline).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => deleteGoal(g.id)}
                        className="p-2 rounded-lg bg-slate-950 hover:bg-neonCoral/15 text-slate-500 hover:text-neonCoral border border-transparent hover:border-neonCoral/20 transition-all shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Transaction History Panel */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-bold text-white">Purchase History</h2>
            </div>
            <button
              onClick={() => setShowPurchaseForm(!showPurchaseForm)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
            >
              <Plus className="w-4 h-4" />
            </button>
          </CardHeader>
          
          <CardBody className="space-y-4">
            {/* Inline Add Purchase Form */}
            {showPurchaseForm && (
              <form onSubmit={handleAddPurchase} className="p-4 rounded-xl bg-slate-900/50 border border-darkBorder space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Log Transaction</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-semibold text-slate-400">Item Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Starbucks, Rent, Shoes"
                      value={purchaseName}
                      onChange={(e) => setPurchaseName(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-darkBorder text-white text-xs focus:outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-semibold text-slate-400">Price (₹)</label>
                    <input
                      type="number"
                      placeholder="₹250"
                      value={purchasePrice}
                      onChange={(e) => setPurchasePrice(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-darkBorder text-white text-xs focus:outline-none"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 items-center pt-1">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-semibold text-slate-400">Category</label>
                    <select
                      value={purchaseCategory}
                      onChange={(e) => setPurchaseCategory(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-darkBorder text-white text-xs focus:outline-none"
                    >
                      <option value="Needs">Needs</option>
                      <option value="Wants">Wants</option>
                      <option value="Savings">Savings</option>
                      <option value="Investing">Investing</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2 mt-4">
                    <input
                      type="checkbox"
                      id="isImpulse"
                      checked={purchaseIsImpulse}
                      onChange={(e) => setPurchaseIsImpulse(e.target.checked)}
                      className="rounded bg-slate-950 border-darkBorder text-neonViolet focus:ring-0 focus:ring-offset-0"
                    />
                    <label htmlFor="isImpulse" className="text-xs font-semibold text-slate-300 cursor-pointer">
                      Impulse Purchase?
                    </label>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPurchaseForm(false)}
                    className="px-3 py-1.5 rounded-lg text-xs bg-slate-800 text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-lg text-xs bg-indigo-600 text-white hover:bg-indigo-500 font-semibold"
                  >
                    Log Purchase
                  </button>
                </div>
              </form>
            )}

            {/* Transactions List */}
            {purchases.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs flex flex-col items-center gap-2">
                <ShoppingBag className="w-8 h-8 text-slate-700" />
                <span>No purchases recorded yet. Log your first spend!</span>
              </div>
            ) : (
              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                {purchases.map((p) => (
                  <div key={p.id} className="p-3 rounded-xl bg-slate-900/30 border border-darkBorder hover:border-slate-800 transition-all flex items-center justify-between gap-3">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">{p.name}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                          p.category === 'Needs' ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/10' :
                          p.category === 'Wants' ? 'bg-amber-600/10 text-neonAmber border border-amber-500/10' :
                          'bg-emerald-600/10 text-neonMint border border-emerald-500/10'
                        }`}>
                          {p.category}
                        </span>
                        {p.is_impulse && (
                          <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-violet-600/10 text-violet-400 border border-violet-500/10">
                            Impulse
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span>₹{p.price.toLocaleString()}</span>
                        <span>•</span>
                        <span>{new Date(p.date).toLocaleDateString()}</span>
                        {p.is_impulse && p.regret_likelihood > 0 && (
                          <>
                            <span>•</span>
                            <span className="text-neonCoral/90 flex items-center gap-0.5">
                              Regret Prob: {(p.regret_likelihood * 100).toFixed(0)}%
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Toggle Regret & Delete Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {p.is_impulse && (
                        <button
                          onClick={() => toggleRegret(p.id, p.was_regretted)}
                          className={`p-2 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                            p.was_regretted
                              ? 'bg-neonCoral/15 text-neonCoral border-neonCoral/20'
                              : 'bg-slate-950 text-slate-400 border-transparent hover:border-slate-700 hover:text-slate-300'
                          }`}
                          title="Did you regret this impulse purchase later?"
                        >
                          {p.was_regretted ? <Frown className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                        </button>
                      )}
                      
                      <button
                        onClick={() => deletePurchase(p.id)}
                        className="p-2 rounded-lg bg-slate-950 hover:bg-neonCoral/15 text-slate-500 hover:text-neonCoral border border-transparent hover:border-neonCoral/20 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
};
