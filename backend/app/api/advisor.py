from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Any

from app.database import get_db
from app.core.deps import get_current_user
from app.models.models import Recommendation
from app.schemas.schemas import (
    PurchaseAdvisorRequest, 
    PurchaseAdvisorResponse,
    ChatRequest, 
    ChatResponse
)
from app.services.financial_engine import (
    simulate_goal_delays,
    predict_impulse_regret
)
from app.services.ai_service import evaluate_purchase, chat_with_coach

router = APIRouter(prefix="/advisor", tags=["advisor"])

@router.post("/evaluate", response_model=PurchaseAdvisorResponse)
def evaluate_purchase_decision(
    request: PurchaseAdvisorRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
) -> Any:
    """
    Evaluates a potential purchase decision.
    Runs deterministic forecasts on goal delays, checks impulse regret, 
    consults the AI service, and records the advice in recommendations.
    """
    # 1. Run math simulations
    simulation_results = simulate_goal_delays(current_user, request.price, db)
    
    # 2. Estimate impulse regret likelihood
    regret_prob = predict_impulse_regret(current_user, request.category, db)
    
    # 3. Call AI Advisor for reasoning
    ai_advice = evaluate_purchase(
        user=current_user,
        item_name=request.item_name,
        price=request.price,
        category=request.category,
        math_results=simulation_results,
        regret_prob=regret_prob
    )
    
    # 4. Log the recommendation to the database
    db_rec = Recommendation(
        user_id=current_user.id,
        recommendation_text=ai_advice["recommendation"],
        reason=ai_advice["reason"]
    )
    db.add(db_rec)
    db.commit()
    
    return {
        "need_score": ai_advice["need_score"],
        "want_score": ai_advice["want_score"],
        "recommendation": ai_advice["recommendation"],
        "reason": ai_advice["reason"],
        "alternatives": ai_advice["alternatives"],
        "total_delay_months": simulation_results.get("total_delay_months"),
        "regret_likelihood": regret_prob
    }

@router.post("/coach", response_model=ChatResponse)
def message_ai_coach(
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
) -> Any:
    """
    Exposes a chat dialogue system with the AI Financial Coach.
    Uses message history context and user financial metrics.
    """
    # Format message history to dictionary form for the service
    history_list = [
        {"role": msg.role, "content": msg.content} 
        for msg in request.history
    ]
    
    reply = chat_with_coach(
        user=current_user,
        chat_history=history_list,
        user_message=request.message,
        db=db
    )
    return {"reply": reply}
