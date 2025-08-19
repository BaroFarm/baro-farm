// src/hooks/useRecommendations.js
import { useEffect, useRef, useState } from "react";
import axios from "axios";

const BASE = process.env.REACT_APP_API_BASE_URL || "";
function chunk(arr, n) { const out=[]; for (let i=0;i<arr.length;i+=n) out.push(arr.slice(i,i+n)); return out; }

// ✅ 상대/프로토콜-상대 URL 보정
// function toAbsolute(u = "") {
//     if (!u) return "";
//     if (/^https?:\/\//i.test(u)) return u;
//     if (u.startsWith("//")) return `https:${u}`;
//     try {
//         return new URL(u, BASE).toString();
//     } catch {
//         return u;
//     }
// }

function getOrCreateGuestId() {
    let id = localStorage.getItem("guestUserId");
    if (!id) {
        id = "guest_" + new Date().toISOString().slice(0, 10).replace(/-/g, "") + "_" + Math.floor(Math.random() * 1e6);
        localStorage.setItem("guestUserId", id);
    }
    return id;
}

export default function useRecommendations({ currentProduct } = {}) {
    const [items, setItems]   = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError]   = useState(null);
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

                const url = new URL(`${BASE}/api/products/recommendations`);
                if (!token) url.searchParams.set("user_id", getOrCreateGuestId());
                if (currentProduct?.id || currentProduct?.product_id) {
                    url.searchParams.set("product_id", String(currentProduct.id ?? currentProduct.product_id));
                }
                url.searchParams.set("_", Date.now());

                const res = await axios.get(url.toString(), { headers });

                const raw = res?.data?.data ?? res?.data?.products ?? res?.data?.items ?? [];
                // const mapped = (raw || []).map((p) => {
                //     // ✅ 여러 케이스를 모두 커버
                //     const imgCandidate =
                //         p.image_url ||
                //         p.image ||
                //         p?.images?.[0]?.img_url || // ← 추천 API가 include로 준 대표 이미지
                //         "/images/mock/no-image-240.png";

                //     return {
                //         id: p.product_id ?? p.id,
                //         name: p.title ?? p.name ?? "상품",
                //         price: Number(p.price ?? 0),
                //         image: toAbsolute(imgCandidate), // ← 절대경로 보정
                //         rating: Number(p.rating ?? p.average_rating ?? 0),
                //     };
                //});
                let mapped = raw.map(p => ({
                    id: Number(p.product_id ?? p.id),
                    name: p.title ?? p.name ?? "상품",
                    price: Number(p.price ?? 0),
                    image: p.image_url || "",   // 아직 없음
                    rating: Number(p.rating ?? p.average_rating ?? 0),
                }));

            // 2) 이미지 없는 것만 상세로 보강
                const targets = mapped.filter(m => !m.image).map(m => m.id);
                const batches = chunk(targets, 4);               // 동시 4개
                for (const group of batches) {
                    const results = await Promise.allSettled(
                        group.map(id => axios.get(`${BASE}/api/products/${id}`, { params: { _: Date.now() } }, { cache: 'no-store' }))
                    );
                    results.forEach((r, idx) => {
                        if (r.status === "fulfilled") {
                            const id = group[idx];
                            const img = r.value?.data?.data?.image_url;
                            if (img) {
                                const i = mapped.findIndex(m => m.id === id);
                                if (i >= 0) mapped[i] = { ...mapped[i], image: img };
                            }
                        }
                    });

                    if (!cancelRef.current) setItems(mapped);
                }
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
    }, [currentProduct]);

    return { items, loading, error };
}
