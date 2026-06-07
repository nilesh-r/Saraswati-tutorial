import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Sparkles, BookOpen, Star, ShieldCheck, TrendingUp, Calendar, Zap, 
  MessageSquare, GraduationCap, ChevronRight, Award, Phone, Mail, MapPin, 
  Code, Atom, Dna, Coins, Send, RefreshCw, User, BookOpenCheck, ArrowRight
} from 'lucide-react';
import { apiService } from '../utils/api';
import heroTutor from '../assets/hero_tutor.png';
import aboutTutor from '../assets/about_tutor.png';
import mathImage from '../assets/subject_math.png';
import scienceImage from '../assets/subject_science.png';
import physicsImage from '../assets/subject_physics.png';
import chemistryImage from '../assets/subject_chemistry.png';
import biologyImage from '../assets/subject_biology.png';
import englishImage from '../assets/subject_english.png';
import commerceImage from '../assets/subject_commerce.png';
import csImage from '../assets/subject_cs.png';
import logoHomeTuition from '../assets/logo_home_tuition.png';
import logoSubjectCoaching from '../assets/logo_subject_coaching.png';
import logoExamPrep from '../assets/logo_exam_prep.png';
import logoOnlineClasses from '../assets/logo_online_classes.png';
import logoAssignmentHelp from '../assets/logo_assignment_help.png';
import logoTestSeries from '../assets/logo_test_series.png';

