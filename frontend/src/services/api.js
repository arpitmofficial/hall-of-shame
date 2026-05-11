import axios from 'axios';

const rawBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
// Ensure /api suffix is always present, even if Vercel env is set without it
const baseURL = rawBase.replace(/\/+$/, '').endsWith('/api')
  ? rawBase.replace(/\/+$/, '')
  : rawBase.replace(/\/+$/, '') + '/api';

const API = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('hos_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const register = (data) => API.post('/auth/register', data);
export const login = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');
export const getUsers = () => API.get('/auth/users');

// Matches
export const getMatches = () => API.get('/matches');
export const createMatch = (data) => API.post('/matches', data);
export const updateMatch = (id, data) => API.put(`/matches/${id}`, data);
export const getStats = () => API.get('/matches/stats');
export const deleteMatch = (id) => API.delete(`/matches/${id}`);

// Competitions
export const getCompetitions = () => API.get('/competitions');
export const createCompetition = (data) => API.post('/competitions', data);
export const getCompetition = (id) => API.get(`/competitions/${id}`);
export const toggleCompetition = (id) => API.put(`/competitions/${id}/toggle`);

// Logs
export const getLogs = (params) => API.get('/logs', { params });
export const createLog = (data) => API.post('/logs', data);
export const reviewLog = (id, data) => API.put(`/logs/${id}/review`, data);
export const getScoreboard = (competitionId) => API.get(`/logs/scoreboard/${competitionId}`);

export default API;
