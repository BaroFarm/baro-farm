import React, { useEffect, useState } from "react";
import ProductReviewItem from "../common/product/ProductReviewItem";
import ProductReviewSummary from "./ProductReviewSummary";

export default function ProductReviewList({ productId }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(5);

  useEffect(() => {
    if (!productId) return;
    let alive = true;

    (async () => {
      try {
        setLoading(true);

        const base = process.env.REACT_APP_API_BASE_URL;
        const u = new URL(`/api/products/${productId}/reviews`, base);
        // 캐시버스터로 304 방지
        u.searchParams.set("_", Date.now());

        const res = await fetch(u.toString(), {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache" },
        });

        const text = await res.text();
        let data = {};
        try {
          data = text ? JSON.parse(text) : {};
        } catch (e) {
          console.warn("[reviews] JSON parse 실패, 원문:", text);
        }

        const raw =
          data.reviews ??
          data.items ??
          data.data?.items ??
          data.data ??
          data ??
          [];

        const maskId = (id) => {
  const s = String(id || '');
  if (!s) return '익명';
  if (s.length <= 2) return '구매자**';
  return `구매자**${s.slice(-2)}`; // 끝 2자리만 노출
};

const normalized = (Array.isArray(raw) ? raw : []).map((r, i) => {
  const nickname =
    (typeof r.nickname === 'string' && r.nickname.trim()) ||
    (typeof r.user?.nickname === 'string' && r.user.nickname.trim()) ||
    (typeof r.customer?.nickname === 'string' && r.customer.nickname.trim());

  const emailMasked =
    (typeof r.email_masked === 'string' && r.email_masked.trim()) ||
    (typeof r.masked_email === 'string' && r.masked_email.trim());

  const displayName = nickname || emailMasked || maskId(r.user_id || r.customer_id);

  const dateRaw = r.created_date ?? r.created_at ?? r.date ?? '';
  const date = dateRaw
    ? new Date(dateRaw).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })
    : '';

  return {
    review_id: r.review_id ?? r.id ?? `${productId}-${i}`,
    user_id: displayName,
    date,
    rating: Number(r.rating ?? r.stars ?? 0),
    content: r.content ?? r.text ?? '',
    image_url: r.image_url ?? r.img_url ?? null,
  };
});

        console.log(
          "[reviews] pid=", productId,
          "status=", res.status,
          "count=", normalized.length,
          "sample=", normalized[0]
        );

        if (alive) setReviews(normalized);
      } catch (err) {
        console.error("리뷰 로드 에러 → 더미 사용", err);
        if (alive)
          setReviews([
            { review_id: `${productId}-d1`, user_id: "farm****", date: "2025-07-04", rating: 5, content: "배송도 빠르고 좋아요!!" },
            { review_id: `${productId}-d2`, user_id: "farm****", date: "2025-07-04", rating: 3, content: "그냥 사과에요" },
          ]);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => { alive = false; };
  }, [productId]);

  const handleShowMore = () => setVisibleCount((prev) => prev + 5);

  if (loading) return <p style={{ padding: 24 }}>리뷰를 불러오는 중...</p>;

  return (
    <div style={{ padding: 24 }}>
      {reviews.length === 0 ? (
        <p>아직 작성된 후기가 없습니다.</p>
      ) : (
        <>
          <ProductReviewSummary productId={productId} />
          <ul style={{ listStyle: "none", padding: 0 }}>
            {reviews.slice(0, visibleCount).map((review) => (
              <ProductReviewItem key={review.review_id} review={review} />
            ))}
          </ul>
          {visibleCount < reviews.length && (
            <button
              onClick={handleShowMore}
              style={{
                marginTop: 16, padding: "10px 20px",
                background: "none", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 16
              }}
            >
              더보기
            </button>
          )}
        </>
      )}
    </div>
  );
}
