import axios from "axios";

const axiosInstance = axios.create({
  baseURL:
    import.meta.env.VITE_MODE === "development"
      ? import.meta.env.VITE_SERVER_URI
      : "",
  withCredentials: true,
});

export default axiosInstance;
