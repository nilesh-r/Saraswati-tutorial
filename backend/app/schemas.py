from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List

class UserRegister(BaseModel):
    name: str = Field(..., min_length=2)
    email: EmailStr
    password: str = Field(..., min_length=6)
    role: str = Field(..., description="student, parent, tutor, or admin")

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str = Field(..., alias="_id")
    name: str
    email: EmailStr
    role: str

    class Config:
        populate_by_name = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class TutorProfileUpdate(BaseModel):
    subjects: List[str]
    classes: List[str]
    rate_per_hour: float
    experience_years: int
    qualification: str
    bio: str
    location: str
    availability: List[str]
    demo_video_url: Optional[str] = ""

class InquiryCreate(BaseModel):
    subjects: List[str]
    class_name: str = Field(..., alias="class")
    preferred_timing: str
    budget: float
    learning_weaknesses: Optional[str] = ""
    tutor_id: Optional[str] = None

    class Config:
        populate_by_name = True

class ScheduleClassCreate(BaseModel):
    enrollment_id: str
    date: str
    start_time: str
    end_time: str
    meeting_link: Optional[str] = "https://meet.google.com/mock-meet-link"

class AttendanceLog(BaseModel):
    attendance_status: str = Field(..., description="present or absent")

class GradeCreate(BaseModel):
    test_name: str
    max_marks: float
    obtained_marks: float
    date: str
    feedback: Optional[str] = ""

class AssignmentCreate(BaseModel):
    title: str
    description: str
    due_date: str

class AssignmentSubmit(BaseModel):
    submission_url: str

class AssignmentGrade(BaseModel):
    grade: str
    feedback: Optional[str] = ""

class ReviewCreate(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    review_text: str

class MessageSend(BaseModel):
    receiver_id: str
    message: str
