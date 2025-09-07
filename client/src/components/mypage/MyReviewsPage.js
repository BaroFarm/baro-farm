// src/pages/MyReviewsPage.jsx
import React, { useMemo, useState } from "react";

/** 별점 아이콘 */
function RatingStars({ value = 0, size = 20 }) {
  const stars = Array.from({ length: 5 }, (_, i) => i < value);
  return (
    <div style={{ display: "inline-flex", gap: 6 }}>
      {stars.map((filled, i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" aria-hidden>
          <path
            d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.62L12 2 9.19 8.62 2 9.24l5.46 4.73L5.82 21z"
            fill={filled ? "#FFD54F" : "#E0E0E0"}
          />
        </svg>
      ))}
    </div>
  );
}

/** 공통 카드 */
const Card = ({ children, style }) => (
  <div
    style={{
      border: "1px solid #E6E6E6",
      borderRadius: 16,
      background: "#fff",
      padding: 20,
      boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
      ...style,
    }}
  >
    {children}
  </div>
);

/** 모달(리뷰 팝업) */
function ReviewModal({ open, onClose, review }) {
  if (!open || !review) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "grid",
        placeItems: "center",
        zIndex: 1000,
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "min(720px, 96vw)",
          maxHeight: "90vh",
          overflow: "auto",
          background: "#fff",
          borderRadius: 18,
          padding: 24,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <img
            src={review.productThumb}
            alt=""
            style={{
              width: 64,
              height: 64,
              borderRadius: 12,
              objectFit: "cover",
              border: "1px solid #eee",
            }}
          />
          <div>
            <div style={{ fontWeight: 700, fontSize: 18 }}>{review.productName}</div>
            <div style={{ color: "#888", fontSize: 13 }}>{review.sellerName}</div>
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <RatingStars value={review.rating} size={22} />
          <span style={{ marginLeft: 8, color: "#888", fontSize: 12 }}>작성일 {review.date}</span>
        </div>

        <div style={{ marginTop: 16, whiteSpace: "pre-wrap", lineHeight: 1.7 }}>
          {review.content}
        </div>

        {review.images?.length ? (
          <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
            {review.images.map((src, i) => (
              <img
                key={i}
                src={src}
                alt=""
                style={{
                  width: 120,
                  height: 120,
                  objectFit: "cover",
                  borderRadius: 12,
                  border: "1px solid #eee",
                }}
              />
            ))}
          </div>
        ) : null}

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 24 }}>
          <button
            onClick={onClose}
            style={{
              padding: "10px 16px",
              borderRadius: 12,
              border: "1px solid #ddd",
              background: "#fafafa",
              cursor: "pointer",
            }}
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}

/** 긴 텍스트 줄임 */
function Truncate({ text, max = 160 }) {
  if (text.length <= max) return <>{text}</>;
  return <>{text.slice(0, max)}…</>;
}

/** 더미 데이터 (API 연동 시 교체) */
const SAMPLE = [
  {
    id: 1,
    productName: "상품명",
    sellerName: "판매농가(지역명칭)",
    productThumb:
      "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?q=80&w=300&auto=format&fit=crop",
    rating: 4,
    date: "2025.09.01",
    content: "배송도 빠르고 사과 맛있어요! 양도 굿",
    images: [
      "https://images.unsplash.com/photo-1567306301408-9b74779a11af?q=80&w=240&auto=format&fit=crop",
    ],
  },
  {
    id: 2,
    productName: "상품명",
    sellerName: "판매농가(지역명칭)",
    productThumb:
      "https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?q=80&w=300&auto=format&fit=crop",
    rating: 5,
    date: "2025.08.28",
    content:
      "양도 굿 배송도 빠르고 사과 맛있어요! 양도 굿 배송도 빠르고 사과 맛있어요! 양도 굿 배송도 빠르고 사과 맛있어요! 양도 굿 배송도 빠르고 사과 맛있어요! 양도 굿 배송도 빠르고 사과 맛있어요!",
    images: [],
  },
  {
    id: 3,
    productName: "상품명",
    sellerName: "판매농가(지역명칭)",
    productThumb:
      "https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?q=80&w=300&auto=format&fit=crop",
    rating: 4,
    date: "2025.08.14",
    content: "배송도 빠르고 사과 맛있어요! 양도 굿",
    images: [
      "https://images.unsplash.com/photo-1542831371-d531d36971e6?q=80&w=240&auto=format&fit=crop",
    ],
  },
];

