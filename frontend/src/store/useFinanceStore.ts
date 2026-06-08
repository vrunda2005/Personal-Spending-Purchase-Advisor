import { create } from 'zustand';
import apiClient from '../api/client';
import { 
  Goal, 
  Purchase, 
  HealthScore, 
  BudgetAllocation, 
  AdvisorAdvice, 
  ChatMessage 
} from '../types';

interface FinanceState {
  goals: Goal[];
  purchases: Purchase[];
  healthScore: HealthScore | null;
  budgetAllocation: BudgetAllocation | null;
  advisorAdvice: AdvisorAdvice | null;
  chatHistory: ChatMessage[];
  isLoading: boolean;
  isChatLoading: boolean;
  error: string | null;

  fetchGoals: () => Promise<void>;
  addGoal: (goal: { goal_name: string; target_amount: number; current_amount: number; deadline: string | null }) => Promise<boolean>;
  updateGoal: (id: number, goal: Partial<Goal>) => Promise<boolean>;
  deleteGoal: (id: number) => Promise<boolean>;

  fetchPurchases: () => Promise<void>;
  addPurchase: (purchase: { name: string; price: number; category: string; date: string; is_impulse: boolean; was_regretted: boolean | null }) => Promise<boolean>;
  updatePurchase: (id: number, purchase: Partial<Purchase>) => Promise<boolean>;
  deletePurchase: (id: number) => Promise<boolean>;

  fetchHealthScore: () => Promise<void>;
  fetchBudgetAllocation: () => Promise<void>;
  evaluatePurchaseAdvice: (item_name: string, price: number, category: string) => Promise<void>;
  sendCoachMessage: (message: string) => Promise<void>;
  clearAdvisorAdvice: () => void;
  clearChat: () => void;
}

export const useFinanceStore = create<FinanceState>((set, get) => ({
  goals: [],
  purchases: [],
  healthScore: null,
  budgetAllocation: null,
  advisorAdvice: null,
  chatHistory: [],
  isLoading: false,
  isChatLoading: false,
  error: null,

  fetchGoals: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get<Goal[]>('/goals/');
      set({ goals: response.data, isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.detail || 'Failed to fetch goals.', isLoading: false });
    }
  },

  addGoal: async (goal) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post<Goal>('/goals/', goal);
      set((state) => ({ goals: [...state.goals, response.data] }));
      await get().fetchHealthScore(); // Refresh health score since goal stack changed
      set({ isLoading: false });
      return true;
    } catch (err: any) {
      set({ error: err.response?.data?.detail || 'Failed to create goal.', isLoading: false });
      return false;
    }
  },

  updateGoal: async (id, goalData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.put<Goal>(`/goals/${id}`, goalData);
      set((state) => ({
        goals: state.goals.map((g) => (g.id === id ? response.data : g)),
      }));
      await get().fetchHealthScore();
      set({ isLoading: false });
      return true;
    } catch (err: any) {
      set({ error: err.response?.data?.detail || 'Failed to update goal.', isLoading: false });
      return false;
    }
  },

  deleteGoal: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.delete(`/goals/${id}`);
      set((state) => ({
        goals: state.goals.filter((g) => g.id !== id),
      }));
      await get().fetchHealthScore();
      set({ isLoading: false });
      return true;
    } catch (err: any) {
      set({ error: err.response?.data?.detail || 'Failed to delete goal.', isLoading: false });
      return false;
    }
  },

  fetchPurchases: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get<Purchase[]>('/purchases/');
      set({ purchases: response.data, isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.detail || 'Failed to fetch purchases.', isLoading: false });
    }
  },

  addPurchase: async (purchase) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post<Purchase>('/purchases/', purchase);
      set((state) => ({ purchases: [response.data, ...state.purchases] }));
      
      // Re-trigger global metric updates
      await get().fetchHealthScore();
      set({ isLoading: false });
      return true;
    } catch (err: any) {
      set({ error: err.response?.data?.detail || 'Failed to record purchase.', isLoading: false });
      return false;
    }
  },

  updatePurchase: async (id, purchaseData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.put<Purchase>(`/purchases/${id}`, purchaseData);
      set((state) => ({
        purchases: state.purchases.map((p) => (p.id === id ? response.data : p)),
      }));
      await get().fetchHealthScore();
      set({ isLoading: false });
      return true;
    } catch (err: any) {
      set({ error: err.response?.data?.detail || 'Failed to update purchase.', isLoading: false });
      return false;
    }
  },

  deletePurchase: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.delete(`/purchases/${id}`);
      set((state) => ({
        purchases: state.purchases.filter((p) => p.id !== id),
      }));
      await get().fetchHealthScore();
      set({ isLoading: false });
      return true;
    } catch (err: any) {
      set({ error: err.response?.data?.detail || 'Failed to delete purchase.', isLoading: false });
      return false;
    }
  },

  fetchHealthScore: async () => {
    try {
      const response = await apiClient.get<HealthScore>('/users/me/health');
      set({ healthScore: response.data });
    } catch (err) {
      console.error('Failed to fetch health score metrics:', err);
    }
  },

  fetchBudgetAllocation: async () => {
    try {
      const response = await apiClient.get<BudgetAllocation>('/users/me/allocation');
      set({ budgetAllocation: response.data });
    } catch (err) {
      console.error('Failed to fetch budget allocations:', err);
    }
  },

  evaluatePurchaseAdvice: async (item_name, price, category) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post<AdvisorAdvice>('/advisor/evaluate', {
        item_name,
        price,
        category,
      });
      set({ advisorAdvice: response.data, isLoading: false });
    } catch (err: any) {
      set({ 
        error: err.response?.data?.detail || 'Failed to evaluate purchase advice.', 
        isLoading: false,
        advisorAdvice: null
      });
    }
  },

  sendCoachMessage: async (message) => {
    const userMessage: ChatMessage = { role: 'user', content: message };
    set((state) => ({
      chatHistory: [...state.chatHistory, userMessage],
      isChatLoading: true,
      error: null
    }));

    try {
      const response = await apiClient.post<{ reply: string }>('/advisor/coach', {
        message,
        history: get().chatHistory.slice(0, -1) // Send history excluding the message we just added
      });
      
      const coachReply: ChatMessage = { role: 'model', content: response.data.reply };
      set((state) => ({
        chatHistory: [...state.chatHistory, coachReply],
        isChatLoading: false
      }));
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Failed to communicate with the AI coach.';
      const systemError: ChatMessage = {
        role: 'model',
        content: `Error: ${errorMessage}. Please check your internet connection and verify if the Gemini API key is configured.`
      };
      set((state) => ({
        chatHistory: [...state.chatHistory, systemError],
        isChatLoading: false
      }));
    }
  },

  clearAdvisorAdvice: () => set({ advisorAdvice: null }),
  clearChat: () => set({ chatHistory: [] }),
}));
