// src/pages/ProductImageUploadPage.js
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams, useLocation } from "react-router-dom";

export default function ProductImageUploadPage() {
  const navigate = useNavigate();
  const { productId: pidFromUrl } = useParams();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const qid = searchParams.get("id");
  const stateId = location.state?.productId;
  const storedId =
    typeof window !== "undefined"
      ? (localStorage.getItem("current_product_id") || localStorage.getItem("currentProductId"))
      : null;

  const initialId = pidFromUrl || qid || stateId || storedId || "";
  const [productId, setProductId] = useState(initialId);

  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadedCount, setUploadedCount] = useState(0);
  const [error, setError] = useState(null);

  const previews = useMemo(
    () => files.map((f) => ({ name: f.name, url: URL.createObjectURL(f) })),
    [files]
  );
  useEffect(() => () => previews.forEach((p) => URL.revokeObjectURL(p.url)), [previews]);

  const onPickFiles = (e) => {
    const list = e.target.files ? Array.from(e.target.files) : [];
    if (!list.length) return;
    setFiles((prev) => [...prev, ...list]);
  };

  const move = (idx, dir) =>
    setFiles((prev) => {
      const next = [...prev];
      const t = idx + dir;
      if (t < 0 || t >= next.length) return prev;
      [next[idx], next[t]] = [next[t], next[idx]];
      return next;
    });

  const remove = (idx) => setFiles((prev) => prev.filter((_, i) => i !== idx));

  const onUpload = async () => {
    setError(null);
    const id = productId || pidFromUrl;
    if (!id) return setError("상품 ID가 필요합니다.");
    if (!files.length) return setError("업로드할 이미지를 선택하세요.");

    try {
      setUploading(true);

      const fd = new FormData();
      fd.append("product_id", String(id));
      const nowISO = new Date().toISOString();
      files.forEach((file, idx) => {
        fd.append("images", file);
        fd.append("img_order[]", String(idx + 1));
        fd.append("created_at[]", nowISO);
      });

      const BASE = (process.env.REACT_APP_API_BASE_URL || "").replace(/\/$/, "");
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${BASE}/api/s-products/${id}/images`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: fd,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || `업로드 실패 (HTTP ${res.status})`);
      }

      const data = await res.json();
      setUploadedCount(Array.isArray(data?.images) ? data.images.length : files.length);

      navigate(`/seller/products/${id}/description/ai-gen`);
    } catch (e) {
      setError(e?.message || "업로드 실패");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={styles.pageWrapper}>
      {/* 상단 제목 */}
      <div style={{ marginBottom: "24px" }}>
        <h2 style={styles.title}>상품 등록</h2>
      </div>

      {/* 본문 안내 + 업로드 버튼 */}
      <div style={styles.mainSection}>
        <p style={styles.subTitle}>
          <span>상품등록을 위해</span>
          <br />
          <span>이미지를 업로드 하세요</span>
        </p>

        <div style={styles.centerContent}>
          <label style={styles.fileButton}>
            이미지 업로드
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={onPickFiles}
              style={{ display: "none" }}
            />
          </label>

          {!!files.length && (
            <p style={styles.helperText}>
              여러 장 선택 가능 · 위/아래 버튼으로 순서 조정 (순서가 <code>img_order</code>가 됩니다)
            </p>
          )}
        </div>
      </div>

      {/* 이미지 미리보기 */}
      {!!files.length && (
        <ul style={styles.previewGrid}>
          {previews.map((p, idx) => (
            <li key={p.url} style={styles.previewItem}>
              <img src={p.url} alt={p.name} style={styles.previewImg} />
              <div style={{ fontSize: 12, marginTop: 6 }}>
                {idx + 1}. {p.name}
              </div>
              <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                <button onClick={() => move(idx, -1)} disabled={idx === 0}>
                  위로
                </button>
                <button onClick={() => move(idx, 1)} disabled={idx === files.length - 1}>
                  아래
                </button>
                <button
                  style={{ marginLeft: "auto", color: "#c00" }}
                  onClick={() => remove(idx)}
                >
                  삭제
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* 하단 네비 버튼 */}
      <div style={styles.bottomNav}>
        <button type="button" style={styles.prevBtn} onClick={() => navigate("/product/form")}>
          &lt; 이전 단계로 이동
        </button>
        <button
          type="button"
          style={{
            ...styles.nextBtn,
            opacity: uploading ? 0.6 : 1,
            cursor: uploading ? "not-allowed" : "pointer",
          }}
          onClick={onUpload}
          disabled={uploading}
        >
          다음 단계로 이동 &gt;
        </button>
      </div>

      {uploadedCount > 0 && (
        <p style={{ color: "green", fontSize: 13, textAlign: "center", marginTop: 10 }}>
          {uploadedCount}개 업로드 완료
        </p>
      )}
      {error && <p style={{ color: "#c00", marginTop: 8, textAlign: "center" }}>{error}</p>}
    </div>
  );
}

const styles = {
  pageWrapper: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "40px 20px",
  },
  title: {
    fontSize: "28px",
    fontWeight: 'bold',
    margin: 0,
    textAlign: "left",
    color: "#1d1d1f",
  },
  mainSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "40vh", // ✅ 전체적으로 아래쪽으로 배치
    marginBottom: "40px",
  },
  subTitle: {
    fontSize: "24px", // ✅ 더 크게
    fontWeight: 400, // ✅ 볼드 없음
    textAlign: "center",
    marginBottom: "20px",
    color: "#4a4a4a",
    lineHeight: 1.5,
  },
  centerContent: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
  },
  fileButton: {
    display: "inline-block",
    backgroundColor: "#B6D19B",
    padding: "12px 24px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: 500,
    color: "#1d1d1f",
    border: "1px solid black",
  },
  helperText: {
    fontSize: "13px",
    color: "#666",
  },
  previewGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 12,
    marginTop: 20,
  },
  previewItem: {
    border: "1px solid #ddd",
    borderRadius: 8,
    padding: 8,
    textAlign: "center",
  },
  previewImg: {
    width: "100%",
    height: 120,
    objectFit: "cover",
    borderRadius: 6,
  },
  bottomNav: {
    display: "flex",
     justifyContent: "space-between", // ✅ 좌/우 끝으로 밀기
    maxWidth: 800,
    margin: "80px auto 0", // ✅ 전체적으로 아래 배치
  },
  prevBtn: {
    backgroundColor: "#fff",
    border: "1px solid #bbb",
    borderRadius: "20px",
    padding: "14px 40px",   // ✅ 버튼 자체를 가로로 더 길게
    fontSize: "17px",       // ✅ 글씨 크게
    
  },
  nextBtn: {
    backgroundColor: "#B6D19B",
    border: "1px solid black",
    borderRadius: "20px",
     padding: "12px 28px",   // ✅ 가로·세로 여백 증가
    fontSize: "17px",       // ✅ 글씨 크게
    
  },
};
