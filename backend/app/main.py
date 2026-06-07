from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import users, tutors, inquiries, progress, payments, ai, chat
from app.config import settings

app = FastAPI(
    title="Saraswati Tutorial Mumbai API",
    description="AI-Powered Educational Tuition & Management System API Server",
    version="1.0.0"
)

# Enable CORS for frontend local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(users.router, prefix="/api")
app.include_router(tutors.router, prefix="/api")
app.include_router(inquiries.router, prefix="/api")
app.include_router(progress.router, prefix="/api")
app.include_router(payments.router, prefix="/api")
app.include_router(ai.router, prefix="/api")
app.include_router(chat.router, prefix="/api")

@app.get("/")
def read_root():
    return {
        "status": "online",
        "platform": "Saraswati Tutorial Mumbai",
        "api_documentation": "/docs"
    }
