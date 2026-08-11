import axios from "axios";
import { auth } from "../config/firebase";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" }
});

// Attach a fresh Firebase ID token to every request automatically
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ---- Auth ----
// Call after Firebase phone verification succeeds (confirmationResult.confirm(otp))
export const registerProfile = ({ name, role }) => api.post("/auth/register", { name, role });

// Returns { user: null } if Firebase-verified but not yet registered in our DB
export const fetchProfile = () => api.get("/auth/me");

export default api;