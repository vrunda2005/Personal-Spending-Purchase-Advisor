from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Any

from app.database import get_db
from app.core.deps import get_current_user
from app.models.models import User
from app.schemas.schemas import UserOut, UserUpdate
from app.services.financial_engine import (
    calculate_budget_allocation,
    calculate_financial_health_score
)

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/me", response_model=UserOut)
def read_user_me(current_user: User = Depends(get_current_user)) -> Any:
    """
    Get current logged in user details.
    """
    return current_user

@router.put("/me", response_model=UserOut)
def update_user_me(
    user_in: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Update personal configurations, income, budget, and custom percentages.
    Includes backend validation to verify that custom percentage allocations sum to exactly 100.
    """
    update_data = user_in.model_dump(exclude_unset=True)
    
    # Custom percentages integrity check
    needs = update_data.get("needs_percentage", current_user.needs_percentage)
    wants = update_data.get("wants_percentage", current_user.wants_percentage)
    savings = update_data.get("savings_percentage", current_user.savings_percentage)
    investing = update_data.get("investing_percentage", current_user.investing_percentage)
    
    # If the user is modifying any of the percentages, check that the new set sums to 100%
    is_modifying_percentages = any(
        k in update_data 
        for k in ["needs_percentage", "wants_percentage", "savings_percentage", "investing_percentage"]
    )
    if is_modifying_percentages:
        total = needs + wants + savings + investing
        if abs(total - 100.0) > 0.01:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Custom budget allocations must sum to exactly 100%."
            )
            
    for field, value in update_data.items():
        setattr(current_user, field, value)
        
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user

@router.get("/me/allocation")
def get_user_budget_allocation(current_user: User = Depends(get_current_user)) -> Any:
    """
    Calculate user's budget allocations (Needs, Wants, Savings, Investing) based on current income and percentages.
    """
    return calculate_budget_allocation(current_user)

@router.get("/me/health")
def get_user_financial_health(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Fetch the user's Financial Health Score (0-100) and personalized review checklist.
    """
    return calculate_financial_health_score(current_user, db)
