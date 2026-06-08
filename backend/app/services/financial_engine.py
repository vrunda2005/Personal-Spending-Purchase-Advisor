import datetime
from typing import Dict, List, Any
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.models import User, Goal, Purchase

def calculate_surplus_savings(user: User) -> float:
    """
    Surplus = Income - Monthly Budget
    """
    return max(0.0, user.income - user.available_budget)

def get_months_between(date1: datetime.date, date2: datetime.date) -> float:
    """
    Helper to calculate months between two dates (fractional).
    """
    if date1 >= date2:
        return 0.0
    diff_days = (date2 - date1).days
    return diff_days / 30.4375  # Average days in a month

def simulate_goal_delays(
    user: User, 
    purchase_price: float, 
    db: Session
) -> Dict[str, Any]:
    """
    Simulates the impact of a potential purchase on the user's active goals.
    Goals are processed sequentially in order of creation/deadline.
    """
    # Fetch active goals ordered by deadline (nulls last) then by ID
    goals = db.query(Goal).filter(Goal.user_id == user.id).order_name_or_id_flow = [
        g for g in db.query(Goal).filter(Goal.user_id == user.id).all()
    ]
    # Sort: goals with deadlines first (sorted by deadline), then goals with no deadlines
    goals.sort(key=lambda g: (g.deadline is None, g.deadline, g.id))

    surplus = calculate_surplus_savings(user)
    today = datetime.date.today()

    goal_forecasts = []
    total_delay_months = 0.0
    
    if surplus > 0:
        # P / S determines the overall delay shift across the entire goal pipeline
        total_delay_months = purchase_price / surplus
    else:
        # If surplus is zero or negative, the user is not saving anything, goals cannot be met.
        total_delay_months = -1.0  # Sentinel value indicating infinite delay

    cumulative_remaining_before = 0.0
    for goal in goals:
        remaining_needed = max(0.0, goal.target_amount - goal.current_amount)
        cumulative_remaining_before += remaining_needed
        
        # Calculate current forecast (months from today)
        months_to_complete_before = 0.0
        if surplus > 0:
            months_to_complete_before = cumulative_remaining_before / surplus
        else:
            months_to_complete_before = float('inf')

        # Calculate simulated forecast (months from today, after reducing cash by purchase_price)
        months_to_complete_after = 0.0
        if surplus > 0:
            months_to_complete_after = (cumulative_remaining_before + purchase_price) / surplus
        else:
            months_to_complete_after = float('inf')

        # Check deadlines
        is_on_track_before = True
        is_on_track_after = True
        months_to_deadline = None
        
        if goal.deadline:
            months_to_deadline = get_months_between(today, goal.deadline)
            is_on_track_before = months_to_complete_before <= months_to_deadline
            is_on_track_after = months_to_complete_after <= months_to_deadline

        goal_forecasts.append({
            "id": goal.id,
            "goal_name": goal.goal_name,
            "target_amount": goal.target_amount,
            "current_amount": goal.current_amount,
            "months_to_complete_before": None if months_to_complete_before == float('inf') else round(months_to_complete_before, 2),
            "months_to_complete_after": None if months_to_complete_after == float('inf') else round(months_to_complete_after, 2),
            "delay_months": None if total_delay_months == -1.0 else round(total_delay_months, 2),
            "is_on_track_before": is_on_track_before,
            "is_on_track_after": is_on_track_after,
            "months_to_deadline": round(months_to_deadline, 2) if months_to_deadline else None
        })

    return {
        "surplus_savings": surplus,
        "purchase_price": purchase_price,
        "total_delay_months": round(total_delay_months, 2) if total_delay_months >= 0 else None,
        "goals": goal_forecasts
    }

