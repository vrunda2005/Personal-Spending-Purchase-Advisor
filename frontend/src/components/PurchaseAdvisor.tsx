import React, { useState } from 'react';
import { useFinanceStore } from '../store/useFinanceStore';
import { Card, CardHeader, CardBody } from './common/Card';
import { 
  Sparkles, 
  ShoppingBag, 
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  Calendar,
  Undo2
} from 'lucide-react';

export const PurchaseAdvisor: React.FC = () => {
  const { advisorAdvice, evaluatePurchaseAdvice, clearAdvisorAdvice, isLoading, error } = useFinanceStore();

  const [itemName, setItemName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Wants');

  const handleEvaluate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName || !price) return;
    await evaluatePurchaseAdvice(itemName, parseFloat(price), category);
  };

  const resetAdvisor = () => {
    setItemName('');
    price && setPrice('');
    clearAdvisorAdvice();
  };

  return (
    <div className="space-y-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_right,rgba(99,102,241,0.06)_0px,transparent_60%)] pointer-events-none" />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white text-gradient-primary">AI Purchase Evaluation</h1>
          <p className="text-xs text-slate-400">Simulate financial goal impacts and analyze impulse regrets before you spend.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        {/* Left Side: Input Form */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-neonViolet" />
            <h2 className="text-base font-bold text-white">Purchase Parameters</h2>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleEvaluate} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase">Item Name</label>
                <input
                  type="text"
                  placeholder="e.g. Sony WH-1000XM5, Weekend Getaway"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900/50 border border-darkBorder text-white focus:outline-none focus:border-neonViolet/50 text-sm"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase">Price (₹)</label>
                <input
                  type="number"
                  placeholder="₹15,000"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900/50 border border-darkBorder text-white focus:outline-none focus:border-neonViolet/50 text-sm"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase">Budget Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900/50 border border-darkBorder text-white focus:outline-none focus:border-neonViolet/50 text-sm"
                  disabled={isLoading}
                >
                  <option value="Wants">Wants (Leisure, Dining out, Subscriptions)</option>
                  <option value="Needs">Needs (Essential Bills, Healthcare)</option>
                  <option value="Savings">Savings (Emergency reserves)</option>
                  <option value="Investing">Investing (Capital additions)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isLoading || !itemName || !price}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold shadow-lg hover:shadow-violet-500/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 text-sm"
              >
                {isLoading ? 'Running Simulations...' : 'Evaluate Decision'}
              </button>
            </form>
          </CardBody>
        </Card>

        {/* Right Side: Results */}
        <div className="lg:col-span-3">
          {isLoading ? (
            <Card className="h-[400px] flex flex-col items-center justify-center text-center p-8">
              <div className="relative w-16 h-16 mb-4">
                <div className="absolute inset-0 border-4 border-violet-500/10 rounded-full" />
                <div className="absolute inset-0 border-4 border-t-neonViolet rounded-full animate-spin" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Analyzing Cash Flows</h3>
              <p className="text-xs text-slate-400 max-w-xs">
                Calculating deterministic goal impacts and calling the Google Gemini AI evaluator engine...
              </p>
            </Card>
          ) : error ? (
            <Card className="p-6 border-neonCoral/20 bg-neonCoral/5">
              <div className="flex items-center gap-3 text-neonCoral mb-4">
                <AlertTriangle className="w-6 h-6" />
                <h3 className="font-bold">Evaluation Failed</h3>
              </div>
              <p className="text-xs text-slate-300">{error}</p>
              <button
                onClick={resetAdvisor}
                className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold"
              >
                Try Again
              </button>
            </Card>
          ) : advisorAdvice ? (
            <div className="space-y-6">
              {/* Verdict Header Card */}
              <Card glowColor={advisorAdvice.recommendation === 'Buy' ? 'emerald' : 'coral'}>
                <CardBody className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest block">AI RECOMMENDATION</span>
                    <h2 className={`text-2xl font-black font-display uppercase tracking-wide mt-1 ${
                      advisorAdvice.recommendation === 'Buy' ? 'text-neonMint' : 'text-neonCoral'
                    }`}>
                      {advisorAdvice.recommendation === 'Buy' ? 'Buy Authorized' : 'Postpone Recommended'}
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Analyzed on current monthly net surplus, goals target deadlines, and category regret metrics.
                    </p>
                  </div>
                  <button
                    onClick={resetAdvisor}
                    className="flex items-center gap-1.5 px-4 py-2 bg-slate-900/50 border border-darkBorder hover:border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-all shrink-0"
                  >
                    <Undo2 className="w-4 h-4" />
                    Reset
                  </button>
                </CardBody>
              </Card>

              {/* Math metrics section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Need vs Want Scores */}
                <Card>
                  <CardHeader className="border-none pb-0">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Score Metrics</h3>
                  </CardHeader>
                  <CardBody className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                        <span>Need Score</span>
                        <span className="text-indigo-400">{advisorAdvice.need_score}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${advisorAdvice.need_score}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                        <span>Want Score</span>
                        <span className="text-neonAmber">{advisorAdvice.want_score}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-neonAmber rounded-full" style={{ width: `${advisorAdvice.want_score}%` }} />
                      </div>
                    </div>
                  </CardBody>
                </Card>

                {/* Delay & Regret metrics */}
                <Card>
                  <CardHeader className="border-none pb-0">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Forecasting Impacts</h3>
                  </CardHeader>
                  <CardBody className="space-y-3 text-xs">
                    <div className="flex justify-between items-center py-1.5 border-b border-darkBorder">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-violet-400" /> Goal Timelines Delay
                      </span>
                      <span className={`font-semibold ${advisorAdvice.total_delay_months && advisorAdvice.total_delay_months > 0 ? 'text-neonCoral' : 'text-neonMint'}`}>
                        {advisorAdvice.total_delay_months ? `+${advisorAdvice.total_delay_months} Month(s)` : '0 Months Delay'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-1.5">
                      <span className="text-slate-400 flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4 text-neonAmber" /> Predicted Impulse Regret
                      </span>
                      <span className={`font-semibold ${advisorAdvice.regret_likelihood > 0.5 ? 'text-neonCoral' : 'text-neonMint'}`}>
                        {(advisorAdvice.regret_likelihood * 100).toFixed(0)}% Likelihood
                      </span>
                    </div>
                  </CardBody>
                </Card>
              </div>

              {/* AI critique reason */}
              <Card>
                <CardHeader className="border-none pb-0 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-neonViolet" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">AI Advisor Analysis</h3>
                </CardHeader>
                <CardBody>
                  <p className="text-sm text-slate-200 leading-relaxed bg-slate-900/40 p-4 rounded-xl border border-darkBorder">
                    {advisorAdvice.reason}
                  </p>
                </CardBody>
              </Card>

              {/* Suggestions Alternatives */}
              {advisorAdvice.alternatives.length > 0 && (
                <Card>
                  <CardHeader className="border-none pb-0 flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Smart Alternatives</h3>
                  </CardHeader>
                  <CardBody className="p-4 pt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-2">
                      {advisorAdvice.alternatives.map((alt, i) => (
                        <div key={i} className="flex gap-2.5 p-3 rounded-xl bg-slate-900/20 border border-darkBorder text-slate-300 text-xs items-start">
                          <ArrowRight className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                          <span>{alt}</span>
                        </div>
                      ))}
                    </div>
                  </CardBody>
                </Card>
              )}
            </div>
          ) : (
            <Card className="h-[400px] flex flex-col items-center justify-center text-center p-8 border-dashed border-slate-700/60 bg-transparent">
              <Sparkles className="w-12 h-12 text-slate-700 mb-4" />
              <h3 className="text-sm font-bold text-slate-400 mb-1">Waiting for Inputs</h3>
              <p className="text-xs text-slate-500 max-w-xs">
                Fill in the item details on the left to see deterministic delays and generative AI advisor remarks.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
