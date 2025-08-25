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

      // 캐시 + 결과 페이지로 이동
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
    <div style={styles.pageWrapper}>
      {/* 상단 타이틀 */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={styles.title}>상품 등록</h2>
      </div>

      {/* 메인 영역 */}
      <div style={styles.mainSection}>
        <p style={styles.headline}>
          키워드를 입력해 자동으로 상세 설명을 만들어보세요!
        </p>

        {/* 키워드 입력 */}
        <div style={styles.inputRow}>
          <label style={styles.inputLabel}>키워드 입력</label>
          <input
            style={styles.inputBox}
            value={keywordsText}
            onChange={(e) => setKeywordsText(e.target.value)}
            placeholder="예: 유기농, 산지직송, 아침수확"
            onKeyDown={(e) => { if (e.key === "Enter") onGenerate(); }}
          />
        </div>

        {/* 프롬프트 입력(선택) */}
        <div style={{ ...styles.inputRow, alignItems: "flex-start" }}>
          <label style={{ ...styles.inputLabel, lineHeight: "40px" }}>프롬프트</label>
          <textarea
            style={{ ...styles.inputBox, height: 120, padding: "10px 12px", resize: "vertical" }}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="설명 톤/분량/타겟 등을 자유롭게"
          />
        </div>

        {/* 생성 버튼 */}
        <button
          onClick={onGenerate}
          disabled={loading}
          style={{
            ...styles.ctaButton,
            opacity: loading ? 0.7 : 1,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "생성 중..." : "자동 AI 상세 설명 생성하기"}
        </button>
      </div>

      {/* 하단 이전 단계 */}
      <div style={styles.bottomLeft}>
        <button
          type="button"
          onClick={() => navigate("/product/image-upload")}
          style={styles.prevBtn}
        >
          &lt;  이전 단계로 이동
        </button>
      </div>

      {/* 에러 / (선택)미리보기 박스 */}
      {error && <p style={{ color: "#c00", marginTop: 12, textAlign: "center" }}>{error}</p>}
      {desc && (
        <div style={styles.previewBox}>
          {desc}
        </div>
      )}
    </div>
  );
}

const styles = {
  pageWrapper: { maxWidth: 1200, margin: "0 auto", padding: "40px 20px" },

  // 전페이지 크기에 맞춘 굵고 큰 제목
  title: { fontSize: 28, fontWeight: 'bold', margin: 0, textAlign: "left", color: "#1d1d1f" },

  mainSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "40vh",
    gap: 36,
  },

  // 안내 문구 30px
  headline: {
    fontSize: 24,
    fontWeight: 400,
    color: "#333",
    textAlign: "center",
    maxWidth: 720,
    margin: "20px auto 8px",
    lineHeight: 1.5,
  },

  inputRow: {
    display: "flex",
    alignItems: "center",
    width: "100%",
    maxWidth: 720,
    margin: "4px auto 0",
    gap: 12,
  },

  // 라벨 30px(볼드X)
  inputLabel: {
    fontSize: 24,
    fontWeight: 400,
    color: "#1d1d1f",
    whiteSpace: "nowrap",
  },

  // 입력 박스 얇게
  inputBox: {
    flex: 1,
    height: 40,           // 50 → 40
    padding: "0 12px",
    borderRadius: 8,
    border: "1px solid #ccc",
    fontSize: 18,
    boxSizing: "border-box",
    backgroundColor: "#fff",
  },

  // 버튼 얇게 + 30px 텍스트
  ctaButton: {
    backgroundColor: "#2E7D32",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    padding: "10px 36px",
    fontSize: 24,
    fontWeight: 400,
    marginTop: 16,
  },

  bottomLeft: {
    display: "flex",
    justifyContent: "flex-start",
    width: "100%",
    maxWidth: 900,
    margin: "80px auto 0",
  },

  prevBtn: {
    backgroundColor: "#fff",
    border: "1px solid #bbb",
    borderRadius: 22,
    padding: "14px 26px",
    fontSize: 18,
    color: "#1d1d1f",
    cursor: "pointer",
  },

  // 선택: 생성 결과 미리보기 박스
  previewBox: {
    maxWidth: 720,
    margin: "24px auto 0",
    padding: 16,
    border: "1px solid #ddd",
    borderRadius: 10,
    background: "#F9F9F9",
    whiteSpace: "pre-wrap",
  },
};
