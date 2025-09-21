// src/pages/CouponCardPage.jsx
import React, { useEffect, useState } from "react";

const API_BASE = (process.env.REACT_APP_API_BASE_URL || "").replace(/\/$/, "");

function CouponCard({ brand, discount, disabled, onClick }) {
  return (
    <div style={S.card}>
      <div style={S.left}>
        <div style={S.brand}>{brand}</div>
        <div style={S.discount}>{discount}</div>
      </div>
      <button type="button" style={S.btn} disabled={disabled} onClick={onClick}>
        {disabled ? "받음" : "쿠폰 받기"}
      </button>
    </div>
  );
}

export default function CouponCardPage() {
  const [coupons, setCoupons] = useState([]);
  const [downloading, setDownloading] = useState({});
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setErr("");
        const token =
          localStorage.getItem("accessToken") ||
          sessionStorage.getItem("accessToken");

        const res = await fetch(
          `${API_BASE}/api/my/coupons/downloadable?page=1&limit=2`,
          {
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          }
        );
        if (!res.ok) {
          const j = await safeJson(res);
          throw new Error(j?.message || `HTTP ${res.status}`);
        }
        const json = await res.json();
        const list = Array.isArray(json?.data?.downloadableCoupons)
          ? json.data.downloadableCoupons
          : [];

        const mapped = list.slice(0, 2).map((c) => ({
          id: c.coupon_id,
          brand: c.type === "PERCENT" ? "퍼센트 쿠폰" : "일반 쿠폰", // (API에 브랜드 없음)
          discount: c.coupon_name || "쿠폰",
          downloaded: false,
        }));

        if (alive) setCoupons(mapped);
      } catch (e) {
        if (alive) {
          setErr(e.message || "쿠폰을 불러오지 못했습니다. (예시 표시)");
          // 폴백 2개
          setCoupons([
            { id: 3, brand: "일반 쿠폰", discount: "여름맞이 5,000원 할인쿠폰", downloaded: false },
            { id: 4, brand: "퍼센트 쿠폰", discount: "신규회원 10% 할인쿠폰", downloaded: false },
          ]);
        }
      }
    })();
    return () => { alive = false; };
  }, []);

  async function onDownload(id) {
    const token =
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken");
    if (!token) return alert("로그인이 필요합니다.");

    try {
      setDownloading((m) => ({ ...m, [id]: true }));
      const res = await fetch(`${API_BASE}/api/my/coupons`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ coupon_id: id }),
      });
      if (!res.ok) {
        const j = await safeJson(res);
        throw new Error(j?.message || `HTTP ${res.status}`);
      }
      // 성공 → 해당 카드 비활성화
      setCoupons((arr) =>
        arr.map((c) => (c.id === id ? { ...c, downloaded: true } : c))
      );
      alert("쿠폰이 발급되었습니다.");
    } catch (e) {
      alert(`발급 실패: ${e.message}`);
    } finally {
      setDownloading((m) => ({ ...m, [id]: false }));
    }
  }

  return (
    <div>
      {err && <div style={{ color: "crimson", marginBottom: 10 }}>{err}</div>}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {coupons.map((c) => (
          <CouponCard
            key={c.id}
            brand={c.brand}
            discount={c.discount}
            disabled={c.downloaded || downloading[c.id]}
            onClick={() => onDownload(c.id)}
          />
        ))}
      </div>
    </div>
  );
}

/* utils */
async function safeJson(res) {
  try { return await res.json(); } catch { return null; }
}

/* styles */
const S = {
  card: {
    display: "flex",
    alignItems: "center",
    border: "1px solid #d7dfd6",
    background: "#fff",
    borderRadius: 10,
    overflow: "hidden",
    width: 300,
    height: 80,
  },
  left: { flex: 1, padding: "10px 12px", textAlign: "left" },
  brand: { fontSize: 13, fontWeight: 700, color: "#2b2b2b" },
  discount: { fontSize: 12, color: "#e03535", marginTop: 4 },
  btn: {
    height: "100%",
    minWidth: 86,
    border: "none",
    borderLeft: "1px dashed #c8d3c7",
    background: "#e7f1e6",
    fontWeight: 800,
    cursor: "pointer",
  },
};
