from fastapi import APIRouter, HTTPException, Depends, status
from app.db import db
from app.schemas import InquiryCreate
from app.auth import get_current_user, require_role
from datetime import datetime

router = APIRouter(prefix="/inquiries", tags=["Inquiries"])

@router.post("")
async def create_inquiry(inquiry: InquiryCreate, current_user: dict = Depends(require_role(["student", "parent"]))):
    # Check if a tutor is specified, if so check if they exist
    tutor_name = ""
    if inquiry.tutor_id:
        tutor_prof = await db.find_one("tutor_profiles", {"user_id": inquiry.tutor_id})
        if not tutor_prof:
            raise HTTPException(status_code=404, detail="Selected tutor profile not found")
        tutor_name = tutor_prof.get("name", "")

    inquiry_doc = {
        "user_id": current_user["_id"],
        "user_name": current_user["name"],
        "user_email": current_user["email"],
        "subjects": inquiry.subjects,
        "class": inquiry.class_name,
        "preferred_timing": inquiry.preferred_timing,
        "budget": inquiry.budget,
        "learning_weaknesses": inquiry.learning_weaknesses,
        "tutor_id": inquiry.tutor_id,
        "tutor_name": tutor_name,
        "status": "pending",  # pending, accepted, rejected
        "created_at": datetime.utcnow().isoformat()
    }
    
    result = await db.insert_one("inquiries", inquiry_doc)
    return {"message": "Inquiry submitted successfully", "inquiry": result}

@router.get("")
async def list_inquiries(current_user: dict = Depends(get_current_user)):
    role = current_user.get("role")
    
    if role in ["student", "parent"]:
        # Get inquiries submitted by this user
        inquiries = await db.find("inquiries", {"user_id": current_user["_id"]})
        return inquiries
    elif role == "tutor":
        # Get inquiries specifically requested for this tutor, or open inquiries (tutor_id is null)
        # We can fetch both types of inquiries for tutors
        direct_inquiries = await db.find("inquiries", {"tutor_id": current_user["_id"]})
        open_inquiries = await db.find("inquiries", {"tutor_id": None})
        # Merge them
        return direct_inquiries + open_inquiries
    elif role == "admin":
        inquiries = await db.find("inquiries")
        return inquiries
    else:
        raise HTTPException(status_code=403, detail="Role not authorized to list inquiries")

@router.post("/{inquiry_id}/accept")
async def accept_inquiry(inquiry_id: str, current_user: dict = Depends(require_role(["tutor"]))):
    # Fetch inquiry
    inquiry = await db.find_one("inquiries", {"_id": inquiry_id})
    if not inquiry:
        raise HTTPException(status_code=404, detail="Inquiry not found")
        
    if inquiry["status"] != "pending":
        raise HTTPException(status_code=400, detail=f"Inquiry is already {inquiry['status']}")
        
    # Update inquiry status
    await db.update_one("inquiries", {"_id": inquiry_id}, {"$set": {"status": "accepted", "tutor_id": current_user["_id"], "tutor_name": current_user["name"]}})
    
    # Create enrollment between student and tutor
    enrollment = {
        "student_id": inquiry["user_id"],
        "student_name": inquiry["user_name"],
        "tutor_id": current_user["_id"],
        "tutor_name": current_user["name"],
        "subject": inquiry["subjects"][0] if inquiry["subjects"] else "General Tuition",
        "class": inquiry["class"],
        "rate_per_hour": inquiry["budget"],
        "start_date": datetime.utcnow().isoformat()[:10], # YYYY-MM-DD
        "status": "active", # active, completed, paused
        "created_at": datetime.utcnow().isoformat()
    }
    
    created_enrollment = await db.insert_one("enrollments", enrollment)
    return {"message": "Inquiry accepted and tuition enrollment activated", "enrollment": created_enrollment}

@router.post("/{inquiry_id}/reject")
async def reject_inquiry(inquiry_id: str, current_user: dict = Depends(require_role(["tutor", "admin"]))):
    inquiry = await db.find_one("inquiries", {"_id": inquiry_id})
    if not inquiry:
        raise HTTPException(status_code=404, detail="Inquiry not found")
        
    if inquiry["status"] != "pending":
        raise HTTPException(status_code=400, detail="Inquiry has already been processed")
        
    await db.update_one("inquiries", {"_id": inquiry_id}, {"$set": {"status": "rejected"}})
    return {"message": "Inquiry rejected successfully"}
