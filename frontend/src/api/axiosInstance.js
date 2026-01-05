import axios from "axios";

const axiosInstance = axios.create({
  baseURL:
    import.meta.env.MODE === "development" ? import.meta.env.SERVER_URI : "",
  withCredentials: true,
});

export default axiosInstance;
