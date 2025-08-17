import axios from "axios";

export const http = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || "http://localhost:3002/api",
  withCredentials: false, // Bearer 토큰이면 false
});

// 매 요청마다 Authorization 헤더 자동 부착
http.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken"); // 저장 위치에 맞게 수정 가능
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
