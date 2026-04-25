// Centralized API base URL — change once here for production
// For local development: http://localhost:8000
// For production: Set VITE_API_URL environment variable in Vercel to your Railway backend URL
const API = import.meta.env.VITE_API_URL || "http://localhost:8000";
export default API;
