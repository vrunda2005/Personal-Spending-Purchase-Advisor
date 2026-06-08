import datetime
from typing import List, Optional, Dict
from pydantic import BaseModel, EmailStr, Field

# --- AUTH & TOKEN SCHEMAS ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenPayload(BaseModel):
    sub: Optional[int] = None

# --- USER SCHEMAS ---
class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    name: str = Field(..., min_length=2)

class UserUpdate(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    occupation: Optional[str] = None
    income: Optional[float] = Field(None, ge=0.0)
    savings: Optional[float] = Field(None, ge=0.0)
    risk_profile: Optional[str] = None  # Conservative, Moderate, Aggressive
    available_budget: Optional[float] = Field(None, ge=0.0)
    
    # Custom allocations (Must total 100 on client verification)
    needs_percentage: Optional[float] = Field(None, ge=0.0, le=100.0)
    wants_percentage: Optional[float] = Field(None, ge=0.0, le=100.0)
    savings_percentage: Optional[float] = Field(None, ge=0.0, le=100.0)
    investing_percentage: Optional[float] = Field(None, ge=0.0, le=100.0)

class UserOut(BaseModel):
    id: int
    email: EmailStr
    name: str
    age: Optional[int] = None
    occupation: Optional[str] = None
    income: float
    savings: float
    risk_profile: str
    available_budget: float
    needs_percentage: float
    wants_percentage: float
    savings_percentage: float
    investing_percentage: float
    created_at: datetime.datetime

    class Config:
        from_attributes = True

# --- GOAL SCHEMAS ---
class GoalCreate(BaseModel):
    goal_name: str = Field(..., min_length=1)
    target_amount: float = Field(..., gt=0.0)
    current_amount: float = Field(0.0, ge=0.0)
    deadline: Optional[datetime.date] = None

class GoalUpdate(BaseModel):
    goal_name: Optional[str] = None
    target_amount: Optional[float] = Field(None, gt=0.0)
    current_amount: Optional[float] = Field(None, ge=0.0)
    deadline: Optional[datetime.date] = None

class GoalOut(BaseModel):
    id: int
    user_id: int
    goal_name: str
    target_amount: float
    current_amount: float
    deadline: Optional[datetime.date] = None
    created_at: datetime.datetime

    class Config:
        from_attributes = True

# --- PURCHASE SCHEMAS ---
class PurchaseCreate(BaseModel):
    name: str = Field(..., min_length=1)
    price: float = Field(..., gt=0.0)
    category: str = Field(..., min_length=1)
    date: Optional[datetime.date] = None
    is_impulse: bool = False
    was_regretted: Optional[bool] = None

class PurchaseUpdate(BaseModel):
    name: Optional[str] = None
    price: Optional[float] = Field(None, gt=0.0)
    category: Optional[str] = None
    date: Optional[datetime.date] = None
    is_impulse: Optional[bool] = None
    was_regretted: Optional[bool] = None

class PurchaseOut(BaseModel):
    id: int
    user_id: int
    name: str
    price: float
    category: str
    date: datetime.date
    is_impulse: bool
    was_regretted: Optional[bool] = None
    regret_likelihood: float
    created_at: datetime.datetime

    class Config:
        from_attributes = True

# --- ADVISOR SCHEMAS ---
class PurchaseAdvisorRequest(BaseModel):
    item_name: str = Field(..., min_length=1)
    price: float = Field(..., gt=0.0)
    category: str = Field(..., min_length=1)

class PurchaseAdvisorResponse(BaseModel):
    need_score: int
    want_score: int
    recommendation: str
    reason: str
    alternatives: List[str]
    total_delay_months: Optional[float] = None
    regret_likelihood: float

class ChatMessage(BaseModel):
    role: str  # 'user' or 'model'
    content: str

class ChatRequest(BaseModel):
    message: str
    history: List[ChatMessage] = []

class ChatResponse(BaseModel):
    reply: str
