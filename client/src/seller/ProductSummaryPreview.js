// src/pages/ProductSummaryPreview.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function ProductSummaryPreview() {
  const { state } = useLocation() || {};
  const navigate = useNavigate();

  const productId =
    state?.productId ||
    Number(localStorage.getItem("current_product_id") || 0) ||
    null;

  const [summary, setSummary] = useState(
    state?.summary ||
      state?.description ||
      (productId ? localStorage.getItem(`last_ai_desc_${productId}`) : "") ||
      ""
  );
  const [loading, setLoading] = useState(false);

  // 없으면 서버에서 요약 다시 가져오기
  useEffect(() => {
    if (!productId || summary) return;

    const BASE = (process.env.REACT_APP_API_BASE_URL || "").replace(/\/$/, "");
    const token = localStorage.getItem("accessToken");

    (async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `${BASE}/api/s-products/${productId}/description/summary`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({ product_id: productId }),
          }
        );
        if (!res.ok) throw new Error(`요약 요청 실패 (${res.status})`);
        const json = await res.json().catch(() => ({}));
        setSummary(json?.summary || json?.data?.summary || "");
      } catch (e) {
        // 요약이 꼭 필요하지 않으면 조용히 패스
        console.warn(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [productId, summary]);

  const goPrev = () =>
    navigate("/product/ai-custom-input", {
      state: { productId, base: summary },
    });

  const goNext = () =>
    navigate("/product/video-preview", {
      state: { productId, summary },
    });

  return (
    <div style={styles.wrapper}>
      <h2 style={styles.title}>상품 등록</h2>
      <p style={styles.subText}>상품에 대한 간단한 소개글입니다.</p>

      <div style={styles.labelRow}>
        <span>AI 요약</span>
        <button style={styles.editButton} onClick={goPrev}>
          요약 수정하기
        </button>
      </div>

      <div style={styles.summaryBox}>
        {loading
          ? "요약 불러오는 중…"
          : summary || "요약 내용이 없습니다. 이전 단계에서 설명을 생성/선택해 주세요."}
      </div>

      <div style={styles.buttonGroup}>
        <button style={styles.buttonWhite} onClick={goPrev}>
          &lt; 이전 단계로 이동
        </button>
        <button
          style={styles.buttonGreen}
          onClick={goNext}
          disabled={!summary}
        >
          다음 단계로 이동 &gt;
        </button>
      </div>
    </div>
  );
}

const styles = {
  wrapper: { maxWidth: "800px", margin: "0 auto", padding: "40px 20px", textAlign: "center" },
  title: { fontSize: "22px", fontWeight: "bold", textAlign: "left" },
  subText: { fontSize: "18px", margin: "40px 0 24px" },
  labelRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", fontSize: "15px" },
  editButton: { padding: "6px 12px", border: "1px solid #ccc", borderRadius: "999px", backgroundColor: "white", cursor: "pointer", fontSize: "13px" },
  summaryBox: { border: "1px solid #888", padding: "24px", minHeight: "80px", textAlign: "left", fontSize: "16px", backgroundColor: "#fff" },
  buttonGroup: { display: "flex", justifyContent: "space-between", marginTop: "60px" },
  buttonWhite: { backgroundColor: "white", border: "1px solid #ccc", borderRadius: "999px", padding: "10px 24px", fontSize: "14px", fontWeight: "500", cursor: "pointer" },
  buttonGreen: { backgroundColor: "#B6D19B", border: "1px solid black", borderRadius: "999px", padding: "10px 24px", fontSize: "14px", fontWeight: "500", cursor: "pointer" },
};

export default ProductSummaryPreview;