export default function MyReviewsPage() {
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [activeReview, setActiveReview] = useState(null);

  const filtered = useMemo(() => {
    const q = query.trim();
    if (!q) return SAMPLE;
    return SAMPLE.filter(
      (r) =>
        r.productName.includes(q) ||
        r.sellerName.includes(q) ||
        r.content.includes(q)
    );
  }, [query]);

  const openModal = (review) => {
    setActiveReview(review);
    setModalOpen(true);
  };

  return (
    <div style={styles.page}>
      {/* 제목 (좌측 정렬) */}
      <h2 style={styles.h2}>나의 리뷰 목록</h2>
      {/* 제목 하단 구분선 */}
      <div style={styles.sectionDivider} />

      {/* 검색 바: 폭 축소 + 테두리 */}
      <div style={styles.searchWrap}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="검색어를 입력하세요."
          style={styles.searchInput}
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            style={styles.clearBtn}
            aria-label="검색어 지우기"
          >
            ×
          </button>
        )}
      </div>

      {/* 리뷰 리스트 */}
      <div style={{ display: "grid", gap: 16, marginTop: 12 }}>
        {filtered.map((r) => (
          <Card key={r.id} style={{ padding: 0 }}>
            {/* 상단: 상품 정보 */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: 16,
                borderBottom: "1px solid #F0F0F0",
              }}
            >
              <img
                src={r.productThumb}
                alt=""
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 12,
                  objectFit: "cover",
                  border: "1px solid #eee",
                }}
              />
              <div>
                <div style={{ fontWeight: 700 }}>{r.productName}</div>
                <div style={{ color: "#999", fontSize: 12 }}>{r.sellerName}</div>
              </div>
            </div>

            {/* 본문 */}
            <div style={{ padding: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <RatingStars value={r.rating} />
                <span style={{ color: "#888", fontSize: 12 }}>작성일</span>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "88px 1fr",
                  gap: 16,
                  alignItems: "start",
                  marginTop: 14,
                }}
              >
                {/* 리뷰 대표 이미지 */}
                <div
                  style={{
                    width: 88,
                    height: 88,
                    borderRadius: 12,
                    background: r.images?.[0]
                      ? `url(${r.images[0]}) center/cover`
                      : "#F4F4F4",
                    border: "1px solid #eee",
                  }}
                />

                {/* 텍스트 + 더보기 */}
                <div style={{ color: "#222", lineHeight: 1.7 }}>
                  <div style={{ marginBottom: 6 }}>
                    <Truncate text={r.content} max={120} />
                  </div>
                  <div style={{ color: "#666", fontSize: 14 }}>
                    <Truncate
                      text={r.content + " " + r.content + " " + r.content}
                      max={240}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => openModal(r)}
                    style={styles.moreBtn}
                  >
                    더보기
                  </button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* 팝업 */}
      <ReviewModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        review={activeReview}
      />
    </div>
  );
}

const styles = {
  page: {
    maxWidth: 960,
    margin: "24px auto 80px",
    padding: "0 16px",
  },
  h2: {
    fontSize: 24,
    fontWeight: 800,
    margin: "0 0 12px",
    textAlign: "left", // 제목 왼쪽 정렬
  },
  sectionDivider: {
    borderBottom: "1px solid #D9D9D9", //  타이틀 아래 구분선
    margin: "0 0 16px",
  },
  
   //  가운데 정렬된 검색바
  searchWrap: {
    position: "relative",
    background: "#E8FAEA",
    borderRadius: 999,
    padding: "10px 44px 10px 16px",
    color: "#5B8E61",
    border: "1px solid #CFE9D2",
    width: "min(620px, 100%)",
    margin: "0 auto", // 가운데 정렬
  },
  searchInput: {
    width: "100%",
    border: "none",
    outline: "none",
    background: "transparent",
    fontSize: 14,
  },
  clearBtn: {
    position: "absolute",
    right: 8,
    top: "50%",
    transform: "translateY(-50%)",
    border: "none",
    background: "transparent",
    fontSize: 18,
    color: "#6D6D6D",
    cursor: "pointer",
    lineHeight: 1,
  },
  moreBtn: {
    marginTop: 10,
    padding: "8px 12px",
    borderRadius: 10,
    border: "1px solid #DADADA",
    background: "#fff",
    cursor: "pointer",
    color: "#333",
  },
};
