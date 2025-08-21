// src/pages/ProductDetailPage.js
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useLocation, useSearchParams } from "react-router-dom";
import ShopNav from "../components/common/ShopNav";
import ProductSummary from "../components/productDetail/ProductSummary";
import ProductDetailNav from "../components/productDetail/ProductDetailNav";
import ProductDetailInfo from "../components/productDetail/ProductDetailInfo";
import ProductPolicy from "../components/productDetail/ProductPolicy";
import ProductReviewList from "../components/productDetail/ProductReviewList";
import ProductQnA from "../components/productDetail/ProductQnA";
import mockProductDetail from "../data/mockProductDetail";

// -------------------- 헬퍼 (컴포넌트 밖) --------------------
const fallbackImg = (id, name) =>
  `https://picsum.photos/seed/${encodeURIComponent(String(id ?? name ?? "default"))}/800/600`;

function normalizeProduct(d, productId) {
  if (!d || typeof d !== "object") return null;

  const id =
    d.id ?? d.product_id ?? d.productId ?? (productId ? Number(productId) : undefined);
  const name = (d.name ?? d.title ?? d.product_name ?? "상품").toString().trim() || "상품";

  // ⭐ 별점 통합: 어떤 키로 와도 동작
  const ratingVal = Number(d.average_rating ?? d.rating ?? d.avg_rating ?? 0);

  
 // ✅ 영상 필드: 상세 응답에 실려온 걸 그대로 사용
 const video_url =
   d.video_url ??
   d.video?.url ??
   d.media?.video_url ?? // (백 스키마가 다를 가능성 대비)
   "";

  return {
    id,
    name,
    title: name,
    price: Number(d.price ?? 0),
    image:
      d.image_url ??
      d.image ??
      d.thumbnail ??
      d.main_image_url ??
      d.images?.[0]?.image_url ??
      d.images?.[0]?.url ??
      fallbackImg(id, name),

    weight: d.weight ?? null,
    status: d.status ?? null,
    description: d.description ?? "",
    intro: d.intro ?? d.short_description ?? "",
    category: d.category ?? null,
    seller: d.seller ?? null,
    store: d.store ?? null,

    // ⭐ 둘 다 세팅 (ProductSummary/다른 컴포넌트 호환)
    average_rating: ratingVal,
    rating: ratingVal,

    // ✅ 영상 관련
   is_video: d.is_video ?? Boolean(video_url),
   video_url,

    is_returnable: d.is_returnable ?? d.returnable ?? false,
    is_subscription: d.is_subscription ?? d.is_subscription_available ?? false,
    created_at: d.created_at ?? null,
    updated_at: d.updated_at ?? null,
    detail_page: d.detail_page ?? null,
  };
}

// -------------------- 컴포넌트 --------------------
export default function ProductDetail() {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("상품 설명");

  const location = useLocation();
  const [search] = useSearchParams();

  // 정기배송/목록에서 온 경우
  const fromSubscription =
    location.state?.from === "subscription" || search.get("from") === "sub";
  const subscriptionOnly = !!fromSubscription;

  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);
      try {
        // const res = await fetch(
        //   `${process.env.REACT_APP_API_BASE_URL}/api/products/${productId}`
        // );
        const u = new URL(`/api/products/${productId}`, process.env.REACT_APP_API_BASE_URL);
        u.searchParams.set('_', Date.now());
        const res = await fetch(u.toString(), { cache: 'no-store', headers: { 'Cache-Control': 'no-cache' } });


        if (!res.ok) {
          // 404/에러면 목으로
          const normalizedMock = normalizeProduct(mockProductDetail, productId);
          if (alive) setProduct(normalizedMock);
          return;
        }

        const json = await res.json();
        // 다양한 스키마 방어
        const raw = json?.data ?? json?.product ?? json;
        const normalized = normalizeProduct(raw, productId);
        if (alive) setProduct(normalized);
      } catch (err) {
        console.error("상품 정보를 불러오지 못했습니다. 예시 데이터를 사용합니다", err);
        const normalizedMock = normalizeProduct(mockProductDetail, productId);
        if (alive) setProduct(normalizedMock);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [productId]);

  // product가 아직 null일 때를 대비한 안전값
  const safeProduct = useMemo(
    () => product ?? normalizeProduct(mockProductDetail, productId),
    [product, productId]
  );

  if (loading) return <p>로딩 중...</p>;
  if (!safeProduct) return <p>상품을 찾을 수 없습니다.</p>;  
  return (
    <div>
      <ShopNav />
      <ProductSummary product={safeProduct} subscriptionOnly={subscriptionOnly} />

      <ProductDetailNav
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      <div style={{ padding: "24px" }}>
        {selectedCategory === "상품 설명" && <ProductDetailInfo product={safeProduct} />}
        {selectedCategory === "상세정보" && <ProductPolicy product={safeProduct} />}
        {selectedCategory === "후기" && <ProductReviewList productId={safeProduct.id} />}
        {selectedCategory === "문의" && <ProductQnA productId={safeProduct.id} />}
      </div>
    </div>
  );
}
