// src/pages/MyInquiryListPage.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

/** 잠금 아이콘 */
const Lock = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
    <path d="M17 8h-1V6a4 4 0 10-8 0v2H7a2 2 0 00-2 2v8a2 2 0 002 2h10a2 2 0 002-2v-8a2 2 0 00-2-2zm-7-2a2 2 0 114 0v2H10V6zm7 12H7v-8h10v8z" fill="#7b7b7b"/>
  </svg>
);

const API_BASE = (process.env.REACT_APP_API_BASE_URL || "").replace(/\/$/, "");

/* ✅ 카테고리 정규화 (백/프 라벨 차이 흡수) */
const CAT_TO_KEY = {
  "회원/계정 문의": "account",
  "주문/결제 문의": "order",
  "배송 문의": "shipping",
  "반품/교환/환불": "return",
  "반품/교환/환불 문의": "return",
  "쿠폰/포인트 문의": "coupon",
  "상품 문의": "product",
  "이벤트/프로모션 문의": "event",
  "기타 문의": "etc",
};
const KEY_TO_LABEL = {
  account: "회원/계정 문의",
  order: "주문/결제 문의",
  shipping: "배송 문의",
  return: "반품/교환/환불",
  coupon: "쿠폰/포인트 문의",
  product: "상품 문의",
  event: "이벤트/프로모션 문의",
  etc: "기타 문의",
};
const CATEGORIES = ["전체", ...Object.values(KEY_TO_LABEL)];

// 공백/‘문의’ 꼬리 제거까지 고려한 라벨 정규화
const norm = (s) => (s || "").trim().replace(/\s+/g, "").replace(/문의$/, "");
function catToKey(s) {
  if (!s) return null;
  if (CAT_TO_KEY[s]) return CAT_TO_KEY[s];
  const n = norm(s);
  for (const k of Object.keys(CAT_TO_KEY)) {
    if (norm(k) === n) return CAT_TO_KEY[k];
  }
  return null;
}

