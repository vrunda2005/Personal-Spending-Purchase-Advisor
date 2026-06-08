import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, Date, DateTime, ForeignKey, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    name = Column(String, nullable=False)
    age = Column(Integer, nullable=True)
    occupation = Column(String, nullable=True)
    
    # Financial profile
    income = Column(Float, default=0.0, nullable=False)
    savings = Column(Float, default=0.0, nullable=False)
    risk_profile = Column(String, default="Moderate", nullable=False)  # Conservative, Moderate, Aggressive
    
    # Custom allocations (Must total 100)
    needs_percentage = Column(Float, default=50.0, nullable=False)
    wants_percentage = Column(Float, default=25.0, nullable=False)
    savings_percentage = Column(Float, default=15.0, nullable=False)
    investing_percentage = Column(Float, default=10.0, nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    goals = relationship("Goal", back_populates="user", cascade="all, delete-orphan")
    purchases = relationship("Purchase", back_populates="user", cascade="all, delete-orphan")
    recommendations = relationship("Recommendation", back_populates="user", cascade="all, delete-orphan")

    @property
    def available_budget(self) -> float:
        """
        Computes the monthly available budget (Needs + Wants allocations).
        """
        return float(self.income * (self.needs_percentage + self.wants_percentage) / 100.0)

    @available_budget.setter
    def available_budget(self, value: float) -> None:
        """
        No-op setter to maintain read-write compatibility with API schemas.
        """
        pass


class Goal(Base):
    __tablename__ = "goals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    goal_name = Column(String, nullable=False)
    target_amount = Column(Float, nullable=False)
    current_amount = Column(Float, default=0.0, nullable=False)
    deadline = Column(Date, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="goals")


class Purchase(Base):
    __tablename__ = "purchases"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    price = Column(Float, nullable=False)
    category = Column(String, nullable=False)
    date = Column(Date, default=datetime.date.today, nullable=False)
    
    # Impulse purchase flags
    is_impulse = Column(Boolean, default=False, nullable=False)
    was_regretted = Column(Boolean, nullable=True)  # Nullable: can be filled in later
    regret_likelihood = Column(Float, default=0.0, nullable=False)  # 0.0 to 1.0 (calculated likelihood)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="purchases")


class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    recommendation_text = Column(String, nullable=False)
    reason = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="recommendations")
