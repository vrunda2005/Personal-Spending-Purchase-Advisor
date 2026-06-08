import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Any

from app.database import get_db
from app.core.deps import get_current_user
from app.models.models import Purchase
from app.schemas.schemas import PurchaseCreate, PurchaseUpdate, PurchaseOut
from app.services.financial_engine import predict_impulse_regret

router = APIRouter(prefix="/purchases", tags=["purchases"])

@router.get("/", response_model=List[PurchaseOut])
def read_purchases(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
) -> Any:
    """
    Retrieve all purchases made by the current user.
    """
    return db.query(Purchase).filter(Purchase.user_id == current_user.id).order_by(Purchase.date.desc(), Purchase.id.desc()).all()

@router.post("/", response_model=PurchaseOut, status_code=status.HTTP_201_CREATED)
def create_purchase(
    purchase_in: PurchaseCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
) -> Any:
    """
    Log a new transaction. If flagged as an impulse purchase, 
    predicts the likelihood of regret based on past purchase behavior.
    """
    date = purchase_in.date or datetime.date.today()
    
    # Calculate regret likelihood if it is an impulse buy
    regret_likelihood = 0.0
    if purchase_in.is_impulse:
        regret_likelihood = predict_impulse_regret(current_user, purchase_in.category, db)

    db_purchase = Purchase(
        user_id=current_user.id,
        name=purchase_in.name,
        price=purchase_in.price,
        category=purchase_in.category,
        date=date,
        is_impulse=purchase_in.is_impulse,
        was_regretted=purchase_in.was_regretted,
        regret_likelihood=regret_likelihood
    )
    db.add(db_purchase)
    db.commit()
    db.refresh(db_purchase)
    return db_purchase

@router.put("/{purchase_id}", response_model=PurchaseOut)
def update_purchase(
    purchase_id: int,
    purchase_in: PurchaseUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
) -> Any:
    """
    Update details of an existing purchase (e.g. updating the regret flag after 7 days).
    """
    purchase = db.query(Purchase).filter(Purchase.id == purchase_id, Purchase.user_id == current_user.id).first()
    if not purchase:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Purchase not found"
        )
    
    update_data = purchase_in.model_dump(exclude_unset=True)
    
    # Recalculate regret if impulse status changes
    is_impulse = update_data.get("is_impulse", purchase.is_impulse)
    category = update_data.get("category", purchase.category)
    if is_impulse and (("is_impulse" in update_data) or ("category" in update_data)):
        purchase.regret_likelihood = predict_impulse_regret(current_user, category, db)
    elif not is_impulse:
        purchase.regret_likelihood = 0.0

    for field, value in update_data.items():
        setattr(purchase, field, value)
        
    db.add(purchase)
    db.commit()
    db.refresh(purchase)
    return purchase

@router.delete("/{purchase_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_purchase(
    purchase_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
) -> None:
    """
    Delete a purchase transaction.
    """
    purchase = db.query(Purchase).filter(Purchase.id == purchase_id, Purchase.user_id == current_user.id).first()
    if not purchase:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Purchase not found"
        )
    db.delete(purchase)
    db.commit()
    return None
