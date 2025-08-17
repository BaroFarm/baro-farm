// client/src/api/seller.js
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:3002/api";

// 판매자 정보 조회
export async function getSeller(storeId, token) {
  return axios.get(`${API_BASE}/seller`, {
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    params: { store_id: storeId },
    withCredentials: true,
  });
}

// 판매자 정보 변경
export async function patchSeller(payload, token) {
  return axios.patch(`${API_BASE}/seller`, payload, {
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    withCredentials: true,
  });
}