export default function MyInquiryListPage() {
  const [open, setOpen] = useState(false);
  const [selectedCat, setSelectedCat] = useState("전체"); // 화면 라벨
  const [query, setQuery] = useState("");

  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);                 // ✅ pageSize 사용
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

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

  // ✅ 리스트 호출 (GET /api/my/inquiries?page=&pageSize=)
  useEffect(() => {
    let alive = true;
    async function fetchMine() {
      try {
        setLoading(true); setErr("");
        const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");

        const res = await fetch(
          `${API_BASE}/api/my/inquiries?page=${page}&pageSize=${pageSize}`,
          { headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) } }
        );
        if (!res.ok) { const j = await safeJson(res); throw new Error(j?.message || `HTTP ${res.status}`); }

        const json = await res.json();
        const list = Array.isArray(json?.data?.inquiries) ? json.data.inquiries : [];

if (process.env.NODE_ENV !== "production") {
  const uniq = [...new Set(list.map(i => (i?.category ?? "")))];
  console.log("API categories:", uniq);
}

        const mapped = list.map((it) => {
          const created = it.created_at || it.createdAt;
          const dt = created ? new Date(created) : null;

          const rawCat = typeof it.category === "string" ? it.category : "";
          const key = catToKey(rawCat);                       // 정규화된 key
          const label = key ? KEY_TO_LABEL[key] : (rawCat || "-");

          return {
            id: it.inquiry_id ?? it.id,
            categoryKey: key,                                 // 필터 1차: key로 비교
            categoryNorm: norm(rawCat),                       // ✅ 필터 2차: 정규화 문자열 비교
            category: label,                                  // 표시용 라벨
            title: it.title ?? "",
            isPublic: it.is_visible === "public" || it.is_visible === "공개",
            date: dt ? dt.toLocaleDateString("ko-KR") : "-",
            status: it.status === "ANSWERED" ? "답변 완료" : "답변 대기",
            _raw: it,
          };
        });

        if (!alive) return;
        setRows(mapped);

        const pg = json?.data?.pagination || {};
        setTotalPages(Number(pg.totalPages) || 1);
      } catch (e) {
        if (!alive) return;
        setErr(e.message || "불러오기 실패"); setRows([]); setTotalPages(1);
      } finally {
        if (alive) setLoading(false);
      }
    }
    fetchMine();
    return () => { alive = false; };
  }, [page, pageSize]);

  // ✅ 필터: 선택 라벨 → key 변환 후 비교
  const filtered = useMemo(() => {
    const q = query.trim();
    const selectedKey = selectedCat === "전체" ? null : catToKey(selectedCat);
    const selectedNorm = selectedCat === "전체" ? null : norm(selectedCat);

    return rows.filter((r) => {
      const catOk = selectedKey 
        ? ((selectedKey && r.categoryKey === selectedKey) || r.categoryNorm === selectedNorm)
        : true;
      const qOk =
        !q ||
        (r.title && r.title.includes(q)) ||
        (r.category && r.category.includes(q)) ||
        r.status.includes(q);
      return catOk && qOk;
    });
  }, [rows, selectedCat, query]);

  return (
    <div style={styles.page}>
      <h2 style={styles.title}>나의 문의 내역</h2>
      <div style={styles.divider} />

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
            {loading ? (
              <tr><td colSpan={5} style={{ textAlign: "center", padding: 28 }}>불러오는 중...</td></tr>
            ) : err ? (
              <tr><td colSpan={5} style={{ textAlign: "center", padding: 28, color: "crimson" }}>{err}</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: "center", padding: 28 }}>검색 결과가 없습니다.</td></tr>
            ) : (
              filtered.map((r) => (
                <tr
                  key={r.id}
                  style={{ cursor: "pointer" }}
                  onClick={() =>
                    navigate(`/mypage/inquiry/${r.id}`, { state: { inquiry: r._raw } })
                  }
                >
                  <td>{r.category}</td>
                  <td style={{ textAlign: "left" }}>{r.title}</td>
                  <td>{r.isPublic ? "공개" : <span style={{ display:"inline-flex", gap:6, alignItems:"center" }}><Lock/> 비공개</span>}</td>
                  <td>{r.date}</td>
                  <td style={{ color: r.status === "답변 완료" ? "#76a36a" : "#666", fontWeight: r.status === "답변 완료" ? 800 : 600, textDecoration: r.status === "답변 완료" ? "underline" : "none", textUnderlineOffset: r.status === "답변 완료" ? 3 : 0 }}>
                    {r.status}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* 페이지네이션 + 문의하기 */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:20 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>&lt; Previous</button>
            <span>{page} / {totalPages}</span>
            <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next &gt;</button>
          </div>
          <button type="button" onClick={() => (window.location.href = "/mypage/inquiry")} style={styles.askBtn}>
            문의하기
          </button>
        </div>
      </div>
    </div>
  );
}

/* 유틸 */
async function safeJson(res) { try { return await res.json(); } catch { return null; } }

/** 스타일 동일 */
const styles = {
  page: { maxWidth: 1100, margin: "24px auto 80px", padding: "0 16px" },
  title: { fontSize: 24, fontWeight: 800, margin: "0 0 12px", textAlign: "left" },
  divider: { borderBottom: "1px solid #D9D9D9", marginBottom: 16 },
  topBar: { display: "grid", gridTemplateColumns: "140px 1fr", gap: 8, alignItems: "center", marginBottom: 8 },
  topWhole: { width: "100%", height: 36, padding: "0 12px", border: "1px solid #E6E6E6", borderRadius: 10, background: "#f0f5ed",
    fontSize: 14, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" },
  dropdownPanel: { position: "absolute", top: "42px", left: 0, width: 200, background: "#fff", border: "1px solid #E6E6E6",
    borderRadius: 10, boxShadow: "0 6px 18px rgba(0,0,0,0.08)", overflow: "hidden", zIndex: 5 },
  dropdownItem: { padding: "10px 12px", fontSize: 14, color: "#333", background: "#fff", cursor: "pointer", borderBottom: "1px solid #F2F2F2" },
  dropdownItemActive: { background: "#eaf4e7", fontWeight: 700 },
  searchWrap: { position: "relative", border: "1px solid #DADADA", borderRadius: 18, padding: "8px 40px 8px 14px", width: "100%", background: "#FFFFFF" },
  searchInput: { width: "100%", border: "none", outline: "none", background: "transparent", fontSize: 14 },
  clearBtn: { position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", border: "none", background: "transparent", fontSize: 18, color: "#888", cursor: "pointer" },
  tableWrap: { overflowX: "auto", marginTop: 0 },
  table: { width: "100%", borderCollapse: "separate", borderSpacing: 0, background: "#fff", border: "1px solid #EEE", borderRadius: 12, overflow: "hidden", fontSize: 14 },
  askBtn: { padding: "12px 18px", borderRadius: 12, border: "1px solid #B9D5BD", background: "#DCEFD8", cursor: "pointer", fontWeight: 800, color: "#2f4e35" },
};
