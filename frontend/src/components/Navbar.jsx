import React from 'react';
import { BookOpen, LogOut, LayoutDashboard, User, Sun, Moon } from 'lucide-react';

export default function Navbar({ user, onLogout, navigateTo, theme, toggleTheme, currentPage }) {
  const handleNavClick = (sectionId) => {
    if (sectionId === 'top') {
      if (currentPage === 'landing') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        navigateTo('landing');
      }
      return;
    }

    if (currentPage === 'landing') {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      navigateTo('landing', { scroll: sectionId });
    }
  };

  return (
    <nav className="glass-panel sticky top-4 z-50 mx-4 my-2 px-6 py-3.5 flex items-center justify-between rounded-2xl transition-all duration-250">
      {/* Brand logo */}
      <div 
        onClick={() => navigateTo(user ? 'dashboard' : 'landing')} 
        className="flex items-center gap-2.5 cursor-pointer group"
      >
        <div className="bg-black dark:bg-white p-2.5 rounded-xl text-white dark:text-black shadow-md group-hover:scale-105 transition-all">
          <BookOpen className="w-5 h-5" />
        </div>
        <div>
          <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-black to-zinc-600 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">
            Saraswati
          </span>
          <span className="text-[10px] block text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider -mt-0.5">
            Tutorial Mumbai
          </span>
        </div>
      </div>

      {/* Navigation links */}
      {!user && (
        <div className="hidden lg:flex items-center gap-6">
          <button 
            onClick={() => handleNavClick('top')} 
            className="text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white font-semibold text-xs transition-colors"
          >
            Home
          </button>
          <button 
            onClick={() => handleNavClick('about')} 
            className="text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white font-semibold text-xs transition-colors"
          >
            About Us
          </button>
          <button 
            onClick={() => handleNavClick('services')} 
            className="text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white font-semibold text-xs transition-colors"
          >
            Services
          </button>
          <button 
            onClick={() => handleNavClick('subjects')} 
            className="text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white font-semibold text-xs transition-colors"
          >
            Subjects
          </button>
          <button 
            onClick={() => handleNavClick('how-it-works')} 
            className="text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white font-semibold text-xs transition-colors"
          >
            How It Works
          </button>
          <button 
            onClick={() => navigateTo('tutors-search')} 
            className="text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white font-semibold text-xs transition-colors"
          >
            Find Tutors
          </button>
          <button 
            onClick={() => handleNavClick('contact')} 
            className="text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white font-semibold text-xs transition-colors"
          >
            Contact Us
          </button>
        </div>
      )}

      {/* Action panel & theme selector */}
      <div className="flex items-center gap-3">
        {/* Theme Switcher Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-white/20 dark:bg-black/20 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
          title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-white" /> : <Moon className="w-3.5 h-3.5" />}
        </button>

        {user ? (
          <>
            <button
              onClick={() => navigateTo('dashboard')}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white/30 dark:bg-black/30 hover:bg-white/50 dark:hover:bg-black/50 text-zinc-800 dark:text-zinc-200 rounded-xl text-xs font-bold transition-all border border-zinc-200 dark:border-zinc-800"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-black dark:text-white" />
              <span>Dashboard</span>
            </button>
            <div className="hidden sm:flex items-center gap-1.5 bg-white/30 dark:bg-black/30 px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs">
              <User className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400" />
              <span className="font-bold max-w-[80px] truncate">{user.name}</span>
              <span className="text-[8px] bg-black/10 dark:bg-white/10 px-1 py-0.5 rounded text-zinc-800 dark:text-zinc-300 capitalize font-bold">
                {user.role}
              </span>
            </div>
            <button
              onClick={onLogout}
              className="p-2 bg-white/30 dark:bg-black/30 hover:bg-black/10 dark:hover:bg-white/10 hover:text-black dark:hover:text-white text-zinc-500 dark:text-zinc-400 rounded-xl transition-colors border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600"
              title="Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => navigateTo('login')}
              className="text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white font-bold text-xs transition-colors px-2 py-2"
            >
              Login
            </button>
            <button
              onClick={() => navigateTo('register')}
              className="px-4 py-2 glass-btn-primary hover:opacity-90 font-bold text-xs rounded-xl shadow-md transition-all"
            >
              Get Started
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
