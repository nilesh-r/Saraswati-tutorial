import React, { useState, useEffect } from 'react';
import { Search, Star, Sparkles, SlidersHorizontal, MapPin, IndianRupee, BookOpen, ShieldCheck } from 'lucide-react';
import { apiService } from '../utils/api';

export default function TutorSearch({ navigateTo, setSelectedTutorId, prefilledParams = {} }) {
  const [subject, setSubject] = useState(prefilledParams.subject || '');
  const [className, setClassName] = useState(prefilledParams.class || '');
  const [location, setLocation] = useState(prefilledParams.location || '');
  const [maxRate, setMaxRate] = useState('');
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchTutors = async () => {
    try {
      setLoading(true);
      const params = {
        subject: subject || undefined,
        class_name: className || undefined,
        location: location || undefined,
        max_rate: maxRate ? parseFloat(maxRate) : undefined,
      };
      const data = await apiService.searchTutors(params);
      setTutors(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTutors();
  }, [prefilledParams]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTutors();
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 transition-colors duration-250">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Find Certified Tutors</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Search through verified home educators in Mumbai</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Filters Panel */}
        <form onSubmit={handleSearchSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl h-fit space-y-6 shadow-sm">
          <div className="flex items-center gap-2 text-slate-800 dark:text-white font-bold text-sm pb-4 border-b border-slate-200 dark:border-slate-800">
            <SlidersHorizontal className="w-4 h-4 text-black dark:text-white" />
            <span>Search Filters</span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-2">Subject</label>
              <input
                type="text"
                placeholder="e.g. Mathematics, Science"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 focus:border-black dark:focus:border-white rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-2">Grade Level</label>
              <select
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 focus:border-black dark:focus:border-white rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
              >
                <option value="">Any Grade</option>
                <option value="Class 6">Class 6th</option>
                <option value="Class 7">Class 7th</option>
                <option value="Class 8">Class 8th</option>
                <option value="Class 9">Class 9th</option>
                <option value="Class 10">Class 10th</option>
                <option value="Class 11">Class 11th</option>
                <option value="Class 12">Class 12th</option>
                <option value="Graduation">Graduation / B.Tech</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-2">Neighborhood Location</label>
              <input
                type="text"
                placeholder="e.g. Andheri, Dadar"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 focus:border-black dark:focus:border-white rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-2">Max Rate per Hour (₹)</label>
              <input
                type="number"
                placeholder="e.g. 1000"
                value={maxRate}
                onChange={(e) => setMaxRate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 focus:border-black dark:focus:border-white rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-black hover:bg-zinc-900 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-black border border-zinc-900 dark:border-zinc-100 font-bold text-xs rounded-xl shadow-md transition-all"
          >
            Apply Filters
          </button>
        </form>

        {/* Results Grid */}
        <div className="lg:col-span-3 space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl h-60 animate-pulse" />
              ))}
            </div>
          ) : tutors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tutors.map((tutor) => (
                <div 
                  key={tutor._id} 
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6.5 hover:border-black dark:hover:border-white hover:shadow-lg transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Name & verification */}
                    <div className="flex justify-between items-start mb-3.5">
                      <div>
                        <h3 className="font-extrabold text-slate-850 dark:text-white text-lg flex items-center gap-1.5">
                          <span>{tutor.name}</span>
                          {tutor.verification_status === 'verified' && (
                            <span className="text-[9px] bg-black text-white dark:bg-white dark:text-black border border-zinc-800 dark:border-zinc-200 px-2 py-0.5 rounded font-extrabold uppercase tracking-wider">
                              Verified
                            </span>
                          )}
                        </h3>
                        <p className="text-xs text-zinc-650 dark:text-zinc-400 font-bold">{tutor.qualification}</p>
                      </div>
                      <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-950 px-2 py-1 rounded text-zinc-900 dark:text-zinc-100 text-xs font-extrabold border border-slate-200 dark:border-slate-800">
                        <Star className="w-3.5 h-3.5 fill-black dark:fill-white text-zinc-900 dark:text-zinc-100" />
                        <span>{tutor.rating > 0 ? tutor.rating : "New"}</span>
                      </div>
                    </div>

                    <p className="text-slate-500 dark:text-slate-400 text-xs line-clamp-2 mb-4 leading-relaxed">
                      {tutor.bio || "Experienced educator dedicated to academic preparation and conceptual study methods."}
                    </p>

                    <div className="grid grid-cols-2 gap-3 text-xs text-slate-500 dark:text-slate-400 mb-6 bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                      <div>
                        <span className="block text-[9px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider mb-0.5">Experience</span>
                        <span className="text-slate-800 dark:text-white font-bold">{tutor.experience_years} Years</span>
                      </div>
                      <div>
                        <span className="block text-[9px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider mb-0.5">Rate</span>
                        <span className="text-slate-800 dark:text-white font-bold">₹{tutor.rate_per_hour}/hr</span>
                      </div>
                      <div className="col-span-2 pt-2 border-t border-slate-200 dark:border-slate-900">
                        <span className="block text-[9px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider mb-0.5">Locations</span>
                        <span className="text-slate-800 dark:text-white font-bold truncate block">{tutor.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedTutorId(tutor.user_id);
                        navigateTo('tutor-details');
                      }}
                      className="flex-1 px-3 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl border border-slate-200 dark:border-slate-800 transition-colors"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => {
                        setSelectedTutorId(tutor.user_id);
                        navigateTo('book-tutor');
                      }}
                      className="flex-1 px-3 py-2.5 bg-black hover:bg-zinc-900 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-black font-extrabold text-xs rounded-xl border border-zinc-900 dark:border-zinc-100 transition-all shadow"
                    >
                      Book Lessons
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-16 text-center">
              <p className="text-slate-500 dark:text-slate-400 text-xs">No tutors match the applied filter criteria.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
