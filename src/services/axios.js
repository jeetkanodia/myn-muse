import axios from "axios";
import { REACT_APP_API_URL } from "../constants/baseURL";

const axiosInstance = axios.create({
  baseURL: REACT_APP_API_URL,
  withCredentials: true,
});

export default axiosInstance;