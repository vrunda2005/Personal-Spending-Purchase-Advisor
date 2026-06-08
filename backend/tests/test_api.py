import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.models.models import User

def test_register_and_login(client: TestClient):
    # Register new user
    register_response = client.post(
        "/api/auth/register",
        json={
            "email": "register@example.com",
            "password": "secretpassword",
            "name": "Register Tester"
        }
    )
    assert register_response.status_code == 201
    assert register_response.json()["email"] == "register@example.com"
    
    # Login
    login_response = client.post(
        "/api/auth/login",
        data={
            "username": "register@example.com",
            "password": "secretpassword"
        }
    )
    assert login_response.status_code == 200
    token_data = login_response.json()
    assert "access_token" in token_data
    assert token_data["token_type"] == "bearer"

def test_unauthorized_endpoints(client: TestClient):
    response = client.get("/api/users/me")
    assert response.status_code == 401

def test_authorized_get_me(client: TestClient, db_session: Session):
    # Manually insert password-hashed user to db
    from app.core.security import get_password_hash
    hashed_pwd = get_password_hash("testpwd")
    user = User(
        email="authuser@example.com",
        hashed_password=hashed_pwd,
        name="Auth User",
        income=45000.0,
        savings=12000.0,
        needs_percentage=50,
        wants_percentage=25,
        savings_percentage=15,
        investing_percentage=10,
        risk_profile="Moderate"
    )
    db_session.add(user)
    db_session.commit()
    
    # Login to obtain token
    login_response = client.post(
        "/api/auth/login",
        data={"username": "authuser@example.com", "password": "testpwd"}
    )
    token = login_response.json()["access_token"]
    
    # Get profile using bearer token
    headers = {"Authorization": f"Bearer {token}"}
    me_response = client.get("/api/users/me", headers=headers)
    assert me_response.status_code == 200
    assert me_response.json()["name"] == "Auth User"

def test_goal_crud_flow(client: TestClient, db_session: Session):
    # Setup user
    from app.core.security import get_password_hash
    user = User(
        email="goaltester@example.com",
        hashed_password=get_password_hash("goalpwd"),
        name="Goal Tester",
        income=50000.0,
        savings=5000.0,
        needs_percentage=50,
        wants_percentage=25,
        savings_percentage=15,
        investing_percentage=10,
        risk_profile="Moderate"
    )
    db_session.add(user)
    db_session.commit()
    
    # Get token
    login_response = client.post(
        "/api/auth/login",
        data={"username": "goaltester@example.com", "password": "goalpwd"}
    )
    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # 1. Create Goal
    create_response = client.post(
        "/api/goals/",
        json={"goal_name": "Car Fund", "target_amount": 100000.0, "current_amount": 5000.0, "deadline": "2027-12-31"},
        headers=headers
    )
    assert create_response.status_code == 201
    goal_id = create_response.json()["id"]
    
    # 2. Get Goals list
    list_response = client.get("/api/goals/", headers=headers)
    assert list_response.status_code == 200
    assert len(list_response.json()) == 1
    assert list_response.json()[0]["goal_name"] == "Car Fund"
    
    # 3. Update Goal
    update_response = client.put(
        f"/api/goals/{goal_id}",
        json={"current_amount": 10000.0},
        headers=headers
    )
    assert update_response.status_code == 200
    assert update_response.json()["current_amount"] == 10000.0
    
    # 4. Delete Goal
    delete_response = client.delete(f"/api/goals/{goal_id}", headers=headers)
    assert delete_response.status_code == 204
    
    # Verify deletion
    list_response = client.get("/api/goals/", headers=headers)
    assert len(list_response.json()) == 0
