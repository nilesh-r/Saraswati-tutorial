import React, { useState, useEffect } from 'react';
import { 
  Shield, Check, X, Users, UserCheck, AlertCircle, FileText, 
  IndianRupee, LogOut, LayoutDashboard, Settings, BarChart2,
  Sun, Moon
} from 'lucide-react';
import { apiService } from '../../utils/api';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard({ theme, toggleTheme }) {
  const [activeTab, setActiveTab] = useState('overview'); // overview, users, tutors, students, inquiries, payments, settings
  const [pendingTutors, setPendingTutors] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const userGrowthData = [
    { name: 'Jan', users: 1200 },
    { name: 'Feb', users: 1700 },
    { name: 'Mar', users: 2200 },
    { name: 'Apr', users: 2700 },
    { name: 'May', users: 3200 }
  ];

  const inquiriesData = [
    { name: 'Week 1', inquiries: 85 },
    { name: 'Week 2', inquiries: 110 },
    { name: 'Week 3', inquiries: 95 },
    { name: 'Week 4', inquiries: 140 },
    { name: 'Week 5', inquiries: 110 }
  ];

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const tutorsData = await apiService.getPendingTutors();
      setPendingTutors(tutorsData);

      const invoiceData = await apiService.getInvoices();
      setInvoices(invoiceData);

      const enrollsData = await apiService.getEnrollments();
      setEnrollments(enrollsData);
    } catch (err) {
      console.error(err);
      setError('Failed to load administrative analytics records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleVerify = async (profileId, action) => {
    try {
      setMessage('');
      setError('');
      await apiService.verifyTutor(profileId, action);
      setMessage(`Tutor profile successfully ${action === 'approve' ? 'approved' : 'rejected'}.`);
      loadData();
    } catch (err) {
      console.error(err);
      setError('Failed to update tutor status.');
    }
  };

  const handleLogout = () => {
    apiService.logout();
    window.location.reload();
  };

  // Math aggregates
  const totalRevenue = invoices
    .filter((inv) => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.amount, 0);

  const pendingRevenue = invoices
    .filter((inv) => inv.status === 'unpaid')
    .reduce((sum, inv) => sum + inv.amount, 0);

  // Sidebar list items
  const sidebarItems = [
    { id: 'overview', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'tutors', label: 'Tutors Verification', icon: <UserCheck className="w-4 h-4" /> },
    { id: 'students', label: 'Student Enrollments', icon: <Users className="w-4 h-4" /> },
    { id: 'payments', label: 'Financial Ledgers', icon: <IndianRupee className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> }
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-80px)] gap-8 max-w-7xl mx-auto p-6 text-zinc-900 dark:text-zinc-100 transition-colors duration-250">
      
      {/* 1. Sidebar Panel */}
      <div className="w-full md:w-64 shrink-0 glass-panel rounded-3xl p-6 h-fit shadow-sm space-y-6">
        <div className="flex items-center justify-between px-2 pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500 dark:bg-rose-400 animate-pulse" />
            <span className="font-extrabold text-xs uppercase tracking-wider text-zinc-600 dark:text-zinc-400">Admin Portal</span>
          </div>
          {toggleTheme && (
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
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
                  ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-l-4 border-rose-600 shadow-sm' 
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/40 hover:text-rose-500'
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

      {/* 2. Main content area */}
      <div className="flex-1 space-y-6">
        
        {/* Welcome Monochromatic Header Bar */}
        <div className="bg-gradient-to-r from-rose-600 to-red-500 dark:from-rose-900 dark:to-red-950 text-white p-6 rounded-3xl shadow-md border border-white/5 relative overflow-hidden flex justify-between items-center gap-4">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
          <div className="z-10">
            <h2 className="text-2xl font-extrabold tracking-tight">Welcome, Admin!</h2>
            <p className="text-zinc-300 text-xs sm:text-sm mt-1 font-medium">Platform management diagnostics and financials.</p>
          </div>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-white/10 dark:bg-black/35 hover:bg-white/20 border border-zinc-700/50 text-white rounded-xl text-xs font-bold shadow-sm transition-all z-10"
          >
            Refresh Data
          </button>
        </div>

        {message && (
          <div className="bg-teal-500/10 border border-teal-500/30 p-4 rounded-xl text-teal-700 dark:text-teal-400 text-sm">
            {message}
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl text-red-700 dark:text-red-400 text-sm flex gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Dashboard Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              
              <div className="glass-card p-5 rounded-2xl flex items-center justify-between shadow-sm">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">Total Users</span>
                  <p className="text-3xl font-extrabold text-black dark:text-white">3,200</p>
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400">Registered profiles</span>
                </div>
                <Users className="w-8 h-8 text-rose-600 dark:text-rose-400" />
              </div>

              <div className="glass-card p-5 rounded-2xl flex items-center justify-between shadow-sm">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">Total Tutors</span>
                  <p className="text-3xl font-extrabold text-black dark:text-white">1,500</p>
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400">Teaching members</span>
                </div>
                <UserCheck className="w-8 h-8 text-rose-600 dark:text-rose-400" />
              </div>

              <div className="glass-card p-5 rounded-2xl flex items-center justify-between shadow-sm">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">Total Inquiries</span>
                  <p className="text-3xl font-extrabold text-black dark:text-white">540</p>
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400">Tuition requests logged</span>
                </div>
                <FileText className="w-8 h-8 text-rose-600 dark:text-rose-400" />
              </div>

            </div>

            {/* Admin Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* User Growth Line Chart */}
              <div className="glass-card p-6 rounded-2xl shadow-sm space-y-4">
                <h3 className="font-extrabold text-sm sm:text-base text-zinc-950 dark:text-white pb-2 border-b border-zinc-200 dark:border-zinc-800">User Growth</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={userGrowthData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#27272a' : '#e4e4e7'} />
                      <XAxis dataKey="name" stroke="#71717a" fontSize={10} tickLine={false} />
                      <YAxis stroke="#71717a" fontSize={10} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: theme === 'dark' ? '#09090b' : '#ffffff', borderColor: theme === 'dark' ? '#27272a' : '#e4e4e7', color: theme === 'dark' ? '#ffffff' : '#000000' }} />
                      <Line type="monotone" dataKey="users" stroke="#e11d48" strokeWidth={3} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Inquiries Bar Chart */}
              <div className="glass-card p-6 rounded-2xl shadow-sm space-y-4">
                <h3 className="font-extrabold text-sm sm:text-base text-zinc-950 dark:text-white pb-2 border-b border-zinc-200 dark:border-zinc-800">Inquiries</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={inquiriesData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#27272a' : '#e4e4e7'} />
                      <XAxis dataKey="name" stroke="#71717a" fontSize={10} tickLine={false} />
                      <YAxis stroke="#71717a" fontSize={10} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: theme === 'dark' ? '#09090b' : '#ffffff', borderColor: theme === 'dark' ? '#27272a' : '#e4e4e7', color: theme === 'dark' ? '#ffffff' : '#000000' }} />
                      <Bar dataKey="inquiries" fill="#e11d48" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Split layout: Verification & Invoices summaries */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* verification short list */}
              <div className="glass-card p-6 rounded-2xl shadow-sm space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-zinc-200 dark:border-zinc-800">
                  <h3 className="font-extrabold text-sm sm:text-base text-zinc-950 dark:text-white">Pending Vettings</h3>
                  <button onClick={() => setActiveTab('tutors')} className="text-xs text-zinc-950 dark:text-white hover:underline font-extrabold">View All</button>
                </div>

                {pendingTutors.length > 0 ? (
                  <div className="space-y-3">
                    {pendingTutors.slice(0, 3).map((t) => (
                      <div key={t._id} className="p-3 bg-white/20 dark:bg-black/20 border border-zinc-200 dark:border-zinc-800 rounded-xl flex justify-between items-center">
                        <div>
                          <span className="font-bold text-xs text-zinc-950 dark:text-white block">{t.name}</span>
                          <span className="text-[9px] text-zinc-500 block">{t.qualification || 'Teaching member'}</span>
                        </div>
                        <div className="flex gap-1.5">
                          <button onClick={() => handleVerify(t._id, 'reject')} className="p-1 hover:bg-red-500/10 text-red-500 border border-red-500/30 rounded transition-colors">
                            <X className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleVerify(t._id, 'approve')} className="p-1 hover:bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 rounded transition-colors">
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-zinc-500 text-xs">No pending approvals.</div>
                )}
              </div>

              {/* invoice overview */}
              <div className="glass-card p-6 rounded-2xl shadow-sm space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-zinc-200 dark:border-zinc-800">
                  <h3 className="font-extrabold text-sm sm:text-base text-zinc-950 dark:text-white">Recent Transactions</h3>
                  <button onClick={() => setActiveTab('payments')} className="text-xs text-zinc-950 dark:text-white hover:underline font-extrabold">View Ledger</button>
                </div>

                {invoices.length > 0 ? (
                  <div className="space-y-3">
                    {invoices.slice(0, 3).map((inv) => (
                      <div key={inv._id} className="p-3 bg-white/20 dark:bg-black/20 rounded-xl border border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
                        <div>
                          <span className="font-bold text-xs text-zinc-950 dark:text-white block">₹{inv.amount}</span>
                          <span className="text-[9px] text-zinc-500 block">{inv.student_name} ({inv.subject})</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase border ${
                          inv.status === 'paid' 
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' 
                            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                        }`}>
                          {inv.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-zinc-500 text-xs">No invoices found.</div>
                )}
              </div>

            </div>

          </div>
        )}

        {/* Tutors verification list */}
        {activeTab === 'tutors' && (
          <div className="glass-card rounded-3xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-white/20 dark:bg-black/20">
              <h3 className="font-bold text-zinc-950 dark:text-white text-base">Tutor Verification Queue</h3>
            </div>

            {pendingTutors.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-white/30 dark:bg-black/30 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 text-[10px] font-bold uppercase tracking-wider">
                      <th className="px-6 py-3.5">Tutor Name</th>
                      <th className="px-6 py-3.5">Qualifications</th>
                      <th className="px-6 py-3.5">Subjects & Classes</th>
                      <th className="px-6 py-3.5">Rate & Location</th>
                      <th className="px-6 py-3.5 text-right">Approve / Reject</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200/50 dark:divide-zinc-850 text-zinc-600 dark:text-zinc-300">
                    {pendingTutors.map((tutor) => (
                      <tr key={tutor._id} className="hover:bg-white/10 dark:hover:bg-black/10">
                        <td className="px-6 py-4 font-semibold text-zinc-950 dark:text-white">{tutor.name}</td>
                        <td className="px-6 py-4">
                          <span className="block text-zinc-900 dark:text-white font-bold">{tutor.qualification || 'Not set'}</span>
                          <span className="text-[10px] text-zinc-500 font-medium">Exp: {tutor.experience_years} years</span>
                        </td>
                        <td className="px-6 py-4 max-w-xs">
                          <div className="flex flex-wrap gap-1 mb-1">
                            {tutor.subjects.map((sub, i) => (
                              <span key={i} className="text-[9px] bg-white/40 dark:bg-black/40 text-zinc-950 dark:text-white px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-800">{sub}</span>
                            ))}
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {tutor.classes.map((cl, i) => (
                              <span key={i} className="text-[9px] bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 px-1.5 py-0.5 rounded border border-zinc-300 dark:border-zinc-700">{cl}</span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="block text-zinc-900 dark:text-white font-bold">{tutor.location}</span>
                          <span className="text-[10px] text-zinc-950 dark:text-white font-extrabold">₹{tutor.rate_per_hour}/hr</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleVerify(tutor._id, 'reject')}
                              className="p-1.5 hover:bg-red-500/10 text-red-500 border border-red-500/20 rounded hover:border-red-500/30 transition-all"
                            >
                              <X className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleVerify(tutor._id, 'approve')}
                              className="p-1.5 hover:bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 rounded hover:border-emerald-500/30 transition-all"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-10 text-center text-zinc-500">All registered tutors are verified.</div>
            )}
          </div>
        )}

        {/* Student enrollments list */}
        {activeTab === 'students' && (
          <div className="glass-card rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-lg text-zinc-950 dark:text-white pb-2 border-b border-zinc-200 dark:border-zinc-800">Student Tuition Enrollments</h3>

            {enrollments.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {enrollments.map((enr) => (
                  <div key={enr._id} className="p-5 bg-white/20 dark:bg-black/20 border border-zinc-200/50 dark:border-zinc-800 rounded-2xl space-y-3">
                    <div className="space-y-1">
                      <h4 className="font-extrabold text-zinc-950 dark:text-white text-base">{enr.student_name}</h4>
                      <p className="text-xs text-zinc-500">Tutor: <span className="font-bold text-zinc-900 dark:text-zinc-100">{enr.tutor_name}</span></p>
                      <p className="text-xs text-zinc-500">Subject: <span className="font-bold text-zinc-900 dark:text-zinc-100">{enr.subject}</span> ({enr.class})</p>
                    </div>
                    <div className="text-[11px] text-zinc-500 border-t border-zinc-200/50 dark:border-zinc-800 pt-2 flex justify-between">
                      <span>Rate: ₹{enr.rate_per_hour}/hr</span>
                      <span className="text-zinc-950 dark:text-white font-extrabold capitalize">{enr.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-zinc-500">No active classrooms logged.</div>
            )}
          </div>
        )}

        {/* Financial Ledgers */}
        {activeTab === 'payments' && (
          <div className="glass-card rounded-3xl overflow-hidden shadow-sm space-y-6">
            <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-white/20 dark:bg-black/20 flex justify-between items-center">
              <h3 className="font-bold text-zinc-950 dark:text-white text-base">Invoices ledger</h3>
              <div className="flex gap-4 text-xs font-bold text-zinc-800 dark:text-zinc-200">
                <span>Processed: ₹{totalRevenue}</span>
                <span>Pending: ₹{pendingRevenue}</span>
              </div>
            </div>

            {invoices.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-white/30 dark:bg-black/30 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 text-[10px] font-bold uppercase tracking-wider">
                      <th className="px-6 py-3.5">Invoice ID</th>
                      <th className="px-6 py-3.5">Student</th>
                      <th className="px-6 py-3.5">Tutor & Subject</th>
                      <th className="px-6 py-3.5">Amount</th>
                      <th className="px-6 py-3.5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200/50 dark:divide-zinc-850 text-zinc-600 dark:text-zinc-300">
                    {invoices.map((inv) => (
                      <tr key={inv._id} className="hover:bg-white/10 dark:hover:bg-black/10">
                        <td className="px-6 py-4 font-mono">{inv._id.substring(0, 8)}...</td>
                        <td className="px-6 py-4 font-semibold text-zinc-950 dark:text-white">{inv.student_name}</td>
                        <td className="px-6 py-4">
                          <span className="block text-zinc-900 dark:text-white font-bold">{inv.tutor_name}</span>
                          <span className="text-[10px] text-zinc-500">{inv.subject}</span>
                        </td>
                        <td className="px-6 py-4 font-extrabold">₹{inv.amount}</td>
                        <td className="px-6 py-4 text-right">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase border ${
                            inv.status === 'paid' 
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' 
                              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                          }`}>
                            {inv.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-10 text-center text-zinc-500">No invoices.</div>
            )}
          </div>
        )}

        {/* Settings tab */}
        {activeTab === 'settings' && (
          <div className="glass-card rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-lg text-zinc-950 dark:text-white pb-2 border-b border-zinc-200 dark:border-zinc-800">Portal Settings</h3>
            
            <div className="space-y-4 max-w-md text-xs">
              <div className="p-4 bg-white/20 dark:bg-black/25 border border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-1">
                <span className="font-bold text-zinc-900 dark:text-white block text-sm">Bootstrap Admin Setup</span>
                <p className="text-zinc-500 mb-2">Re-initialize the platform defaults if starting from a fresh database.</p>
                <button 
                  onClick={async () => {
                    try {
                      await apiService.setupAdmin();
                      setMessage('Admin database records bootstrapped successfully.');
                    } catch (e) {
                      setError('Bootstrap setup failed or already completed.');
                    }
                  }}
                  className="px-4 py-2 glass-btn-primary font-bold rounded-lg shadow-sm hover:opacity-90 transition-all"
                >
                  Run Admin Setup Script
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
