import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { generateAIDescription } from "../api/products";

export default function ProductAIDetailPage() {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [keywordsText, setKeywordsText] = useState("");
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [desc, setDesc] = useState("");
  const [error, setError] = useState(null);

  // 서버 응답 다양한 스키마를 안전하게 뽑아주는 헬퍼
  const pickDescription = (res) => {
    if (!res) return "";
    if (typeof res === "string") return res;
    if (res.data?.description) return res.data.description;
    if (res.generatedDescription) return res.generatedDescription;
    if (res.description) return res.description;
    // 마지막 대비: 객체를 문자열로
    return JSON.stringify(res);
  };

  const onGenerate = async () => {
    setError(null);
    if (!productId) return setError("상품 ID가 필요합니다.");

    // 키워드 전처리
    const keywords = keywordsText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    // 서버가 빈 배열을 싫어하는 경우 대비해서 options 구성
    const options = {};
    if (keywords.length) options.keywords = keywords;
    if (prompt.trim()) options.prompt = prompt.trim();

    try {
      setLoading(true);
      const result = await generateAIDescription(productId, options);
      const text = pickDescription(result);
      setDesc(text || "");
    } catch (e) {
      const status = e?.status || e?.response?.status;
      const msg =
        e?.message ||
        e?.response?.data?.message ||
        (status === 401 ? "로그인이 필요합니다. 다시 로그인해주세요." : "AI 생성 실패");

      // 선택: 401이면 로그인으로 유도
      if (status === 401) {
        // 필요 시 경로 수정
        setTimeout(() => navigate("/mypage?login=1"), 500);
      }

      setError(msg);
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

      {desc && (
        <div style={{ marginTop: 16, padding: 12, border: "1px solid #ddd", borderRadius: 8, whiteSpace: "pre-wrap" }}>
          {desc}
        </div>
      )}
    </div>
  );
}
