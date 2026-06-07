from fastapi import APIRouter, Depends, HTTPException
from app.db import db
from app.config import settings
from app.auth import get_current_user
from pydantic import BaseModel
from typing import List, Optional
import random

router = APIRouter(prefix="/ai", tags=["AI Integration"])

class RecommendRequest(BaseModel):
    subject: str
    class_name: str  # e.g., "Class 10" or "Graduation"
    weaknesses: Optional[str] = ""
    budget: float
    location: Optional[str] = ""
    preferred_timing: Optional[str] = ""

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[dict]] = []

@router.post("/recommend")
async def recommend_tutors(req: RecommendRequest):
    # Fetch all verified tutors
    tutors = await db.find("tutor_profiles", {"verification_status": "verified"})
    
    scored_tutors = []
    
    for tutor in tutors:
        score = 0
        reasons = []
        
        # 1. Subject match (up to 40 points)
        subject_match = False
        for sub in tutor.get("subjects", []):
            if req.subject.lower() in sub.lower() or sub.lower() in req.subject.lower():
                subject_match = True
                break
        if subject_match:
            score += 40
            reasons.append(f"Specializes in teaching {req.subject}.")
        else:
            # Skip if tutor does not teach the requested subject at all
            continue
            
        # 2. Class match (up to 20 points)
        class_match = False
        for cl in tutor.get("classes", []):
            if req.class_name.lower() in cl.lower() or cl.lower() in req.class_name.lower():
                class_match = True
                break
        if class_match:
            score += 20
            reasons.append(f"Instructs students at the {req.class_name} level.")
        else:
            # Non-exact class match, but teaches nearby classes
            score += 5
            reasons.append(f"Teaches other academic grade levels.")
            
        # 3. Budget match (up to 15 points)
        rate = tutor.get("rate_per_hour", 0.0)
        if rate <= req.budget:
            score += 15
            reasons.append(f"Rate (₹{rate}/hr) fits well within your budget of ₹{req.budget}/hr.")
        elif rate <= req.budget * 1.25:
            score += 8
            reasons.append(f"Slightly above budget (₹{rate}/hr), but within acceptable margin.")
        else:
            score += 0
            reasons.append(f"Premium tutor pricing (₹{rate}/hr).")
            
        # 4. Location match (up to 15 points)
        tutor_loc = tutor.get("location", "")
        if req.location and tutor_loc:
            if req.location.lower() in tutor_loc.lower() or tutor_loc.lower() in req.location.lower():
                score += 15
                reasons.append(f"Available for home tutoring in your neighborhood ({tutor_loc}).")
            else:
                score += 5
                reasons.append(f"Located in {tutor_loc}; may require hybrid/online schedule.")
        else:
            score += 10
            reasons.append("Location compatibility fits platform limits.")
            
        # 5. Experience match (up to 10 points)
        exp = tutor.get("experience_years", 0)
        exp_score = min(exp * 1.5, 10)
        score += exp_score
        if exp >= 5:
            reasons.append(f"Highly experienced tutor with {exp} years of academic tenure.")
        elif exp > 0:
            reasons.append(f"Has {exp} years of professional tutoring experience.")
            
        # 6. Weakness analysis bonus (up to 10 points)
        weakness_matched = False
        if req.weaknesses:
            keywords = ["numerical", "mechanics", "grammar", "coding", "calculus", "organic", "accounting", "equations", "derivation"]
            for kw in keywords:
                if kw in req.weaknesses.lower() and kw in tutor.get("bio", "").lower():
                    weakness_matched = True
                    break
            if weakness_matched:
                score += 10
                reasons.append(f"Bio indicates special methodology in addressing student's weakness ({req.weaknesses}).")
        
        # Calculate rating bonus
        rating = tutor.get("rating", 0.0)
        if rating >= 4.5:
            score += 5
            reasons.append(f"Highly-rated tutor ({rating} stars).")
            
        # Cap score at 100
        score = min(round(score), 100)
        
        # Construct dynamic AI-powered review
        ai_explanation = f"Match Score: {score}%. " + " ".join(reasons)
        
        scored_tutors.append({
            "tutor_id": tutor["user_id"],
            "profile_id": tutor["_id"],
            "name": tutor["name"],
            "subjects": tutor["subjects"],
            "classes": tutor["classes"],
            "rate_per_hour": tutor["rate_per_hour"],
            "experience_years": tutor["experience_years"],
            "qualification": tutor["qualification"],
            "location": tutor["location"],
            "rating": rating,
            "reviews_count": tutor.get("reviews_count", 0),
            "match_score": score,
            "ai_explanation": ai_explanation
        })
        
    # Sort tutors by match score descending
    scored_tutors.sort(key=lambda x: x["match_score"], reverse=True)
    return scored_tutors

