// src/components/mypage/MyInquiryDetailView.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function MyInquiryDetailView() {
  const nav = useNavigate();

  // TODO: 실제 데이터로 교체
  const data = {
    category: "상품 문의",
    title: "사과 유통기한 문의",
    isPublic: true,
    createdAt: "2025-07-10 14:30:00",
    content:
      "무농약 유기농 사과 유통기한이 어떻게 되나요? 보통 구매하면 어느 정도 기간 내에 섭취해야 하는지 궁금합니다. 구매 전에 확인하고 싶습니다.",
    answer:
      "안녕하세요, 고객님. 문의하신 사과의 유통기한은 수령일로부터 약 7~10일 정도이며, 신선도 유지를 위해 가급적 빨리 섭취하시는 것을 권장드립니다. 감사합니다.",
  };

  return (
    <div style={S.page}>
      {/* 상단 타이틀 */}
      <h2 style={S.pageTitle}>나의 문의 내역</h2>
      <hr style={S.hrBold} />

      {/* 메타 정보 */}
      <div style={S.metaWrap}>
        {/* 라벨-값 '붙게', 왼쪽 정렬 */}
        <MetaRow label="카테고리" value={data.category} />
        <MetaRow label="제목" value={data.title} />

        {/* 공개여부(좌)  |  등록일(가운데) */}
        <div style={S.metaRowComplex}>
          <InlinePair label="공개 여부" value={data.isPublic ? "공개" : "비공개"} />
          <InlinePairCenter label="등록일" value={data.createdAt} />
        </div>
      </div>

      {/* 문의 내용 */}
      <h3 style={S.sectionTitle}>문의 내용</h3>
      <div style={S.bubble}>{data.content}</div>

      <hr style={S.hrLight} />

      {/* 답변 내용 */}
      <h3 style={S.sectionTitle}>답변 내용</h3>
      <div style={S.bubble}>{data.answer}</div>

      {/* 하단 버튼 — 이미지 느낌으로 크게 */}
      <div style={S.footer}>
  <button type="button" style={S.backBtn} onClick={() => nav(-1)}>
    <span style={S.chevron} aria-hidden>&lt;</span>
    <span style={S.backLabel}>이전으로</span>
  </button>
</div>
    </div>
  );
}

/* ===== Sub components ===== */
function MetaRow({ label, value }) {
  return (
    <div style={S.metaRow}>
      <span style={S.metaLabel}>{label}</span>
      <span style={S.metaValue}>{value}</span>
    </div>
  );
}

function InlinePair({ label, value }) {
  return (
    <div style={S.inlinePair}>
      <span style={S.metaLabel}>{label}</span>
      <span style={S.metaValue}>{value}</span>
    </div>
  );
}

function InlinePairCenter({ label, value }) {
  return (
    <div style={S.inlinePairCenter}>
      <span style={S.metaLabel}>{label}</span>
      <span style={S.metaValue}>{value}</span>
    </div>
  );
}

/* ================== Styles ================== */
const S = {
  page: {
    maxWidth: 980,
    margin: "40px auto 110px",
    padding: "0 12px",
    fontFamily:
      "Pretendard, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Noto Sans KR, sans-serif",
    color: "#111",
  },

  /* 소제목/라벨 크게(내용 크기 이상으로) */
  pageTitle: { margin: 0, fontSize: 28, fontWeight: 800, textAlign: "left" },
  sectionTitle: { margin: "28px 0 12px", fontSize: 20, fontWeight: 800, textAlign: "left" },

  hrBold: { margin: "16px 0 22px", border: 0, height: 2, background: "#111" },
  hrLight: { margin: "32px 0 18px", border: 0, height: 1, background: "#E5E5E5" },

  metaWrap: { marginTop: 6, marginBottom: 6 },

  /* 라벨-값 '붙게' + 왼쪽정렬 */
  metaRow: {
    display: "flex",
    alignItems: "center",
    gap: 6,               // ★ 라벨-값 사이 좁힘
    padding: "8px 0",
  },
  metaLabel: { minWidth: 84, fontSize: 18, fontWeight: 800, color: "#222", textAlign: "left" },
  metaValue: { fontSize: 18, fontWeight: 600, color: "#222", textAlign: "left" },

  /* 공개여부(좌) + 등록일(가운데) 한 줄 배치 */
  metaRowComplex: {
    display: "flex",
    alignItems: "center",
    padding: "4px 0",
  },
  inlinePair: { display: "flex", alignItems: "center", gap: 6 },
  inlinePairCenter: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    flex: 1,
    justifyContent: "center", // ★ 등록일을 가운데로
  },

  bubble: {
    padding: "16px 18px",
    background: "#fff",
    border: "1px solid #E2E2E2",
    borderRadius: 12,
    lineHeight: 1.72,
    color: "#333",
  },

  footer: { display: "flex", justifyContent: "flex-start", marginTop: 46 },

  /* ▼ 이미지처럼 크게·둥글게·외곽선 버튼 + 왼쪽 동그란 화살표 */
  backBtn: {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 14,
  height: 56,
  padding: "0 32px",
  borderRadius: 9999,
  border: "1.5px solid #111",   // 첫 이미지처럼 진한 테두리
  background: "#fff",
  color: "#111",
  cursor: "pointer",
  lineHeight: 1,
},

  chevron: { fontSize: 22, transform: "translateY(-1px)" },
backLabel: { fontSize: 18, fontWeight: 800 },
};