import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const API_BASE = (process.env.REACT_APP_API_BASE_URL || "").replace(/\/$/, "");

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

function toPublicBool(v) {
  const s = String(v ?? "").toLowerCase().trim();
  if (s === "public" || s === "공개" || s === "true" || s === "1") return true;
  if (s === "private" || s === "비공개" || s === "false" || s === "0") return false;
  return false; // 모호하면 비공개로
}

export default function InquiryBoardPage() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const [selectedCat, setSelectedCat] = useState("전체");
  const [query, setQuery] = useState("");

  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
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

  useEffect(() => {
    async function fetchInquiries() {
      try {
        setLoading(true);
        setErr("");

        const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
         // 전체 문의 엔드포인트로 변경
        const qs = new URLSearchParams({ page: String(page), limit: String(limit) });
         // 옵션: 상품 상세 탭에서 넘어온 경우 필터 지원 (?product_id=..)
        const pid = new URLSearchParams(location.search).get("product_id");
        if (pid) qs.set("product_id", pid);
        const url = `${API_BASE}/api/my/store-communication/inquiries?${qs.toString()}`;

        const res = await fetch(url, {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!res.ok) {
          const j = await safeJson(res);
          throw new Error(j?.message || `HTTP ${res.status}`);
        }

        const json = await res.json();
        const list =Array.isArray(json?.data?.result)
          ? json.data.result
          : (Array.isArray(json?.data?.inquiries) ? json.data.inquiries : []);

        // 방어적 매핑
        const mapped = list.map((it) => {
          const created =
            it.created_at || it.createdAt || it.createdAT || it.created_at_ts; // 혹시 모를 변형 대비
          const dt = created ? new Date(created) : null;
          const visRaw = it.is_visible ?? it.isVisible ?? it.visibility;
          return {
            id: it.inquiry_id ?? it.id,
            category: it.category ?? "-",                   // 없으면 "-"
            title: it.title ?? "",
            isPublic: toPublicBool(visRaw),
            date: dt ? dt.toLocaleDateString("ko-KR") : "-",
            status: (() => {
              const s = String(it.status ?? "").trim();
              return (s === "답변완료" || s === "ANSWERED") ? "답변 완료" : "답변 대기";
            })(),
          };
        });

        setRows(mapped);

        const total = Number(json?.data?.totalPages ?? json?.data?.pagination?.totalPages ?? 1);
        setTotalPages(total);
        
      } catch (e) {
        console.error("fetchInquiries error:", e);
        setErr(e.message || "불러오기 실패");
        setRows([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    }
    fetchInquiries();
  }, [page, limit, location.search]);

  const filtered = useMemo(() => {
    const q = query.trim();
    return rows.filter((r) => {
      const catOk = selectedCat === "전체" ? true : r.category === selectedCat;
      const qOk = !q || r.title.includes(q) || r.category.includes(q) || r.status.includes(q);
      return catOk && qOk;
    });
  }, [rows, selectedCat, query]);

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
                  filtered.map((r) => {
                    const canOpen = r.isPublic === true; // 공개글만 클릭 가능
                    return (
                    <tr
                      key={r.id}
                      onClick={canOpen ? () => navigate(`/inquiry/${r.id}`, { state: { inquiry: r.raw } }) : undefined}
                      aria-disabled={!canOpen}
                      title={!canOpen ? "비공개 글은 열람할 수 없습니다." : undefined}
                      style={{
                        cursor: canOpen ? "pointer" : "default",
                        opacity: canOpen ? 1 : 0.7, // 비공개일 때 살짝 흐리게
                      }}
                    >
                    <td>{r.category}</td>
                    <td style={{ textAlign: "left" }}>
                    {canOpen ? (
                      <span >{r.title}</span>
                    ) : (
                      <span >{r.title}</span>
                    )}
                    </td>
                    <td>
                      {r.isPublic ? "공개" : (
                        <span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
                        <Lock/> 비공개
                        </span>
                      )}
                    </td>
                    <td>{r.date}</td>
                    <td style={{ color: r.status === "답변 완료" ? "#2f7235" : "#666", fontWeight: 700 }}>
                      {r.status}
                    </td>
                  </tr>
                );
              })
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
          <button type="button" onClick={() => navigate("/mypage/inquiry")} style={styles.askBtn}>
            문의하기
          </button>
        </div>
      </div>
    </div>
  );
}
async function safeJson(res) { try { return await res.json(); } catch { return null; } }


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