# Pre-programmed guidance responses
GUIDANCE_KNOWLEDGE_BASE = {
    "mathematics": [
        "For Mathematics, our tutors focus on building core concept clarity. Instead of memorization, we employ the 'Socratic method' where students derive formulas under guidance, followed by structured practice of progressively harder problem sets.",
        "To improve math performance, we recommend: 1. Maintain a dedicated 'Formula Notebook' for quick daily reviews. 2. Focus on step-by-step problem breakdown. 3. Allocate 30 minutes daily to practice active derivations. Saraswati home tutors specialize in solving arithmetic and calculus anxiety."
    ],
    "physics": [
        "Physics improvement requires translating equations into physical visualization. Our tutors use real-world demonstrations (like pendulums, circuit mockups, and virtual simulations) to teach principles before jumping into complex numerical calculations.",
        "If your child is struggling with Physics numericals, our tutors recommend: 1. Always list the 'Given data' and 'Required formulas' first. 2. Verify physical units. 3. Practice derivation maps. One-on-one tutoring allows for customized debugging of these calculation steps."
    ],
    "improvement": [
        "Tuition at home provides focused, 1-on-1 attention where a tutor identifies learning gaps immediately. In a class of 40, teachers cannot pause for a single child, but home tuition creates a safe workspace for students to ask 'silly' questions repeatedly.",
        "Academic improvement is a marathon. On average, students attending Saraswati tutorials twice-weekly show a letter-grade improvement within 6 to 8 weeks, as we structure customized diagnostic testing every Sunday."
    ],
    "discipline": [
        "Focus and self-discipline are cultivated through structured routines. Our tutors help students design a customized 'Study Planner' and teach techniques like the Pomodoro method (25 mins focus, 5 mins break) to prevent cognitive fatigue.",
        "Parents can support study discipline by: 1. Keep a distraction-free physical workspace. 2. Avoid gadget access during study hours. 3. Review the weekly progress report issued by the Saraswati Tutorial tutor."
    ],
    "board prep": [
        "For Class 10th and 12th board prep, our tutors utilize a 3-step strategy: 1. Comprehensive syllabus completion 3 months prior. 2. Chapter-wise analysis of past 10 years' board papers. 3. Weekly timed mock examinations to build writing speed and stress resilience."
    ],
    "benefits": [
        "Saraswati Tutorial home tuition benefits include: 1. Tailored curriculum pacing. 2. Flexible class schedules that prevent school exhaustion. 3. Elimination of travel time. 4. Real-time feedback, ensuring misconceptions are resolved before they compound."
    ]
}

@router.post("/chatbot")
async def educational_chatbot(req: ChatRequest):
    message = req.message.lower()
    
    # Try calling Google Gemini if API Key is configured
    if settings.GEMINI_API_KEY:
        try:
            import google.generativeai as genai
            genai.configure(api_key=settings.GEMINI_API_KEY)
            
            # Format history for Gemini
            model = genai.GenerativeModel('gemini-1.5-flash')
            
            prompt_context = (
                "You are the AI Educational Guidance Assistant for 'Saraswati Tutorial Mumbai'. "
                "Your role is to guide parents and students about academic improvements, home tuition benefits, "
                "exam prep strategies, focus, study schedules, and syllabus tracking. "
                "Keep your tone professional, supportive, and knowledgeable about Indian board syllabi (CBSE, ICSE, HSC, etc.). "
                "Keep responses structured and under 150 words. "
                f"User Message: {req.message}"
            )
            
            response = model.generate_content(prompt_context)
            if response and response.text:
                return {"reply": response.text, "mode": "gemini-ai"}
        except Exception as e:
            print(f"Gemini generation failed: {e}. Falling back to pre-programmed Knowledge Base.")
            
    # Fallback/Default NLP rule-based chatbot
    reply = ""
    matched_topics = []
    
    for topic, responses in GUIDANCE_KNOWLEDGE_BASE.items():
        if topic in message or (topic == "board prep" and ("board" in message or "exam" in message or "test" in message)):
            matched_topics.append(topic)
            
    if matched_topics:
        # Choose a response from one of the matched topics
        chosen_topic = random.choice(matched_topics)
        reply = random.choice(GUIDANCE_KNOWLEDGE_BASE[chosen_topic])
    else:
        # Smart generic response
        reply = (
            "Thank you for contacting Saraswati Tutorial Mumbai! Academic improvement begins with recognizing learning gaps. "
            "Our certified tutors conduct diagnostic evaluations and provide 1-on-1 customized schedules. "
            "Whether your child needs help with Mathematics derivations, Physics numericals, or CBSE/ICSE board preparation, "
            "we are here to assist. Feel free to ask about specific subjects, study planning, or tuition schedules!"
        )
        
    return {"reply": reply, "mode": "local-nlp"}
