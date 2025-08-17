// src/pages/ProductAIDescriptionResult.jsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { saveAIDescription } from "../api/products";

function ProductAIDescriptionResult() {
  const { state } = useLocation() || {};
  const navigate = useNavigate();

  const productId =
    state?.productId ||
    Number(localStorage.getItem("current_product_id") || 0) ||
    null;

  const aiDescription =
    state?.description ||
    (productId ? localStorage.getItem(`last_ai_desc_${productId}`) : "") ||
    "AI가 생성한 상세 설명이 여기에 표시됩니다.";

  const handleUseDescription = async () => {
    if (!productId) return alert("상품 ID가 없습니다.");
    if (!aiDescription || aiDescription.startsWith("AI가 생성한")) {
      return alert("사용할 설명이 없습니다.");
    }

    try {
      await saveAIDescription(productId, aiDescription); // ← 저장
      // 저장 성공 시 다음 단계로
      navigate("/product/summary-preview", {
        state: {
          productId,
          description: aiDescription,
          summary: aiDescription, // 요약도 동일 전달
        },
      });
    } catch (err) {
      const msg = err?.response?.data?.message || "AI 설명 저장 중 오류 발생";
      alert(msg);
    }
  };

  const handleGoCustom = () =>
    navigate("/product/ai-custom-input", { state: { productId, base: aiDescription } });

  return (
    <div style={{ padding: 24 }}>
      <h2>AI 생성 결과</h2>
      <pre style={{ whiteSpace: "pre-wrap" }}>{aiDescription}</pre>

      <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
        <button onClick={handleUseDescription}>위 설명 사용할게요</button>
        <button onClick={handleGoCustom}>직접 작성할게요</button>
      </div>
    </div>
  );
}

export default ProductAIDescriptionResult;
