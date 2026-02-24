import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message);
    
    // Handle common error scenarios
    if (error.response?.status === 400) {
      // Bad request - validation errors
      throw new Error(error.response.data.message || 'Invalid request data');
    } else if (error.response?.status === 404) {
      // Not found
      throw new Error(error.response.data.message || 'Resource not found');
    } else if (error.response?.status === 500) {
      // Server error
      throw new Error('Server error. Please try again later.');
    } else if (error.code === 'ECONNABORTED') {
      // Timeout
      throw new Error('Request timeout. Please check your connection.');
    } else if (error.code === 'ERR_NETWORK') {
      // Network error
      throw new Error('Network error. Please check if the server is running.');
    }
    
    throw error;
  }
);

// API Service object
export const apiService = {
  // Health check
  async healthCheck() {
    const response = await api.get('/health');
    return response.data;
  },

  // Games
  async getGames() {
    const response = await api.get('/registration/games');
    return response.data;
  },

  // Colleges
  async getColleges() {
    const response = await api.get('/registration/colleges');
    return response.data;
  },

  // Sponsorship Tiers
  async getSponsorshipTiers() {
    const response = await api.get('/registration/sponsorship-tiers');
    return response.data;
  },

  // Registration ID Generation
  async generateRegistrationId(registrationType) {
    const response = await api.post('/registration/generate-id', { registrationType });
    return response.data.registrationId;
  },

  // Team Registration
  async submitTeamRegistration(teamData) {
    const response = await api.post('/registration/team', teamData);
    return response.data;
  },

  // Sponsor Registration
  async submitSponsorRegistration(sponsorData) {
    const response = await api.post('/registration/sponsor', sponsorData);
    return response.data;
  },

  // Visitor Registration
  async submitVisitorRegistration(visitorData) {
    const response = await api.post('/registration/visitor', visitorData);
    return response.data;
  },

  // Get Registration Details
  async getRegistrationDetails(registrationId) {
    const response = await api.get(`/registration/${registrationId}`);
    return response.data;
  },

  // Statistics
  async getOverviewStats() {
    const response = await api.get('/stats/overview');
    return response.data;
  },

  async getTeamStats(filters = {}) {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/stats/teams?${params}`);
    return response.data;
  },

  async getSponsorStats(filters = {}) {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/stats/sponsors?${params}`);
    return response.data;
  },

  async getGameStats() {
    const response = await api.get('/stats/games');
    return response.data;
  },

  async getCollegeStats() {
    const response = await api.get('/stats/colleges');
    return response.data;
  },

  async getTimelineStats(days = 30) {
    const response = await api.get(`/stats/timeline?days=${days}`);
    return response.data;
  },

  async getIncompleteTeams() {
    const response = await api.get('/stats/incomplete-teams');
    return response.data;
  },
};

// Export the axios instance for direct use if needed
export default api;
