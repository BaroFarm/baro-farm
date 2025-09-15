// src/pages/InquiryBoardPage.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

/** 잠금 아이콘 */
const Lock = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
    <path d="M17 8h-1V6a4 4 0 10-8 0v2H7a2 2 0 00-2 2v8a2 2 0 002 2h10a2 2 0 002-2v-8a2 2 0 00-2-2zm-7-2a2 2 0 114 0v2H10V6zm7 12H7v-8h10v8z" fill="#7b7b7b"/>
  </svg>
);

/** 카테고리 & 더미 데이터 */
const CATEGORIES = [
  "전체","회원/계정 문의","주문/결제 문의","배송 문의","반품/교환/환불 문의",
  "쿠폰/포인트 문의","상품 문의","이벤트/프로모션 문의","기타 문의",
];

const ROWS = [
  { id: 1, category: "회원/계정 문의", title: "주소 변경이 안됩니다.", isPublic: true,  date: "2025-08-06", status: "답변 대기" },
  { id: 2, category: "배송 문의",     title: "상품 배송이 언제 되나요?",  isPublic: false, date: "2025-08-03", status: "답변 대기" },
  { id: 3, category: "상품 문의",     title: "사과 유통기한 문의",      isPublic: true,  date: "2025-08-02", status: "답변 완료" },
];

export default function InquiryBoardPage() {
  const [open, setOpen] = useState(false);
  const [selectedCat, setSelectedCat] = useState("전체");
  const [query, setQuery] = useState("");
  const btnRef = useRef(null);
  const panelRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const onDocClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target) &&
          btnRef.current && !btnRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim();
    return ROWS.filter((r) => {
      const catOk = selectedCat === "전체" ? true : r.category === selectedCat;
      const qOk = !q || r.title.includes(q) || r.category.includes(q) || r.status.includes(q);
      return catOk && qOk;
    });
  }, [selectedCat, query]);

  return (
    <div style={styles.page}>
      <h2 style={styles.title}>문의게시판</h2>

      {/* 상단: 카테고리 드롭다운 + 검색 */}
      <div style={styles.topBar}>
        <div style={{ position: "relative" }}>
          <button
            ref={btnRef}
            type="button"
            onClick={() => setOpen(v => !v)}
            style={styles.topWhole}
            aria-expanded={open}
          >
            <span style={{ color: "#333" }}>{selectedCat}</span>
            <span style={{ marginLeft: 8, color: "#8a8a8a" }}>{open ? "▾" : "▸"}</span>
          </button>
          {open && (
            <div ref={panelRef} style={styles.dropdownPanel}>
              {CATEGORIES.map((c) => (
                <div
                  key={c}
                  onClick={() => { setSelectedCat(c); setOpen(false); }}
                  style={{ ...styles.dropdownItem, ...(selectedCat === c ? styles.dropdownItemActive : {}) }}
                >
                  {c}
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={styles.searchWrap}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="검색어를 입력하세요."
            style={styles.searchInput}
          />
          {query && (
            <button onClick={() => setQuery("")} style={styles.clearBtn} aria-label="검색어 지우기">×</button>
          )}
        </div>
      </div>

      {/* 표 */}
      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={{ width: 160 }}>카테고리</th>
              <th>문의 제목</th>
              <th style={{ width: 120 }}>공개 여부</th>
              <th style={{ width: 120 }}>등록일</th>
              <th style={{ width: 120 }}>답변 상태</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: "center", padding: 28 }}>검색 결과가 없습니다.</td></tr>
            ) : (
              filtered.map((r) => (
                <tr key={r.id} onClick={() => navigate(`/inquiry/${r.id}`)} style={{ cursor: "pointer" }}>
                  <td>{r.category}</td>
                  <td style={{ textAlign: "left" }}>{r.title}</td>
                  <td>{r.isPublic ? "공개" : <span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}><Lock/> 비공개</span>}</td>
                  <td>{r.date}</td>
                  <td style={{ color: r.status === "답변 완료" ? "#2f7235" : "#666", fontWeight: 700 }}>{r.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* 페이지네이션 + 문의하기 */}
        <div style={styles.bottomBar}>
          <div style={styles.pagination}>
            <button>&lt; Previous</button>
            <span>1</span>
            <button>Next &gt;</button>
          </div>
          <button type="button" onClick={() => navigate("/inquiry/new")} style={styles.askBtn}>
            문의하기
          </button>
        </div>
      </div>
    </div>
  );
}

/** 스타일 */
const styles = {
  page: { maxWidth: 1100, margin: "24px auto 80px", padding: "0 16px" },
  title: { fontSize: 24, fontWeight: 800, margin: "0 0 16px", textAlign: "left" },
  topBar: { display: "grid", gridTemplateColumns: "160px 1fr", gap: 10, alignItems: "center", marginBottom: 16 },
  topWhole: { width: "100%", height: 40, padding: "0 12px", border: "1px solid #E6E6E6", borderRadius: 10, background: "#f0f5ed",
    fontSize: 14, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" },
  dropdownPanel: { position: "absolute", top: "44px", left: 0, width: 220, background: "#fff", border: "1px solid #E6E6E6",
    borderRadius: 10, boxShadow: "0 6px 18px rgba(0,0,0,0.08)", overflow: "hidden", zIndex: 5 },
  dropdownItem: { padding: "10px 12px", fontSize: 14, color: "#333", cursor: "pointer", borderBottom: "1px solid #F2F2F2" },
  dropdownItemActive: { background: "#eaf4e7", fontWeight: 700 },
  searchWrap: { position: "relative", border: "1px solid #DADADA", borderRadius: 18, padding: "8px 40px 8px 14px", background: "#fff" },
  searchInput: { width: "100%", border: "none", outline: "none", background: "transparent", fontSize: 14 },
  clearBtn: { position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", border: "none", background: "transparent",
    fontSize: 18, color: "#888", cursor: "pointer" },
  tableWrap: { overflowX: "auto", marginTop: 0 },
  table: { width: "100%", borderCollapse: "separate", borderSpacing: 0, background: "#fff", border: "1px solid #EEE", borderRadius: 12, fontSize: 14 },
  bottomBar: { marginTop: 20, display: "flex", justifyContent: "space-between", alignItems: "center" },
  pagination: { display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "#555" },
  askBtn: { padding: "12px 20px", borderRadius: 12, border: "1px solid #B9D5BD", background: "#DCEFD8", cursor: "pointer",
    fontWeight: 800, color: "#2f4e35" },
};

/* 테이블 공통 스타일 인젝션 */
const thBase = `
  table thead th { background: #f8faf8; color: #333; font-weight: 800; text-align: left; padding: 14px 16px; border-bottom: 1px solid #eee; }
  table tbody td { padding: 14px 16px; border-bottom: 1px solid #f3f3f3; vertical-align: middle; }
  table tbody tr:hover td { background: #fbfdfb; }
`;
if (typeof document !== "undefined" && !document.getElementById("inquiry-board-style")) {
  const tag = document.createElement("style");
  tag.id = "inquiry-board-style";
  tag.innerHTML = thBase;
  document.head.appendChild(tag);
}
