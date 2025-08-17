// src/api/axios.js
import axios from "axios";
import { TOKEN } from "../config/token";

const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:3002/api";

const instance = axios.create({
  baseURL: API_BASE,
  headers: {
    Authorization: `Bearer ${TOKEN}`,
  },
  withCredentials: true, // 쿠키/세션 필요 시
});

export default instance;
