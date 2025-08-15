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
                // ✅ 캐시버스터로 304 방지
                u.searchParams.set("_", Date.now());

                const res = await fetch(u.toString(), {
                    cache: "no-store",
                    headers: { "Cache-Control": "no-cache" },
                });

                // ✅ 본문이 비어도 안전하게
                const text = await res.text();
                let data = {};
                try {
                    data = text ? JSON.parse(text) : {};
                } catch (e) {
                    console.warn("[reviews] JSON parse 실패, 원문:", text);
                }

                // ✅ 다양한 응답 스키마 방어
                const raw =
                    data.reviews ??
                    data.items ??
                    data.data?.items ??
                    data.data ??
                    data ??
                    [];

                const normalized = (Array.isArray(raw) ? raw : []).map((r, i) => ({
                    review_id: r.review_id ?? r.id ?? `${productId}-${i}`,
                    user_id: r.user_id ?? r.customer_id ?? "익명",
                    date: r.created_date ?? r.created_at ?? r.date ?? "",
                    rating: Number(r.rating ?? r.stars ?? 0),
                    content: r.content ?? r.text ?? "",
                }));

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
                    { user_id: "farm****", date: "2025-07-04", rating: 5, content: "배송도 빠르고 좋아요!!" },
                    { user_id: "farm****", date: "2025-07-04", rating: 3, content: "그냥 사과에요" },
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
