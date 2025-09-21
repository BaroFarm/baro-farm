// src/pages/MyInquiryDetailPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";

const API_BASE = (process.env.REACT_APP_API_BASE_URL || "").replace(/\/$/, "");

/** 백엔드 raw → 화면용으로 매핑 */
function toView(raw) {
  if (!raw) return null;

  // created_at 변형들 방어
  const created =
    raw.created_at || raw.createdAt || raw.created_at_ts || raw.createdAT;
  const createdAt = created
    ? new Date(created).toLocaleString("ko-KR")
    : "-";

  // 공개 여부: public / '공개'
  const isPublic =
    raw.isPublic ??
    raw.is_visible === "public" ??
    raw.is_visible === "공개";

  // 카테고리: 그대로 표시(백이 ENUM이므로 표준 문자열일 확률 높음)
  const category = raw.category ?? raw.category_name ?? "-";

  // 제목/내용
  const title = raw.title ?? raw.subject ?? "-";
  const question = raw.content ?? raw.question ?? "-";

  // 답변: 서버 매핑(answer 객체) 또는 replies 배열 방어
  const answer =
    raw.answer?.content ??
    raw.Inquiry_replies?.[0]?.content ??
    raw.replies?.[0]?.content ??
    raw.answer ??
    null;

  return {
    id: raw.inquiry_id ?? raw.id,
    category,
    title,
    isPublic,
    createdAt,
    question,
    answer,
    _raw: raw,
  };
}

/** 안전 JSON */
async function safeJson(res) {
  try { return await res.json(); } catch { return null; }
}

export default function MyInquiryDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation() || {};

  const [view, setView] = useState(() => {
    // 목록에서 넘어온 경우: state.inquiry 사용
    if (state?.inquiry) return toView(state.inquiry);
    return null;
  });
  const [loading, setLoading] = useState(!state?.inquiry);
  const [err, setErr] = useState("");

  // state가 없으면 API로 채우기
  useEffect(() => {
    if (view) return; // 이미 state로 채워졌다면 네트워크 생략
    let alive = true;

    async function fetchDetail() {
      try {
        setLoading(true);
        setErr("");

        const token =
          localStorage.getItem("accessToken") ||
          sessionStorage.getItem("accessToken");

        // 1) 상세 엔드포인트 시도 (있다면 가장 깔끔)
        const tryDetail = async () => {
          const res = await fetch(`${API_BASE}/api/my/inquiries/${id}`, {
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          });
          if (!res.ok) {
            const j = await safeJson(res);
            throw new Error(j?.message || `HTTP ${res.status}`);
          }
          const j = await res.json();
          // 응답 스키마 방어
          const raw =
            j?.data?.inquiry ??
            j?.data ??
            j?.inquiry ??
            j ??
            null;
          if (!raw) throw new Error("상세 응답이 비어있습니다.");
          return raw;
        };

        // 2) 상세가 없다면 목록에서 찾아오기(폴백)
        const tryFromList = async () => {
          const res = await fetch(`${API_BASE}/api/my/inquiries?page=1&pageSize=100`, {
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          });
          if (!res.ok) {
            const j = await safeJson(res);
            throw new Error(j?.message || `HTTP ${res.status}`);
          }
          const j = await res.json();
          const items = Array.isArray(j?.data?.inquiries) ? j.data.inquiries : [];
          const found = items.find(
            (it) =>
              String(it.inquiry_id ?? it.id) === String(id)
          );
          if (!found) throw new Error("해당 문의를 찾을 수 없습니다.");
          return found;
        };

        let raw;
        try {
          raw = await tryDetail();
        } catch {
          raw = await tryFromList();
        }

        if (!alive) return;
        setView(toView(raw));
      } catch (e) {
        if (!alive) return;
        setErr(e.message || "불러오기 실패");
      } finally {
        if (alive) setLoading(false);
      }
    }

    fetchDetail();
    return () => { alive = false; };
  }, [id, view]);

  if (loading) {
    return (
      <div style={s.page}>
        <h2 style={s.title}>나의 문의 내역</h2>
        <div style={s.divider} />
        <div style={{ padding: 24 }}>불러오는 중...</div>
      </div>
    );
  }

  if (err || !view) {
    return (
      <div style={s.page}>
        <h2 style={s.title}>나의 문의 내역</h2>
        <div style={s.divider} />
        <div style={{ padding: 24, color: "crimson" }}>
          {err || "해당 문의를 찾을 수 없습니다."}
        </div>
        <div style={{ marginTop: 24 }}>
          <button onClick={() => navigate(-1)} style={s.backBtn}>
            <span style={s.chev}>&lt;</span> 이전으로
          </button>
        </div>
      </div>
    );
  }

  // ✅ 비공개라도 내 문의이므로 그대로 표시 (메타에만 비공개 표기)
  return (
    <div style={s.page}>
      <h2 style={s.title}>나의 문의 내역</h2>
      <div style={s.divider} />

      {/* 메타 정보 */}
      <section style={{ marginBottom: 16 }}>
        <div style={s.metaGrid}>
          <div style={s.metaLabel}>카테고리</div>
          <div style={s.metaValue}>{view.category}</div>

          <div style={s.metaLabel}>제목</div>
          <div style={s.metaValue}>{view.title}</div>

          <div style={s.metaLabel}>공개 여부</div>
          <div style={s.metaValue}>{view.isPublic ? "공개" : "비공개"}</div>

          <div style={s.metaLabel}>등록일</div>
          <div style={s.metaValue}>{view.createdAt}</div>
        </div>
      </section>

      {/* 문의 내용 */}
      <section style={{ margin: "30px 28px" }}>
        <h3 style={s.sectionTitle}>문의 내용</h3>
        <div style={s.bubble}>{view.question}</div>
      </section>

      {/* 구분선 */}
      <div style={{ ...s.divider, marginTop: 28, marginBottom: 16 }} />

      {/* 답변 내용 */}
      <section style={{ margin: "30px 28px" }}>
        <h3 style={s.sectionTitle}>답변 내용</h3>
        {view.answer ? (
          <div style={s.bubble}>{view.answer}</div>
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

/** Styles (그대로) */
const s = {
  page: { maxWidth: 1100, margin: "24px auto 80px", padding: "0 16px" },
  title: { fontSize: 24, fontWeight: 'bold', margin: "0 0 12px", textAlign: "left" },
  divider: { borderBottom: "1px solid #D9D9D9", marginBottom: 16 },

  metaGrid: {
    display: "grid",
    gridTemplateColumns: "120px 1fr 120px 1fr",
    rowGap: 12,
    columnGap: 12,
  },
  metaLabel: { fontWeight: 'bold', color: "#2f2f2f" },
  metaValue: { color: "#333" },

  sectionTitle: { fontSize: 16, fontWeight: 'bold', margin: "14px 0 10px", textAlign: 'left' },

  bubble: {
    border: "1px solid #E6E6E6",
    borderRadius: 12,
    padding: "14px 16px",
    background: "#fff",
    lineHeight: 1.7,
    minHeight: "100px"
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
    fontWeight: 'bold',
    color: "#2c2c2c",
    cursor: "pointer",
  },
  chev: { fontWeight: 900, display: "inline-block", transform: "translateY(-1px)" },
};
