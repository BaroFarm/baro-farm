import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";

const BASE = process.env.REACT_APP_API_BASE_URL || "";

/** 절대경로 보정 + 빈문자/문자열 'null'/'undefined' 거르기 */
function toAbsolute(u = "") {
  if (!u || u === "null" || u === "undefined") return "";
  if (/^https?:\/\//i.test(u)) return u;   // 이미 절대경로
  if (u.startsWith("//")) return `https:${u}`; // 프로토콜-상대 → https
  try {
    return new URL(u, BASE).toString();     // /images/a.jpg → BASE 기준
  } catch {
    return u;
  }
}

/** 응답 객체에서 대표 이미지 후보를 최대한 뽑아내기 */
function pickImage(obj = {}) {
  const candidates = [
    obj.image_url,
    obj.image,
    obj.thumbnail,
    obj.thumb_url,
    obj?.images?.[0]?.img_url,
    obj?.images?.[0]?.url,
    obj?.product_images?.[0]?.image_url,
    obj?.productImages?.[0]?.url,
  ];
  for (const c of candidates) {
    const abs = toAbsolute(c || "");
    if (abs) return abs;
  }
  return ""; // 없으면 빈문자 (추후 상세 보강/폴백)
}

function clamp(n, min, max) {
  n = Number(n) || 0;
  return Math.max(min, Math.min(max, n));
}

/**
 * GET /api/products/seasonal?limit=number
 * - 응답 예: [{ id, title, price, image_url, is_subscription_available, average_rating }]
 */
export default function useSeasonalProducts({ limit = 20 } = {}) {
  const safeLimit = useMemo(() => clamp(limit, 1, 100), [limit]);

  const [items, setItems] = useState([]);   // UI 매핑 데이터
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const controllerRef = useRef(null);
  const seqRef = useRef(0);                 // 마지막 요청만 반영

  useEffect(() => {
    const controller = new AbortController();
    controllerRef.current = controller;
    const mySeq = ++seqRef.current;

    (async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("accessToken");
        const headers = {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };

        const res = await axios.get(`${BASE}/api/products/seasonal`, {
          params: { limit: safeLimit, _: Date.now() },
          headers,
          signal: controller.signal,
        });

        const raw = res?.data?.data ?? res?.data?.items ?? res?.data ?? [];

        // 1차 매핑: 가능한 모든 이미지 후보에서 대표 이미지 선택
        let mapped = (raw || []).map((p) => ({
          id: Number(p.id ?? p.product_id),
          name: p.title ?? p.name ?? "상품",
          price: clamp(p.price ?? 0, 0, Number.MAX_SAFE_INTEGER),
          image: pickImage(p),
          rating: Number(p.average_rating ?? p.rating ?? 0) || 0,
          isSubscription: Boolean(p.is_subscription_available ?? p.isSubscription ?? false),
        }));

        // 2차 보강(선택): 이미지가 빈 항목만 상세 API로 대표 이미지 보충
        // 동시 4개씩 처리하여 네트워크 부담 완화
        const targets = mapped.filter(m => !m.image).map(m => m.id);
        const chunk = (arr, n) => {
          const out = [];
          for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
          return out;
        };

        for (const group of chunk(targets, 4)) {
          const results = await Promise.allSettled(
            group.map(id =>
              axios.get(`${BASE}/api/products/${id}`, {
                params: { _: Date.now() },
                signal: controller.signal,
              })
            )
          );

          results.forEach((r, idx) => {
            if (r.status === "fulfilled") {
              const id = group[idx];
              const d = r.value?.data?.data ?? r.value?.data ?? {};
              const abs = pickImage(d);
              if (abs) {
                const i = mapped.findIndex(m => m.id === id);
                if (i >= 0) mapped[i] = { ...mapped[i], image: abs };
              }
            }
          });

          // 진행 중에도 최신 요청일 때만 반영
          if (mySeq === seqRef.current) setItems([...mapped]);
        }

        if (mySeq === seqRef.current) setItems(mapped);
      } catch (e) {
        // 취소면 무시
        if (e.name === "CanceledError" || e.code === "ERR_CANCELED") return;
        if (mySeq === seqRef.current) setError(e);
        console.error("[useSeasonalProducts] error:", e);
      } finally {
        if (mySeq === seqRef.current) setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [safeLimit]);

  return { items, loading, error };
}
