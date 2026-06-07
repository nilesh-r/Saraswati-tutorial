from fastapi import APIRouter, HTTPException, Depends, status
from app.db import db
from app.schemas import UserRegister, UserLogin, TokenResponse, UserResponse
from app.auth import hash_password, verify_password, create_access_token, get_current_user
from app.config import settings
from datetime import datetime

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse)
async def register(user_data: UserRegister):
    # Check if user already exists
    existing_user = await db.find_one("users", {"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Hash password and create user document
    hashed = hash_password(user_data.password)
    user_doc = {
        "name": user_data.name,
        "email": user_data.email,
        "hashed_password": hashed,
        "role": user_data.role,
        "created_at": datetime.utcnow()
    }
    
    created_user = await db.insert_one("users", user_doc)
    
    # If registering as a tutor, create an initial tutor profile
    if user_data.role == "tutor":
        tutor_profile = {
            "user_id": created_user["_id"],
            "name": created_user["name"],
            "email": created_user["email"],
            "subjects": [],
            "classes": [],
            "rate_per_hour": 0.0,
            "experience_years": 0,
            "qualification": "",
            "bio": "",
            "location": "",
            "availability": [],
            "is_verified": False,
            "verification_status": "pending",  # pending, verified, rejected
            "rating": 0.0,
            "reviews_count": 0,
            "demo_video_url": "",
            "created_at": datetime.utcnow().isoformat()
        }
        await db.insert_one("tutor_profiles", tutor_profile)
        
    # Generate token
    token = create_access_token({"sub": created_user["_id"], "role": created_user["role"]})
    
    # format user response to match UserResponse schema
    user_resp = {
        "_id": created_user["_id"],
        "name": created_user["name"],
        "email": created_user["email"],
        "role": created_user["role"]
    }
    
    return {"access_token": token, "token_type": "bearer", "user": user_resp}

@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    user = await db.find_one("users", {"email": credentials.email})
    if not user or not verify_password(credentials.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
        
    token = create_access_token({"sub": user["_id"], "role": user["role"]})
    
    user_resp = {
        "_id": user["_id"],
        "name": user["name"],
        "email": user["email"],
        "role": user["role"]
    }
    
    return {"access_token": token, "token_type": "bearer", "user": user_resp}

@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    response_data = {
        "user": current_user
    }
    if current_user.get("role") == "tutor":
        profile = await db.find_one("tutor_profiles", {"user_id": current_user["_id"]})
        response_data["profile"] = profile
        
    return response_data

@router.post("/admin-setup")
async def admin_setup():
    # Helper to bootstrap admin account for testing purposes
    existing_admin = await db.find_one("users", {"email": settings.DEFAULT_ADMIN_EMAIL})
    if existing_admin:
        return {"message": "Admin already initialized."}
        
    hashed = hash_password(settings.DEFAULT_ADMIN_PASSWORD)
    admin_doc = {
        "name": "Super Admin Saraswati",
        "email": settings.DEFAULT_ADMIN_EMAIL,
        "hashed_password": hashed,
        "role": "admin",
        "created_at": datetime.utcnow()
    }
    await db.insert_one("users", admin_doc)
    return {"message": "Admin account created successfully.", "email": settings.DEFAULT_ADMIN_EMAIL}
