import React, { useState, useEffect } from 'react';
import { GraduationCap } from 'lucide-react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import TutorSearch from './pages/TutorSearch';
import TutorDetails from './pages/TutorDetails';
import BookTutor from './pages/BookTutor';
import AIChatbot from './components/AIChatbot';

// Dashboards
import AdminDashboard from './pages/Dashboards/AdminDashboard';
import TutorDashboard from './pages/Dashboards/TutorDashboard';
import ParentDashboard from './pages/Dashboards/ParentDashboard';
import StudentDashboard from './pages/Dashboards/StudentDashboard';

import { apiService } from './utils/api';

export default function App() {
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('landing');
  const [selectedTutorId, setSelectedTutorId] = useState(null);
  const [prefilledSearchParams, setPrefilledSearchParams] = useState({});
  const [sessionLoading, setSessionLoading] = useState(true);

  // Manage Light / Dark Mode theme
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('saraswati_theme') || 'dark';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('saraswati_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Authenticate user on page load
  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem('saraswati_token');
      if (token) {
        try {
          const userData = await apiService.getMe();
          setUser(userData);
          setCurrentPage(prev => prev === 'landing' ? 'dashboard' : prev);
        } catch (err) {
          console.warn("Session expired or invalid token", err);
          apiService.logout();
          setUser(null);
        }
      }
      setSessionLoading(false);
    };
    checkSession();
  }, []);

  // Auto-redirect logged-in users away from auth / landing pages to their dashboard
  useEffect(() => {
    if (user && ['landing', 'login', 'register'].includes(currentPage)) {
      setCurrentPage('dashboard');
    }
  }, [user, currentPage]);

  const handleLogout = () => {
    apiService.logout();
    setUser(null);
    setCurrentPage('landing');
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const navigateTo = (page, params = {}) => {
    if (params) {
      setPrefilledSearchParams(params);
    }
    setCurrentPage(page);
    if (!params || !params.scroll) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Render role-based dashboards
  const renderDashboard = () => {
    if (!user) {
      return <Login navigateTo={navigateTo} onLoginSuccess={handleLoginSuccess} />;
    }
    switch (user.role) {
      case 'admin':
        return <AdminDashboard theme={theme} toggleTheme={toggleTheme} />;
      case 'tutor':
        return <TutorDashboard theme={theme} toggleTheme={toggleTheme} />;
      case 'parent':
        return <ParentDashboard navigateTo={navigateTo} setSelectedTutorId={setSelectedTutorId} theme={theme} toggleTheme={toggleTheme} />;
      case 'student':
        return <StudentDashboard theme={theme} toggleTheme={toggleTheme} />;
      default:
        return <div className="text-center py-20 text-slate-800 dark:text-slate-200">Unknown User Role: {user.role}</div>;
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        if (user) {
          return renderDashboard();
        }
        return (
          <LandingPage 
            navigateTo={navigateTo} 
            setSelectedTutorId={setSelectedTutorId} 
            prefilledParams={prefilledSearchParams}
          />
        );
      case 'login':
        return (
          <Login 
            navigateTo={navigateTo} 
            onLoginSuccess={handleLoginSuccess} 
          />
        );
      case 'register':
        return (
          <Register 
            navigateTo={navigateTo} 
            onLoginSuccess={handleLoginSuccess} 
          />
        );
      case 'dashboard':
        return renderDashboard();
      case 'tutors-search':
        return (
          <TutorSearch 
            navigateTo={navigateTo} 
            setSelectedTutorId={setSelectedTutorId}
            prefilledParams={prefilledSearchParams}
          />
        );
      case 'tutor-details':
        return (
          <TutorDetails 
            tutorId={selectedTutorId} 
            navigateTo={navigateTo} 
            setSelectedTutorId={setSelectedTutorId}
          />
        );
      case 'book-tutor':
        return (
          <BookTutor 
            tutorId={selectedTutorId} 
            navigateTo={navigateTo} 
          />
        );
      case 'ai-chatbot':
        return (
          <div className="py-12 px-6">
            <AIChatbot />
          </div>
        );
      default:
        return (
          <LandingPage 
            navigateTo={navigateTo} 
            setSelectedTutorId={setSelectedTutorId} 
          />
        );
    }
  };

  if (sessionLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 text-sm gap-2">
        <div className="w-8 h-8 rounded-full border-2 border-zinc-900 dark:border-white border-t-transparent animate-spin" />
        <span>Authenticating secure session...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-zinc-100 to-zinc-200 dark:from-zinc-950 dark:via-black dark:to-zinc-900 text-zinc-900 dark:text-zinc-100 flex flex-col justify-between selection:bg-zinc-900 selection:text-white dark:selection:bg-white dark:selection:text-black transition-colors duration-250">
      <div>
        {/* Navbar (Hidden on Dashboard for logged-in users, simplified otherwise) */}
        {(!user || currentPage !== 'dashboard') && (
          <Navbar 
            user={user} 
            onLogout={handleLogout} 
            navigateTo={navigateTo} 
            theme={theme}
            toggleTheme={toggleTheme}
            currentPage={currentPage}
          />
        )}
        <main className={user && currentPage === 'dashboard' ? "w-full animate-fade-in" : "max-w-7xl mx-auto w-full px-4 animate-fade-in"}>
          {renderPage()}
        </main>
      </div>
      {/* Footer (Hidden when logged in) */}
      {!user && <Footer navigateTo={navigateTo} />}
    </div>
  );
}
