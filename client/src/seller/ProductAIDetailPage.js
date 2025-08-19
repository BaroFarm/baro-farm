// src/pages/ProductAIDetailPage.js
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function ProductAIDetailPage() {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [keywordsText, setKeywordsText] = useState("");
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [desc, setDesc] = useState("");
  const [error, setError] = useState(null);

  // 응답에서 설명 텍스트 뽑기 (스키마 방어)
  const pickDescription = (resJson) => {
    if (!resJson) return "";
    if (typeof resJson === "string") return resJson;
    if (resJson.generatedDescription) return resJson.generatedDescription;
    if (resJson.data?.generatedDescription) return resJson.data.generatedDescription;
    if (resJson.description) return resJson.description;
    return JSON.stringify(resJson);
  };

  const onGenerate = async () => {
    setError(null);
    if (!productId) return setError("상품 ID가 필요합니다.");

    const keywords = keywordsText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      setLoading(true);

      const BASE = (process.env.REACT_APP_API_BASE_URL || "").replace(/\/$/, "");
      const token = localStorage.getItem("accessToken");

      const res = await fetch(`${BASE}/api/s-products/${productId}/description/ai-gen`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          product_id: Number(productId),
          ...(keywords.length ? { keywords } : {}),
          ...(prompt.trim() ? { prompt: prompt.trim() } : {}),
        }),
      });

      if (res.status === 401) {
        setError("로그인이 필요합니다. 다시 로그인해주세요.");
        setTimeout(() => navigate("/login"), 600);
        return;
      }
      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        throw new Error(errText || `요청 실패 (${res.status})`);
      }

      const json = await res.json();
      const text = pickDescription(json) || "";
      setDesc(text);

      // 🔸 로컬 캐시 + 결과 페이지로 이동
      localStorage.setItem(`last_ai_desc_${productId}`, text);
      navigate(`/seller/products/${productId}/description/result`, {
        state: { productId: Number(productId), description: text },
      });
    } catch (e) {
      setError(e.message || "AI 생성 실패");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 16, maxWidth: 760 }}>
      <h2>상품 설명 자동 생성</h2>

      <div style={{ marginTop: 12 }}>
        <label>키워드 (쉼표로 구분):</label>
        <input
          style={{ display: "block", width: "100%", border: "1px solid #ccc", padding: 6, marginTop: 6 }}
          value={keywordsText}
          onChange={(e) => setKeywordsText(e.target.value)}
          placeholder="예: 유기농, 산지직송, 아침수확"
          onKeyDown={(e) => { if (e.key === "Enter") onGenerate(); }}
        />
      </div>

      <div style={{ marginTop: 12 }}>
        <label>프롬프트(선택):</label>
        <textarea
          style={{ display: "block", width: "100%", height: 120, border: "1px solid #ccc", padding: 6, marginTop: 6 }}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="설명 톤/분량/타겟 등을 자유롭게"
        />
      </div>

      <div style={{ marginTop: 12 }}>
        <button onClick={onGenerate} disabled={loading}>
          {loading ? "생성 중..." : "자동 AI 상세 설명 생성하기"}
        </button>
      </div>

      {error && <p style={{ color: "#c00", marginTop: 8 }}>{error}</p>}
      {/* desc는 즉시 이동하므로 남겨도 되고 제거해도 됨 */}
      {desc && (
        <div style={{ marginTop: 16, padding: 12, border: "1px solid #ddd", borderRadius: 8, whiteSpace: "pre-wrap" }}>
          {desc}
        </div>
      )}
    </div>
  );
}
