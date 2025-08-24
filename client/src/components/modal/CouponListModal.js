import React, { useEffect, useRef, useState } from "react";

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
  const getTokenRef = useRef(getToken);         // 🔒 함수 참조 고정
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

  // 모달 열릴 때 페이지 리셋
  useEffect(() => {
    if (open) setPage(1);
  }, [open]);

  // 📡 데이터 로드 (getToken 제거된 deps)
  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();

    (async () => {
      setLoading(true);
      setErr("");
      try {
        const token = getTokenRef.current?.() || "";
        if (!token) {
          setErr("로그인이 필요합니다.");
          setItems([]);
          setPg((p) => ({ ...p, currentPage: 1, totalPages: 1, totalElements: 0 }));
          return;
        }

        const endpoint = `${API_BASE}/api/my/coupons/downloadable?page=${page}&limit=${pageSize}`;
        const res = await fetch(endpoint, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          cache: "no-store",
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`서버 오류(${res.status})`);

        const js = await res.json().catch(() => ({}));
        const data = js?.data ?? js ?? {};
        const list = Array.isArray(data.downloadableCoupons) ? data.downloadableCoupons : [];
        const pagination = data.pagination ?? {};

        setItems(list);
        setPg({
          currentPage: Number(pagination.currentPage ?? page),
          totalPages: Number(pagination.totalPages ?? 1),
          totalElements: Number(pagination.totalElements ?? list.length),
          pageSize: Number(pagination.pageSize ?? pageSize),
        });
      } catch (e) {
        if (e.name === "AbortError") return;
        setErr(e.message || "쿠폰을 불러오지 못했습니다.");
        setItems([]);
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [open, page, pageSize]); // ✅ getToken 제외

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
        {loading && <div style={S.state}>불러오는 중…</div>}
        {err && <div style={{ ...S.state, color: "#d33" }}>{err}</div>}
        {empty && <div style={S.state}>다운로드 가능한 쿠폰이 없습니다.</div>}

        {/* 리스트 */}
        {!loading && !err && items.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {items.map((c) => (
              <div key={c.coupon_id} style={S.row}>
                <div style={S.thumb}><div style={S.thumbGray}/></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={S.title}>{c.coupon_name}</div>
                  <div style={S.discount}>
                    {c.type === "PERCENTAGE" ? "퍼센트 할인 쿠폰"
                      : c.type === "FIXED_AMOUNT" ? "정액 할인 쿠폰" : "쿠폰"}
                    {c.min_order_account ? ` · 최소주문 ${c.min_order_account.toLocaleString()}원` : ""}
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
          </div>
        )}

        {/* 하단: 페이지 + 전체 받기 */}
        <div style={{ display: "flex", gap: 8, marginTop: 16, alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" disabled={page <= 1 || loading} onClick={() => setPage((p) => Math.max(1, p - 1))} style={{ ...S.pagerBtn, opacity: page <= 1 || loading ? 0.5 : 1 }}>이전</button>
            <div style={{ fontSize: 13, color: "#555" }}>{pg.currentPage} / {pg.totalPages}</div>
            <button type="button" disabled={page >= pg.totalPages || loading} onClick={() => setPage((p) => Math.min(pg.totalPages, p + 1))} style={{ ...S.pagerBtn, opacity: page >= pg.totalPages || loading ? 0.5 : 1 }}>다음</button>
          </div>
          <button type="button" onClick={() => onReceiveAll ? onReceiveAll() : alert("쿠폰 전체 받기 (UI 데모)")} style={S.fullBtn}>쿠폰 전체 받기</button>
        </div>
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
  },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  xbtn: { border: "none", background: "transparent", cursor: "pointer", fontSize: 18 },

  state: { padding: "16px 4px", color: "#333", fontSize: 14, textAlign: "center" },

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
  },
  pagerBtn: {
    border: "1px solid #ddd",
    background: "#fff",
    padding: "8px 10px",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 13,
  },
};
