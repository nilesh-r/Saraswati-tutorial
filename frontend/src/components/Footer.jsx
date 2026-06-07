import React from 'react';
import { BookOpen, Phone, Mail, MapPin } from 'lucide-react';

export default function Footer({ navigateTo }) {
  return (
    <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-900 px-6 py-12 text-slate-500 dark:text-slate-400 text-sm transition-colors duration-250">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        
        {/* Brand */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-black dark:bg-zinc-800 p-2.5 rounded-xl text-white shadow-md">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-lg text-slate-800 dark:text-white tracking-tight">Saraswati Tutorial</span>
          </div>
          <p className="leading-relaxed text-slate-600 dark:text-slate-400 text-xs">
            AI-Powered Personalized Home Tuition and Academic Progress Management Platform. Empowering student growth across Mumbai.
          </p>
        </div>

        {/* Subjects */}
        <div>
          <h4 className="text-slate-800 dark:text-white font-bold mb-4 text-xs uppercase tracking-wider">Subjects Covered</h4>
          <ul className="flex flex-col gap-2 text-xs">
            <li>Mathematics & Calculus</li>
            <li>Physics & Applied Mechanics</li>
            <li>Chemistry (Organic/Inorganic)</li>
            <li>Biology & Bio-Sciences</li>
            <li>Commerce & Accountancy</li>
            <li>Computer Science & Coding</li>
          </ul>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-slate-800 dark:text-white font-bold mb-4 text-xs uppercase tracking-wider">Quick Links</h4>
          <ul className="flex flex-col gap-2 text-xs">
            <li>
              <button onClick={() => navigateTo('landing')} className="hover:text-black dark:hover:text-white transition-colors">Home</button>
            </li>
            <li>
              <button onClick={() => navigateTo('tutors-search')} className="hover:text-black dark:hover:text-white transition-colors">Find Tutors</button>
            </li>
            <li>
              <button onClick={() => navigateTo('ai-chatbot')} className="hover:text-black dark:hover:text-white transition-colors">AI Guidance Chatbot</button>
            </li>
            <li>
              <button onClick={() => navigateTo('login')} className="hover:text-black dark:hover:text-white transition-colors">Portal Login</button>
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h4 className="text-slate-800 dark:text-white font-bold mb-4 text-xs uppercase tracking-wider">Contact Office</h4>
          <ul className="flex flex-col gap-3 text-xs">
            <li className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-zinc-900 dark:text-zinc-300 shrink-0 mt-0.5" />
              <span>Dadar West, Mumbai, Maharashtra 400028</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-zinc-900 dark:text-zinc-300 shrink-0" />
              <span>+91 98765 43210</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-zinc-900 dark:text-zinc-300 shrink-0" />
              <span>info@saraswatitutorials.in</span>
            </li>
          </ul>
        </div>

      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-slate-200 dark:border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 dark:text-slate-500">
        <span>© {new Date().getFullYear()} Saraswati Tutorial Mumbai. All rights reserved.</span>
        <div className="flex gap-4">
          <a href="#" className="hover:underline">Privacy Policy</a>
          <a href="#" className="hover:underline">Terms of Service</a>
          <a href="#" className="hover:underline">Tutor Guidelines</a>
        </div>
      </div>
    </footer>
  );
}