export default function LandingPage({ navigateTo, setSelectedTutorId, prefilledParams }) {
  // Search state
  const [subject, setSubject] = useState('');
  const [className, setClassName] = useState('');
  const [location, setLocation] = useState('');
  const [featuredTutors, setFeaturedTutors] = useState([]);
  const [loading, setLoading] = useState(false);

  // Inquiry Form state
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryPhone, setInquiryPhone] = useState('');
  const [inquiryEmail, setInquiryEmail] = useState('');
  const [inquiryClass, setInquiryClass] = useState('');
  const [inquirySubject, setInquirySubject] = useState('');
  const [inquiryTime, setInquiryTime] = useState('');
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [inquiryLoading, setInquiryLoading] = useState(false);
  const [inquirySuccess, setInquirySuccess] = useState('');
  const [inquiryError, setInquiryError] = useState('');

  // AI Chatbot state
  const [chatMessages, setChatMessages] = useState([
    {
      id: 'welcome',
      sender: 'ai',
      text: "Namaste! I am your AI Educational Guidance Assistant for Saraswati Tutorials. How can I help you improve your child's academic performance today?",
      mode: 'local-nlp'
    },
    {
      id: 'q1',
      sender: 'user',
      text: "How do home tutors help in the growth of children?"
    },
    {
      id: 'a1',
      sender: 'ai',
      text: "Home tutors play a significant role in a child's overall growth. They provide personalized education, understand the child's learning pace and help improve academic performance.\n\nHere are some key benefits:\n• Concept clarity and strong fundamentals\n• Better focus and confidence\n• Regular practice and doubt solving\n• Personalized study plans\n• Improved discipline and time management\n\nWould you like tips based on your child's class or subject?",
      mode: 'local-nlp'
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatMessagesEndRef = useRef(null);

  const displayTutors = featuredTutors.length > 0 ? featuredTutors : [
    { _id: 't1', user_id: 'u1', name: 'Rohit Sharma', qualification: 'B.Sc Mathematics', experience_years: 8, rate_per_hour: 500, rating: 4.9, bio: 'Specialist in calculus and secondary school board preparations.' },
    { _id: 't2', user_id: 'u2', name: 'Neha Verma', qualification: 'B.Tech, M.Tech (CS)', experience_years: 6, rate_per_hour: 700, rating: 4.8, bio: 'Experienced in programming, coding, and logical reasoning.' },
    { _id: 't3', user_id: 'u3', name: 'Arjun Patel', qualification: 'M.Sc Physics', experience_years: 7, rate_per_hour: 600, rating: 4.9, bio: 'Applied mechanics and board examinations preparation expert.' }
  ];

  // Scroll to section handling
  useEffect(() => {
    if (prefilledParams?.scroll) {
      const element = document.getElementById(prefilledParams.scroll);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [prefilledParams]);

  useEffect(() => {
    // Load top verified tutors
    const fetchTeasers = async () => {
      try {
        setLoading(true);
        const data = await apiService.searchTutors({ verified_only: true });
        setFeaturedTutors(data.slice(0, 4));
      } catch (err) {
        console.error("Failed to load featured tutors", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTeasers();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigateTo('tutors-search', {
      subject,
      class: className,
      location
    });
  };

  const handleQuickSubjectSearch = (sub) => {
    navigateTo('tutors-search', {
      subject: sub,
      class: '',
      location: ''
    });
  };

  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    if (!inquiryName || !inquiryPhone || !inquiryClass || !inquirySubject) {
      setInquiryError('Full Name, Phone, Class and Subject are required to book a demo.');
      return;
    }
    setInquiryLoading(true);
    setInquiryError('');
    setInquirySuccess('');
    try {
      const token = localStorage.getItem('saraswati_token');
      if (!token) {
        setInquiryError('You must be logged in as a Parent or Student to book a demo class. Please login or register.');
        setInquiryLoading(false);
        return;
      }

      await apiService.createInquiry({
        subjects: [inquirySubject],
        class: inquiryClass,
        preferred_timing: inquiryTime || 'Flexible',
        budget: 500, // default placeholder
        learning_weaknesses: inquiryMessage || 'Requested a demo class.'
      });
      setInquirySuccess('Your demo class request has been submitted successfully! Our counselors will contact you shortly.');
      // Clear fields
      setInquiryName('');
      setInquiryPhone('');
      setInquiryEmail('');
      setInquiryClass('');
      setInquirySubject('');
      setInquiryTime('');
      setInquiryMessage('');
    } catch (err) {
      console.error(err);
      setInquiryError(err.response?.data?.detail || 'Failed to submit request. Ensure you are signed in as a Parent or Student.');
    } finally {
      setInquiryLoading(false);
    }
  };

  const handleChatSend = async (textToSend) => {
    const query = textToSend || chatInput;
    if (!query.trim()) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: query
    };

    setChatMessages(prev => [...prev, userMsg]);
    if (!textToSend) setChatInput('');
    setChatLoading(true);

    try {
      const history = chatMessages.map(m => ({
        role: m.sender === 'ai' ? 'model' : 'user',
        parts: [{ text: m.text }]
      }));

      const res = await apiService.sendChatbotMessage(query, history);
      
      const aiMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: res.reply,
        mode: res.mode
      };
      
      setChatMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      setChatMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: "I apologize, but I am having trouble connecting to my knowledge base right now. Please try again in a few moments.",
          mode: 'error'
        }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  useEffect(() => {
    chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, chatLoading]);

  // Top subjects data helper with high-quality generated images
  const topSubjects = [
    { name: 'Mathematics', image: mathImage },
    { name: 'Science', image: scienceImage },
    { name: 'Physics', image: physicsImage },
    { name: 'Chemistry', image: chemistryImage },
    { name: 'Biology', image: biologyImage },
    { name: 'English', image: englishImage },
    { name: 'Commerce', image: commerceImage },
    { name: 'Computer Science', image: csImage }
  ];

  return (
    <div className="space-y-20 pb-20 text-zinc-900 dark:text-zinc-100 transition-colors duration-250">
      
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-purple-500/10 dark:bg-purple-600/5 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {['CBSE', 'ICSE', 'IGCSE', 'IB Board', 'State Board'].map((board) => (
              <span 
                key={board} 
                className="text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-zinc-500/10 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100"
              >
                {board}
              </span>
            ))}
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-zinc-950 dark:text-white tracking-tight leading-tight">
            Personalized Home Tuition<br />
            <span className="bg-gradient-to-r from-black via-zinc-700 to-black dark:from-white dark:via-zinc-300 dark:to-white bg-clip-text text-transparent">For Every Learner</span>
          </h1>

          <p className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base max-w-lg leading-relaxed">
            Expert tutors, one-on-one attention and AI powered guidance to help your child excel academically. Saraswati Tutorials connects parents in Mumbai with highly experienced, certified home tutors.
          </p>

          <div className="flex gap-4">
            <button
              onClick={() => navigateTo('tutors-search')}
              className="px-6 py-3 bg-zinc-950 hover:bg-black border border-zinc-900 dark:border-zinc-800 text-white font-bold text-xs rounded-xl shadow-lg transition-all"
            >
              Find a Tutor
            </button>
            <button
              onClick={() => {
                const el = document.getElementById('how-it-works');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-6 py-3 glass-btn-secondary font-bold text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm transition-all"
            >
              How It Works
            </button>
          </div>
        </div>

        {/* Hero Image Container (Full Color restored) */}
        <div className="relative justify-self-center lg:justify-self-end w-full max-w-md">
          <div className="absolute -inset-1 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-3xl blur opacity-20" />
          <div className="relative glass-card p-3 rounded-3xl shadow-xl">
            <img 
              src={heroTutor} 
              alt="Tutor teaching student" 
              className="rounded-2xl w-full h-[280px] object-cover"
            />
          </div>
        </div>
      </section>

      {/* 2. Stats Strip (Black background with white text) */}
      <section className="bg-black text-white py-8 border-y border-zinc-800 shadow-md">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <p className="text-3xl sm:text-4xl font-extrabold text-white">2000+</p>
            <p className="text-zinc-400 text-xs mt-1 font-bold uppercase tracking-wider">Happy Students</p>
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-extrabold text-white">1500+</p>
            <p className="text-zinc-400 text-xs mt-1 font-bold uppercase tracking-wider">Expert Tutors</p>
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-extrabold text-white">50+</p>
            <p className="text-zinc-400 text-xs mt-1 font-bold uppercase tracking-wider">Subjects</p>
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-extrabold text-white">10+</p>
            <p className="text-zinc-400 text-xs mt-1 font-bold uppercase tracking-wider">Years of Experience</p>
          </div>
        </div>
      </section>

      {/* 3. Our Top Subjects */}
      <section id="subjects" className="max-w-6xl mx-auto px-6 space-y-6">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 dark:text-white">Our Top Subjects</h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm mt-1 font-medium">Explore our highly requested subjects for home tutoring</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {topSubjects.map((sub, idx) => (
            <button
              key={idx}
              onClick={() => handleQuickSubjectSearch(sub.name)}
              className="glass-card overflow-hidden rounded-2xl flex flex-col hover:border-[#7c3aed] dark:hover:border-purple-500 shadow-sm hover:shadow-lg transition-all group text-left"
            >
              <div className="h-32 w-full overflow-hidden relative">
                <img 
                  src={sub.image} 
                  alt={sub.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60" />
              </div>
              <div className="p-4 flex flex-col gap-1">
                <span className="font-extrabold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-[#7c3aed] transition-colors">{sub.name}</span>
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider">Explore Tutors</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* 4. Services Section */}
      <section id="services" className="bg-[#f3e8ff]/40 dark:bg-purple-950/5 py-16 border-y border-purple-100 dark:border-purple-950/20">
        <div className="max-w-6xl mx-auto px-6 space-y-10">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 dark:text-white">Our Services</h2>
            <p className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm mt-1 font-medium">We provide a wide range of tutoring services tailored to meet the unique needs of students</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'Home Tuition', desc: 'One-on-one learning at your home', logo: logoHomeTuition },
              { title: 'Subject Coaching', desc: 'Expert coaching in all major subjects', logo: logoSubjectCoaching },
              { title: 'Exam Preparation', desc: 'Special guidance for school & college exams', logo: logoExamPrep },
              { title: 'Online Classes', desc: 'Live interactive online sessions', logo: logoOnlineClasses },
              { title: 'Assignment Help', desc: 'Help with homework and assignments', logo: logoAssignmentHelp },
              { title: 'Test Series', desc: 'Regular tests and performance analysis', logo: logoTestSeries }
            ].map((srv, idx) => (
              <div 
                key={idx}
                className="glass-card p-6 rounded-2xl flex items-start gap-4 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="w-12 h-12 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shrink-0 shadow-inner flex items-center justify-center p-1.5 group-hover:scale-105 transition-all duration-300">
                  <img src={srv.logo} alt={srv.title} className="w-full h-full object-contain" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm sm:text-base text-zinc-950 dark:text-white">{srv.title}</h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">{srv.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. About Us Page Section */}
      <section id="about" className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left: Content */}
        <div className="space-y-6">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-950 dark:text-white">About Us</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-zinc-950 dark:text-white mt-1">
              About Saraswati<br />Tutorial Mumbai
            </h2>
          </div>

          <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
            We provide quality home tuitions with a mission to deliver personalized education and help students achieve academic excellence. Our tutors focus on concept clarity, systematic mock-testing, and routine feedback loops.
          </p>

          <div className="grid grid-cols-2 gap-4">
            {[
              'Experienced & Verified Tutors',
              'Personalized Learning',
              'Result Oriented Approach',
              'Flexible Timing'
            ].map((point, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs font-bold text-zinc-700 dark:text-zinc-300">
                <div className="w-2 h-2 rounded-full bg-zinc-950 dark:bg-white" />
                <span>{point}</span>
              </div>
            ))}
          </div>

          <button 
            onClick={() => {
              const el = document.getElementById('services');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-6 py-2.5 bg-zinc-950 hover:bg-black border border-zinc-900 dark:border-zinc-800 text-white font-bold text-xs rounded-xl shadow-md transition-all"
          >
            Know More
          </button>
        </div>

        {/* Right: Picture & Stats Container (Full Color restored) */}
        <div className="space-y-6">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-3xl blur opacity-20" />
            <div className="relative glass-card p-3 rounded-3xl shadow-xl">
              <img 
                src={aboutTutor} 
                alt="Tutor guiding student" 
                className="rounded-2xl w-full h-[240px] object-cover"
              />
            </div>
          </div>

          {/* Mini stats cards grid */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { num: '10+', lbl: 'Years Exp' },
              { num: '2000+', lbl: 'Helped' },
              { num: '1500+', lbl: 'Tutors' },
              { num: '98%', lbl: 'Satisfaction' }
            ].map((st, idx) => (
              <div 
                key={idx}
                className="glass-card p-3 rounded-xl text-center shadow-sm"
              >
                <span className="block text-sm sm:text-base font-extrabold text-zinc-950 dark:text-white">{st.num}</span>
                <span className="block text-[8px] sm:text-[9px] text-zinc-500 dark:text-zinc-400 font-bold uppercase mt-0.5 tracking-tighter truncate">{st.lbl}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Expert Tutors Section */}
      <section className="bg-white/20 dark:bg-black/10 border-y border-zinc-200 dark:border-zinc-800 py-16">
        <div className="max-w-6xl mx-auto px-6 space-y-10">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 dark:text-white">Our Expert Tutors</h2>
            <p className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm mt-1 font-medium">Learn from highly qualified and experienced tutors</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: 'Rohit Sharma', qual: 'B.Sc Mathematics', exp: 8, rating: 4.9, count: 120 },
              { name: 'Neha Verma', qual: 'B.Tech, M.Tech (CS)', exp: 6, rating: 4.8, count: 98 },
              { name: 'Arjun Patel', qual: 'M.Sc Physics', exp: 7, rating: 4.9, count: 110 },
              { name: 'Priya Singh', qual: 'M.Sc Chemistry', exp: 5, rating: 4.7, count: 80 }
            ].map((tut, idx) => (
              <div 
                key={idx}
                className="glass-card p-5 rounded-2xl flex flex-col justify-between shadow-sm hover:shadow hover:border-zinc-450 dark:hover:border-zinc-700 transition-all text-center"
              >
                <div className="space-y-3">
                  <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-950 dark:text-zinc-100 flex items-center justify-center font-extrabold text-xl border border-zinc-200 dark:border-zinc-800 mx-auto select-none">
                    {tut.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-zinc-950 dark:text-white truncate">{tut.name}</h4>
                    <p className="text-[10px] text-zinc-700 dark:text-zinc-300 font-extrabold truncate mt-0.5">{tut.qual}</p>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1">{tut.exp} Years Experience</p>
                  </div>
                  <div className="flex items-center justify-center gap-1 text-[10px] font-extrabold text-amber-500">
                    <Star className="w-3.5 h-3.5 fill-amber-500" />
                    <span>{tut.rating} ({tut.count})</span>
                  </div>
                </div>
                <button
                  onClick={() => navigateTo('tutors-search', { subject: tut.qual.includes('CS') ? 'Computer Science' : tut.qual.split(' ').pop() })}
                  className="mt-4 w-full py-2 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white text-zinc-700 dark:text-zinc-200 font-bold text-[10px] rounded-lg shadow-sm transition-all"
                >
                  View Profile
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. AI Guidance Page Section (Purple gradient restored) */}
      <section className="max-w-6xl mx-auto px-6 space-y-6">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-950 dark:text-white">AI Guidance</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 dark:text-white mt-1">AI Education Counselor</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left card */}
          <div className="bg-gradient-to-br from-zinc-950 via-black to-zinc-900 text-white p-8 rounded-3xl flex flex-col justify-between gap-8 shadow-lg relative overflow-hidden border border-zinc-800">
            <div className="absolute top-0 right-0 w-32 h-32 bg-zinc-800/20 rounded-full blur-[40px] pointer-events-none" />
            <div className="space-y-6">
              <div className="bg-zinc-800/40 w-fit p-3 rounded-xl border border-zinc-700/30">
                <Zap className="w-6 h-6 text-zinc-200 animate-pulse" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-extrabold tracking-tight">AI Education Assistant</h3>
                <p className="text-xs text-zinc-300 leading-relaxed font-medium">
                  Ask anything about how home tutors help in your child's growth and academic success. Our smart agent is loaded with CBSE SSC HSC curricula knowledge.
                </p>
              </div>
              <div className="space-y-3.5 text-xs text-zinc-400">
                {[
                  'Personalized Guidance',
                  'Study Improvement Tips',
                  'Child Growth & Development',
                  'Learning Strategies'
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <button 
              onClick={() => {
                setChatMessages([
                  {
                    id: 'welcome',
                    sender: 'ai',
                    text: "Namaste! I am your AI Educational Guidance Assistant for Saraswati Tutorials. How can I help you improve your child's academic performance today?",
                    mode: 'local-nlp'
                  }
                ]);
              }}
              className="w-full py-3 bg-white hover:bg-zinc-100 text-black font-bold text-xs rounded-xl shadow-md transition-all"
            >
              Start New Chat
            </button>
          </div>

          {/* Right chat interface */}
          <div className="lg:col-span-2 glass-card rounded-3xl shadow-md flex flex-col h-[400px] overflow-hidden justify-between">
            {/* Chat header */}
            <div className="px-6 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-white/20 dark:bg-black/20 flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-950 dark:text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping" />
                <span>AI Assistant Guidance Chat</span>
              </span>
            </div>

            {/* Chat bubbles */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-white/5 dark:bg-black/5">
              {chatMessages.map((msg) => (
                <div 
                  key={msg.id}
                  className={`flex gap-3 max-w-[85%] ${
                    msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border ${
                    msg.sender === 'user' 
                      ? 'bg-zinc-800 border-zinc-700 text-white text-xs' 
                      : 'bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs'
                  }`}>
                    {msg.sender === 'user' ? 'U' : 'AI'}
                  </div>
                  <div>
                    <div className={`px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black shadow-md font-semibold rounded-tr-none'
                        : 'bg-white dark:bg-slate-900 text-zinc-950 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 rounded-tl-none shadow-sm'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                </div>
              ))}

              {chatLoading && (
                <div className="flex gap-3 mr-auto max-w-[85%] items-center">
                  <div className="w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 flex items-center justify-center text-xs animate-spin">
                    <RefreshCw className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-zinc-500 dark:text-zinc-400 text-[10px] font-medium">AI is writing...</span>
                </div>
              )}
              <div ref={chatMessagesEndRef} />
            </div>

            {/* Chat input */}
            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white/20 dark:bg-black/20 flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleChatSend()}
                placeholder="Ask our AI educational counselor a question..."
                className="flex-1 glass-input rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-black dark:focus:border-white"
                disabled={chatLoading}
              />
              <button 
                onClick={() => handleChatSend()}
                disabled={chatLoading || !chatInput.trim()}
                className="p-2 bg-zinc-950 dark:bg-zinc-100 hover:bg-zinc-900 dark:hover:bg-zinc-200 text-white dark:text-black rounded-xl disabled:opacity-40"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Inquiry Section (Book a Free Demo Class) */}
      <section id="contact" className="max-w-6xl mx-auto px-6 py-12 glass-card rounded-[32px] shadow-sm grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left details panel */}
        <div className="lg:border-r border-zinc-200 dark:border-zinc-800 lg:pr-8 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-xl font-extrabold text-zinc-950 dark:text-white">Book a Free Demo Class</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
              Fill out the form and our team will get in touch with you. We will coordinate a trial session with the matching tutor.
            </p>
          </div>

          <div className="space-y-4 text-xs text-zinc-600 dark:text-zinc-300 font-bold">
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-zinc-900 dark:text-zinc-300" />
              <span>+91 98676 54321</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-zinc-900 dark:text-zinc-300" />
              <span>info@saraswatitutorial.in</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-zinc-900 dark:text-zinc-300" />
              <span>Mumbai, Maharashtra</span>
            </div>
          </div>
        </div>

        {/* Right form panel */}
        <form onSubmit={handleInquirySubmit} className="lg:col-span-2 space-y-4">
          <h4 className="text-sm font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wide">Enter Registration Details</h4>
          
          {inquirySuccess && (
            <div className="bg-teal-500/10 border border-teal-500/30 p-4 rounded-xl text-teal-700 dark:text-teal-400 text-xs">
              {inquirySuccess}
            </div>
          )}

          {inquiryError && (
            <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl text-red-700 dark:text-red-400 text-xs">
              {inquiryError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Full Name"
              value={inquiryName}
              onChange={(e) => setInquiryName(e.target.value)}
              className="glass-input px-4 py-2.5 text-xs rounded-xl focus:outline-none focus:border-black dark:focus:border-white"
            />
            <input
              type="text"
              placeholder="Phone Number"
              value={inquiryPhone}
              onChange={(e) => setInquiryPhone(e.target.value)}
              className="glass-input px-4 py-2.5 text-xs rounded-xl focus:outline-none focus:border-black dark:focus:border-white"
            />
            <input
              type="email"
              placeholder="Email Address"
              value={inquiryEmail}
              onChange={(e) => setInquiryEmail(e.target.value)}
              className="glass-input px-4 py-2.5 text-xs rounded-xl focus:outline-none focus:border-black dark:focus:border-white"
            />
            
            <select
              value={inquiryClass}
              onChange={(e) => setInquiryClass(e.target.value)}
              className="glass-input px-4 py-2.5 text-xs rounded-xl focus:outline-none focus:border-black dark:focus:border-white"
            >
              <option value="">Select Class...</option>
              <option value="Class 6">Class 6th</option>
              <option value="Class 7">Class 7th</option>
              <option value="Class 8">Class 8th</option>
              <option value="Class 9">Class 9th</option>
              <option value="Class 10">Class 10th</option>
              <option value="Class 11">Class 11th</option>
              <option value="Class 12">Class 12th</option>
              <option value="Graduation">Graduation / Engineering</option>
            </select>
            
            <input
              type="text"
              placeholder="Select Subject (e.g. Mathematics)"
              value={inquirySubject}
              onChange={(e) => setInquirySubject(e.target.value)}
              className="glass-input px-4 py-2.5 text-xs rounded-xl focus:outline-none focus:border-black dark:focus:border-white"
            />

            <input
              type="text"
              placeholder="Preferred Time (e.g. Weekends 4-6 PM)"
              value={inquiryTime}
              onChange={(e) => setInquiryTime(e.target.value)}
              className="glass-input px-4 py-2.5 text-xs rounded-xl focus:outline-none focus:border-black dark:focus:border-white"
            />
          </div>

          <textarea
            placeholder="Your Message / Specific learning targets..."
            value={inquiryMessage}
            onChange={(e) => setInquiryMessage(e.target.value)}
            className="w-full h-24 glass-input px-4 py-2.5 text-xs rounded-xl focus:outline-none focus:border-black dark:focus:border-white resize-none"
          />

          <button
            type="submit"
            disabled={inquiryLoading}
            className="w-full py-3 bg-zinc-950 hover:bg-black text-white font-bold text-xs rounded-xl shadow-md transition-all border border-zinc-900 dark:border-zinc-800"
          >
            {inquiryLoading ? 'Submitting Form...' : 'Submit Inquiry'}
          </button>
        </form>
      </section>

      {/* 9. AI Recommendation / Recommended Tutors Strip */}
      <section className="max-w-6xl mx-auto px-6 space-y-6">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-950 dark:text-white">AI Recommendations</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 dark:text-white mt-1">Recommended Tutors For You</h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm mt-0.5 font-medium">AI has recommended the best tutors based on your requirements</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {displayTutors.map((tutor) => (
            <div 
              key={tutor._id} 
              className="glass-card rounded-2xl p-5 shadow-sm hover:shadow flex flex-col justify-between gap-4 border border-zinc-200 dark:border-zinc-800"
            >
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-950 dark:text-zinc-100 flex items-center justify-center font-extrabold text-sm border border-zinc-200 dark:border-zinc-800 shrink-0 select-none">
                  {tutor.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="min-w-0">
                  <h4 className="font-extrabold text-xs sm:text-sm text-zinc-950 dark:text-white truncate">{tutor.name}</h4>
                  <p className="text-[10px] text-zinc-700 dark:text-zinc-300 font-extrabold truncate">{tutor.qualification}</p>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5 font-medium">{tutor.experience_years} Years Exp • ₹{tutor.rate_per_hour}/hr</p>
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-1 text-[10px] font-extrabold text-amber-500">
                  <Star className="w-3.5 h-3.5 fill-amber-500" />
                  <span>{tutor.rating > 0 ? tutor.rating : "New"}</span>
                </div>
                <button
                  onClick={() => {
                    setSelectedTutorId(tutor.user_id);
                    navigateTo('tutor-details');
                  }}
                  className="px-3.5 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-750 text-zinc-900 dark:text-zinc-100 border border-zinc-250 dark:border-zinc-800 font-bold text-[10px] rounded-lg transition-all"
                >
                  View Profile
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 10. How It Works Onboarding Flow */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-6 py-12 glass-card rounded-[32px] shadow-sm">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 dark:text-white">Connecting Parents with Elite Tutors</h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm mt-1 font-medium">Our simple four-step tutoring onboarding pipeline</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { num: '1', title: 'Register Account', desc: 'Create your account specifying student syllabus class, subjects, and learning weaknesses.' },
            { num: '2', title: 'AI Matching', desc: 'Our smart recommendation scans coordinates to match active slots and budgets.' },
            { num: '3', title: 'Free Demo Class', desc: 'Schedule an initial trial lecture to evaluate compatibility before making payments.' },
            { num: '4', title: 'Weekly Tracking', desc: 'Access logged attendance sheets, homework grades, and AI diagnostic reports.' }
          ].map((step, idx) => (
            <div key={idx} className="text-center relative">
              <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full flex items-center justify-center font-bold text-zinc-900 dark:text-zinc-100 text-base mx-auto mb-4">
                {step.num}
              </div>
              <h4 className="font-extrabold text-zinc-950 dark:text-white mb-2 text-sm">{step.title}</h4>
              <p className="text-zinc-500 dark:text-zinc-400 text-xs leading-relaxed max-w-[200px] mx-auto">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
