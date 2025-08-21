// src/hooks/useProducts.js
import { useEffect, useState } from "react";
import axios from "axios";

const BASE = process.env.REACT_APP_API_BASE_URL || "";

export default function useProducts({ page = 1, limit = 40, category = "", sort = "latest" }) {
    const [items, setItems] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const ctrl = new AbortController();
        setLoading(true);
        setError(null);

        (async () => {
            try {
                const params = { page, limit, sort };
                if (category) params.category = category; // 서버가 `category` 쿼리키를 받도록 통일!
                const url = `${BASE}/api/products`;
                const res = await axios.get(url, { params, signal: ctrl.signal });
                if (res.data?.status === "success") {
                    const mapped = (res.data.products || []).map((item) => ({
                        id: item.product_id ?? item.id,
                        name: item.name || item.title || "상품",
                        price: item.price,
                        image: item.image_url ?? item.image,
                        rating: item.average_rating ?? item.rating ?? 0,
                        isSubscription: item.is_subscription_available ?? false,
                        isSeasonal: item.isSeasonal ?? false,        // ← 백에서 주는 필드(없으면 너 로직으로 판단)
                        isRecommended: item.isRecommended ?? false,  // ← 동일
                }));
            // 중복 제거
                const deduped = Array.from(new Map(mapped.map((p) => [p.id, p])).values());
                setItems(deduped);
                setTotalPages(res.data.pagination?.total_pages ?? 1);
            } else {
                setItems([]);
                setTotalPages(1);
            }
        } catch (e) {
            if (!ctrl.signal.aborted) {
                setError(e);
                setItems([]);
                setTotalPages(1);
            }
        } finally {
            if (!ctrl.signal.aborted) setLoading(false);
        }
        })();

        return () => ctrl.abort();
    }, [page, limit, category, sort]);

    return { items, totalPages, loading, error };
}
