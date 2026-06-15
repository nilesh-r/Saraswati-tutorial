# 🎓Saraswati Tutorial Mumbai
### *AI-Powered Home Tuition & Educational Management System*

Welcome to **SPIDY** (Saraswati Tutorial Mumbai), a modern, full-stack, AI-powered home tutoring marketplace and educational management system. The platform bridges the gap between expert tutors, parents, students, and administrators by providing seamless matching, direct communication, interactive dashboards, progress tracking, and secure invoice payments.

---

## 🏗️ Architecture Overview

SPIDY is built using a decoupled **client-server architecture**:
*   **Backend**: A high-performance REST API built with **FastAPI** (Python 3.13+), featuring token-based authentication, a dual-mode database layer, and AI integration.
*   **Frontend**: A responsive Single Page Application (SPA) built with **React 19** and **Vite 8**, styled using **Tailwind CSS v4** and featuring interactive charts (Recharts) and dynamic theme switching.

```
SPIDY/
├── backend/            # FastAPI Python Backend
│   ├── app/
│   │   ├── routers/    # API Endpoint Routers (Auth, AI, Chat, Tutors, Inquiries, etc.)
│   │   ├── auth.py     # JWT Token auth & role validation
│   │   ├── config.py   # Settings & Environment configurations
│   │   ├── db.py       # Dual MongoDB / JSON Local Database client
│   │   ├── main.py     # App instantiation & Router registration
│   │   └── schemas.py  # Pydantic validation schemas
│   ├── local_db.json   # Local database fallback storage
│   └── run.py          # Backend server startup script
├── frontend/           # React 19 + Vite Frontend
│   ├── src/
│   │   ├── assets/     # Static assets & styling
│   │   ├── components/ # Shared components (Navbar, Footer, AI Chatbot)
│   │   ├── pages/      # Pages & Role-based Dashboards (Admin, Tutor, Parent, Student)
│   │   ├── utils/      # Axios API configuration & services
│   │   ├── App.jsx     # Route handling & global states
│   │   └── main.jsx    # Entry point
│   ├── package.json    # Frontend dependency manifest
│   └── vite.config.js  # Vite server configurations
└── README.md           # Main documentation (This file)
```

---

## 🌟 Key Features

### 1. 🤖 AI Integration & Features
*   **Tutor Recommendation Engine (`/api/ai/recommend`)**: Utilizes a scoring algorithm that evaluates tutors based on subjects, class level, budget, neighborhood proximity, experience, and the student's specific academic weaknesses (e.g., calculus, physics numericals, grammar). It generates a detailed **AI explanation** justifying the match percentage.
*   **Educational Guidance Chatbot (`/api/ai/chatbot`)**: Features a chatbot built to assist users with academic prep strategies, time management, subject focus, and home tutoring benefits. It connects to **Google Gemini** (`gemini-1.5-flash`) via the `google-generativeai` SDK, with a robust rule-based local NLP fallback if no API key is provided.

### 2. 🔐 Authentication & Roles
Secure token-based JWT authentication with 4 distinct user roles:
*   **👨‍💼 Admin Dashboard**:
    *   Review pending tutor applications.
    *   Approve or reject tutor profile verifications.
    *   Manage overall system stats (tutors, students, inquiries).
*   **🎓 Tutor Dashboard**:
    *   Complete profile (subjects, class levels, hourly rate, bio, availability, demo video).
    *   Track active students and enrollment status.
    *   Log class schedules and mark student attendance.
    *   Create assignments, grade student submissions, and log academic grades.
    *   Monitor cumulative monthly earnings and invoice payments.
*   **👪 Parent Dashboard**:
    *   Search and filter verified tutors based on rate, experience, subject, class, and ratings.
    *   Send tuition inquiries and book lessons.
    *   Monitor children's attendance, assignments, and grades.
    *   View, track, and pay tuition invoices securely (simulated UPI/Card payments).
    *   Chat directly with tutors.
*   **👶 Student Dashboard**:
    *   View weekly class schedules and calendar.
    *   Track submitted and pending homework assignments.
    *   Access assignment feedback, grades, and attendance stats.
    *   View interactive progress analytics charts (subject-wise grades, submission rates).

### 3. 💬 Real-time Communication
*   **Internal Chat App**: Direct message flow between parents/students and tutors to discuss requirements, schedules, and lesson updates.

---

## 🛠️ Technology Stack

### Backend
*   **Framework**: FastAPI
*   **Server**: Uvicorn
*   **Database Client**: PyMongo / Motor (Async driver)
*   **Authentication**: PyJWT (JSON Web Tokens) & Passlib (Bcrypt hashing)
*   **Data Validation**: Pydantic v2
*   **Dual Database Layer**: Automated connection to MongoDB Atlas; fallback to local file system database (`local_db.json`) if MongoDB URI is not provided.

### Frontend
*   **Framework**: React 19 (JavaScript SPA)
*   **Build Tool**: Vite 8
*   **Styling**: Tailwind CSS v4 + Lucide Icons
*   **HTTP Client**: Axios (with authorization interceptors)
*   **Charts & Visualizations**: Recharts

---

## 🚀 Installation & Local Setup

Both the backend and frontend development servers have been pre-configured to run concurrently.

### Prerequisites
*   [Python 3.10+](https://www.python.org/downloads/)
*   [Node.js (v18+)](https://nodejs.org/)

---

### Step 1: Running the Backend

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Activate the pre-configured Python virtual environment:
   *   **Windows (PowerShell)**:
       ```powershell
       .venv\Scripts\Activate.ps1
       ```
   *   **Windows (CMD)**:
       ```cmd
       .venv\Scripts\activate.bat
       ```
   *   **macOS/Linux**:
       ```bash
       source .venv/bin/activate
       ```
3. *(Optional)* Create a `.env` file inside `backend/` and configure:
   ```env
   MONGODB_URI=your_mongodb_connection_uri
   DB_NAME=saraswati_tutorials
   GEMINI_API_KEY=your_gemini_api_key
   JWT_SECRET=your_jwt_secret_key
   ```
   *Note: If no `.env` is supplied, the server automatically defaults to the local `local_db.json` database and local NLP fallback for the chatbot.*
4. Start the FastAPI development server:
   ```bash
   python run.py
   ```
   The backend API will start at: **`http://127.0.0.1:8000`**
   Interactive Swagger API Documentation will be available at: **`http://127.0.0.1:8000/docs`**

---

### Step 2: Running the Frontend

1. Open a new terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install npm packages (if not already installed):
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The frontend UI will start at: **`http://localhost:5173/`**

---

## 🧪 Testing Credentials
You can log in to the system with the following preloaded accounts:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@saraswati.com` | `admin123` |
| **Parent** | `ramesh@gmail.com` | `password` |
| **Student** | `NileshSahu8675@gmail.com` | `password` |

*(Note: Passwords for default seed users are pre-hashed inside `local_db.json` using bcrypt).*

---

## 📄 License
This project is for educational and tutorial management purposes. 

Happy Learning! 🎓
