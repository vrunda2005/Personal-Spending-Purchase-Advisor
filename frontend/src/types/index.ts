export interface User {
  id: number;
  email: string;
  name: string;
  age: number | null;
  occupation: string | null;
  income: number;
  savings: number;
  risk_profile: string;
  available_budget: number;
  needs_percentage: number;
  wants_percentage: number;
  savings_percentage: number;
  investing_percentage: number;
  created_at: string;
}

export interface Goal {
  id: number;
  user_id: number;
  goal_name: string;
  target_amount: number;
  current_amount: number;
  deadline: string | null; // YYYY-MM-DD
  created_at: string;
}

export interface Purchase {
  id: number;
  user_id: number;
  name: string;
  price: number;
  category: string;
  date: string; // YYYY-MM-DD
  is_impulse: boolean;
  was_regretted: boolean | null;
  regret_likelihood: number;
  created_at: string;
}

export interface AdvisorAdvice {
  need_score: number;
  want_score: number;
  recommendation: 'Buy' | 'Postpone';
  reason: string;
  alternatives: string[];
  total_delay_months: number | null;
  regret_likelihood: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface BudgetCategory {
  percentage: number;
  amount: number;
}

export interface BudgetAllocation {
  source: 'custom' | 'risk_profile';
  income: number;
  allocations: {
    needs: BudgetCategory;
    wants: BudgetCategory;
    savings: BudgetCategory;
    investing: BudgetCategory;
  };
}

export interface HealthBreakdown {
  savings_rate_score: number;
  impulse_control_score: number;
  goal_adherence_score: number;
  budget_discipline_score: number;
}

export interface HealthScore {
  score: number;
  rating: string;
  summary: string;
  breakdown: HealthBreakdown;
  metrics: {
    monthly_savings_rate: number;
    current_month_spending: number;
    last_30_days_spending: number;
  };
}
