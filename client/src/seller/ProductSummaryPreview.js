// src/pages/ProductSummaryPreview.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const pickNumber = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};

function ProductSummaryPreview() {
  const { state } = useLocation() || {};
  const navigate = useNavigate();

  // productId: state → localStorage
  const productId =
    pickNumber(state?.productId) ??
    pickNumber(localStorage.getItem("current_product_id"));

  const BASE = (process.env.REACT_APP_API_BASE_URL || "").replace(/\/$/, "");
  const token = localStorage.getItem("accessToken");

  // 초기 요약: ①state.summary ②요약 캐시 ③설명(state.description) ④설명 캐시 → ''
  const initialSummary = useMemo(() => {
    return (
      state?.summary ??
      (productId ? localStorage.getItem(`last_ai_summary_${productId}`) : "") ??
      state?.description ??
      (productId ? localStorage.getItem(`last_ai_desc_${productId}`) : "") ??
      ""
    );
  }, [productId, state?.summary, state?.description]);

  const [summary, setSummary] = useState(initialSummary);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false); // 요약 저장 로딩

  // 요약이 없으면 서버에 요청해서 생성/조회
  useEffect(() => {
    if (!productId) return;
    if (summary && summary.trim()) return;

    if (!BASE) {
      console.warn("REACT_APP_API_BASE_URL 미설정. 요약 생략.");
      return;
    }

    (async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `${BASE}/api/s-products/${productId}/description/summary`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          }
        );
        if (!res.ok) throw new Error(`요약 요청 실패 (${res.status})`);
        const json = await res.json().catch(() => ({}));
        const s = json?.summary || json?.data?.summary || "";
        setSummary(s);
        if (s) localStorage.setItem(`last_ai_summary_${productId}`, s);
      } catch (e) {
        console.warn(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [productId, summary, BASE, token]);

  const goPrev = () =>
    navigate("/product/ai-custom-input", { state: { productId, base: summary } });

  // ✅ 요약 저장 → 성공 시 다음 단계로 이동
  const goNext = async () => {
    if (!productId) return alert("상품 ID가 없습니다.");
    if (!summary?.trim()) return alert("저장할 요약이 없습니다.");

    try {
      setSaving(true);

      if (!BASE) throw new Error("REACT_APP_API_BASE_URL이 설정되지 않았습니다.");

      const res = await fetch(
        `${BASE}/api/s-products/${productId}/description/summary-save`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            product_id: Number(productId),
            summary,
          }),
        }
      );

      if (res.status === 401) {
        alert("로그인이 필요합니다. 다시 로그인해주세요.");
        return navigate("/login");
      }
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `요약 저장 실패 (${res.status})`);
      }

      localStorage.setItem(`final_ai_summary_${productId}`, summary);
      navigate("/product/video-preview", { state: { productId, summary } });
    } catch (e) {
      alert(e.message || "요약 저장 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
    <h2 style={styles.title}>상품 등록</h2>
    <div style={styles.wrapper}>
      
      <p style={styles.subText}>상품에 대한 간단한 소개글입니다.</p>

      <div style={styles.labelRow}>
        <span style={styles.labelText}>AI 요약</span>
        <button style={styles.editButton} onClick={goPrev} disabled={loading}>
          요약 수정하기
        </button>
      </div>

      <div style={styles.summaryBox}>
        {loading
          ? "요약 불러오는 중…"
          : summary || "요약 내용이 없습니다. 이전 단계에서 설명을 생성/선택해 주세요."}
      </div>

      <div style={styles.buttonGroup}>
        <button style={styles.buttonWhite} onClick={goPrev} disabled={loading}>
          &lt; 이전 단계로 이동
        </button>
        <button
          style={styles.buttonGreen}
          onClick={goNext}
          disabled={!summary || loading || saving}
        >
          다음 단계로 이동 &gt;
        </button>
      </div>
    </div>
  </>
  );
}

const styles = {
  wrapper: { maxWidth: "800px", margin: "0 auto", padding: "40px 20px", textAlign: "center" },
  title: { fontSize: 28, fontWeight: 'bold', marginLeft: "20px", marginTop: "17px", textAlign: "left", color: "#1d1d1f", },
  // ⬆️ 안내문 크기 업 (18 → 22)
  subText: { fontSize: "22px", margin: "40px 0 24px" },

  labelRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
  },
  // ⬆️ AI 요약 라벨 크기 업 (15 → 20) + 굵게
  labelText: { fontSize: "20px", fontWeight: 700 },

  editButton: {
    padding: "6px 12px",
    border: "1px solid #ccc",
    borderRadius: "999px",
    backgroundColor: "white",
    cursor: "pointer",
    fontSize: "13px",
  },

  summaryBox: {
    border: "1px solid #888",
    padding: "24px",
    minHeight: "80px",
    textAlign: "left",
    fontSize: "16px",
    backgroundColor: "#fff",
  },

  buttonGroup: { display: "flex", justifyContent: "space-between", marginTop: "60px" },
  buttonWhite: {
    backgroundColor: "white",
    border: "1px solid #ccc",
    borderRadius: "999px",
    padding: "10px 24px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
  },
  buttonGreen: {
    backgroundColor: "#B6D19B",
    border: "1px solid black",
    borderRadius: "999px",
    padding: "10px 24px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
  },
};

export default ProductSummaryPreview;
