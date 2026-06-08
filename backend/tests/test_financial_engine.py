import pytest
from sqlalchemy.orm import Session
from app.models.models import User, Goal, Purchase
from app.services.financial_engine import (
    calculate_budget_allocation,
    simulate_goal_delays,
    calculate_financial_health_score,
    predict_impulse_regret
)

def test_calculate_budget_allocation():
    # User with default 50/25/15/10 percentages
    user = User(
        income=50000.0,
        needs_percentage=50.0,
        wants_percentage=25.0,
        savings_percentage=15.0,
        investing_percentage=10.0,
        hashed_password="dummy_hash"
    )
    
    alloc = calculate_budget_allocation(user)
    
    assert alloc["income"] == 50000.0
    assert alloc["allocations"]["needs"]["amount"] == 25000.0
    assert alloc["allocations"]["wants"]["amount"] == 12500.0
    assert alloc["allocations"]["savings"]["amount"] == 7500.0
    assert alloc["allocations"]["investing"]["amount"] == 5000.0

def test_simulate_goal_delays(db_session: Session):
    # Setup user in db
    user = User(
        email="test@example.com",
        name="Test User",
        income=40000.0,
        savings=10000.0,
        needs_percentage=50.0,
        wants_percentage=25.0,
        savings_percentage=20.0, # 8,000 savings amount per month
        investing_percentage=5.0,
        hashed_password="dummy_hash"
    )
    db_session.add(user)
    db_session.commit()
    
    # Setup Goal: Target = 24,000, current = 0. Monthly surplus = 8,000.
    # Without new purchase, months left = 24,000 / 8,000 = 3 months.
    goal = Goal(
        user_id=user.id,
        goal_name="Laptop",
        target_amount=24000.0,
        current_amount=0.0
    )
    db_session.add(goal)
    db_session.commit()
    
    # Case 1: Evaluate purchase of 16,000.
    # It depletes savings by 16,000.
    # Total remaining amount is 24,000 + 16,000 = 40,000.
    # Months left now = 40,000 / 10,000 = 4 months.
    # Delay is 4 - 2.4 = 1.6 months.
    results = simulate_goal_delays(user, 16000.0, db_session)
    
    assert results["total_delay_months"] == 1.6
    assert len(results["goals"]) == 1
    assert results["goals"][0]["goal_name"] == "Laptop"
    assert results["goals"][0]["delay_months"] == 1.6

def test_calculate_financial_health_score(db_session: Session):
    user = User(
        email="test2@example.com",
        name="Test User 2",
        income=30000.0,
        savings=15000.0,
        needs_percentage=50.0,
        wants_percentage=25.0,
        savings_percentage=15.0,
        investing_percentage=10.0,
        hashed_password="dummy_hash"
    )
    db_session.add(user)
    db_session.commit()
    
    score_data = calculate_financial_health_score(user, db_session)
    
    assert "score" in score_data
    assert 0 <= score_data["score"] <= 100
    assert "rating" in score_data
    assert "breakdown" in score_data

def test_predict_impulse_regret_empty(db_session: Session):
    user = User(
        email="test3@example.com",
        name="Test User 3",
        hashed_password="dummy_hash"
    )
    db_session.add(user)
    db_session.commit()
    
    # With no purchase history, it should fallback to baseline regret rates
    regret_rate = predict_impulse_regret(user, "Wants", db_session)
    assert regret_rate == 0.30 # baseline for Wants
