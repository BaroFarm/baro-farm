// src/pages/MyReviewsPage.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";

/** ---------- 유틸 ---------- */
const API_BASE = (process.env.REACT_APP_API_BASE_URL || "").replace(/\/$/, "");
const REVIEWS_API = `${API_BASE}/api/my/reviews`;
const REVIEW_DETAIL_API = (id) => `${API_BASE}/api/reviews/${id}`;

// null/undefined 만 건너뛰는 병합 유틸 (?? 대체)
function coalesce(...vals) {
  for (let i = 0; i < vals.length; i++) {
    const v = vals[i];
    if (v !== null && v !== undefined) return v;
  }
  return undefined;
}

function toAbs(url) {
  const v = String(url || "").trim().replace(/\\/g, "/");
  if (!v) return "";
  if (/^https?:\/\//i.test(v)) return v;
  return `${API_BASE}/${v.replace(/^\/+/, "")}`;
}

function fmtDate(iso) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}.${m}.${day}`;
  } catch {
    return iso;
  }
}

/** ---------- 별점 ---------- */
function RatingStars({ value = 0, size = 20 }) {
  const v = Math.max(0, Math.min(5, Number(value) || 0));
  const stars = Array.from({ length: 5 }, (_, i) => i < v);
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

/** ---------- 공통 카드 ---------- */
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

/** ---------- 모달 ---------- */
function ReviewModal({ open, onClose, review, loading }) {
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
          <span style={{ marginLeft: 8, color: "#888", fontSize: 12 }}>
            작성일 {review.date}
          </span>
        </div>

        <div style={{ marginTop: 16, whiteSpace: "pre-wrap", lineHeight: 1.7 }}>
          {review.content || (loading ? "본문 불러오는 중…" : "")}
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

/** ---------- 텍스트 줄임 ---------- */
function Truncate({ text = "", max = 160 }) {
  if (!text) return null;
  return <>{text.length <= max ? text : `${text.slice(0, max)}…`}</>;
}

/** ---------- 메인 페이지 ---------- */
export default function MyReviewsPage() {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState([]); // 누적 목록 (페이지 append)
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [activeReview, setActiveReview] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const abortRef = useRef(null);
  const mountedRef = useRef(true);

  // 마운트/언마운트 가드
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (abortRef.current) abortRef.current.abort("unmount");
    };
  }, []);

  // (목록) API 응답 → 프론트 도메인으로 매핑
  function mapReview(raw) {
    const r = raw || {};
    const productThumb = toAbs(coalesce(r.product_img_url, r.productThumb, r.product_image, ""));
    const reviewImage = toAbs(coalesce(r.img_url, r.review_img_url, ""));
    return {
      id: coalesce(r.review_id, r.id, `${r.product_id || ""}-${r.created_at || ""}`),
      productId: r.product_id,
      productName: coalesce(r.product_name, r.productName, r.title, ""),
      sellerName: coalesce(r.store_name, r.sellerName, ""),
      productThumb: productThumb || "",
      rating: Number(r.rating) || 0,
      date: fmtDate(coalesce(r.created_at, r.createdDate, r.date)),
      content: coalesce(r.content, r.summary, r.snippet, ""),
      images: reviewImage
        ? [reviewImage]
        : Array.isArray(r.images)
        ? r.images.map(toAbs)
        : [],
    };
  }

  // (상세) API 응답 → 매핑
  function mapReviewDetail(raw) {
    const r = raw || {};
    const productThumb = toAbs(coalesce(r.product_img_url, r.productThumb, r.product_image, ""));
    const reviewImage = toAbs(coalesce(r.img_url, r.review_img_url, ""));
    const content = coalesce(r.content, r.full_content, r.body, "");
    return {
      id: coalesce(r.review_id, r.id),
      productId: r.product_id,
      productName: coalesce(r.product_name, r.productName, r.title, ""),
      sellerName: coalesce(r.store_name, r.sellerName, ""),
      productThumb: productThumb || "",
      rating: Number(r.rating) || 0,
      date: fmtDate(coalesce(r.created_at, r.createdDate, r.date)),
      content,
      images: reviewImage
        ? [reviewImage]
        : Array.isArray(r.images)
        ? r.images.map(toAbs)
        : [],
    };
  }

  // 목록 호출
  async function fetchPage(p) {
    if (!REVIEWS_API) return;
    if (mountedRef.current) {
      setLoading(true);
      setErr("");
    }

    // 이전 요청 취소
    if (abortRef.current) abortRef.current.abort("next-request");
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const token =
        localStorage.getItem("accessToken") ||
        sessionStorage.getItem("accessToken") ||
        "";

      const res = await fetch(`${REVIEWS_API}?page=${p}&limit=${limit}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json", // GET에서 불필요하지만 무방
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        signal: controller.signal,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
      }

      const json = await res.json();

      let arr =
        (Array.isArray(json) && json) ||
        (Array.isArray(json?.reviews) && json.reviews) ||
        (Array.isArray(json?.data?.reviews) && json.data.reviews) ||
        (Array.isArray(json?.data?.result) && json.data.result) ||
        [];

      const mapped = arr.map(mapReview);

      if (mountedRef.current) {
        setHasMore(mapped.length >= limit);
        setItems((prev) => (p === 1 ? mapped : [...prev, ...mapped]));
      }
    } catch (e) {
      if (e.name === "AbortError") return; // 취소는 정상
      console.error(e);
      if (mountedRef.current) setErr(e.message || "리뷰를 불러오지 못했습니다.");
    } finally {
      if (mountedRef.current) setLoading(false);
      abortRef.current = null;
    }
  }

  // 최초/페이지 변경 시 로드
  useEffect(() => {
    fetchPage(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit]);

  // 검색 필터
  const filtered = useMemo(() => {
    const q = query.trim();
    if (!q) return items;
    return items.filter(
      (r) =>
        r.productName.includes(q) ||
        r.sellerName.includes(q) ||
        r.content.includes(q)
    );
  }, [items, query]);

  // 상세 열기: 즉시 모달 + 백그라운드 상세 갱신
  const openModal = async (review) => {
    setActiveReview(review || null);
    setModalOpen(true);
    if (!review || !review.id) return;

    try {
      setDetailLoading(true);
      const token =
        localStorage.getItem("accessToken") ||
        sessionStorage.getItem("accessToken") ||
        "";

      const res = await fetch(REVIEW_DETAIL_API(review.id), {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();

      // 래핑 흡수
      const raw = coalesce(json?.data?.review, json?.review, json?.data, json);
      const full = mapReviewDetail(raw);

      // content가 더 풍부할 때만 업데이트
      if (mountedRef.current && full && full.content && full.content !== review.content) {
        setActiveReview((prev) => ({ ...(prev || {}), ...full }));
      }
    } catch (e) {
      console.warn("detail fetch skipped:", e.message || e);
    } finally {
      if (mountedRef.current) setDetailLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* 제목 */}
      <h2 style={styles.h2}>나의 리뷰 목록</h2>
      <div style={styles.sectionDivider} />

      {/* 검색 */}
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

      {/* 상태 표시 */}
      {err && (
        <div style={{ color: "#d00", marginTop: 12 }}>
          오류가 발생했습니다: {err}
        </div>
      )}

      {!loading && !err && filtered.length === 0 && (
        <div style={{ color: "#666", marginTop: 16 }}>표시할 리뷰가 없습니다.</div>
      )}

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
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 12,
                  border: "1px solid #eee",
                  background: r.productThumb
                    ? `url(${r.productThumb}) center/cover`
                    : "#F4F4F4",
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
                <span style={{ color: "#888", fontSize: 12 }}>
                  작성일 {r.date}
                </span>
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
                  <div style={{ marginBottom: 6, textAlign: 'left' }}>
                    <Truncate text={r.content} max={120} />
                  </div>
                  <button type="button" onClick={() => openModal(r)} style={styles.moreBtn}>
                    더보기
                  </button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* 더보기 / 로딩 */}
      <div style={{ marginTop: 16, display: "flex", justifyContent: "center" }}>
        {loading ? (
          <span style={{ color: "#666" }}>불러오는 중…</span>
        ) : hasMore && !err ? (
          <button
            type="button"
            onClick={() => setPage((p) => p + 1)}
            style={styles.moreBtn}
          >
            더보기
          </button>
        ) : null}
      </div>

      {/* 모달 */}
      <ReviewModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        review={activeReview}
        loading={detailLoading}
      />
    </div>
  );
}

/** ---------- 스타일 ---------- */
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
    textAlign: "left",
  },
  sectionDivider: {
    borderBottom: "1px solid #D9D9D9",
    margin: "0 0 16px",
  },
  // 가운데 정렬된 검색바
  searchWrap: {
    position: "relative",
    background: "#E8FAEA",
    borderRadius: 999,
    padding: "10px 44px 10px 16px",
    color: "#5B8E61",
    border: "1px solid #CFE9D2",
    width: "min(620px, 100%)",
    margin: "0 auto",
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
