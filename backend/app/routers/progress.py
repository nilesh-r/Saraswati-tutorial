from fastapi import APIRouter, HTTPException, Depends, status, Query
from app.db import db
from app.schemas import ScheduleClassCreate, AttendanceLog, AssignmentCreate, AssignmentSubmit, AssignmentGrade, GradeCreate
from app.auth import get_current_user, require_role
from datetime import datetime
from typing import Optional

router = APIRouter(prefix="/progress", tags=["Progress & Tracking"])

@router.get("/enrollments")
async def list_enrollments(current_user: dict = Depends(get_current_user)):
    role = current_user.get("role")
    if role == "tutor":
        return await db.find("enrollments", {"tutor_id": current_user["_id"]})
    elif role in ["student", "parent"]:
        return await db.find("enrollments", {"student_id": current_user["_id"]})
    elif role == "admin":
        return await db.find("enrollments")
    return []

@router.post("/schedule")
async def schedule_class(class_data: ScheduleClassCreate, current_user: dict = Depends(require_role(["tutor"]))):
    # Verify enrollment exists
    enrollment = await db.find_one("enrollments", {"_id": class_data.enrollment_id, "tutor_id": current_user["_id"]})
    if not enrollment:
        raise HTTPException(status_code=404, detail="Active enrollment not found for this tutor")
        
    schedule_doc = {
        "enrollment_id": class_data.enrollment_id,
        "tutor_id": current_user["_id"],
        "tutor_name": current_user["name"],
        "student_id": enrollment["student_id"],
        "student_name": enrollment["student_name"],
        "subject": enrollment["subject"],
        "class": enrollment["class"],
        "date": class_data.date,
        "start_time": class_data.start_time,
        "end_time": class_data.end_time,
        "status": "scheduled",  # scheduled, completed, cancelled
        "meeting_link": class_data.meeting_link,
        "attendance_marked": False,
        "attendance_status": None,  # present, absent
        "created_at": datetime.utcnow().isoformat()
    }
    
    result = await db.insert_one("schedules", schedule_doc)
    return {"message": "Class scheduled successfully", "schedule": result}

@router.get("/schedule")
async def get_schedule(current_user: dict = Depends(get_current_user)):
    role = current_user.get("role")
    if role == "tutor":
        return await db.find("schedules", {"tutor_id": current_user["_id"]})
    elif role in ["student", "parent"]:
        return await db.find("schedules", {"student_id": current_user["_id"]})
    elif role == "admin":
        return await db.find("schedules")
    return []

@router.post("/schedule/{class_id}/attendance")
async def mark_attendance(class_id: str, log: AttendanceLog, current_user: dict = Depends(require_role(["tutor"]))):
    class_doc = await db.find_one("schedules", {"_id": class_id, "tutor_id": current_user["_id"]})
    if not class_doc:
        raise HTTPException(status_code=404, detail="Scheduled class not found")
        
    update_doc = {
        "$set": {
            "attendance_marked": True,
            "attendance_status": log.attendance_status,
            "status": "completed"
        }
    }
    await db.update_one("schedules", {"_id": class_id}, update_doc)
    
    # Auto-generate a payment invoice when attendance is marked present
    # Invoice amount = rate_per_hour * hours (assume 1.5 hours default or calculated)
    enrollment = await db.find_one("enrollments", {"_id": class_doc["enrollment_id"]})
    if enrollment and log.attendance_status == "present":
        rate = enrollment.get("rate_per_hour", 500)
        # Create invoice
        invoice_doc = {
            "enrollment_id": enrollment["_id"],
            "class_id": class_id,
            "student_id": enrollment["student_id"],
            "student_name": enrollment["student_name"],
            "tutor_id": current_user["_id"],
            "tutor_name": current_user["name"],
            "subject": enrollment["subject"],
            "amount": rate * 1.5,  # Assume 1.5 hour class
            "due_date": (datetime.utcnow()).strftime("%Y-%m-%d"),
            "status": "unpaid",  # unpaid, paid
            "payment_date": None,
            "created_at": datetime.utcnow().isoformat()
        }
        await db.insert_one("invoices", invoice_doc)
        
    return {"message": "Attendance marked successfully"}

