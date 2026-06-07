import React, { useState } from 'react';
import { UserPlus, User, Mail, Lock, ShieldCheck, AlertCircle } from 'lucide-react';
import { apiService } from '../utils/api';

export default function Register({ navigateTo, onLoginSuccess }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !role) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const data = await apiService.register({
        name,
        email,
        password,
        role
      });
      onLoginSuccess(data.user);
      navigateTo('dashboard');
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail || 
        'Registration failed. Email might already be registered.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-16 glass-panel rounded-3xl p-8 shadow-2xl relative transition-all">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-zinc-500/10 dark:bg-white/5 rounded-full blur-[80px] pointer-events-none" />
      
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-zinc-950 dark:text-white tracking-tight">Create Account</h2>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">Join Mumbai's smart educational portal</p>
      </div>

      {error && (
        <div className="mb-6 bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 p-3.5 rounded-xl flex gap-2.5 text-zinc-900 dark:text-zinc-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-zinc-600 dark:text-zinc-450" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">Full Name</label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Nilesh Sawant"
              className="w-full glass-input rounded-xl pl-10 pr-4 py-2.5 text-sm text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-black focus:dark:focus:border-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. nilesh@example.com"
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
              placeholder="Min 6 characters"
              className="w-full glass-input rounded-xl pl-10 pr-4 py-2.5 text-sm text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-black focus:dark:focus:border-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">Your Role</label>
          <div className="relative">
            <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full glass-input rounded-xl pl-10 pr-4 py-2.5 text-sm text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-zinc-650"
            >
              <option value="student">Student (Class 6th to Graduation)</option>
              <option value="parent">Parent / Guardian</option>
              <option value="tutor">Professional Home Tutor</option>
              <option value="admin">System Administrator</option>
            </select>
          </div>
        </div>

        {role === 'tutor' && (
          <div className="bg-zinc-100 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/60 p-3.5 rounded-xl text-zinc-800 dark:text-zinc-350 text-xs leading-relaxed">
            Note: Tutors require admin verification before appearing in student searches. You will be prompted to fill your teaching subjects and experience in your dashboard.
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-6 py-2.5 bg-black hover:bg-zinc-900 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-black font-extrabold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50 border border-zinc-900 dark:border-zinc-100"
        >
          <UserPlus className="w-4 h-4" />
          <span>{loading ? 'Creating Account...' : 'Register'}</span>
        </button>
      </form>

      <div className="mt-6 text-center text-xs text-zinc-500">
        <span>Already have an account? </span>
        <button 
          onClick={() => navigateTo('login')} 
          className="text-black dark:text-white hover:underline font-extrabold"
        >
          Login here
        </button>
      </div>
    </div>
  );
}
