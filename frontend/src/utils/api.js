import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add interceptor to automatically add authorization header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('saraswati_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const apiService = {
  // Authentication
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.access_token) {
      localStorage.setItem('saraswati_token', response.data.access_token);
    }
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.access_token) {
      localStorage.setItem('saraswati_token', response.data.access_token);
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('saraswati_token');
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  setupAdmin: async () => {
    const response = await api.post('/auth/admin-setup');
    return response.data;
  },

  // Tutors
  searchTutors: async (filters = {}) => {
    const response = await api.get('/tutors/search', { params: filters });
    return response.data;
  },

  getTutorDetails: async (tutorId) => {
    const response = await api.get(`/tutors/${tutorId}`);
    return response.data;
  },

  updateTutorProfile: async (profileData) => {
    const response = await api.put('/tutors/profile', profileData);
    return response.data;
  },

  getPendingTutors: async () => {
    const response = await api.get('/tutors/admin/pending');
    return response.data;
  },

  verifyTutor: async (profileId, action) => {
    const response = await api.post(`/tutors/admin/verify/${profileId}`, null, {
      params: { action },
    });
    return response.data;
  },

  // Inquiries
  createInquiry: async (inquiryData) => {
    const response = await api.post('/inquiries', inquiryData);
    return response.data;
  },

  getInquiries: async () => {
    const response = await api.get('/inquiries');
    return response.data;
  },

  acceptInquiry: async (inquiryId) => {
    const response = await api.post(`/inquiries/${inquiryId}/accept`);
    return response.data;
  },

  rejectInquiry: async (inquiryId) => {
    const response = await api.post(`/inquiries/${inquiryId}/reject`);
    return response.data;
  },

  // Progress
  getEnrollments: async () => {
    const response = await api.get('/progress/enrollments');
    return response.data;
  },

  scheduleClass: async (classData) => {
    const response = await api.post('/progress/schedule', classData);
    return response.data;
  },

  getSchedule: async () => {
    const response = await api.get('/progress/schedule');
    return response.data;
  },

  markAttendance: async (classId, attendanceStatus) => {
    const response = await api.post(`/progress/schedule/${classId}/attendance`, {
      attendance_status: attendanceStatus,
    });
    return response.data;
  },

  createAssignment: async (enrollmentId, assignmentData) => {
    const response = await api.post('/progress/assignments', assignmentData, {
      params: { enrollment_id: enrollmentId },
    });
    return response.data;
  },

  getAssignments: async () => {
    const response = await api.get('/progress/assignments');
    return response.data;
  },

  submitAssignment: async (assignmentId, submissionUrl) => {
    const response = await api.post(`/progress/assignments/${assignmentId}/submit`, {
      submission_url: submissionUrl,
    });
    return response.data;
  },

  gradeAssignment: async (assignmentId, gradingData) => {
    const response = await api.post(`/progress/assignments/${assignmentId}/grade`, gradingData);
    return response.data;
  },

  addGrade: async (enrollmentId, gradeData) => {
    const response = await api.post('/progress/grades', gradeData, {
      params: { enrollment_id: enrollmentId },
    });
    return response.data;
  },

  getGrades: async () => {
    const response = await api.get('/progress/grades');
    return response.data;
  },

  getAnalytics: async (studentId = null) => {
    const params = studentId ? { student_id: studentId } : {};
    const response = await api.get('/progress/analytics', { params });
    return response.data;
  },

  // Payments
  getInvoices: async () => {
    const response = await api.get('/payments/invoices');
    return response.data;
  },

  payInvoice: async (invoiceId, paymentMethod = 'UPI') => {
    const response = await api.post(`/payments/invoices/${invoiceId}/pay`, null, {
      params: { payment_method: paymentMethod },
    });
    return response.data;
  },

  getEarnings: async () => {
    const response = await api.get('/payments/earnings');
    return response.data;
  },

  // AI Integration
  getAiRecommendations: async (recommendData) => {
    const response = await api.post('/ai/recommend', recommendData);
    return response.data;
  },

  sendChatbotMessage: async (message, history = []) => {
    const response = await api.post('/ai/chatbot', { message, history });
    return response.data;
  },

  // Communications
  sendMessage: async (receiverId, message) => {
    const response = await api.post('/chat/send', { receiver_id: receiverId, message });
    return response.data;
  },

  getChatHistory: async (contactId) => {
    const response = await api.get(`/chat/history/${contactId}`);
    return response.data;
  },

  getContacts: async () => {
    const response = await api.get('/chat/contacts');
    return response.data;
  },
};

export default api;
