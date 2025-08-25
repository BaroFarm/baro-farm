// src/pages/PreferenceOverviewPage.jsx
import React from "react";

/** 스토어 전체 선호도 분석 상세 페이지 */
export default function PreferenceOverviewPage() {
  const reviews = [
    { user: "사용자 1", rating: 4, date: "2024.04.24", text: "아주 달고 맛있어요" },
    { user: "사용자 2", rating: 5, date: "2024.04.24", text: "신선하고 포장도 깔끔!" },
    { user: "사용자 3", rating: 3, date: "2024.04.24", text: "무난했어요." },
    { user: "사용자 4", rating: 4, date: "2024.04.24", text: "재구매 의사 있어요." },
  ];

  return (
    <div style={styles.page}>
      <h2 style={styles.title}>스토어 전체 선호도 분석</h2>

      {/* 상단 요약 카드 */}
      <div style={styles.card}>
        <div style={styles.summaryRow}>
          <div style={styles.summaryBlock}>
            <StarIcon size={48} />
            <div>
              <div style={styles.summaryLabel}>별점 평균</div>
              <div style={styles.summaryBig}>4.5</div>
            </div>
          </div>

          <div style={styles.separator} />

          <div style={styles.summaryBlock}>
            <div>
              <div style={styles.summaryLabel}>좋아요</div>
              <div style={styles.summaryBig}>최고예요</div>
            </div>
          </div>

          <div style={styles.separator} />

          <div style={{...styles.summaryBlock, gap: 16}}>
            <Donut value={70} size={64} />
            <div>
              <div style={styles.summaryLabel}>만족도</div>
              <div style={styles.summaryBig}>70%</div>
            </div>
          </div>
        </div>
      </div>

      {/* 항목별 막대 그래프 */}
      <div style={styles.card}>
        <div style={styles.cardTitle}>항목별 만족도</div>
        <BarRow label="품목 A" value={4.2} max={5} />
        <BarRow label="품목 B" value={3.6} max={5} />
        <BarRow label="품목 C" value={4.8} max={5} />
      </div>

      {/* 리뷰 목록 */}
      <div style={styles.card}>
        <div style={styles.cardTitle}>리뷰 목록</div>
        <div style={{display: "grid", gap: 12}}>
          {reviews.map((r, i) => (
            <div key={i} style={styles.reviewRow}>
              <div>
                <div style={styles.reviewUser}>
                  {r.user} <Stars n={r.rating} />
                </div>
                <div style={styles.reviewText}>{r.text}</div>
              </div>
              <div style={styles.reviewDate}>{r.date}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------- 작은 컴포넌트들 ------- */
function StarIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{marginRight: 8}}>
      <path d="M12 2l2.9 6.1L22 9l-5 4.7L18.2 21 12 17.7 5.8 21 7 13.7 2 9l7.1-.9L12 2z" fill="#D2D5DB" />
    </svg>
  );
}

function Donut({ value = 70, size = 72 }) {
  const r = size / 2 - 6;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <svg width={size} height={size}>
      <circle cx={size/2} cy={size/2} r={r} stroke="#E5E7EB" strokeWidth="8" fill="none" />
      <circle cx={size/2} cy={size/2} r={r} stroke="#9CC285" strokeWidth="8" fill="none"
              strokeDasharray={c} strokeDashoffset={offset} transform={`rotate(-90 ${size/2} ${size/2})`} />
    </svg>
  );
}

function BarRow({ label, value, max }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div style={styles.barRow}>
      <div style={styles.barLabel}>{label}</div>
      <div style={styles.barTrack}>
        <div style={{...styles.barFill, width: `${pct}%`}} />
      </div>
      <div style={styles.barValue}>{value.toFixed(1)}</div>
    </div>
  );
}

function Stars({ n = 4 }) {
  return (
    <span style={{marginLeft: 8}}>
      {"★".repeat(n)}{"☆".repeat(5 - n)}
    </span>
  );
}

/* ------- 스타일 ------- */
const styles = {
  page: { padding: "20px 24px 40px" },
  title: { fontSize: 22, fontWeight: 'bold', margin: "8px 0 18px", textAlign: 'left' },

  card: {
    background: "#fff",
    border: "1px solid #E5E7EB",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },

  /* 상단 요약 */
  summaryRow: {
    display: "grid",
    gridTemplateColumns: "1fr auto 1fr auto 1fr",
    alignItems: "center",
    gap: 16,
  },
  summaryBlock: { display: "flex", alignItems: "center", gap: 12 },
  summaryLabel: { fontSize: 13, color: "#6B7280" },
  summaryBig: { fontSize: 20, fontWeight: 700 },

  separator: { width: 1, height: 40, background: "#E5E7EB" },

  /* 바 차트 */
  cardTitle: { fontWeight: 700, marginBottom: 12 },
  barRow: { display: "grid", gridTemplateColumns: "100px 1fr 48px", alignItems: "center", gap: 12, marginBottom: 10 },
  barLabel: { fontSize: 14, color: "#374151" },
  barTrack: { height: 10, background: "#F3F4F6", borderRadius: 999, overflow: "hidden" },
  barFill: { height: "100%", background: "#9CC285" },
  barValue: { fontSize: 14, textAlign: "right", color: "#111827" },

  /* 리뷰 */
  reviewRow: {
    display: "flex",
    justifyContent: "space-between",
    border: "1px solid #E5E7EB",
    borderRadius: 10,
    padding: "12px 14px",
    alignItems: "center",
  },
  reviewUser: { fontWeight: 600, marginBottom: 6 },
  reviewText: { fontSize: 14, color: "#374151" },
  reviewDate: { color: "#6B7280", fontSize: 13, marginLeft: 16 },
};