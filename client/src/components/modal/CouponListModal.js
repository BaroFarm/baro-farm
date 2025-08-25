import React, { useEffect, useRef, useState, useMemo } from "react";

const API_BASE = process.env.REACT_APP_API_BASE_URL || "";

export default function CouponListModal({
  open,
  onClose,
  pageSize = 10,
  onReceive,
  onReceiveAll,
  getToken = () => localStorage.getItem("accessToken") || "",
}) {
  const sheetRef = useRef(null);
  const scrollRef = useRef(null);       // 🔹 스크롤 컨테이너
  const endRef = useRef(null);          // 🔹 센티넬
  const getTokenRef = useRef(getToken); // 🔒 함수 참조 고정
  useEffect(() => { getTokenRef.current = getToken; }, [getToken]);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [pg, setPg] = useState({ currentPage: 1, totalPages: 1, totalElements: 0, pageSize });

  // ESC 닫기
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // 모달 열릴 때 초기화
  useEffect(() => {
    if (open) {
      setItems([]);
      setPage(1);
      setPg({ currentPage: 1, totalPages: 1, totalElements: 0, pageSize });
      setErr("");
    }
  }, [open, pageSize]);

  // 📡 페이지 단위 로드 (append)
  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();

    const fetchPage = async () => {
      setLoading(true);
      try {
        const token = getTokenRef.current?.() || "";
        if (!token) {
          setErr("로그인이 필요합니다.");
          setItems([]);
          setPg((p) => ({ ...p, currentPage: 1, totalPages: 1, totalElements: 0 }));
          return;
        }

        const url = `${API_BASE}/api/my/coupons/downloadable?page=${page}&limit=${pageSize}`;
        const res = await fetch(url, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` }, // ⚠️ GET엔 Content-Type 제거
          cache: "no-store",
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`서버 오류(${res.status})`);

        const js = await res.json().catch(() => ({}));
        const data = js?.data ?? js ?? {};
        const list = Array.isArray(data.downloadableCoupons) ? data.downloadableCoupons : [];
        const pagination = data.pagination ?? {};

        // 🔹 append + dedup(coupon_id)
        setItems((prev) => {
          const seen = new Set(prev.map((x) => x.coupon_id));
          const merged = [...prev];
          for (const it of list) if (!seen.has(it.coupon_id)) merged.push(it);
          return merged;
        });

        setPg({
          currentPage: Number(pagination.currentPage ?? page),
          totalPages: Number(pagination.totalPages ?? (page > 1 ? page : 1)),
          totalElements: Number(pagination.totalElements ?? 0),
          pageSize: Number(pagination.pageSize ?? pageSize),
        });
      } catch (e) {
        if (e.name !== "AbortError") {
          setErr(e.message || "쿠폰을 불러오지 못했습니다.");
          // 첫 페이지에서 실패했을 때만 리스트 비우기
          if (page === 1) setItems([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
    return () => controller.abort();
  }, [open, page, pageSize]);

  // 더 불러올 수 있는지
  const hasMore = useMemo(() => {
    return pg.currentPage < pg.totalPages;
  }, [pg.currentPage, pg.totalPages]);

  // 🔭 인피니트 스크롤(센티넬 관측)
  useEffect(() => {
    if (!open) return;
    const rootEl = scrollRef.current || null;
    const target = endRef.current;
    if (!target) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const ent = entries[0];
        if (ent.isIntersecting && hasMore && !loading) {
          setPage((p) => p + 1);
        }
      },
      { root: rootEl, rootMargin: "200px 0px", threshold: 0 }
    );

    obs.observe(target);
    return () => obs.disconnect();
  }, [open, hasMore, loading]);

  if (!open) return null;

  const handleBackdrop = (e) => {
    if (!sheetRef.current) return;
    if (!sheetRef.current.contains(e.target)) onClose?.();
  };

  const fmtDate = (iso) => {
    if (!iso) return null;
    const d = new Date(iso);
    if (isNaN(d)) return null;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${y}.${m}.${dd}`;
  };

  const renderExpires = (from, to) => {
    const f = fmtDate(from);
    const t = fmtDate(to);
    if (f && t) return `${f} ~ ${t}`;
    if (t) return `~ ${t} 까지`;
    if (f) return `${f} 부터`;
    return "유효기간 정보 없음";
  };

  const empty = !loading && !err && items.length === 0;

  return (
    <div style={S.backdrop} onMouseDown={handleBackdrop} role="dialog" aria-modal="true">
      <div ref={sheetRef} style={S.sheet} onMouseDown={(e)=>e.stopPropagation()}>
        {/* 헤더 */}
        <div style={S.header}>
          <div style={{ fontWeight: 800, fontSize: 18 }}>쿠폰</div>
          <button type="button" aria-label="닫기" onClick={onClose} style={S.xbtn}>✕</button>
        </div>

        {/* 상태 */}
        {err && <div style={{ ...S.state, color: "#d33" }}>{err}</div>}
        {empty && <div style={S.state}>다운로드 가능한 쿠폰이 없습니다.</div>}

        {/* 리스트 (스크롤 컨테이너) */}
        <div ref={scrollRef} style={S.listScroll}>
          {items.map((c) => (
            <div key={c.coupon_id} style={S.row}>
              <div style={S.thumb}><div style={S.thumbGray}/></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={S.title}>{c.coupon_name}</div>
                <div style={S.discount}>
                  {c.type === "PERCENTAGE" ? "퍼센트 할인 쿠폰"
                    : c.type === "FIXED_AMOUNT" ? "정액 할인 쿠폰" : "쿠폰"}
                  {c.min_order_account ? ` · 최소주문 ${Number(c.min_order_account).toLocaleString()}원` : ""}
                  {c.max_discount != null ? ` · 최대 ${Number(c.max_discount).toLocaleString()}원` : ""}
                </div>
                <div style={S.expires}>{renderExpires(c.valid_from, c.valid_at)}</div>
              </div>
              <button
                type="button"
                disabled={!c.is_available}
                onClick={() => onReceive ? onReceive(c) : alert(`'${c.coupon_name}' 받기 (UI 데모)`)}
                style={{ ...S.receiveBtn, opacity: c.is_available ? 1 : 0.5, cursor: c.is_available ? "pointer" : "not-allowed" }}
              >
                쿠폰<br/>받기
              </button>
            </div>
          ))}

          {/* 센티넬 + 로딩 표시 */}
          <div ref={endRef} style={S.sentinel} />
          {loading && <div style={S.loadingRow}>불러오는 중…</div>}
          {!hasMore && items.length > 0 && <div style={S.endRow}>마지막 페이지입니다</div>}
        </div>

        {/* 하단 버튼 (전체 받기) */}
        <button
          type="button"
          onClick={() => onReceiveAll ? onReceiveAll() : alert("쿠폰 전체 받기 (UI 데모)")}
          style={S.fullBtn}
        >
          쿠폰 전체 받기
        </button>
      </div>
    </div>
  );
}

const S = {
  backdrop: {
    position: "fixed", inset: 0, background: "rgba(0,0,0,.45)",
    display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 10000,
  },
  sheet: {
    width: 420, maxWidth: "100%", background: "#fff", borderRadius: 16,
    boxShadow: "0 10px 30px rgba(0,0,0,.2)", padding: 16,
    display: "flex", flexDirection: "column", gap: 10,
  },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  xbtn: { border: "none", background: "transparent", cursor: "pointer", fontSize: 18 },

  state: { padding: "8px 4px", color: "#333", fontSize: 14, textAlign: "center" },

  listScroll: {
    display: "flex", flexDirection: "column", gap: 14,
    maxHeight: "60vh", overflowY: "auto", paddingRight: 4,
    marginTop: 8, marginBottom: 8,
  },

  row: {
    display: "grid",
    gridTemplateColumns: "60px 1fr 86px",
    gap: 12,
    alignItems: "center",
    padding: "10px 6px",
    borderBottom: "1px solid #eee",
  },
  thumb: { width: 60, height: 60, borderRadius: 6, overflow: "hidden", background: "#f2f2f2" },
  thumbGray: { width: "100%", height: "100%", borderRadius: 6, background: "#d9d9d9" },

  title: { fontWeight: 700, fontSize: 14, textAlign: "left" },
  discount: { color: "#D63C3C", fontWeight: 700, fontSize: 13, textAlign: "left", marginTop: 2 },
  expires: { color: "#777", fontSize: 12, textAlign: "left", marginTop: 2 },

  receiveBtn: {
    border: "none",
    background: "#D2DDC8",
    borderRadius: 8,
    padding: "10px 0",
    fontWeight: 700,
    cursor: "pointer",
  },

  fullBtn: {
    padding: "10px 12px",
    borderRadius: 8,
    border: "none",
    background: "#D2DDC8",
    fontWeight: 700,
    cursor: "pointer",
    width: "100%",
  },

  loadingRow: { textAlign: "center", color: "#666", fontSize: 13, padding: "8px 0" },
  endRow:     { textAlign: "center", color: "#888", fontSize: 12, padding: "8px 0" },
  sentinel:   { height: 1 },
};
