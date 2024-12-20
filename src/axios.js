import axios from "axios";

// Set the base URL for Axios
const axiosInstance = axios.create({
  baseURL: "https://airstate-server.vercel.app", // Your backend URL
});

// Intercept requests to add Authorization header if token exists
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