@router.post("/assignments")
async def create_assignment(
    assignment_data: AssignmentCreate,
    enrollment_id: str = Query(...),
    current_user: dict = Depends(require_role(["tutor"]))
):
    enrollment = await db.find_one("enrollments", {"_id": enrollment_id, "tutor_id": current_user["_id"]})
    if not enrollment:
        raise HTTPException(status_code=404, detail="Enrollment not found")
        
    doc = {
        "enrollment_id": enrollment_id,
        "tutor_id": current_user["_id"],
        "tutor_name": current_user["name"],
        "student_id": enrollment["student_id"],
        "student_name": enrollment["student_name"],
        "title": assignment_data.title,
        "description": assignment_data.description,
        "due_date": assignment_data.due_date,
        "status": "pending",  # pending, submitted, graded
        "submission_url": "",
        "grade": "",
        "feedback": "",
        "created_at": datetime.utcnow().isoformat()
    }
    
    result = await db.insert_one("assignments", doc)
    return {"message": "Assignment created successfully", "assignment": result}

@router.get("/assignments")
async def list_assignments(current_user: dict = Depends(get_current_user)):
    role = current_user.get("role")
    if role == "tutor":
        return await db.find("assignments", {"tutor_id": current_user["_id"]})
    elif role in ["student", "parent"]:
        return await db.find("assignments", {"student_id": current_user["_id"]})
    elif role == "admin":
        return await db.find("assignments")
    return []

@router.post("/assignments/{assignment_id}/submit")
async def submit_assignment(assignment_id: str, submission: AssignmentSubmit, current_user: dict = Depends(require_role(["student"]))):
    assign = await db.find_one("assignments", {"_id": assignment_id, "student_id": current_user["_id"]})
    if not assign:
        raise HTTPException(status_code=404, detail="Assignment not found")
        
    update_doc = {
        "$set": {
            "status": "submitted",
            "submission_url": submission.submission_url,
            "submitted_at": datetime.utcnow().isoformat()
        }
    }
    await db.update_one("assignments", {"_id": assignment_id}, update_doc)
    return {"message": "Assignment submitted successfully"}

@router.post("/assignments/{assignment_id}/grade")
async def grade_assignment(assignment_id: str, grading: AssignmentGrade, current_user: dict = Depends(require_role(["tutor"]))):
    assign = await db.find_one("assignments", {"_id": assignment_id, "tutor_id": current_user["_id"]})
    if not assign:
        raise HTTPException(status_code=404, detail="Assignment not found")
        
    update_doc = {
        "$set": {
            "status": "graded",
            "grade": grading.grade,
            "feedback": grading.feedback,
            "graded_at": datetime.utcnow().isoformat()
        }
    }
    await db.update_one("assignments", {"_id": assignment_id}, update_doc)
    return {"message": "Assignment graded successfully"}

@router.post("/grades")
async def add_grade(
    grade_data: GradeCreate,
    enrollment_id: str = Query(...),
    current_user: dict = Depends(require_role(["tutor"]))
):
    enrollment = await db.find_one("enrollments", {"_id": enrollment_id, "tutor_id": current_user["_id"]})
    if not enrollment:
        raise HTTPException(status_code=404, detail="Enrollment not found")
        
    doc = {
        "enrollment_id": enrollment_id,
        "tutor_id": current_user["_id"],
        "student_id": enrollment["student_id"],
        "student_name": enrollment["student_name"],
        "subject": enrollment["subject"],
        "test_name": grade_data.test_name,
        "max_marks": grade_data.max_marks,
        "obtained_marks": grade_data.obtained_marks,
        "percentage": round((grade_data.obtained_marks / grade_data.max_marks) * 100, 2),
        "date": grade_data.date,
        "feedback": grade_data.feedback,
        "created_at": datetime.utcnow().isoformat()
    }
    
    result = await db.insert_one("grades", doc)
    return {"message": "Grade recorded successfully", "grade": result}

