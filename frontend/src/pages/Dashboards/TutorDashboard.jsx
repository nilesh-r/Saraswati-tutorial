import React, { useState, useEffect } from 'react';
import { 
  Calendar, User, Edit, FilePlus, Award, Wallet, CheckCircle, 
  Clock, AlertCircle, LogOut, LayoutDashboard, MessageSquare, Plus, Users,
  Sun, Moon
} from 'lucide-react';
import { apiService } from '../../utils/api';

export default function TutorDashboard({ theme, toggleTheme }) {
  const [activeTab, setActiveTab] = useState('overview'); // overview, profile, schedule, assignments, earnings, students
  const [profile, setProfile] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [earnings, setEarnings] = useState({ total_earned: 0, pending_earnings: 0 });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [tutorName, setTutorName] = useState('Tutor');

  // Form states for profile editing
  const [qualification, setQualification] = useState('');
  const [experienceYears, setExperienceYears] = useState(0);
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [ratePerHour, setRatePerHour] = useState(0.0);
  const [subjects, setSubjects] = useState('');
  const [classes, setClasses] = useState('');
  const [demoVideoUrl, setDemoVideoUrl] = useState('');

  // Form states for Scheduling a class
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState('');
  const [classDate, setClassDate] = useState('');
  const [classStartTime, setClassStartTime] = useState('');
  const [classEndTime, setClassEndTime] = useState('');

  // Form states for Test Grade logging
  const [testEnrollmentId, setTestEnrollmentId] = useState('');
  const [testName, setTestName] = useState('');
  const [maxMarks, setMaxMarks] = useState(105);
  const [obtainedMarks, setObtainedMarks] = useState(0);
  const [gradeDate, setGradeDate] = useState('');
  const [gradeFeedback, setGradeFeedback] = useState('');

  // Form states for Assignment creation
  const [assignEnrollmentId, setAssignEnrollmentId] = useState('');
  const [assignTitle, setAssignTitle] = useState('');
  const [assignDesc, setAssignDesc] = useState('');
  const [assignDueDate, setAssignDueDate] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const meData = await apiService.getMe();
      if (meData) {
        setTutorName(meData.name);
      }
      if (meData?.profile) {
        setProfile(meData.profile);
        setQualification(meData.profile.qualification || '');
        setExperienceYears(meData.profile.experience_years || 0);
        setBio(meData.profile.bio || '');
        setLocation(meData.profile.location || '');
        setRatePerHour(meData.profile.rate_per_hour || 0.0);
        setSubjects(meData.profile.subjects?.join(', ') || '');
        setClasses(meData.profile.classes?.join(', ') || '');
        setDemoVideoUrl(meData.profile.demo_video_url || '');
      }

      const schedData = await apiService.getSchedule();
      setSchedule(schedData);

      const enrollsData = await apiService.getEnrollments();
      setEnrollments(enrollsData);

      const earningsData = await apiService.getEarnings();
      setEarnings(earningsData);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch tutor dashboard records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    try {
      setMessage('');
      setError('');
      const subList = subjects.split(',').map(s => s.trim()).filter(Boolean);
      const clList = classes.split(',').map(c => c.trim()).filter(Boolean);
      
      await apiService.updateTutorProfile({
        subjects: subList,
        classes: clList,
        rate_per_hour: parseFloat(ratePerHour),
        experience_years: parseInt(experienceYears),
        qualification,
        bio,
        location,
        availability: ["Monday 4-6 PM", "Wednesday 4-6 PM", "Saturday 10 AM-12 PM"],
        demo_video_url: demoVideoUrl
      });
      setMessage('Profile updated successfully.');
      loadData();
    } catch (err) {
      console.error(err);
      setError('Failed to update teaching credentials.');
    }
  };

  const handleScheduleClass = async (e) => {
    e.preventDefault();
    if (!selectedEnrollmentId || !classDate || !classStartTime || !classEndTime) {
      setError('Please fill in all scheduling fields.');
      return;
    }
    try {
      setMessage('');
      setError('');
      await apiService.scheduleClass({
        enrollment_id: selectedEnrollmentId,
        date: classDate,
        start_time: classStartTime,
        end_time: classEndTime
      });
      setMessage('Class scheduled successfully.');
      setClassDate('');
      setClassStartTime('');
      setClassEndTime('');
      loadData();
    } catch (err) {
      console.error(err);
      setError('Failed to schedule class.');
    }
  };

  const handleMarkAttendance = async (classId, status) => {
    try {
      setMessage('');
      setError('');
      await apiService.markAttendance(classId, status);
      setMessage(`Attendance marked as ${status}. Invoice created.`);
      loadData();
    } catch (err) {
      console.error(err);
      setError('Failed to mark class attendance.');
    }
  };

  const handleAddGrade = async (e) => {
    e.preventDefault();
    if (!testEnrollmentId || !testName || !obtainedMarks || !gradeDate) {
      setError('Please fill in all test details.');
      return;
    }
    try {
      setMessage('');
      setError('');
      await apiService.addGrade(testEnrollmentId, {
        test_name: testName,
        max_marks: parseFloat(maxMarks),
        obtained_marks: parseFloat(obtainedMarks),
        date: gradeDate,
        feedback: gradeFeedback
      });
      setMessage('Test marks recorded successfully.');
      setTestName('');
      setObtainedMarks(0);
      setGradeDate('');
      setGradeFeedback('');
      loadData();
    } catch (err) {
      console.error(err);
      setError('Failed to record student grades.');
    }
  };

  const handleAddAssignment = async (e) => {
    e.preventDefault();
    if (!assignEnrollmentId || !assignTitle || !assignDueDate) {
      setError('Please fill in all assignment fields.');
      return;
    }
    try {
      setMessage('');
      setError('');
      await apiService.createAssignment(assignEnrollmentId, {
        title: assignTitle,
        description: assignDesc,
        due_date: assignDueDate
      });
      setMessage('Assignment issued successfully.');
      setAssignTitle('');
      setAssignDesc('');
      setAssignDueDate('');
      loadData();
    } catch (err) {
      console.error(err);
      setError('Failed to upload assignment.');
    }
  };

  const handleLogout = () => {
    apiService.logout();
    window.location.reload();
  };

  // Sidebar list items
  const sidebarItems = [
    { id: 'overview', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'students', label: 'My Students', icon: <Users className="w-4 h-4" /> },
    { id: 'schedule', label: 'Schedule & Actions', icon: <Calendar className="w-4 h-4" /> },
    { id: 'profile', label: 'Edit Profile', icon: <Edit className="w-4 h-4" /> }
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-80px)] gap-8 max-w-7xl mx-auto p-6 text-zinc-900 dark:text-zinc-100 transition-colors duration-250">
      
      {/* 1. Sidebar Panel */}
      <div className="w-full md:w-64 shrink-0 glass-panel rounded-3xl p-6 h-fit shadow-sm space-y-6">
        <div className="flex items-center justify-between px-2 pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-teal-500 dark:bg-teal-400 animate-pulse" />
            <span className="font-extrabold text-xs uppercase tracking-wider text-zinc-600 dark:text-zinc-400">Tutor Portal</span>
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
                  ? 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-l-4 border-teal-600 shadow-sm' 
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/40 hover:text-teal-500'
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
        
        {/* Welcome Teal Header Bar */}
        <div className="bg-gradient-to-r from-teal-600 to-emerald-600 dark:from-teal-900 dark:to-emerald-950 text-white p-6 rounded-3xl shadow-md border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
          <h2 className="text-2xl font-extrabold tracking-tight">Welcome, {tutorName}!</h2>
          <p className="text-zinc-300 text-xs sm:text-sm mt-1 font-medium">
            Here is your teaching overview today. Profile status:{' '}
            <span className="font-extrabold capitalize underline text-white">
              {profile?.verification_status || 'Pending'}
            </span>
          </p>
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
                  <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">Total Students</span>
                  <p className="text-3xl font-extrabold text-black dark:text-white">{enrollments.length}</p>
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400">Classrooms active</span>
                </div>
                <Users className="w-8 h-8 text-teal-600 dark:text-teal-400" />
              </div>

              <div className="glass-card p-5 rounded-2xl flex items-center justify-between shadow-sm">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">Today's Classes</span>
                  <p className="text-3xl font-extrabold text-black dark:text-white">
                    {schedule.filter(s => s.status === 'scheduled').length}
                  </p>
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400">Lessons scheduled</span>
                </div>
                <Calendar className="w-8 h-8 text-teal-600 dark:text-teal-400" />
              </div>

              <div className="glass-card p-5 rounded-2xl flex items-center justify-between shadow-sm">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">This Month Earnings</span>
                  <p className="text-2xl font-extrabold text-black dark:text-white">₹{(earnings.total_earned || 24000).toLocaleString()}</p>
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400">Awaiting payout: ₹{earnings.pending_earnings}</span>
                </div>
                <Wallet className="w-8 h-8 text-teal-600 dark:text-teal-400" />
              </div>

            </div>

            {/* Today's Schedule list */}
            <div className="glass-card rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-lg text-zinc-950 dark:text-white pb-2 border-b border-zinc-200 dark:border-zinc-800">Today's Schedule</h3>

              {schedule.length > 0 ? (
                <div className="space-y-3">
                  {schedule.map((slot) => (
                    <div key={slot._id} className="p-4 bg-white/20 dark:bg-black/20 rounded-xl border border-zinc-200/50 dark:border-zinc-800 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block">{slot.class}</span>
                        <span className="font-extrabold text-zinc-950 dark:text-white block text-sm">{slot.student_name} ({slot.subject})</span>
                        <span className="text-xs text-zinc-900 dark:text-zinc-300 font-extrabold">{slot.start_time} - {slot.end_time}</span>
                      </div>
                      
                      <div className="flex gap-2">
                        {!slot.attendance_marked ? (
                          <>
                            <button
                              onClick={() => handleMarkAttendance(slot._id, 'absent')}
                              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                            >
                              Absent
                            </button>
                            <button
                              onClick={() => handleMarkAttendance(slot._id, 'present')}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
                            >
                              Present / Log Class
                            </button>
                          </>
                        ) : (
                          <span className={`text-xs font-bold px-3 py-1.5 rounded-lg border ${
                            slot.attendance_status === 'present' 
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' 
                              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                          }`}>
                            Logged: <span className="capitalize">{slot.attendance_status}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-zinc-500">No scheduled classes today.</div>
              )}
            </div>

          </div>
        )}

        {/* My Students list */}
        {activeTab === 'students' && (
          <div className="glass-card rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-lg text-zinc-950 dark:text-white pb-2 border-b border-zinc-200 dark:border-zinc-800">My Students</h3>

            {enrollments.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {enrollments.map((enr) => (
                  <div key={enr._id} className="p-5 bg-white/20 dark:bg-black/20 border border-zinc-200/50 dark:border-zinc-800 rounded-2xl space-y-3">
                    <div className="flex gap-3 items-center">
                      <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 flex items-center justify-center font-extrabold text-sm border border-zinc-300 dark:border-zinc-700">
                        {enr.student_name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-zinc-950 dark:text-white text-sm">{enr.student_name}</h4>
                        <span className="text-[10px] text-zinc-500 font-bold uppercase">{enr.class} • {enr.subject}</span>
                      </div>
                    </div>
                    <div className="text-[11px] text-zinc-500 space-y-0.5 pt-2 border-t border-zinc-200/50 dark:border-zinc-800">
                      <p>Start Date: <span className="font-bold text-zinc-800 dark:text-zinc-300">{enr.start_date}</span></p>
                      <p>Rate per hour: <span className="font-bold text-zinc-950 dark:text-white">₹{enr.rate_per_hour}/hr</span></p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-zinc-500">No student enrollment matching parameters.</div>
            )}
          </div>
        )}

        {/* Schedule Actions */}
        {activeTab === 'schedule' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Schedule class form */}
            <form onSubmit={handleScheduleClass} className="glass-card p-6 rounded-2xl shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-zinc-950 dark:text-white pb-2 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-zinc-700 dark:text-white" />
                <span>Schedule Next Lesson</span>
              </h3>

              <div>
                <label className="block text-[10px] text-zinc-400 dark:text-zinc-500 font-bold mb-1 uppercase">Select Student</label>
                <select
                  value={selectedEnrollmentId}
                  onChange={(e) => setSelectedEnrollmentId(e.target.value)}
                  className="w-full glass-input rounded-xl px-4 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-600"
                >
                  <option value="">Choose Student...</option>
                  {enrollments.map((enr) => (
                    <option key={enr._id} value={enr._id}>
                      {enr.student_name} - {enr.subject} ({enr.class})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-3 sm:col-span-1">
                  <label className="block text-[10px] text-zinc-400 dark:text-zinc-500 font-bold mb-1 uppercase">Date</label>
                  <input
                    type="date"
                    value={classDate}
                    onChange={(e) => setClassDate(e.target.value)}
                    className="w-full glass-input rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-600"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-zinc-400 dark:text-zinc-500 font-bold mb-1 uppercase">Start Time</label>
                  <input
                    type="text"
                    placeholder="e.g. 16:00"
                    value={classStartTime}
                    onChange={(e) => setClassStartTime(e.target.value)}
                    className="w-full glass-input rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none placeholder-zinc-400 focus:border-zinc-600"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-zinc-400 dark:text-zinc-500 font-bold mb-1 uppercase">End Time</label>
                  <input
                    type="text"
                    placeholder="e.g. 17:30"
                    value={classEndTime}
                    onChange={(e) => setClassEndTime(e.target.value)}
                    className="w-full glass-input rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none placeholder-zinc-400 focus:border-zinc-600"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 glass-btn-primary text-xs font-bold rounded-xl shadow-sm hover:opacity-90 transition-all"
              >
                Schedule Class
              </button>
            </form>

            {/* Test marks log form */}
            <form onSubmit={handleAddGrade} className="glass-card p-6 rounded-2xl shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-zinc-950 dark:text-white pb-2 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-2">
                <Award className="w-5 h-5 text-zinc-700 dark:text-white" />
                <span>Record Student Test Marks</span>
              </h3>

              <div>
                <label className="block text-[10px] text-zinc-400 dark:text-zinc-500 font-bold mb-1 uppercase">Select Student</label>
                <select
                  value={testEnrollmentId}
                  onChange={(e) => setTestEnrollmentId(e.target.value)}
                  className="w-full glass-input rounded-xl px-4 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-600"
                >
                  <option value="">Choose Student...</option>
                  {enrollments.map((enr) => (
                    <option key={enr._id} value={enr._id}>
                      {enr.student_name} - {enr.subject}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-zinc-400 dark:text-zinc-500 font-bold mb-1 uppercase">Test Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Chapter 3 Quiz"
                    value={testName}
                    onChange={(e) => setTestName(e.target.value)}
                    className="w-full glass-input rounded-xl px-4 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-zinc-600"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-zinc-400 dark:text-zinc-500 font-bold mb-1 uppercase">Test Date</label>
                  <input
                    type="date"
                    value={gradeDate}
                    onChange={(e) => setGradeDate(e.target.value)}
                    className="w-full glass-input rounded-xl px-4 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-600"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-zinc-400 dark:text-zinc-500 font-bold mb-1 uppercase">Obtained Marks</label>
                  <input
                    type="number"
                    value={obtainedMarks}
                    onChange={(e) => setObtainedMarks(e.target.value)}
                    className="w-full glass-input rounded-xl px-4 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-600"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-zinc-400 dark:text-zinc-500 font-bold mb-1 uppercase">Max Marks</label>
                  <input
                    type="number"
                    value={maxMarks}
                    onChange={(e) => setMaxMarks(e.target.value)}
                    className="w-full glass-input rounded-xl px-4 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-zinc-400 dark:text-zinc-500 font-bold mb-1 uppercase">Performance Feedback</label>
                <input
                  type="text"
                  placeholder="Feedback comments..."
                  value={gradeFeedback}
                  onChange={(e) => setGradeFeedback(e.target.value)}
                  className="w-full glass-input rounded-xl px-4 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-zinc-600"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 glass-btn-primary text-xs font-bold rounded-xl shadow-sm transition-all"
              >
                Upload test results
              </button>
            </form>

            {/* Assignment issuance form */}
            <form onSubmit={handleAddAssignment} className="glass-card p-6 rounded-2xl shadow-sm space-y-4 lg:col-span-2">
              <h3 className="text-lg font-bold text-zinc-950 dark:text-white pb-2 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-2">
                <FilePlus className="w-5 h-5 text-zinc-700 dark:text-white" />
                <span>Issue Homework Assignment</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] text-zinc-400 dark:text-zinc-500 font-bold mb-1 uppercase">Select Student</label>
                  <select
                    value={assignEnrollmentId}
                    onChange={(e) => setAssignEnrollmentId(e.target.value)}
                    className="w-full glass-input rounded-xl px-4 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-600"
                  >
                    <option value="">Choose Student...</option>
                    {enrollments.map((enr) => (
                      <option key={enr._id} value={enr._id}>
                        {enr.student_name} - {enr.subject}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-zinc-400 dark:text-zinc-500 font-bold mb-1 uppercase">Assignment Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Worksheet 4.2"
                    value={assignTitle}
                    onChange={(e) => setAssignTitle(e.target.value)}
                    className="w-full glass-input rounded-xl px-4 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-zinc-600"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-zinc-400 dark:text-zinc-500 font-bold mb-1 uppercase">Due Date</label>
                  <input
                    type="date"
                    value={assignDueDate}
                    onChange={(e) => setAssignDueDate(e.target.value)}
                    className="w-full glass-input rounded-xl px-4 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-zinc-400 dark:text-zinc-500 font-bold mb-1 uppercase">Instructions</label>
                <textarea
                  placeholder="Instructions for student homework..."
                  value={assignDesc}
                  onChange={(e) => setAssignDesc(e.target.value)}
                  className="w-full h-20 glass-input px-4 py-2 text-xs rounded-xl focus:outline-none resize-none focus:border-zinc-600"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 glass-btn-primary font-bold text-xs rounded-xl shadow-sm transition-all"
              >
                Issue Homework
              </button>
            </form>

          </div>
        )}

        {/* Profile edit page */}
        {activeTab === 'profile' && (
          <form onSubmit={handleProfileSave} className="glass-card p-6 rounded-3xl shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-zinc-950 dark:text-white pb-2 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-2">
              <Edit className="w-5 h-5 text-zinc-700 dark:text-white" />
              <span>Teaching & Experience Profile Credentials</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] text-zinc-400 font-bold mb-2 uppercase tracking-wider">Qualifications</label>
                <input
                  type="text"
                  placeholder="e.g. M.Sc. Mathematics, Mumbai University"
                  value={qualification}
                  onChange={(e) => setQualification(e.target.value)}
                  className="w-full glass-input rounded-xl px-4 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-zinc-600"
                />
              </div>

              <div>
                <label className="block text-[10px] text-zinc-400 font-bold mb-2 uppercase tracking-wider">Years of Experience</label>
                <input
                  type="number"
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(e.target.value)}
                  className="w-full glass-input rounded-xl px-4 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-600"
                />
              </div>

              <div>
                <label className="block text-[10px] text-zinc-400 font-bold mb-2 uppercase tracking-wider">Hourly Fees (INR/hr)</label>
                <input
                  type="number"
                  value={ratePerHour}
                  onChange={(e) => setRatePerHour(e.target.value)}
                  className="w-full glass-input rounded-xl px-4 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-600"
                />
              </div>

              <div>
                <label className="block text-[10px] text-zinc-400 font-bold mb-2 uppercase tracking-wider">Teaching Localities (separated by comma)</label>
                <input
                  type="text"
                  placeholder="e.g. Dadar, Bandra, Sion"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full glass-input rounded-xl px-4 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-zinc-600"
                />
              </div>

              <div>
                <label className="block text-[10px] text-zinc-400 font-bold mb-2 uppercase tracking-wider">Subjects Taught (separated by comma)</label>
                <input
                  type="text"
                  placeholder="e.g. Mathematics, Physics"
                  value={subjects}
                  onChange={(e) => setSubjects(e.target.value)}
                  className="w-full glass-input rounded-xl px-4 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-zinc-600"
                />
              </div>

              <div>
                <label className="block text-[10px] text-zinc-400 font-bold mb-2 uppercase tracking-wider">Classes Taught (separated by comma)</label>
                <input
                  type="text"
                  placeholder="e.g. Class 10, Class 12, Graduation"
                  value={classes}
                  onChange={(e) => setClasses(e.target.value)}
                  className="w-full glass-input rounded-xl px-4 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-zinc-600"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[10px] text-zinc-400 font-bold mb-2 uppercase tracking-wider">Bio Description</label>
                <textarea
                  placeholder="Describe your teaching methods, previous results history..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full h-24 glass-input rounded-xl px-4 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none resize-none focus:border-zinc-600"
                />
              </div>

              <div>
                <label className="block text-[10px] text-zinc-400 font-bold mb-2 uppercase tracking-wider">Demo Video Link (Optional)</label>
                <input
                  type="text"
                  placeholder="YouTube link..."
                  value={demoVideoUrl}
                  onChange={(e) => setDemoVideoUrl(e.target.value)}
                  className="w-full glass-input rounded-xl px-4 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-zinc-600"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 glass-btn-primary font-bold text-xs rounded-xl shadow-sm transition-all hover:opacity-90"
            >
              Save Teach Profile
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
