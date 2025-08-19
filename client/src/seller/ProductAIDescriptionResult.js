// src/seller/ProductAIDescriptionResult.js (또는 pages/.. 경로)
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
            description: aiDescription, // 서버가 필요 없다면 무시, 필요하면 사용
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
    navigate("/product/ai-custom-input", { state: { productId, base: aiDescription } });

  return (
    <div style={{ padding: 24 }}>
      <h2>AI 생성 결과</h2>
      <div
    style={{
      marginTop: 12,
      padding: 16,
      border: "1px solid #ddd",
      borderRadius: 8,
      backgroundColor: "#f9f9f9",   // 박스 배경 살짝 회색
      maxWidth: "100%",             // 화면 벗어나지 않게
      overflowWrap: "break-word",   // 긴 단어 줄바꿈
      whiteSpace: "pre-wrap"        // 줄바꿈 유지
    }}
  >
    {aiDescription}
  </div>

  <div style={{ marginTop: 16, display: "flex", gap: 12, justifyContent: 'center' }}>
    <button onClick={handleUseDescription}
      style={{
            display: "inline-block", 
            backgroundColor: "#B6D19B",  // 원하는 버튼 색
            padding: "8px 16px",
            borderRadius: "6px",
            cursor: "pointer",
            marginTop: '16px',
            border: 'none',
            fontSize: '16px'}}
    >위 설명 사용할게요</button>
    <button onClick={handleGoCustom}
      style={{
            display: "inline-block", 
            backgroundColor: "#B6D19B",  // 원하는 버튼 색
            padding: "8px 16px",
            borderRadius: "6px",
            cursor: "pointer",
            marginTop: '16px',
            border: 'none',
            fontSize: '16px'}}>
              직접 작성할게요</button>
  </div>
    </div>
  );
}

export default ProductAIDescriptionResult;
