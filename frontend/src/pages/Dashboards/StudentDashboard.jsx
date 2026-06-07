import React, { useState, useEffect } from 'react';
import { 
  Calendar, FileText, Award, MessageSquare, BookOpen, Clock, 
  AlertCircle, CheckCircle, User, LogOut, LayoutDashboard, ChevronRight, BarChart2,
  Sun, Moon
} from 'lucide-react';
import { apiService } from '../../utils/api';

export default function StudentDashboard({ theme, toggleTheme }) {
  const [activeTab, setActiveTab] = useState('overview'); // overview, classes, schedule, assignments, tests, chat, profile
  const [schedule, setSchedule] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [studentName, setStudentName] = useState('Student');

  // Form states for assignment submission
  const [submitUrls, setSubmitUrls] = useState({});

  // Chat states
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [chatInput, setChatInput] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const me = await apiService.getMe();
      if (me) {
        setStudentName(me.name);
      }

      const sched = await apiService.getSchedule();
      setSchedule(sched);

      const assigs = await apiService.getAssignments();
      setAssignments(assigs);

      const marks = await apiService.getGrades();
      setGrades(marks);

      const conts = await apiService.getContacts();
      setContacts(conts);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch student dashboard records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Poll chat history
  useEffect(() => {
    let timer;
    if (selectedContact) {
      const fetchHistory = async () => {
        try {
          const chatHist = await apiService.getChatHistory(selectedContact.id);
          setChatHistory(chatHist);
        } catch (err) {
          console.error("Chat loading failed", err);
        }
      };
      fetchHistory();
      timer = setInterval(fetchHistory, 5000);
    }
    return () => clearInterval(timer);
  }, [selectedContact]);

  const handleSubmitAssignment = async (e, assignmentId) => {
    e.preventDefault();
    const url = submitUrls[assignmentId];
    if (!url || !url.trim()) {
      setError('Please provide a Google Drive / PDF url for homework submission.');
      return;
    }
    try {
      setMessage('');
      setError('');
      await apiService.submitAssignment(assignmentId, url);
      setMessage('Homework assignment submitted successfully.');
      setSubmitUrls(prev => ({ ...prev, [assignmentId]: '' }));
      loadData();
    } catch (err) {
      console.error(err);
      setError('Failed to submit assignment.');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !selectedContact) return;
    try {
      await apiService.sendMessage(selectedContact.id, chatInput);
      setChatInput('');
      const hist = await apiService.getChatHistory(selectedContact.id);
      setChatHistory(hist);
    } catch (err) {
      console.error(err);
      setError('Failed to send message.');
    }
  };

  const handleLogout = () => {
    apiService.logout();
    window.location.reload();
  };

  // Find upcoming class details
  const getUpcomingClass = () => {
    if (schedule.length === 0) return null;
    return schedule[0]; // simple mock upcoming class
  };

  const upcomingClass = getUpcomingClass();

  // Sidebar navigation lists
  const sidebarItems = [
    { id: 'overview', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'classes', label: 'My Classes', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'schedule', label: 'Schedule', icon: <Calendar className="w-4 h-4" /> },
    { id: 'assignments', label: 'Assignments', icon: <FileText className="w-4 h-4" /> },
    { id: 'tests', label: 'Tests & Reports', icon: <Award className="w-4 h-4" /> },
    { id: 'chat', label: 'Messages', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> }
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-80px)] gap-8 max-w-7xl mx-auto p-6 text-zinc-900 dark:text-zinc-100 transition-colors duration-250">
      
      {/* 1. Sidebar Panel */}
      <div className="w-full md:w-64 shrink-0 glass-panel rounded-3xl p-6 h-fit shadow-sm space-y-6">
        <div className="flex items-center justify-between px-2 pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
            <span className="font-extrabold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">Student Portal</span>
          </div>
          {toggleTheme && (
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-blue-500 transition-colors"
              title={theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-500" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>

        <nav className="space-y-1">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === item.id 
                  ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-l-4 border-blue-600 shadow-sm' 
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/40 hover:text-blue-500'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-red-500 hover:bg-red-500 hover:bg-red-500/10 transition-all mt-6 border border-transparent hover:border-red-500/20"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </nav>
      </div>

      {/* 2. Main content area */}
      <div className="flex-1 space-y-6">
        
        {/* Banner with Blue Gradient Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-3xl shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
          <h2 className="text-2xl font-extrabold tracking-tight">Welcome, {studentName}!</h2>
          <p className="text-blue-100 text-xs sm:text-sm mt-1">Keep learning and stay consistent.</p>
        </div>

        {message && (
          <div className="bg-teal-500/10 border border-teal-500/30 p-4 rounded-xl text-teal-700 dark:text-teal-400 text-sm font-semibold">
            {message}
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl text-red-700 dark:text-red-400 text-sm flex gap-2 font-semibold">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Dashboard Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Top Cards grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              
              {/* Upcoming Class */}
              <div className="glass-card p-5 rounded-2xl flex items-center justify-between shadow-sm">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">Upcoming Class</span>
                  <span className="text-sm font-extrabold text-blue-600 dark:text-blue-400 block">
                    {upcomingClass ? upcomingClass.subject : 'No classes today'}
                  </span>
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block">
                    {upcomingClass ? `${upcomingClass.date} • ${upcomingClass.start_time}` : 'All caught up'}
                  </span>
                </div>
                <Calendar className="w-8 h-8 text-blue-500" />
              </div>

              {/* Attendance */}
              <div className="glass-card p-5 rounded-2xl flex items-center justify-between shadow-sm">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">Attendance</span>
                  <span className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 block">85%</span>
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block">This Month</span>
                </div>
                <Clock className="w-8 h-8 text-blue-500" />
              </div>

              {/* Average Score */}
              <div className="glass-card p-5 rounded-2xl flex items-center justify-between shadow-sm">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">Average Score</span>
                  <span className="text-2xl font-extrabold text-[#7c3aed] dark:text-purple-400 block">78%</span>
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block">This Month</span>
                </div>
                <Award className="w-8 h-8 text-[#7c3aed] dark:text-purple-400" />
              </div>

            </div>

            {/* Split panel: Recent Assignments & Brief Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Recent Assignments list */}
              <div className="lg:col-span-2 glass-card p-6 rounded-2xl shadow-sm space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-zinc-200 dark:border-zinc-800">
                  <h3 className="font-extrabold text-sm sm:text-base text-zinc-950 dark:text-white">Recent Assignments</h3>
                  <button onClick={() => setActiveTab('assignments')} className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-extrabold">View All</button>
                </div>

                {assignments.length > 0 ? (
                  <div className="space-y-3">
                    {assignments.slice(0, 3).map((ass) => (
                      <div key={ass._id} className="p-4 bg-white/20 dark:bg-black/20 rounded-xl border border-zinc-200/50 dark:border-zinc-800 flex justify-between items-center gap-4">
                        <div className="min-w-0">
                          <span className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-white block truncate">{ass.title}</span>
                          <span className="text-[10px] text-zinc-500 block truncate">{ass.description}</span>
                          <span className="text-[10px] text-zinc-500 font-medium block mt-0.5">Due: {ass.due_date}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase shrink-0 border ${
                          ass.status === 'graded' 
                            ? 'bg-teal-50 dark:bg-teal-950/40 text-teal-600 border-teal-200 dark:border-teal-900/60'
                            : ass.status === 'submitted'
                            ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 border-blue-200 dark:border-blue-900/60'
                            : 'bg-red-50 dark:bg-red-950/40 text-red-600 border-red-200 dark:border-red-900/60'
                        }`}>
                          {ass.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-zinc-500 text-xs">No assignments found.</div>
                )}
              </div>

              {/* Right Column: Mini test score list */}
              <div className="glass-card p-6 rounded-2xl shadow-sm space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-zinc-200 dark:border-zinc-800">
                  <h3 className="font-extrabold text-sm sm:text-base text-zinc-950 dark:text-white">Test Scores</h3>
                  <button onClick={() => setActiveTab('tests')} className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-extrabold">View All</button>
                </div>

                {grades.length > 0 ? (
                  <div className="space-y-3">
                    {grades.slice(0, 3).map((g) => (
                      <div key={g._id} className="p-3 bg-white/20 dark:bg-black/20 rounded-xl border border-zinc-200/50 dark:border-zinc-800 flex justify-between items-center">
                        <div className="min-w-0">
                          <span className="font-bold text-xs text-zinc-900 dark:text-white block truncate">{g.test_name}</span>
                          <span className="text-[9px] text-zinc-500 block">{g.date}</span>
                        </div>
                        <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400">
                          {g.obtained_marks}/{g.max_marks}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-zinc-500 text-xs">No test logs found.</div>
                )}
              </div>

            </div>

          </div>
        )}

        {/* Classes list */}
        {activeTab === 'classes' && (
          <div className="glass-card rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-lg text-zinc-950 dark:text-white pb-2 border-b border-zinc-200 dark:border-zinc-800">My Tuitions Classrooms</h3>
            
            {schedule.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from(new Set(schedule.map(s => s.subject))).map((subj, idx) => {
                  const details = schedule.find(s => s.subject === subj);
                  return (
                    <div key={idx} className="p-5 bg-white/25 dark:bg-black/25 rounded-2xl border border-zinc-200/50 dark:border-zinc-800 space-y-4 flex flex-col justify-between">
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded uppercase w-fit block">{details.class || 'All levels'}</span>
                        <h4 className="font-extrabold text-zinc-950 dark:text-white text-base">{subj}</h4>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">Tutor: <span className="font-bold text-zinc-900 dark:text-zinc-100">{details.tutor_name}</span></p>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setActiveTab('chat')}
                          className="flex-1 py-2 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-200 text-xs font-bold rounded-lg transition-colors"
                        >
                          Message Tutor
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-zinc-500 text-xs">No active tuition enrollment.</div>
            )}
          </div>
        )}

        {/* Schedule */}
        {activeTab === 'schedule' && (
          <div className="glass-card rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-lg text-zinc-950 dark:text-white pb-2 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              <span>Weekly Lecture Slots</span>
            </h3>

            {schedule.length > 0 ? (
              <div className="space-y-3">
                {schedule.map((slot) => (
                  <div key={slot._id} className="p-4 bg-white/25 dark:bg-black/25 rounded-2xl border border-zinc-200/50 dark:border-zinc-800 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                    <div>
                      <span className="text-sm font-extrabold text-zinc-950 dark:text-white block">{slot.subject}</span>
                      <span className="text-[11px] text-zinc-500">Tutor: {slot.tutor_name}</span>
                    </div>
                    <div className="sm:text-right">
                      <span className="text-xs text-blue-600 dark:text-blue-400 font-extrabold block">{slot.date}</span>
                      <span className="text-[11px] text-zinc-500">{slot.start_time} - {slot.end_time}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-zinc-500 text-xs">No tuition sessions scheduled.</div>
            )}
          </div>
        )}

        {/* Assignments page */}
        {activeTab === 'assignments' && (
          <div className="glass-card rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-lg text-zinc-950 dark:text-white pb-2 border-b border-zinc-200 dark:border-zinc-800">Homework & Assignments</h3>

            {assignments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-white/35 dark:bg-black/35 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 text-[10px] font-bold uppercase tracking-wider">
                      <th className="px-4 py-3">Title & Details</th>
                      <th className="px-4 py-3">Due Date</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Submission link</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200/50 dark:divide-zinc-850 text-zinc-600 dark:text-zinc-300">
                    {assignments.map((ass) => (
                      <tr key={ass._id} className="hover:bg-white/10 dark:hover:bg-black/10">
                        <td className="px-4 py-4">
                          <span className="font-bold text-zinc-900 dark:text-white block">{ass.title}</span>
                          <span className="text-[10px] text-zinc-500 block mt-0.5">{ass.description}</span>
                        </td>
                        <td className="px-4 py-4 font-semibold text-zinc-500">{ass.due_date}</td>
                        <td className="px-4 py-4">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase border ${
                            ass.status === 'graded' 
                              ? 'bg-teal-50 dark:bg-teal-950/40 text-teal-600 border-teal-200 dark:border-teal-900/60'
                              : ass.status === 'submitted'
                              ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 border-blue-200 dark:border-blue-900/60'
                              : 'bg-red-50 dark:bg-red-950/40 text-red-600 border-red-200 dark:border-red-900/60'
                          }`}>
                            {ass.status}
                          </span>
                          {ass.status === 'graded' && (
                            <span className="block text-[9px] text-teal-600 dark:text-teal-400 font-extrabold mt-1">Score: {ass.obtained_marks}%</span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-right">
                          {ass.status === 'issued' ? (
                            <form 
                              onSubmit={(e) => handleSubmitAssignment(e, ass._id)}
                              className="flex justify-end gap-2"
                            >
                              <input
                                type="text"
                                placeholder="Google Drive / PDF URL..."
                                value={submitUrls[ass._id] || ''}
                                onChange={(e) => setSubmitUrls(prev => ({ ...prev, [ass._id]: e.target.value }))}
                                className="glass-input px-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 rounded-lg focus:outline-none w-48 placeholder-zinc-400 focus:border-blue-500 focus:dark:border-blue-400"
                              />
                              <button
                                type="submit"
                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-sm"
                              >
                                Submit
                              </button>
                            </form>
                          ) : (
                            <div className="flex justify-end items-center gap-1 text-[11px] text-zinc-400">
                              <CheckCircle className="w-3.5 h-3.5 text-teal-500" />
                              <span className="truncate max-w-[120px]" title={ass.submission_url}>
                                {ass.submission_url ? ass.submission_url.replace(/(^\w+:|^)\/\//, '').substring(0, 15) + '...' : 'Submitted'}
                              </span>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-8 text-center text-zinc-500">No issued homework assignments.</div>
            )}
          </div>
        )}

        {/* Tests & Reports */}
        {activeTab === 'tests' && (
          <div className="glass-card rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-lg text-zinc-950 dark:text-white pb-2 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-2">
              <Award className="w-5 h-5 text-blue-500" />
              <span>Academic Test Tracker</span>
            </h3>

            {grades.length > 0 ? (
              <div className="space-y-3">
                {grades.map((g) => (
                  <div key={g._id} className="p-4 bg-white/20 dark:bg-black/20 rounded-2xl border border-zinc-200/50 dark:border-zinc-800 flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-extrabold text-zinc-950 dark:text-white">{g.test_name}</span>
                      <span className="text-sm font-extrabold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 px-3 py-1 rounded-xl">
                        Score: {g.obtained_marks} / {g.max_marks} ({Math.round((g.obtained_marks / g.max_marks) * 100)}%)
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-zinc-500">
                      <span>Date logged: {g.date}</span>
                    </div>
                    {g.feedback && (
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 italic mt-1 bg-white/35 dark:bg-black/35 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded-lg">
                        Tutor Feedback: "{g.feedback}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-zinc-500">No graded test records.</div>
            )}
          </div>
        )}

        {/* Chat message logs */}
        {activeTab === 'chat' && (
          <div className="glass-card rounded-3xl overflow-hidden grid grid-cols-1 md:grid-cols-3 h-[500px] shadow-sm">
            {/* Contacts */}
            <div className="border-r border-zinc-200 dark:border-zinc-800 p-4 space-y-2 overflow-y-auto bg-white/10 dark:bg-black/10">
              <h4 className="font-extrabold text-zinc-400 dark:text-zinc-500 text-[10px] uppercase tracking-wider mb-4 px-2">Contacts</h4>
              {contacts.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedContact(c)}
                  className={`w-full text-left p-3 rounded-xl transition-all border flex gap-3 items-center ${
                    selectedContact?.id === c.id 
                      ? 'bg-blue-500/10 text-blue-600 border-blue-200/50 shadow-sm' 
                      : 'bg-white/40 dark:bg-black/40 border-zinc-200 dark:border-zinc-800 hover:bg-white/70 dark:hover:bg-black/70'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 select-none ${
                    selectedContact?.id === c.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                  }`}>
                    {c.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-bold text-xs truncate block">{c.name}</span>
                    <span className={`text-[10px] truncate block mt-0.5 ${
                      selectedContact?.id === c.id ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-zinc-500'
                    }`}>{c.last_message}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Chat Box */}
            <div className="md:col-span-2 flex flex-col justify-between bg-white/5 dark:bg-black/5 h-full">
              {selectedContact ? (
                <>
                  <div className="px-6 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-white/20 dark:bg-black/20 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                    <span className="font-bold text-zinc-900 dark:text-white text-xs">{selectedContact.name}</span>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 space-y-3">
                    {chatHistory.map((chat) => (
                      <div 
                        key={chat._id} 
                        className={`flex flex-col max-w-[75%] ${
                          chat.sender_id === selectedContact.id ? 'mr-auto items-start' : 'ml-auto items-end'
                        }`}
                      >
                        <div className={`px-4 py-2 rounded-xl text-xs leading-relaxed ${
                          chat.sender_id === selectedContact.id
                            ? 'bg-white/60 dark:bg-black/60 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-tl-none shadow-sm'
                            : 'bg-blue-600 text-white rounded-tr-none shadow-md font-semibold'
                        }`}>
                          {chat.message}
                        </div>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleSendMessage} className="p-4 bg-white/40 dark:bg-black/40 border-t border-zinc-200 dark:border-zinc-800 flex gap-2">
                    <input
                      type="text"
                      placeholder="Type message..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      className="flex-1 glass-input rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl"
                    >
                      Send
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-zinc-500 text-xs gap-2">
                  <MessageSquare className="w-8 h-8 text-zinc-400" />
                  <span>Select a contact to start chatting.</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Profile Details */}
        {activeTab === 'profile' && (
          <div className="glass-card rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-lg text-zinc-950 dark:text-white pb-2 border-b border-zinc-200 dark:border-zinc-800">Student Profile Credentials</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs max-w-xl">
              <div className="p-4 bg-white/20 dark:bg-black/20 rounded-2xl border border-zinc-200/50 dark:border-zinc-800 space-y-1">
                <span className="text-[10px] text-zinc-400 font-bold block">STUDENT NAME</span>
                <span className="font-bold text-zinc-900 dark:text-white block text-sm">{studentName}</span>
              </div>
              
              <div className="p-4 bg-white/20 dark:bg-black/20 rounded-2xl border border-zinc-200/50 dark:border-zinc-800 space-y-1">
                <span className="text-[10px] text-zinc-400 font-bold block">PORTAL ACCESSIBILITY</span>
                <span className="font-bold text-blue-600 dark:text-blue-400 block text-sm">Student Account (Active)</span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
