import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import ProductGrid from "./ProductGrid";
import { mockProducts } from "../../../data/mockProducts";

function generateNewGuestId() {
  return "guest_" + Date.now() + "_" + Math.floor(Math.random() * 10000);
}
function dedupeById(list) {
  return Array.from(new Map(list.map(p => [p.id, p])).values());
}

// ✅ 외부 products를 받으면 그걸 그대로 렌더, 없으면(=undefined)만 fetch
export default function ProductList({
  products: externalProducts,           // ← 추가: 외부 데이터
  type = "all",
  category,
  region,
  sort = "latest",
  page = 1,
  limit = 20,
  onTotalPagesChange,
}) {
  const BASE = process.env.REACT_APP_API_BASE_URL;
  const [products, setProducts] = useState(externalProducts ?? []);
  const [loading, setLoading]   = useState(!externalProducts); // 외부 있으면 로딩 X
  const [error, setError]       = useState(null);
  const isSubList = type === "subscription";

  // 외부 products가 바뀌면 그대로 반영하고 fetch 스킵
  useEffect(() => {
    if (externalProducts) {
      setProducts(externalProducts);
      setLoading(false);
      setError(null);
    }
  }, [externalProducts]);

  // 외부가 없을 때만 fetch
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
    if (externalProducts) return; // ✅ 외부 데이터가 있으면 fetch 하지 않음
    let canceled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const accessToken = localStorage.getItem("accessToken");
        const headers = {
          "Content-Type": "application/json",
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        };

        const params = {
          ...(category ? { category } : {}),
          ...(category && region && { region }),
          sort, page, limit,
          ...(accessToken ? {} : { user_id: guestUserIdRef.current }),
        };

        const path = isSubList ? "/api/products/subscription" : "/api/products";
        const url = new URL(path, BASE);
        Object.entries(params).forEach(([k, v]) => {
          if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, v);
        });

        const res = await axios.get(url.toString(), { headers });
        if (canceled) return;

        const status = res?.data?.status ?? "success";
        const pagination = res?.data?.pagination ?? res?.data?.data?.pagination;
        const rawList =
          res?.data?.products ??
          res?.data?.data?.products ??
          res?.data?.data ??
          res?.data?.items ??
          [];

        if (status !== "success") throw new Error("API status != success");
        onTotalPagesChange?.(pagination?.total_pages ?? 1);

        const mapped = (rawList || []).map(item => ({
          id: item.product_id ?? item.id,
          name: item.name || item.title,
          price: item.price,
          image: item.image_url ?? item.image,
          rating: item.average_rating ?? item.rating ?? 0,
          isSubscription: item.is_subscription_available ?? item.isSubscription ?? false,
        }));

        setProducts(dedupeById(mapped));
      } catch (e) {
        console.error("[ProductList] fetch error → fallback to mock:", e);
        let data = mockProducts;
        if (isSubList) data = data.filter(i => i.is_subscription_available);
        else if (type === "category" && category) data = data.filter(i => i.category === category);

        const mapped = data.map(item => ({
          id: item.product_id ?? item.id,
          name: item.name,
          price: item.price,
          image: item.image_url ?? item.image,
          rating: item.average_rating ?? item.rating ?? 0,
          isSubscription: item.is_subscription_available ?? item.isSubscription ?? false,
        }));
        setProducts(dedupeById(mapped));
        setError("실서버 대신 임시 데이터를 표시합니다.");
      } finally {
        if (!canceled) setLoading(false);
      }
    };

    load();
    return () => { canceled = true; };
  }, [externalProducts, type, category, region, sort, page, limit, isSubList, BASE, onTotalPagesChange]);

  if (loading) return <div style={{ padding: 16 }}>상품 불러오는 중…</div>;

  return (
    <>
      {error && (
        <div style={{ padding: 12, marginBottom: 8, background: "#fff3cd", border: "1px solid #ffeeba" }}>
          {error}
        </div>
      )}
      <ProductGrid
        products={products}
        title="로컬푸드 목록"
        forceFrom={isSubList ? "sub" : undefined}
      />
      {products.length === 0 && (
        <div style={{ padding: 16, color: "#666" }}>표시할 상품이 없어요.</div>
      )}
    </>
  );
}
