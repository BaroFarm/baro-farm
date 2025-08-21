import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import ProductGrid from "./ProductGrid";
import { mockProducts } from "../../../data/mockProducts";

function generateNewGuestId() {
  return "guest_" + Date.now() + "_" + Math.floor(Math.random() * 10000);
}
function dedupeById(list) {
  return Array.from(new Map(list.map((p) => [p.id, p])).values());
}
const truthy = (v) => v === true || v === "true" || v === 1 || v === "1";

export default function ProductList({
  products: externalProducts,
  type = "all",
  category,
  region,
  sort = "latest",
  page = 1,
  limit = 20,
  onTotalPagesChange,
}) {
  // ✅ env 미설정이어도 안전 / 끝 슬래시 제거
  const API_BASE = (process.env.REACT_APP_API_BASE_URL || process.env.REACT_APP_API_URL || "").replace(/\/$/, "");
  const endpoint = `${API_BASE}/api/products`; // API_BASE가 ""면 "/api/products"

  const [products, setProducts] = useState(externalProducts ?? []);
  const [loading, setLoading] = useState(externalProducts === undefined);
  const [error, setError] = useState(null);
  const isSubList = type === "subscription";

  // 외부 products가 바뀌면 그대로 반영하고 fetch 스킵
  useEffect(() => {
    if (externalProducts !== undefined) {
      setProducts(externalProducts);
      setLoading(false);
      setError(null);
    }
  }, [externalProducts]);

  // 게스트 ID 준비
  const guestUserIdRef = useRef(null);
  if (!guestUserIdRef.current) {
    let id = localStorage.getItem("guestUserId");
    if (!id) {
      id = generateNewGuestId();
      localStorage.setItem("guestUserId", id);
    }
    guestUserIdRef.current = id;
  }

  useEffect(() => {
    if (externalProducts !== undefined) return;
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

        // ✅ 백엔드 유효 정렬키로 보정
        const normalizedSort = sort === "rating" ? "popular" : sort;

        // ✅ 명세대로: /api/products + regular_delivery=true (정기배송 전용)
        const params = {
          ...(category ? { category } : {}),
          ...(region ? { region } : {}),
          sort: normalizedSort,
          page,
          limit,
          ...(isSubList ? { regular_delivery: true } : {}),
          ...(accessToken ? {} : { user_id: guestUserIdRef.current }),
          _: Date.now(),
        };

        const res = await axios.get(endpoint, { headers, params });
        if (canceled) return;

        const status = res?.data?.status ?? "success";
        if (status !== "success") throw new Error("API status != success");

        const pagination = res?.data?.pagination ?? res?.data?.data?.pagination;
        onTotalPagesChange?.(pagination?.total_pages ?? 1);

        const rawList =
          res?.data?.products ??
          res?.data?.data?.products ??
          res?.data?.data ??
          res?.data?.items ??
          [];

        const mapped = (rawList || []).map((item) => ({
          id: item.product_id ?? item.id,
          name: item.name || item.title || "상품",
          price: Number(item.price ?? 0),
          image: item.image_url ?? item.image ?? "/images/mock/no-image-240.png",
          rating: Number(item.average_rating ?? item.rating ?? 0),
          // ✅ 정기배송 리스트일 땐 true로 보강(응답에 없더라도)
          isSubscription:
            isSubList
              ? true
              : truthy(item.is_subscription_available ?? item.isSubscription ?? item.regular_delivery ?? false),
          category: item.category ?? item.category_name ?? null,
        }));

        setProducts(dedupeById(mapped));
      } catch (e) {
        console.error("[ProductList] fetch error → fallback to mock:", e);
        let data = mockProducts;
        if (isSubList) data = data.filter((i) => truthy(i.is_subscription_available ?? i.isSubscription));
        else if (type === "category" && category) data = data.filter((i) => (i.category || "").includes(category));

        const mapped = data.map((item) => ({
          id: item.product_id ?? item.id,
          name: item.name || item.title || "상품",
          price: Number(item.price ?? 0),
          image: item.image_url ?? item.image ?? "/images/mock/no-image-240.png",
          rating: Number(item.average_rating ?? item.rating ?? 0),
          isSubscription: truthy(item.is_subscription_available ?? item.isSubscription ?? false),
        }));
        setProducts(dedupeById(mapped));
        setError("실서버 대신 임시 데이터를 표시합니다.");
      } finally {
        if (!canceled) setLoading(false);
      }
    })();

    return () => {
      canceled = true;
    };
  }, [externalProducts, type, category, region, sort, page, limit, isSubList, endpoint, onTotalPagesChange]);

  if (loading) return <div style={{ padding: 16 }}>상품 불러오는 중…</div>;

  return (
    <>
      {error && (
        <div style={{ padding: 12, marginBottom: 8, background: "#fff3cd", border: "1px solid #ffeeba" }}>
          {error}
        </div>
      )}
      <ProductGrid products={products} title={isSubList ? "정기배송 상품" : "로컬푸드 목록"} forceFrom={isSubList ? "sub" : undefined} />
      {products.length === 0 && <div style={{ padding: 16, color: "#666" }}>표시할 상품이 없어요.</div>}
    </>
  );
}
