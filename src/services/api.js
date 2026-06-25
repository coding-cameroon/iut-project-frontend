const API_BASE_URL =
  // import.meta.env.VITE_API_BASE_URL ||
  "https://iut-project-backend.onrender.com/api";

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.interceptors = {
      request: [],
      response: [],
    };
  }

  addRequestInterceptor(interceptor) {
    this.interceptors.request.push(interceptor);
  }

  addResponseInterceptor(interceptor) {
    this.interceptors.response.push(interceptor);
  }

  async request(endpoint, options = {}) {
    const token = localStorage.getItem("token");

    let config = {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    for (const interceptor of this.interceptors.request) {
      config = await interceptor(config);
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(
          errorData.message || `HTTP error! status: ${response.status}`,
        );
        error.status = response.status;
        error.data = errorData;
        throw error;
      }

      const data = await response.json();

      let processedData = data;
      for (const interceptor of this.interceptors.response) {
        processedData = await interceptor(processedData);
      }

      return processedData;
    } catch (error) {
      const errorInfo = {
        message: error.message,
        status: error.status,
        data: error.data,
        endpoint: endpoint,
        stack: error.stack,
      };
      console.error("API request failed:", errorInfo);

      if (error.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }

      throw error;
    }
  }

  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url);
  }

  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async patch(endpoint, data = {}) {
    return this.request(endpoint, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, {
      method: "DELETE",
    });
  }

  // Auth endpoints
  async login(credentials) {
    return this.post("/auth/login", credentials);
  }

  async logout() {
    return this.post("/auth/logout");
  }

  async register(userData) {
    return this.post("/auth/register", userData);
  }

  async getCurrentUser() {
    return this.get("/auth/me");
  }
}

export default new ApiService();
