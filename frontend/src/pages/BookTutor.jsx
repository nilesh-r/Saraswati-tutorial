import React, { useState } from 'react';
import { Calendar, BookOpen, Clock, Wallet, AlertCircle } from 'lucide-react';
import { apiService } from '../utils/api';

export default function BookTutor({ tutorId, navigateTo }) {
  const [subject, setSubject] = useState('');
  const [className, setClassName] = useState('');
  const [hoursPerWeek, setHoursPerWeek] = useState(4);
  const [monthlyBudget, setMonthlyBudget] = useState(6000);
  const [preferredTiming, setPreferredTiming] = useState('Monday 4-6 PM');
  const [weaknesses, setWeaknesses] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!tutorId) {
      setError('Please select a tutor first.');
      return;
    }
    if (!subject || !className || !monthlyBudget) {
      setError('Please fill in all booking fields.');
      return;
    }
    try {
      setLoading(true);
      setError('');
      setMessage('');
      await apiService.createInquiry({
        tutor_id: tutorId,
        subject,
        class_name: className,
        hours_per_week: parseInt(hoursPerWeek),
        monthly_budget: parseFloat(monthlyBudget),
        preferred_timing: preferredTiming,
        weaknesses
      });
      setMessage('Inquiry sent successfully! The tutor will contact you to schedule a demo class.');
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail || 
        'Failed to submit booking inquiry. Make sure you are logged in as a Parent.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto my-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl dark:shadow-2xl relative transition-colors duration-250">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-zinc-500/10 dark:bg-white/5 rounded-full blur-[80px] pointer-events-none" />
      
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Book Tuition Inquiry</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Submit your learning needs and preferred timeslot</p>
      </div>

      {message ? (
        <div className="space-y-6 text-center">
          <div className="bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl text-zinc-900 dark:text-zinc-300 text-sm font-extrabold border-l-4 border-black dark:border-white">
            {message}
          </div>
          <button
            onClick={() => navigateTo('dashboard')}
            className="px-6 py-3 bg-black hover:bg-zinc-900 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-black font-extrabold text-xs rounded-xl shadow-md border border-zinc-950 dark:border-zinc-50"
          >
            Go to Dashboard
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 p-3.5 rounded-xl flex gap-2.5 text-zinc-900 dark:text-zinc-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-zinc-650 dark:text-zinc-400" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-2">Syllabus Subject</label>
            <div className="relative">
              <BookOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="e.g. Mathematics"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 focus:border-black dark:focus:border-white rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-2">Student Class Level</label>
            <div className="relative">
              <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 focus:border-black dark:focus:border-white rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 dark:text-slate-100 focus:outline-none"
              >
                <option value="">Select Grade Class...</option>
                <option value="Class 6">Class 6th</option>
                <option value="Class 7">Class 7th</option>
                <option value="Class 8">Class 8th</option>
                <option value="Class 9">Class 9th</option>
                <option value="Class 10">Class 10th</option>
                <option value="Class 11">Class 11th</option>
                <option value="Class 12">Class 12th</option>
                <option value="Graduation">Graduation / Engineering</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-2">Hours Per Week</label>
              <div className="relative">
                <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="number"
                  value={hoursPerWeek}
                  onChange={(e) => setHoursPerWeek(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 focus:border-black dark:focus:border-white rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 dark:text-slate-100 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-2">Monthly Budget (₹)</label>
              <div className="relative">
                <Wallet className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="number"
                  value={monthlyBudget}
                  onChange={(e) => setMonthlyBudget(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 focus:border-black dark:focus:border-white rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 dark:text-slate-100 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-2">Preferred Timing Slot</label>
            <input
              type="text"
              placeholder="e.g. Weekends 10 AM - 12 PM"
              value={preferredTiming}
              onChange={(e) => setPreferredTiming(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 focus:border-black dark:focus:border-white rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-2">Student Weaknesses / Focus Areas</label>
            <textarea
              placeholder="Describe any particular concepts, exams, or homework types the student struggles with..."
              value={weaknesses}
              onChange={(e) => setWeaknesses(e.target.value)}
              className="w-full h-24 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 focus:border-black dark:focus:border-white rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 py-3 bg-black hover:bg-zinc-900 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-black font-extrabold text-xs rounded-xl shadow-lg transition-all disabled:opacity-50 border border-zinc-950 dark:border-zinc-50"
          >
            {loading ? 'Submitting...' : 'Send Tuition Inquiry'}
          </button>
        </form>
      )}
    </div>
  );
}
