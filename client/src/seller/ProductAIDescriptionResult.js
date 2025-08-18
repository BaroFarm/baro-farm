// src/pages/ProductAIDescriptionResult.jsx
import React from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

function ProductAIDescriptionResult() {
  const { state } = useLocation() || {};
  const { productId: pidFromUrl } = useParams();
  const navigate = useNavigate();

  // productId 우선순위: location.state → URL → localStorage
  const productId =
    state?.productId ??
    (pidFromUrl ? Number(pidFromUrl) : null) ??
    (Number(localStorage.getItem("current_product_id")) || null);

  // 설명 우선순위: location.state → localStorage 캐시 → 플레이스홀더
  const aiDescription =
    state?.description ??
    (productId ? localStorage.getItem(`last_ai_desc_${productId}`) : "") ??
    "AI가 생성한 상세 설명이 여기에 표시됩니다.";

  const handleUseDescription = () => {
    if (!productId) return alert("상품 ID가 없습니다.");
    if (!aiDescription || aiDescription.startsWith("AI가 생성한")) {
      return alert("사용할 설명이 없습니다.");
    }
    // 다음 단계로 이동 (시연용: API 저장 없이 진행)
    localStorage.setItem(`final_ai_desc_${productId}`, aiDescription);
    navigate("/product/summary-preview", {
      state: {
        productId,
        description: aiDescription,
        summary: aiDescription, // 시연 편의상 동일 전달
      },
    });
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