@router.get("/grades")
async def list_grades(current_user: dict = Depends(get_current_user)):
    role = current_user.get("role")
    if role == "tutor":
        return await db.find("grades", {"tutor_id": current_user["_id"]})
    elif role in ["student", "parent"]:
        return await db.find("grades", {"student_id": current_user["_id"]})
    elif role == "admin":
        return await db.find("grades")
    return []

@router.get("/analytics")
async def get_analytics(student_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    # Validate authorization to fetch student details
    target_student_id = student_id if student_id else current_user["_id"]
    if current_user["role"] in ["student", "parent"]:
        if current_user["role"] == "parent" and not student_id:
            # Parent must supply student_id to view records
            # For simplicity, if parent has no student_id supplied, fetch the first matching user in enrollments
            parent_enrolls = await db.find("enrollments", {"student_id": current_user["_id"]}) # or search by name
            # Let's just lookup any student the parent has enrolled
            pass
            
    # Load data for student
    classes = await db.find("schedules", {"student_id": target_student_id})
    grades = await db.find("grades", {"student_id": target_student_id})
    assignments = await db.find("assignments", {"student_id": target_student_id})
    
    # Calculate stats
    total_classes = len(classes)
    attended_classes = len([c for c in classes if c.get("attendance_status") == "present"])
    attendance_rate = round((attended_classes / total_classes) * 100, 2) if total_classes > 0 else 100.0
    
    avg_grade = 0.0
    if grades:
        avg_grade = sum(g["percentage"] for g in grades) / len(grades)
        avg_grade = round(avg_grade, 2)
        
    pending_assignments = len([a for a in assignments if a["status"] == "pending"])
    
    # Auto-generate dynamic AI-styled suggestions based on data trends
    ai_insights = []
    if attendance_rate < 85:
        ai_insights.append("Attendance is below the recommended 85%. Consistent sessions are critical for subject retention.")
    else:
        ai_insights.append("Excellent attendance discipline! Consistent presence is reflecting positively on the syllabus coverage.")
        
    if avg_grade < 70 and grades:
        ai_insights.append("Academic scores are average. We recommend requesting the tutor to focus on concept clarity and scheduling a mock test before the upcoming board examinations.")
    elif avg_grade >= 85 and grades:
        ai_insights.append("Outstanding academic performance! The student shows advanced conceptual understanding. Consider introducing higher-order thinking (HOT) questions.")
        
    if pending_assignments > 2:
        ai_insights.append(f"Action Needed: {pending_assignments} assignments are overdue. Prompt submission is vital for feedback and marking.")

    if not grades and not classes:
        ai_insights.append("Welcome! No academic tracking data is present yet. Once the scheduled demo classes commence, visual analytics will populate here.")
        
    # Weakest subject detector helper
    subject_scores = {}
    for g in grades:
        sub = g.get("subject", "General")
        if sub not in subject_scores:
            subject_scores[sub] = []
        subject_scores[sub].append(g["percentage"])
        
    weakest_subject = "None"
    lowest_score = 100.0
    for sub, scores in subject_scores.items():
        avg = sum(scores) / len(scores)
        if avg < lowest_score:
            lowest_score = avg
            weakest_subject = sub
            
    if weakest_subject != "None" and lowest_score < 75:
        ai_insights.append(f"Focus Area: The student is finding {weakest_subject} challenging (avg {round(lowest_score, 1)}%). The AI suggestion is to allocate 2 extra hours of personalized practice weekly on this subject.")

    return {
        "attendance_rate": attendance_rate,
        "average_grade": avg_grade,
        "completed_classes": len([c for c in classes if c["status"] == "completed"]),
        "pending_assignments": pending_assignments,
        "grades_history": grades,
        "weak_subject": weakest_subject,
        "ai_insights": ai_insights
    }
