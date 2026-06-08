import json
import re
from typing import Dict, List, Any, Optional
import google.generativeai as genai
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.models import User, Goal, Purchase

# Initialize Gemini if Key is present
if settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)

def _get_fallback_evaluation(
    item_name: str, 
    price: float, 
    category: str, 
    math_results: Dict[str, Any],
    regret_prob: float
) -> Dict[str, Any]:
    """
    Fallback rule-based engine when Gemini API is unavailable or missing a key.
    Ensures the app remains fully functional.
    """
    cat_lower = category.lower()
    
    # Simple Needs vs Wants classification
    needs_categories = ["health", "education", "utilities", "rent", "bills", "groceries", "investment"]
    wants_categories = ["entertainment", "dining", "shopping", "luxury", "gadgets", "games"]
    
    if any(c in cat_lower for c in needs_categories):
        need_score = 8
        want_score = 2
    elif any(c in cat_lower for c in wants_categories):
        need_score = 2
        want_score = 8
    else:
        need_score = 5
        want_score = 5

    delay = math_results.get("total_delay_months")
    
    if delay is None or delay > 3.0 or regret_prob > 0.6:
        recommendation = "Postpone"
        reason = f"Postponing {item_name} is recommended. Purchasing this will delay your financial goals by {delay if delay else 'indefinite'} months and carries a high estimated regret rate of {int(regret_prob * 100)}%."
    else:
        recommendation = "Buy"
        reason = f"You can buy {item_name}. It has a minimal delay of {delay} months on your savings goals and fits within your surplus budget constraints."

    # Alternatives generator
    alternatives = [
        f"Look for a refurbished or secondhand version of {item_name}.",
        f"Wait 48 hours before purchasing to bypass the impulse urge.",
        f"Allocate a smaller budget towards this category next month to compensate."
    ]

    return {
        "need_score": need_score,
        "want_score": want_score,
        "recommendation": recommendation,
        "reason": reason,
        "alternatives": alternatives
    }

def evaluate_purchase(
    user: User,
    item_name: str,
    price: float,
    category: str,
    math_results: Dict[str, Any],
    regret_prob: float
) -> Dict[str, Any]:
    """
    Evaluates a potential purchase decision using Gemini 1.5.
    Combines user financial settings and goal mathematical delays into the prompt.
    """
    if not settings.GEMINI_API_KEY:
        return _get_fallback_evaluation(item_name, price, category, math_results, regret_prob)

    surplus = math_results.get("surplus_savings", 0.0)
    delay_months = math_results.get("total_delay_months")
    
    prompt = f"""
    You are an expert AI Personal Finance Advisor. Analyze this potential purchase decision.
    
    USER PROFILE:
    - Name: {user.name}
    - Monthly Income: ₹{user.income}
    - Monthly Base Budget Limit: ₹{user.available_budget}
    - Monthly Savings Surplus: ₹{surplus}
    - Risk Profile: {user.risk_profile}
    
    PROPOSED PURCHASE:
    - Item Name: {item_name}
    - Price: ₹{price}
    - Category: {category}
    
    DETERMINISTIC FORECASTING STATS:
    - Goal delays caused by this purchase: {f'{delay_months} months' if delay_months is not None else 'Infinite delay (budget deficit)'}
    - Predicted Impulse Regret Likelihood: {int(regret_prob * 100)}%
    
    Provide your evaluation. Output a JSON object containing:
    1. "need_score": A score from 0 to 10 evaluating how necessary this is.
    2. "want_score": A score from 0 to 10 evaluating how much of a luxury/want this is.
    3. "recommendation": Either "Buy" or "Postpone".
    4. "reason": A single, punchy paragraph explaining why, mentioning the goal impact.
    5. "alternatives": A list of 2-3 specific, actionable cost-saving alternatives (e.g., cheaper brands or postponing actions).
    
    Ensure the output is valid JSON matching this schema exactly.
    """

    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(
            prompt,
            generation_config={"response_mime_type": "application/json"}
        )
        data = json.loads(response.text.strip())
        return {
            "need_score": int(data.get("need_score", 5)),
            "want_score": int(data.get("want_score", 5)),
            "recommendation": str(data.get("recommendation", "Postpone")),
            "reason": str(data.get("reason", "Please review your financial settings.")),
            "alternatives": list(data.get("alternatives", []))
        }
    except Exception as e:
        # Graceful logging fallback
        print(f"Gemini API Error: {e}")
        return _get_fallback_evaluation(item_name, price, category, math_results, regret_prob)

def chat_with_coach(
    user: User,
    chat_history: List[Dict[str, str]],
    user_message: str,
    db: Session
) -> str:
    """
    Generates a response from the AI Financial Coach.
    Provides personal finance guidance contextualized by user's active goals and spending records.
    """
    # Load user specific context
    goals = db.query(Goal).filter(Goal.user_id == user.id).all()
    goals_summary = ", ".join([f"{g.goal_name} (Target: ₹{g.target_amount}, Saved: ₹{g.current_amount})" for g in goals])
    
    # Calculate surplus
    surplus = max(0.0, user.income - user.available_budget)
    
    if not settings.GEMINI_API_KEY:
        return (
            f"Hi {user.name}! I am currently running in offline fallback mode. "
            f"Based on your profile, your monthly income is ₹{user.income} and your surplus savings are ₹{surplus}. "
            f"Your active goals are: {goals_summary if goals_summary else 'No active goals set up yet'}. "
            "Please configure a GEMINI_API_KEY in the environment for full coaching conversations."
        )

    # Build system instructions context
    system_prompt = f"""
    You are a professional AI Financial Coach. Your goal is to guide users to make smart, conscious financial decisions.
    
    User context:
    - Name: {user.name}
    - Income: ₹{user.income}/month
    - Available Budget Limit: ₹{user.available_budget}/month
    - Calculated surplus savings: ₹{surplus}/month
    - Investment risk tolerance: {user.risk_profile}
    - Active Goals: {goals_summary if goals_summary else "No goals configured yet"}
    
    Instructions:
    - Be supportive, realistic, and strictly focus on personal financial health.
    - Provide clear, actionable recommendations (e.g. tracking index funds, cutting specific categories, using the rule of 72).
    - NEVER provide regulatory financial advice (do not claim guaranteed returns or specify particular stock tickers). Keep recommendations educational.
    - Reference their real goals ({goals_summary}) and metrics where possible to make the coaching highly personalized.
    - Keep answers concise and direct. Use bullet points for readability.
    """

    # Format history for Gemini
    contents = []
    # System context prepended
    contents.append(system_prompt)
    
    # Append past chat messages
    for msg in chat_history[-10:]:  # Keep last 10 messages for token efficiency
        role = "user" if msg.get("role") == "user" else "model"
        contents.append(f"{role}: {msg.get('content')}")
        
    contents.append(f"user: {user_message}")

    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content("\n\n".join(contents))
        return response.text.strip()
    except Exception as e:
        print(f"Gemini Coach Error: {e}")
        return "I'm sorry, I ran into a connection error. Please try asking again in a moment."
