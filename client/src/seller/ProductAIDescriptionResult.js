// src/seller/ProductAIDescriptionResult.js
import React from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

function ProductAIDescriptionResult() {
  const { state } = useLocation() || {};
  const { productId: pidFromUrl } = useParams();
  const navigate = useNavigate();

  const productId =
    state?.productId ??
    (pidFromUrl ? Number(pidFromUrl) : null) ??
    (Number(localStorage.getItem("current_product_id")) || null);

  const aiDescription =
    state?.description ??
    (productId ? localStorage.getItem(`last_ai_desc_${productId}`) : "") ??
    "AI가 생성한 상세 설명이 여기에 표시됩니다.";

  const BASE = (process.env.REACT_APP_API_BASE_URL || "").replace(/\/$/, "");
  const token = localStorage.getItem("accessToken");

  const handleUseDescription = async () => {
    if (!productId) return alert("상품 ID가 없습니다.");
    if (!aiDescription || aiDescription.startsWith("AI가 생성한")) {
      return alert("사용할 설명이 없습니다.");
    }

    try {
      localStorage.setItem(`final_ai_desc_${productId}`, aiDescription);

      // 1) AI 설명 저장
      const resSave = await fetch(
        `${BASE}/api/s-products/${productId}/description/ai-save`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            product_id: Number(productId),
            description: aiDescription,
          }),
        }
      );
      if (resSave.status === 401) {
        alert("로그인이 필요합니다. 다시 로그인해주세요.");
        return navigate("/login");
      }
      if (!resSave.ok) {
        const t = await resSave.text().catch(() => "");
        console.error("ai-save error body:", t);
        throw new Error(t || `AI 설명 저장 실패 (${resSave.status})`);
      }

      // 2) 요약 생성
      const resSum = await fetch(
        `${BASE}/api/s-products/${productId}/description/summary`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );
      if (!resSum.ok) {
        const t = await resSum.text().catch(() => "");
        throw new Error(t || `요약 생성 실패 (${resSum.status})`);
      }
      const json = await resSum.json().catch(() => ({}));
      const summaryText = json?.summary ?? json?.data?.summary ?? "";

      // 3) 다음 단계로 이동
      navigate("/product/summary-preview", {
        state: { productId, description: aiDescription, summary: summaryText },
      });
    } catch (err) {
      alert(err?.message || "AI 설명 저장/요약 처리 중 오류가 발생했습니다.");
    }
  };

  const handleGoCustom = () =>
    navigate("/product/ai-custom-input", {
      state: { productId, base: aiDescription },
    });

  return (
    <div style={styles.page}>
      {/* 좌측 상단 타이틀 */}
      <div style={styles.titleRow}>
        <h1 style={styles.title}>상품 등록</h1>
      </div>

      {/* 중앙 안내 문구 */}
      <p style={styles.subTitle}>AI가 자동으로 생성한 상세 설명입니다.</p>

      {/* 설명 박스 */}
      <div style={styles.box}>
        <div style={styles.desc}>{aiDescription}</div>
      </div>

      {/* 버튼: 좌/우 배치 */}
      <div style={styles.actions}>
        <button onClick={handleUseDescription} style={{ ...styles.btn }}>
          위 설명 사용할게요
        </button>
        <button onClick={handleGoCustom} style={{ ...styles.btn }}>
          직접 작성할게요
        </button>
      </div>
    </div>
  );
}

const styles = {
  page: {
    padding: "24px",
  },
  titleRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  // 전페이지 크기에 최대한 맞춘 굵고 큰 제목 (필요시 px값 조절)
  title: {
    margin: 0,
    fontSize: "28px",
    fontWeight: 700,
    lineHeight: 1,
  },
  subTitle: {
    textAlign: "center",
    fontSize: "20px",
    fontWeight: 600,
    margin: "20px 0 24px",
  },
  box: {
    maxWidth: 720,
    margin: "0 auto",
    background: "#F9F9F9",
    border: "1px solid #E3E3E3",
    borderRadius: 10,
    padding: 24,
    minHeight: 260,
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "flex-start",
  },
  desc: {
    whiteSpace: "pre-wrap",
    overflowWrap: "break-word",
    lineHeight: 1.6,
    fontSize: 18,
  },
  actions: {
    maxWidth: 720,
     margin: "48px auto 0",   // ✅ 박스랑 버튼 사이 간격 늘림 (16px → 48px)
    display: "flex",
    justifyContent: "space-between", // 좌/우 배치
    gap: 12,
  },
  btn: {
  
    backgroundColor: "#B6D19B",   // 연두색
  border: "1px solid #333",     // 테두리 (진하게)
  borderRadius: 15,              // 각진 느낌
  padding: "8px 26px",
  
  fontSize: 18,
  color: "#1d1d1f",
  cursor: "pointer",
  fontWeight: 500,
  },
};

export default ProductAIDescriptionResult;
