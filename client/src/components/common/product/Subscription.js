import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ProductSlider from "./ProductSlider";

function generateNewGuestId() {
  return "guest_" + Date.now() + "_" + Math.floor(Math.random() * 10000);
}
function dedupeById(list) {
  return Array.from(new Map(list.map(p => [p.id, p])).values());
}
// 문자열/숫자 모두 허용
const truthy = v => v === true || v === "true" || v === 1 || v === "1";

export default function Subscription({
  category,
  region,
  sort = "rating",   // UI 표기값, API는 'popular'로 매핑
  page = 1,
  limit = 12,
}) {
  const API_BASE = (process.env.REACT_APP_API_BASE_URL || process.env.REACT_APP_API_URL || "").replace(/\/$/, "");

  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  const navigate = useNavigate();
  const guestUserIdRef = useRef(null);

  // 게스트 아이디 준비
  if (!guestUserIdRef.current) {
    let id = localStorage.getItem("guestUserId");
    if (!id) {
      id = generateNewGuestId();
      localStorage.setItem("guestUserId", id);
    }
    guestUserIdRef.current = id;
  }

  const handleCardClick = (p) => {
    navigate(`/shop/product/${p.id}?from=sub`, { state: { from: "subscription" } });
  };

  useEffect(() => {
    let canceled = false;

    (async () => {
      setLoading(true);
      setError(null);

      try {
        const accessToken = localStorage.getItem("accessToken");
        const headers = {
          "Content-Type": "application/json",
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        };

        // API 정렬키로 보정
        const normalizedSort = sort === "rating" ? "popular" : sort;

        // ✅ 명세대로: /api/products + regular_delivery=true
        const endpoint = `${API_BASE}/api/products`; // API_BASE 없으면 "/api/products"로 동작
        const params = {
          ...(category ? { category } : {}),
          ...(region ? { region } : {}),
          sort: normalizedSort,
          page,
          limit,
          regular_delivery: true,
          ...(accessToken ? {} : { user_id: guestUserIdRef.current }),
          _: Date.now(), // 캐시 회피
        };

        const res = await axios.get(endpoint, { headers, params });
        if (canceled) return;

        const status = res?.data?.status ?? "success";
        if (status !== "success") throw new Error("API status != success");

        const raw =
          res?.data?.products ??
          res?.data?.data?.products ??
          res?.data?.data ??
          res?.data?.items ??
          [];

        // 서버가 이미 절대경로 image_url 내려줌(getProducts에서 toAbs 처리)
        let mapped = (raw || []).map((item) => ({
          id: item.product_id ?? item.id,
          name: item.name ?? item.title ?? "상품",
          price: Number(item.price ?? 0),
          image: item.image_url ?? item.image ?? "/images/mock/no-image-240.png",
          rating: Number(item.average_rating ?? item.rating ?? 0),
          // 응답에 플래그가 없어도, 이 컴포넌트는 '정기배송 전용'이므로 true로 간주
          isSubscription: truthy(item.is_subscription_available ?? item.isSubscription ?? item.regular_delivery ?? true),
        }));

        // (선택) 응답에 명시 플래그가 있을 때만 한 번 더 필터
        if (raw.some(x => x?.is_subscription_available != null || x?.regular_delivery != null)) {
          mapped = mapped.filter(p => truthy(p.isSubscription));
        }

        setProducts(dedupeById(mapped));
      } catch (e) {
        console.error("[Subscription] fetch error:", e);
        setError("정기배송 상품을 불러오지 못해 임시 데이터를 표시합니다.");
        setProducts([
          { id: "101", name: "감자", image: "https://via.placeholder.com/200x150?text=감자", price: 3200, rating: 4.3 },
          { id: "102", name: "강원도 고구마", image: "https://via.placeholder.com/200x150?text=고구마", price: 5800, rating: 4.7 },
        ]);
      } finally {
        if (!canceled) setLoading(false);
      }
    })();

    return () => { canceled = true; };
  }, [API_BASE, category, region, sort, page, limit]);

  if (loading) return <div style={{ padding: 16 }}>정기배송 상품 불러오는 중…</div>;

  return (
    <ProductSlider
      products={products}
      title="정기배송 가능 상품"
      onMoreClick={() => navigate("/shop/products/subscription")}
      onItemClick={handleCardClick}
    />
  );
}