def calculate_financial_health_score(user: User, db: Session) -> Dict[str, Any]:
    """
    Computes a Financial Health Score from 0 to 100.
    Weights: 40% Savings Rate, 25% Impulse Control, 20% Goal Progress, 15% Budget Discipline.
    """
    today = datetime.date.today()
    thirty_days_ago = today - datetime.timedelta(days=30)
    first_of_month = today.replace(day=1)

    # 1. Savings Rate Score (40%)
    # Expenses = average spending over last 30 days
    last_30_days_spending = db.query(func.sum(Purchase.price)).filter(
        Purchase.user_id == user.id,
        Purchase.date >= thirty_days_ago
    ).scalar() or 0.0
    
    savings_rate = 0.0
    if user.income > 0:
        # Use either actual spending or base budget, whichever represents current rate
        effective_spending = max(last_30_days_spending, user.income - calculate_surplus_savings(user))
        savings_rate = (user.income - effective_spending) / user.income
        
    s_savings = min(100.0, max(0.0, savings_rate * 200.0))  # Perfect at 50% savings rate

    # 2. Impulse Control Score (25%)
    all_impulse_purchases = db.query(Purchase).filter(
        Purchase.user_id == user.id,
        Purchase.is_impulse == True
    ).all()
    
    s_impulse = 100.0
    if all_impulse_purchases:
        regretted_count = sum(1 for p in all_impulse_purchases if p.was_regretted is True)
        evaluated_count = sum(1 for p in all_impulse_purchases if p.was_regretted is not None)
        if evaluated_count > 0:
            regret_ratio = regretted_count / evaluated_count
            s_impulse = 100.0 * (1.0 - regret_ratio)

    # 3. Goal Adherence Score (20%)
    goals = db.query(Goal).filter(Goal.user_id == user.id).all()
    s_goals = 100.0
    if goals:
        # Evaluate how many goals are currently on track
        simulation = simulate_goal_delays(user, 0.0, db)
        on_track_count = sum(1 for g in simulation["goals"] if g["is_on_track_before"])
        s_goals = (on_track_count / len(goals)) * 100.0

    # 4. Budget Discipline Score (15%)
    current_month_spending = db.query(func.sum(Purchase.price)).filter(
        Purchase.user_id == user.id,
        Purchase.date >= first_of_month
    ).scalar() or 0.0

    s_budget = 100.0
    if user.available_budget > 0:
        overspend = max(0.0, current_month_spending - user.available_budget)
        overspend_ratio = overspend / user.available_budget
        s_budget = max(0.0, 100.0 * (1.0 - overspend_ratio))
    elif current_month_spending > 0:
        s_budget = 0.0  # Set budget to 0 but spending exists -> 0 score

    # Combined Weighted Score
    final_score = (0.40 * s_savings) + (0.25 * s_impulse) + (0.20 * s_goals) + (0.15 * s_budget)
    final_score = round(final_score, 1)

    # Health evaluation descriptors
    if final_score >= 80:
        rating = "Excellent"
        summary = "Strong savings habit, healthy investment allocations, and low impulse purchase regret."
    elif final_score >= 60:
        rating = "Good"
        summary = "Generally stable budget discipline. Try to minimize impulse purchases to accelerate goals."
    elif final_score >= 40:
        rating = "Fair"
        summary = "Frequent budget overruns or slow goal progression. Recommend reviewing fixed expenses."
    else:
        rating = "Needs Attention"
        summary = "Low savings rate and high regret rates. Try setting up custom budget limits."

    return {
        "score": final_score,
        "rating": rating,
        "summary": summary,
        "breakdown": {
            "savings_rate_score": round(s_savings, 1),
            "impulse_control_score": round(s_impulse, 1),
            "goal_adherence_score": round(s_goals, 1),
            "budget_discipline_score": round(s_budget, 1)
        },
        "metrics": {
            "monthly_savings_rate": round(savings_rate * 100, 1),
            "current_month_spending": round(current_month_spending, 2),
            "last_30_days_spending": round(last_30_days_spending, 2)
        }
    }

def calculate_budget_allocation(user: User) -> Dict[str, Any]:
    """
    Returns custom percentages if the user modified them, otherwise falls back to Risk presets.
    Sums must equal 100%. Returns percentages and absolute values.
    """
    total_custom_pct = (
        user.needs_percentage + 
        user.wants_percentage + 
        user.savings_percentage + 
        user.investing_percentage
    )
    
    # Verify custom inputs sum to 100, else fall back to risk profile defaults
    if abs(total_custom_pct - 100.0) < 0.01:
        needs_pct = user.needs_percentage
        wants_pct = user.wants_percentage
        savings_pct = user.savings_percentage
        investing_pct = user.investing_percentage
        source = "custom"
    else:
        source = "risk_profile"
        profile = user.risk_profile.lower()
        if profile == "conservative":
            needs_pct = 50.0
            wants_pct = 20.0
            savings_pct = 25.0
            investing_pct = 5.0
        elif profile == "aggressive":
            needs_pct = 45.0
            wants_pct = 20.0
            savings_pct = 15.0
            investing_pct = 20.0
        else:  # Moderate or Fallback
            needs_pct = 50.0
            wants_pct = 25.0
            savings_pct = 15.0
            investing_pct = 10.0

    return {
        "source": source,
        "income": user.income,
        "allocations": {
            "needs": {
                "percentage": needs_pct,
                "amount": round(user.income * (needs_pct / 100.0), 2)
            },
            "wants": {
                "percentage": wants_pct,
                "amount": round(user.income * (wants_pct / 100.0), 2)
            },
            "savings": {
                "percentage": savings_pct,
                "amount": round(user.income * (savings_pct / 100.0), 2)
            },
            "investing": {
                "percentage": investing_pct,
                "amount": round(user.income * (investing_pct / 100.0), 2)
            }
        }
    }

def predict_impulse_regret(
    user: User, 
    category: str, 
    db: Session
) -> float:
    """
    Predicts the probability (0.0 to 1.0) that the user will regret an impulse purchase.
    Combines overall regret rates with category-specific regret rates.
    """
    all_impulse = db.query(Purchase).filter(
        Purchase.user_id == user.id,
        Purchase.is_impulse == True,
        Purchase.was_regretted != None
    ).all()
    
    if not all_impulse:
        return 0.30  # Default regret likelihood baseline
        
    global_regretted = sum(1 for p in all_impulse if p.was_regretted is True)
    r_global = global_regretted / len(all_impulse)
    
    # Category specific filter
    cat_impulse = [p for p in all_impulse if p.category.lower() == category.lower()]
    if cat_impulse:
        cat_regretted = sum(1 for p in cat_impulse if p.was_regretted is True)
        r_cat = cat_regretted / len(cat_impulse)
        # Category weight 70%, global weight 30%
        probability = (0.7 * r_cat) + (0.3 * r_global)
    else:
        # Fallback to global regret rate
        probability = r_global

    return round(probability, 2)
