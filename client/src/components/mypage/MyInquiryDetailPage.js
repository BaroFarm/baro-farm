// src/pages/MyInquiryDetailPage.jsx
import React, { useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";

/** 데모 데이터 (실제에선 API로 대체) */
const MOCK = [
  {
    id: 1,
    category: "상품 문의",
    title: "사과 유통기한 문의",
    isPublic: true,
    createdAt: "2025-07-10 14:30:00",
    question:
      "무농약 유기농 사과 유통기한이 어떻게 되나요? 보통 구매하면 어느 정도 기간 내에 섭취해야 하는지 궁금합니다. 구매 전에 확인하고 싶습니다.",
    answer:
      "안녕하세요, 고객님. 문의하신 사과의 유통기한은 수확일로부터 약 7~10일 정도이며, 신선도 유지를 위해 가급적 빨리 섭취하시는 것을 권장드립니다. 감사합니다.",
  },
  {
    id: 2,
    category: "배송 문의",
    title: "상품 배송이 언제 되나요?",
    isPublic: false,
    createdAt: "2025-08-03 11:02:00",
    question: "주문번호 1234 배송 예정일 확인 부탁드립니다.",
    answer: null,
  },
];

export default function MyInquiryDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation() || {};
  // 1) 라우터 state로 넘어오면 그것 우선, 2) 없으면 MOCK에서 조회
  const data = useMemo(() => state?.inquiry ?? MOCK.find(v => String(v.id) === String(id)), [id, state]);

  if (!data) {
    return (
      <div style={s.page}>
        <h2 style={s.title}>나의 문의 내역</h2>
        <div style={s.divider} />
        <div style={{ padding: 24 }}>해당 문의를 찾을 수 없습니다.</div>
        <div style={{ marginTop: 24 }}>
          <button onClick={() => navigate(-1)} style={s.backBtn}>
            <span style={s.chev}>&lt;</span> 이전으로
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <h2 style={s.title}>나의 문의 내역</h2>
      <div style={s.divider} />

      {/* 메타 정보 */}
      <section style={{ marginBottom: 16 }}>
        <div style={s.metaGrid}>
          <div style={s.metaLabel}>카테고리</div>
          <div style={s.metaValue}>{data.category}</div>

          <div style={s.metaLabel}>제목</div>
          <div style={s.metaValue}>{data.title}</div>

          <div style={s.metaLabel}>공개 여부</div>
          <div style={s.metaValue}>{data.isPublic ? "공개" : "비공개"}</div>

          <div style={s.metaLabel}>등록일</div>
          <div style={s.metaValue}>{data.createdAt}</div>
        </div>
      </section>

      {/* 문의 내용 */}
      <section style={{ marginTop: 20 }}>
        <h3 style={s.sectionTitle}>문의 내용</h3>
        <div style={s.bubble}>{data.question}</div>
      </section>

      {/* 구분선 */}
      <div style={{ ...s.divider, marginTop: 28, marginBottom: 16 }} />

      {/* 답변 내용 */}
      <section>
        <h3 style={s.sectionTitle}>답변 내용</h3>
        {data.answer ? (
          <div style={s.bubble}>{data.answer}</div>
        ) : (
          <div style={s.emptyBox}>아직 답변이 등록되지 않았습니다.</div>
        )}
      </section>

      {/* 하단 버튼 */}
      <div style={{ marginTop: 28 }}>
        <button onClick={() => navigate(-1)} style={s.backBtn}>
          <span style={s.chev}>&lt;</span> 이전으로
        </button>
      </div>
    </div>
  );
}

/** Styles */
const s = {
  page: { maxWidth: 1100, margin: "24px auto 80px", padding: "0 16px" },
  title: { fontSize: 24, fontWeight: 800, margin: "0 0 12px", textAlign: "left" },
  divider: { borderBottom: "1px solid #D9D9D9", marginBottom: 16 },

  metaGrid: {
    display: "grid",
    gridTemplateColumns: "120px 1fr 120px 1fr",
    rowGap: 12,
    columnGap: 12,
  },
  metaLabel: { fontWeight: 800, color: "#2f2f2f" },
  metaValue: { color: "#333" },

  sectionTitle: { fontSize: 16, fontWeight: 800, margin: "14px 0 10px" },

  bubble: {
    border: "1px solid #E6E6E6",
    borderRadius: 12,
    padding: "14px 16px",
    background: "#fff",
    lineHeight: 1.7,
  },
  emptyBox: {
    border: "1px dashed #D1D1D1",
    borderRadius: 12,
    padding: "14px 16px",
    color: "#777",
    background: "#fafafa",
  },

  backBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 16px",
    borderRadius: 22,
    border: "1px solid #D9E3D8",
    background: "#EAF4E7",
    fontWeight: 700,
    color: "#2c2c2c",
    cursor: "pointer",
  },
  chev: { fontWeight: 900, display: "inline-block", transform: "translateY(-1px)" },
};
