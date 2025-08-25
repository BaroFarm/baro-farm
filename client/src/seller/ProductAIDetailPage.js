// src/pages/ProductAIDetailPage.js
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function ProductAIDetailPage() {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [keywordsText, setKeywordsText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const onGenerate = () => {
    if (!keywordsText.trim()) return;
    const text = `샘플 생성된 설명: ${keywordsText}`;
    localStorage.setItem(`last_ai_desc_${productId}`, text);
    navigate(`/seller/products/${productId}/description/result`, {
      state: { productId: Number(productId), description: text },
    });
  };

  return (
    <div style={styles.pageWrapper}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={styles.title}>상품 등록</h2>
      </div>

      <div style={styles.mainSection}>
        <p style={styles.headline}>
          키워드를 입력해 자동으로 상세 설명을 만들어보세요!
        </p>

        <div style={styles.inputRow}>
          <label style={styles.inputLabel}>키워드 입력</label>
          <input
            style={styles.inputBox}
            value={keywordsText}
            onChange={(e) => setKeywordsText(e.target.value)}
            placeholder="달달한"
            onKeyDown={(e) => { if (e.key === "Enter") onGenerate(); }}
          />
        </div>

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

      <div style={styles.bottomLeft}>
        <button
          type="button"
          onClick={() => navigate("/product/image-upload")}
          style={styles.prevBtn}
        >
          &lt;  이전 단계로 이동
        </button>
      </div>

      {error && <p style={{ color: "#c00", marginTop: 12, textAlign: "center" }}>{error}</p>}
    </div>
  );
}

const styles = {
  pageWrapper: { maxWidth: 1200, margin: "0 auto", padding: "40px 20px" },

  title: { fontSize: 28, fontWeight: 800, margin: 0, textAlign: "left", color: "#1d1d1f" },

  mainSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "40vh",
    gap: 36,
  },

  // ✅ 안내 문구도 30px로 통일
  headline: {
    fontSize: 30,
    fontWeight: 400,
    color: "#333",
    textAlign: "center",
    margin: "20px 0 8px 0",
    lineHeight: 1.5,
  },

  inputRow: {
    display: "flex",
    alignItems: "center",
    width: "100%",
    maxWidth: 720,
    marginTop: 4,
  },
  // ✅ 라벨 30px (볼드 X)
  inputLabel: {
    fontSize: 30,
    fontWeight: 400,
    color: "#1d1d1f",
    marginRight: 12,
    whiteSpace: "nowrap",
  },
  // ✅ 입력 박스 위아래 높이를 더 얇게
  inputBox: {
    flex: 1,
    height: 40,           // 기존 50 → 40 (얇게)
    padding: "0 12px",    // 위아래 최소 패딩
    borderRadius: 8,
    border: "1px solid #ccc",
    fontSize: 18,
    boxSizing: "border-box",
    backgroundColor: "#fff",
  },

  // ✅ 버튼 위아래 좁게 + 텍스트 30px로 라벨과 통일
  ctaButton: {
    backgroundColor: "#2E7D32",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    padding: "px 36px", // 기존 16px → 10px (세로 얇게)
    fontSize: 30,         // 라벨과 동일한 크기
    fontWeight: 400,      // 볼드 제거
    marginTop: 16,
  },

  bottomLeft: {
    display: "flex",
    justifyContent: "flex-start",
    width: "100%",
    maxWidth: 900,
    margin: "80px auto 0",
  },
  // ✅ 이전 버튼도 약간 키움
  prevBtn: {
    backgroundColor: "#fff",
    border: "1px solid #bbb",
    borderRadius: 22,
    padding: "14px 26px", // 살짝 키움
    fontSize: 18,         // 글자 크기 업
    color: "#1d1d1f",
  },
};
