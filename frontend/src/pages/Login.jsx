import React, { useState } from 'react';
import { Mail, Lock, LogIn, AlertCircle, ShieldAlert } from 'lucide-react';
import { apiService } from '../utils/api';

export default function Login({ navigateTo, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Quick-test helper credentials
  const demoAccounts = [
    { role: 'Admin', email: 'admin@saraswati.com', pass: 'admin123' },
    { role: 'Student', email: 'student@example.com', pass: 'student123' },
    { role: 'Parent', email: 'parent@example.com', pass: 'parent123' },
    { role: 'Tutor', email: 'tutor@example.com', pass: 'tutor123' },
  ];

  const handleFillDemo = (acc) => {
    setEmail(acc.email);
    setPassword(acc.pass);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      if (email === 'admin@saraswati.com') {
        try {
          await apiService.setupAdmin();
        } catch (setupErr) {
          console.warn("Admin bootstrapping failed or was already done", setupErr);
        }
      }

      const data = await apiService.login({ email, password });
      onLoginSuccess(data.user);
      navigateTo('dashboard');
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail || 
        'Invalid credentials. Please register first if this account does not exist.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-16 glass-panel rounded-3xl p-8 shadow-2xl relative transition-all">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-zinc-500/10 dark:bg-white/5 rounded-full blur-[80px] pointer-events-none" />
      
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-zinc-950 dark:text-white tracking-tight">Welcome Back!</h2>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">Sign in to your Saraswati Tutorial portal</p>
      </div>

      {error && (
        <div className="mb-6 bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 p-3.5 rounded-xl flex gap-2.5 text-zinc-900 dark:text-zinc-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-zinc-600 dark:text-zinc-450" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. parent@example.com"
              className="w-full glass-input rounded-xl pl-10 pr-4 py-2.5 text-sm text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-black focus:dark:focus:border-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full glass-input rounded-xl pl-10 pr-4 py-2.5 text-sm text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-black focus:dark:focus:border-white"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-6 py-2.5 bg-black hover:bg-zinc-900 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-black font-extrabold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50 border border-zinc-900 dark:border-zinc-100"
        >
          <LogIn className="w-4 h-4" />
          <span>{loading ? 'Logging in...' : 'Login'}</span>
        </button>
      </form>

      {/* Demo Credentials Section */}
      <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-1.5 text-xs text-zinc-800 dark:text-zinc-300 font-extrabold mb-3">
          <ShieldAlert className="w-4 h-4 text-zinc-500 dark:text-zinc-400 animate-pulse" />
          <span>Testing Console (Preset Accounts)</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {demoAccounts.map((acc, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleFillDemo(acc)}
              className="text-[10px] text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200/20 dark:hover:bg-zinc-800/20 bg-white/20 dark:bg-black/25 border border-zinc-200 dark:border-zinc-800 p-2 rounded-lg text-left transition-colors flex flex-col justify-between"
            >
              <span className="font-extrabold text-zinc-950 dark:text-zinc-100 block mb-0.5 uppercase tracking-wide">{acc.role}</span>
              <span className="text-[9px] text-zinc-500 dark:text-zinc-400 truncate block">{acc.email}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 text-center text-xs text-zinc-500">
        <span>Don't have an account? </span>
        <button 
          onClick={() => navigateTo('register')} 
          className="text-black dark:text-white hover:underline font-extrabold"
        >
          Register here
        </button>
      </div>
    </div>
  );
}
