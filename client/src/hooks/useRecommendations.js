// src/hooks/useRecommendations.js
import { useEffect, useRef, useState } from "react";
import axios from "axios";

const BASE = process.env.REACT_APP_API_BASE_URL || "";

function getOrCreateGuestId() {
  let id = localStorage.getItem("guestUserId");
  if (!id) {
    id =
      "guest_" +
      new Date().toISOString().slice(0, 10).replace(/-/g, "") +
      "_" +
      Math.floor(Math.random() * 1e6);
    localStorage.setItem("guestUserId", id);
  }
  return id;
}

/**
 * @param {{ productId?: number|string, limit?: number }} opts
 * - productId: (선택) 특정 상품 기반 추천. 없으면 일반 추천.
 * - limit: (선택) 기본 20
 */
export default function useRecommendations(opts = {}) {
  const { productId, limit = 20 } = opts;

  const [items, setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const cancelRef = useRef(false);

  useEffect(() => {
    cancelRef.current = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("accessToken");

        const headers = {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };

        const params = {
          _: Date.now(),
          limit,
          ...(productId ? { product_id: Number(productId) } : {}),
          ...(token ? {} : { user_id: getOrCreateGuestId() }),
        };

        const url = `${BASE}/api/products/recommendations`;
        const res = await axios.get(url, { headers, params });

        const raw =
          res?.data?.products ??
          res?.data?.data ??
          res?.data?.items ??
          [];

        const mapped = (raw || []).map((p) => ({
          id: p.product_id ?? p.id,
          name: p.title ?? p.name ?? "상품",
          price: Number(p.price ?? 0),
          image: p.image_url ?? p.image ?? "/images/mock/no-image-240.png",
          rating: Number(p.rating ?? p.average_rating ?? 0),
        }));

        if (!cancelRef.current) setItems(mapped);
      } catch (e) {
        if (!cancelRef.current) setError(e);
        console.error("[useRecommendations] error:", e);
      } finally {
        if (!cancelRef.current) setLoading(false);
      }
    })();

    return () => {
      cancelRef.current = true;
    };
  }, [productId, limit]); // 상품/리밋 변하면 다시 호출

  return { items, loading, error };
}
