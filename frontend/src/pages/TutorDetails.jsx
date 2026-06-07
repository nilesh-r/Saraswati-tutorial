import React, { useState, useEffect } from 'react';
import { Star, ShieldCheck, MapPin, IndianRupee, Clock, Calendar, AlertCircle } from 'lucide-react';
import { apiService } from '../utils/api';

export default function TutorDetails({ tutorId, navigateTo, setSelectedTutorId }) {
  const [tutor, setTutor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadTutor = async () => {
      if (!tutorId) return;
      try {
        setLoading(true);
        setError('');
        const data = await apiService.getTutorDetails(tutorId);
        setTutor(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load tutor detailed profile.');
      } finally {
        setLoading(false);
      }
    };
    loadTutor();
  }, [tutorId]);

  if (loading) {
    return <div className="max-w-4xl mx-auto p-12 text-center text-slate-500 dark:text-slate-400">Loading profile details...</div>;
  }

  if (error || !tutor) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center text-zinc-650 dark:text-zinc-400 flex gap-2 justify-center items-center font-extrabold">
        <AlertCircle className="w-5 h-5" />
        <span>{error || "Tutor profile not found."}</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 transition-colors duration-250">
      {/* Bio Profile Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl relative overflow-hidden flex flex-col md:flex-row gap-8 items-start shadow-sm">
        <div className="absolute top-0 right-0 w-64 h-64 bg-zinc-500/5 dark:bg-white/5 rounded-full blur-[100px] pointer-events-none" />
        
        {/* Avatar Placeholder */}
        <div className="w-24 h-24 rounded-2xl bg-black dark:bg-zinc-800 flex items-center justify-center text-white text-3xl font-extrabold shadow-lg shrink-0">
          {tutor.name.split(' ').map(n => n[0]).join('')}
        </div>

        <div className="space-y-4 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{tutor.name}</h2>
            {tutor.verification_status === 'verified' && (
              <span className="flex items-center gap-1 text-[10px] bg-black text-white dark:bg-white dark:text-black border border-zinc-800 dark:border-zinc-200 px-3 py-1 rounded-full font-extrabold uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Tutor</span>
              </span>
            )}
          </div>

          <p className="text-zinc-600 dark:text-zinc-400 font-bold text-sm">{tutor.qualification}</p>

          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
            {tutor.bio || "Experienced educator dedicated to academic preparation and conceptual study methods."}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
            <div>
              <span className="block text-[9px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider mb-1">Hourly Fee</span>
              <span className="text-slate-800 dark:text-white font-extrabold text-sm">₹{tutor.rate_per_hour}/hr</span>
            </div>
            <div>
              <span className="block text-[9px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider mb-1">Experience</span>
              <span className="text-slate-800 dark:text-white font-extrabold text-sm">{tutor.experience_years} Years</span>
            </div>
            <div>
              <span className="block text-[9px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider mb-1">Rating</span>
              <span className="text-zinc-900 dark:text-zinc-100 font-bold text-sm flex items-center gap-1">
                <Star className="w-4 h-4 fill-black dark:fill-white text-zinc-900 dark:text-zinc-100" />
                <span>{tutor.rating > 0 ? tutor.rating : "New"}</span>
              </span>
            </div>
            <div>
              <span className="block text-[9px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider mb-1">Location</span>
              <span className="text-slate-800 dark:text-white font-bold truncate block">{tutor.location}</span>
            </div>
          </div>

          <button
            onClick={() => {
              setSelectedTutorId(tutor.user_id);
              navigateTo('book-tutor');
            }}
            className="px-6 py-3 bg-black hover:bg-zinc-900 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-black font-extrabold text-xs rounded-xl shadow-md border border-zinc-900 dark:border-zinc-100 transition-all"
          >
            Schedule Free Demo Lesson
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Academic Details */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl space-y-6">
          <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Subjects & Coverage</h3>

          <div className="space-y-4">
            <div>
              <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider mb-2">Syllabus Subjects</span>
              <div className="flex flex-wrap gap-2">
                {tutor.subjects?.map((sub, i) => (
                  <span key={i} className="text-xs bg-slate-50 dark:bg-slate-950 px-3 py-1.5 rounded-lg text-zinc-900 dark:text-zinc-100 border border-slate-200 dark:border-slate-800 font-bold">{sub}</span>
                ))}
              </div>
            </div>

            <div>
              <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider mb-2">Grade Classes</span>
              <div className="flex flex-wrap gap-2">
                {tutor.classes?.map((cl, i) => (
                  <span key={i} className="text-xs bg-slate-50 dark:bg-slate-950 px-3 py-1.5 rounded-lg text-zinc-900 dark:text-zinc-100 border border-slate-200 dark:border-slate-800 font-bold">{cl}</span>
                ))}
              </div>
            </div>

            <div>
              <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider mb-2">Availability Timing Slots</span>
              <div className="flex flex-wrap gap-2">
                {tutor.availability?.map((av, i) => (
                  <span key={i} className="text-xs bg-slate-50 dark:bg-slate-950 px-3 py-1.5 rounded-lg text-zinc-900 dark:text-zinc-100 border border-slate-200 dark:border-slate-800 font-bold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-zinc-650" />
                    <span>{av}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Demo Video Mockup */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl space-y-4">
          <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Introductory Demo Session</h3>
          <div className="aspect-video bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center p-4">
            <span className="text-xs text-slate-700 dark:text-slate-300 font-bold mb-1">Teaching Demo Video Frame</span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 max-w-[200px] leading-relaxed">Interactive trial classes are evaluated before verifying listings.</span>
          </div>
        </div>
      </div>

      {/* Reviews Log */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl space-y-6">
        <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Parent & Student Reviews ({tutor.reviews_count || 0})</h3>
        
        {tutor.reviews && tutor.reviews.length > 0 ? (
          <div className="space-y-4 divide-y divide-slate-200 dark:divide-slate-850">
            {tutor.reviews.map((rev, idx) => (
              <div key={idx} className={`${idx > 0 ? 'pt-4' : ''} space-y-2`}>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-800 dark:text-white">{rev.parent_name}</span>
                  <div className="flex items-center gap-0.5 text-zinc-900 dark:text-zinc-100">
                    <Star className="w-3.5 h-3.5 fill-black dark:fill-white text-zinc-900 dark:text-zinc-100" />
                    <span className="text-xs font-bold">{rev.rating}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 italic">"{rev.comment}"</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 dark:text-slate-500 italic">No reviews have been posted for this tutor yet.</p>
        )}
      </div>

    </div>
  );
}
