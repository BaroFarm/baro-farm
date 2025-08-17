// src/api/index.js
import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002/api',
  withCredentials: false,
});

// 요청 인터셉터: localStorage의 JWT를 Authorization 헤더에 붙이기
API.interceptors.request.use((config) => {
  const token =
    localStorage.getItem('accessToken') ||  // 새 키
    localStorage.getItem('token');          // 예전 키(호환)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    // 디버깅 원하면 잠깐 켜두기:
    // console.log('[API] token:', token.slice(0,16) + '...');
  }
  return config;
});

// 응답 인터셉터: 인증 만료 등 공통 처리
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      console.warn('401 Unauthorized: 토큰이 없거나 만료/무효입니다.');
    }
    return Promise.reject(err);
  }
);

export default API;
