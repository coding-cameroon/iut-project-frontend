import axios from "axios";

export const API_BASE_URL =
  "https://iut-project-backend-production.up.railway.app/api";
//https://iut-project-backend.onrender.com/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor — attach token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // console.log(JSON.stringify(config, null, 2));
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor — normalize errors + handle 401
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Une erreur est survenue";

    const status = error.response?.status;

    if (status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }

    console.log(JSON.stringify(error, null, 2));

    // Attach a clean message to the error before re-throwing
    error.message = message;
    return Promise.reject(error);
  },
);

// Named API calls — auth
export const authApi = {
  login: (credentials) => api.post("/auth/login", credentials),
  register: (userData) => api.post("/auth/register", userData),
  logout: () => api.post("/auth/logout"),
  getCurrentUser: () => api.get("/auth/me"),
};

// Named API calls — user
export const userApi = {
  getProfile: () => api.get("/users/profile"),
  updateProfile: (data) => api.patch("/users/profile", data),
};

export default api;
