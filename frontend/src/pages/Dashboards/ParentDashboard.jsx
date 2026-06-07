import React, { useState, useEffect } from 'react';
import { 
  Sparkles, BrainCircuit, CreditCard, MessageSquare, TrendingUp, Search, 
  User, Clock, AlertCircle, LogOut, LayoutDashboard, Calendar, BarChart2, Award,
  Sun, Moon
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { apiService } from '../../utils/api';

export default function ParentDashboard({ navigateTo, setSelectedTutorId, theme, toggleTheme }) {
  const [activeTab, setActiveTab] = useState('overview'); // overview, children, performance, attendance, invoices, chat, ai-guidance, profile
  const [invoices, setInvoices] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  
  // AI Recommendation form states
  const [recSubject, setRecSubject] = useState('');
  const [recClass, setRecClass] = useState('');
  const [recBudget, setRecBudget] = useState('');
  const [recLocation, setRecLocation] = useState('');
  const [recWeakness, setRecWeakness] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [recLoading, setRecLoading] = useState(false);

  // Chat states
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [chatInput, setChatInput] = useState('');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [parentName, setParentName] = useState('Parent');

  // Chart data for visual progress tracking
  const progressData = [
    { name: 'Week 1', score: 65 },
    { name: 'Week 2', score: 72 },
    { name: 'Week 3', score: 70 },
    { name: 'Week 4', score: 78 },
    { name: 'Week 5', score: 85 }
  ];

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const me = await apiService.getMe();
      if (me) {
        setParentName(me.name);
      }

      const invs = await apiService.getInvoices();
      setInvoices(invs);

      const anal = await apiService.getAnalytics();
      setAnalytics(anal);

      const conts = await apiService.getContacts();
      setContacts(conts);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch parent dashboard records.');
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
          const hist = await apiService.getChatHistory(selectedContact.id);
          setChatHistory(hist);
        } catch (err) {
          console.error("Chat loading failed", err);
        }
      };
      fetchHistory();
      timer = setInterval(fetchHistory, 5000);
    }
    return () => clearInterval(timer);
  }, [selectedContact]);

  const handlePay = async (invoiceId) => {
    try {
      setMessage('');
      setError('');
      await apiService.payInvoice(invoiceId, 'UPI');
      setMessage('Invoice paid successfully. Payment receipt updated.');
      loadData();
    } catch (err) {
      console.error(err);
      setError('Payment gateway error. Please try again.');
    }
  };

  const handleRecommendationSubmit = async (e) => {
    e.preventDefault();
    if (!recSubject || !recClass || !recBudget) {
      setError('Subject, Class, and Budget are required for AI recommendation.');
      return;
    }
    try {
      setRecLoading(true);
      setError('');
      const results = await apiService.getAiRecommendations({
        subject: recSubject,
        class_name: recClass,
        budget: parseFloat(recBudget),
        location: recLocation,
        weaknesses: recWeakness
      });
      setRecommendations(results);
    } catch (err) {
      console.error(err);
      setError('Recommendation engine failed. Please try again.');
    } finally {
      setRecLoading(false);
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

  const handleHire = (tutorId) => {
    setSelectedTutorId(tutorId);
    navigateTo('book-tutor');
  };

  const handleLogout = () => {
    apiService.logout();
    window.location.reload();
  };

  // Sidebar list items
  const sidebarItems = [
    { id: 'overview', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'children', label: 'My Children', icon: <User className="w-4 h-4" /> },
    { id: 'performance', label: 'Performance', icon: <BarChart2 className="w-4 h-4" /> },
    { id: 'attendance', label: 'Attendance', icon: <Clock className="w-4 h-4" /> },
    { id: 'invoices', label: 'Payments', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'chat', label: 'Messages', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'ai-guidance', label: 'AI Guidance', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> }
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-80px)] gap-8 max-w-7xl mx-auto p-6 text-zinc-900 dark:text-zinc-100 transition-colors duration-250">
      
      {/* 1. Sidebar Panel */}
      <div className="w-full md:w-64 shrink-0 glass-panel rounded-3xl p-6 h-fit shadow-sm space-y-6">
        <div className="flex items-center justify-between px-2 pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-extrabold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">Parent Portal</span>
          </div>
          {toggleTheme && (
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-emerald-500 transition-colors"
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
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-l-4 border-emerald-600 shadow-sm' 
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/40 hover:text-emerald-500'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-red-500 hover:bg-red-500/10 transition-all mt-6 border border-transparent hover:border-red-500/20"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </nav>
      </div>

      {/* 2. Main Area */}
      <div className="flex-1 space-y-6">
        
        {/* Welcome Gradient Header Bar */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6 rounded-3xl shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
          <div className="z-10">
            <h2 className="text-2xl font-extrabold tracking-tight">Welcome, {parentName}!</h2>
            <p className="text-emerald-100 text-xs sm:text-sm mt-1">Track your child's academic progress.</p>
          </div>
          <div className="bg-emerald-800/60 border border-emerald-500 px-4 py-2 rounded-xl text-xs z-10">
            <span className="text-emerald-200 mr-2 font-semibold">Child:</span>
            <select className="bg-transparent font-bold focus:outline-none cursor-pointer text-white">
              <option value="aryan" className="bg-emerald-800 text-white">Aryan Sharma</option>
            </select>
          </div>
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
            
            {/* Stats grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              
              <div className="glass-card p-5 rounded-2xl flex items-center justify-between shadow-sm">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">Overall Progress</span>
                  <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 block">Good</span>
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block">Keep it up!</span>
                </div>
                <TrendingUp className="w-8 h-8 text-emerald-500" />
              </div>

              <div className="glass-card p-5 rounded-2xl flex items-center justify-between shadow-sm">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">Attendance</span>
                  <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 block">
                    {analytics?.attendance_percentage || 85}%
                  </span>
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block">This Month</span>
                </div>
                <Clock className="w-8 h-8 text-emerald-500" />
              </div>

              <div className="glass-card p-5 rounded-2xl flex items-center justify-between shadow-sm">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">Performance</span>
                  <span className="text-2xl font-extrabold text-[#7c3aed] dark:text-purple-400 block">
                    {analytics?.average_score || 78}%
                  </span>
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block">This Month</span>
                </div>
                <Award className="w-8 h-8 text-[#7c3aed] dark:text-purple-400" />
              </div>

            </div>

            {/* Split layout: Recharts chart & Subject progress */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Performance Overview (Chart) */}
              <div className="lg:col-span-2 glass-card p-6 rounded-2xl shadow-sm space-y-4">
                <h3 className="font-extrabold text-sm sm:text-base text-zinc-950 dark:text-white pb-2 border-b border-zinc-200 dark:border-zinc-800">Performance Overview</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={progressData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#27272a' : '#e4e4e7'} />
                      <XAxis dataKey="name" stroke="#71717a" fontSize={10} tickLine={false} />
                      <YAxis stroke="#71717a" fontSize={10} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: theme === 'dark' ? '#09090b' : '#ffffff', borderColor: theme === 'dark' ? '#27272a' : '#e4e4e7', color: theme === 'dark' ? '#ffffff' : '#000000' }} />
                      <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={3} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Subject Progress */}
              <div className="glass-card p-6 rounded-2xl shadow-sm space-y-5">
                <h3 className="font-extrabold text-sm sm:text-base text-zinc-950 dark:text-white pb-2 border-b border-zinc-200 dark:border-zinc-800">Subject Progress</h3>
                
                <div className="space-y-4">
                  {[
                    { sub: 'Mathematics', score: 85, color: 'bg-emerald-500' },
                    { sub: 'Science', score: 72, color: 'bg-teal-500' },
                    { sub: 'English', score: 70, color: 'bg-indigo-500' }
                  ].map((subject, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold text-zinc-700 dark:text-zinc-300">
                        <span>{subject.sub}</span>
                        <span>{subject.score}%</span>
                      </div>
                      <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-2">
                        <div className={`${subject.color} h-2 rounded-full`} style={{ width: `${subject.score}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* AI Analysis Diagnostic note */}
            {analytics?.ai_analysis && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 p-5 rounded-2xl space-y-2">
                <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">AI Remedial Analysis</span>
                <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed italic">
                  "{analytics.ai_analysis}"
                </p>
              </div>
            )}

          </div>
        )}

        {/* Children details */}
        {activeTab === 'children' && (
          <div className="glass-card rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-lg text-zinc-950 dark:text-white pb-2 border-b border-zinc-200 dark:border-zinc-800">Enrolled Children</h3>
            <div className="p-5 bg-white/20 dark:bg-black/25 rounded-2xl border border-zinc-200/50 dark:border-zinc-800 flex gap-4 items-center max-w-md">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-extrabold text-lg select-none">
                AS
              </div>
              <div className="space-y-0.5">
                <span className="font-bold text-sm text-zinc-950 dark:text-white block">Aryan Sharma</span>
                <span className="text-xs text-zinc-500 block">Class 10 SSC Board</span>
                <span className="text-[10px] text-zinc-500 block font-medium">Enrolled subjects: Mathematics, Physics</span>
              </div>
            </div>
          </div>
        )}

        {/* Performance Logs */}
        {activeTab === 'performance' && (
          <div className="glass-card rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-lg text-zinc-950 dark:text-white pb-2 border-b border-zinc-200 dark:border-zinc-800">Academic Marks Log</h3>
            <div className="bg-white/20 dark:bg-black/25 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 text-xs space-y-2">
              <p className="text-zinc-500 font-medium">A weekly review of marks logged by tutors for home tests and examinations.</p>
            </div>
            {analytics?.recent_grades?.length > 0 ? (
              <div className="space-y-3">
                {analytics.recent_grades.map((grade, idx) => (
                  <div key={idx} className="p-4 bg-white/25 dark:bg-black/25 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-zinc-950 dark:text-white block text-sm">{grade.test_name}</span>
                      <span className="text-[10px] text-zinc-500 block">{grade.date}</span>
                    </div>
                    <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/20 px-3 py-1 rounded-xl">
                      {grade.obtained_marks} / {grade.max_marks}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-zinc-500 text-xs">No grades recorded.</div>
            )}
          </div>
        )}

        {/* Attendance log */}
        {activeTab === 'attendance' && (
          <div className="glass-card rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-lg text-zinc-950 dark:text-white pb-2 border-b border-zinc-200 dark:border-zinc-800">Attendance Log</h3>
            <p className="text-xs text-zinc-500">Log of completed tuition session slots and attendance markers.</p>
            
            {analytics?.attendance_log?.length > 0 ? (
              <div className="space-y-3">
                {analytics.attendance_log.map((log, idx) => (
                  <div key={idx} className="p-4 bg-white/25 dark:bg-black/25 rounded-2xl border border-zinc-200/50 dark:border-zinc-800 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-zinc-950 dark:text-white block text-sm">{log.subject}</span>
                      <span className="text-[10px] text-zinc-500 block">{log.date}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase border ${
                      log.attendance_status === 'present' 
                        ? 'bg-teal-50 dark:bg-teal-950/45 text-teal-600 border-teal-200' 
                        : 'bg-red-50 dark:bg-red-950/45 text-red-600 border-red-200'
                    }`}>
                      {log.attendance_status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-zinc-500 text-xs">No attendance sheets submitted yet.</div>
            )}
          </div>
        )}

        {/* Payments Invoices */}
        {activeTab === 'invoices' && (
          <div className="glass-card rounded-3xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-white/20 dark:bg-black/20">
              <h3 className="font-bold text-zinc-950 dark:text-white text-base">Invoices Ledger</h3>
            </div>

            {invoices.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-white/30 dark:bg-black/30 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 text-[10px] font-bold uppercase tracking-wider">
                      <th className="px-6 py-3.5">Invoice ID</th>
                      <th className="px-6 py-3.5">Tutor & Subject</th>
                      <th className="px-6 py-3.5">Amount</th>
                      <th className="px-6 py-3.5">Status</th>
                      <th className="px-6 py-3.5 text-right">Payment Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200/50 dark:divide-zinc-850 text-zinc-600 dark:text-zinc-300">
                    {invoices.map((inv) => (
                      <tr key={inv._id} className="hover:bg-white/10 dark:hover:bg-black/10">
                        <td className="px-6 py-4 font-mono">{inv._id.substring(0, 8)}...</td>
                        <td className="px-6 py-4 font-bold text-zinc-950 dark:text-white">
                          {inv.tutor_name}
                          <span className="block text-zinc-400 dark:text-zinc-500 text-[10px] font-normal">{inv.subject}</span>
                        </td>
                        <td className="px-6 py-4 font-extrabold">₹{inv.amount}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase border ${
                            inv.status === 'paid' 
                              ? 'bg-teal-50 dark:bg-teal-950/45 text-teal-700 border-teal-200' 
                              : 'bg-red-50 dark:bg-red-950/45 text-red-600 border-red-200'
                          }`}>
                            {inv.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {inv.status === 'unpaid' ? (
                            <button
                              onClick={() => handlePay(inv._id)}
                              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-sm"
                            >
                              Pay Now
                            </button>
                          ) : (
                            <span className="text-xs text-teal-600 dark:text-teal-400 font-bold flex justify-end gap-1 items-center">
                              <CreditCard className="w-3.5 h-3.5 text-teal-600" />
                              <span>Paid</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-10 text-center text-zinc-500">
                No invoices generated yet.
              </div>
            )}
          </div>
        )}

        {/* AI Guidance Matching Engine */}
        {activeTab === 'ai-guidance' && (
          <div className="space-y-6">
            
            {/* Form */}
            <form onSubmit={handleRecommendationSubmit} className="glass-card p-6 rounded-2xl shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-zinc-950 dark:text-white mb-2 flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-emerald-500 animate-pulse" />
                <span>AI-Powered Tutor Matching Engine</span>
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[10px] text-zinc-400 dark:text-zinc-500 font-bold mb-1 uppercase">Subject</label>
                  <input
                    type="text"
                    placeholder="e.g. Mathematics"
                    value={recSubject}
                    onChange={(e) => setRecSubject(e.target.value)}
                    className="w-full glass-input rounded-xl px-4 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-zinc-400 dark:text-zinc-500 font-bold mb-1 uppercase">Class Level</label>
                  <select
                    value={recClass}
                    onChange={(e) => setRecClass(e.target.value)}
                    className="w-full glass-input rounded-xl px-4 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">Choose Class...</option>
                    <option value="Class 10">Class 10th</option>
                    <option value="Class 12">Class 12th</option>
                    <option value="Graduation">Graduation / Engineering</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-zinc-400 dark:text-zinc-500 font-bold mb-1 uppercase">Max Budget (₹/hr)</label>
                  <input
                    type="number"
                    placeholder="e.g. 800"
                    value={recBudget}
                    onChange={(e) => setRecBudget(e.target.value)}
                    className="w-full glass-input rounded-xl px-4 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-zinc-400 dark:text-zinc-500 font-bold mb-1 uppercase">Your Locality</label>
                  <input
                    type="text"
                    placeholder="e.g. Dadar West"
                    value={recLocation}
                    onChange={(e) => setRecLocation(e.target.value)}
                    className="w-full glass-input rounded-xl px-4 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-zinc-400 dark:text-zinc-500 font-bold mb-1 uppercase">Student's Weaknesses / Learning Gaps</label>
                <input
                  type="text"
                  placeholder="e.g. struggles with organic chemistry equations / calculus derivatives"
                  value={recWeakness}
                  onChange={(e) => setRecWeakness(e.target.value)}
                  className="w-full glass-input rounded-xl px-4 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={recLoading}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
              >
                {recLoading ? 'AI is matching...' : 'Find Matches'}
              </button>
            </form>

            {/* Matches list */}
            {recommendations.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {recommendations.map((tutor) => (
                  <div key={tutor.profile_id} className="glass-card p-5 rounded-2xl flex flex-col justify-between shadow-sm gap-4">
                    <div>
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-extrabold text-zinc-950 dark:text-white text-base">{tutor.name}</h4>
                          <span className="text-xs text-zinc-600 dark:text-zinc-400 font-bold">{tutor.qualification}</span>
                        </div>
                        <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 px-2 py-0.5 rounded text-emerald-700 dark:text-emerald-400 font-extrabold">
                          Match Score: {tutor.match_score}%
                        </span>
                      </div>

                      <div className="bg-white/20 dark:bg-black/30 border border-zinc-200/50 dark:border-zinc-800 p-3 rounded-lg text-xs text-zinc-500 mt-3 leading-relaxed">
                        <span className="text-[9px] text-[#7c3aed] font-bold uppercase tracking-wider block mb-1">AI Recommendation Context</span>
                        {tutor.ai_explanation}
                      </div>
                    </div>

                    <button
                      onClick={() => handleHire(tutor.tutor_id)}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
                    >
                      Book Free Demo
                    </button>
                  </div>
                ))}
              </div>
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
                      ? 'bg-emerald-500/10 text-emerald-600 border-emerald-200/50 shadow-sm' 
                      : 'bg-white/40 dark:bg-black/40 border-zinc-200 dark:border-zinc-800 hover:bg-white/70 dark:hover:bg-black/70'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 select-none ${
                    selectedContact?.id === c.id
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                  }`}>
                    {c.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-bold text-xs truncate block">{c.name}</span>
                    <span className={`text-[10px] truncate block mt-0.5 ${
                      selectedContact?.id === c.id ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-zinc-500'
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
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
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
                            : 'bg-emerald-600 text-white rounded-tr-none shadow-md font-semibold'
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
                      className="flex-1 glass-input rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl"
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

        {/* Profile details */}
        {activeTab === 'profile' && (
          <div className="glass-card rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-lg text-zinc-950 dark:text-white pb-2 border-b border-zinc-200 dark:border-zinc-800">Parent Profile</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs max-w-xl">
              <div className="p-4 bg-white/20 dark:bg-black/20 rounded-2xl border border-zinc-200/50 dark:border-zinc-800 space-y-1">
                <span className="text-[10px] text-zinc-400 font-bold block">PARENT ACCOUNT NAME</span>
                <span className="font-bold text-zinc-900 dark:text-white block text-sm">{parentName}</span>
              </div>
              
              <div className="p-4 bg-white/20 dark:bg-black/20 rounded-2xl border border-zinc-200/50 dark:border-zinc-800 space-y-1">
                <span className="text-[10px] text-zinc-400 font-bold block">PORTAL ACCESSIBILITY</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 block text-sm">Parent Account (Active)</span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
