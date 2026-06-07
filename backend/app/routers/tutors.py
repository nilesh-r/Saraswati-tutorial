from fastapi import APIRouter, HTTPException, Depends, status, Query
from app.db import db
from app.schemas import TutorProfileUpdate
from app.auth import get_current_user, require_role
from typing import Optional, List
from datetime import datetime

router = APIRouter(prefix="/tutors", tags=["Tutors"])

@router.put("/profile")
async def update_profile(profile_data: TutorProfileUpdate, current_user: dict = Depends(require_role(["tutor"]))):
    profile = await db.find_one("tutor_profiles", {"user_id": current_user["_id"]})
    if not profile:
        raise HTTPException(status_code=404, detail="Tutor profile not found")
        
    update_doc = {
        "$set": {
            "subjects": profile_data.subjects,
            "classes": profile_data.classes,
            "rate_per_hour": profile_data.rate_per_hour,
            "experience_years": profile_data.experience_years,
            "qualification": profile_data.qualification,
            "bio": profile_data.bio,
            "location": profile_data.location,
            "availability": profile_data.availability,
            "demo_video_url": profile_data.demo_video_url,
            "updated_at": datetime.utcnow().isoformat()
        }
    }
    
    success = await db.update_one("tutor_profiles", {"user_id": current_user["_id"]}, update_doc)
    return {"success": success, "message": "Profile updated successfully"}

@router.get("/search")
async def search_tutors(
    subject: Optional[str] = None,
    class_name: Optional[str] = Query(None, alias="class"),
    location: Optional[str] = None,
    min_rate: Optional[float] = None,
    max_rate: Optional[float] = None,
    min_experience: Optional[int] = None,
    min_rating: Optional[float] = None,
    verified_only: Optional[bool] = True
):
    # Retrieve all profiles first and filter in-memory for precision
    query = {}
    if verified_only:
        query["verification_status"] = "verified"
        
    profiles = await db.find("tutor_profiles", query)
    filtered = []
    
    for p in profiles:
        # Subject match (case-insensitive sub-match)
        if subject:
            matched = False
            for s in p.get("subjects", []):
                if subject.lower() in s.lower():
                    matched = True
                    break
            if not matched:
                continue
                
        # Class match
        if class_name:
            matched = False
            for c in p.get("classes", []):
                if class_name.lower() in c.lower():
                    matched = True
                    break
            if not matched:
                continue
                
        # Location match
        if location and location.lower() not in p.get("location", "").lower():
            continue
            
        # Rates
        rate = p.get("rate_per_hour", 0.0)
        if min_rate and rate < min_rate:
            continue
        if max_rate and rate > max_rate:
            continue
            
        # Experience
        exp = p.get("experience_years", 0)
        if min_experience and exp < min_experience:
            continue
            
        # Rating
        rating = p.get("rating", 0.0)
        if min_rating and rating < min_rating:
            continue
            
        filtered.append(p)
        
    return filtered

@router.get("/admin/pending")
async def list_pending_tutors(current_user: dict = Depends(require_role(["admin"]))):
    # Allow admins to view pending profile registrations
    pending = await db.find("tutor_profiles", {"verification_status": "pending"})
    return pending

@router.post("/admin/verify/{profile_id}")
async def verify_tutor(
    profile_id: str,
    action: str = Query(..., description="approve or reject"),
    current_user: dict = Depends(require_role(["admin"]))
):
    status_str = "verified" if action == "approve" else "rejected"
    is_verified = (action == "approve")
    
    update_doc = {
        "$set": {
            "verification_status": status_str,
            "is_verified": is_verified,
            "verified_at": datetime.utcnow().isoformat() if is_verified else None
        }
    }
    
    success = await db.update_one("tutor_profiles", {"_id": profile_id}, update_doc)
    if not success:
        raise HTTPException(status_code=404, detail="Tutor profile not found")
        
    return {"message": f"Tutor profile status updated to {status_str}"}

@router.get("/{tutor_id}")
async def get_tutor_details(tutor_id: str):
    # Fetch profile
    profile = await db.find_one("tutor_profiles", {"user_id": tutor_id})
    if not profile:
        profile = await db.find_one("tutor_profiles", {"_id": tutor_id})
        
    if not profile:
        raise HTTPException(status_code=404, detail="Tutor profile not found")
        
    # Fetch reviews
    reviews = await db.find("reviews", {"tutor_id": profile["user_id"]})
    
    # Calculate fresh rating average
    if reviews:
        avg_rating = sum(r["rating"] for r in reviews) / len(reviews)
        profile["rating"] = round(avg_rating, 2)
        profile["reviews_count"] = len(reviews)
    else:
        profile["rating"] = 0.0
        profile["reviews_count"] = 0
        
    return {
        "profile": profile,
        "reviews": reviews
    }
