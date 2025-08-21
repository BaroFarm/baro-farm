// src/pages/ProductImageUploadPage.js
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams, useLocation } from "react-router-dom";

export default function ProductImageUploadPage() {
  const navigate = useNavigate();
  const { productId: pidFromUrl } = useParams();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  // 여러 경로에서 productId 확보
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

  // 미리보기
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

      // ▶︎ 명세: multipart/form-data, POST /api/s-products/:id/images
      const fd = new FormData();
      // 필요시 서버에서 path-param 외에도 활용할 수 있게 함께 넣어줌
      fd.append("product_id", String(id));

      const nowISO = new Date().toISOString();
      files.forEach((file, idx) => {
        // 서버 구현에 따라 field 이름이 'images' 또는 'file'일 수 있어
        // 가장 흔한 'images'로 전송. (백엔드가 'file'을 기대하면 거기에 맞춰 변경)
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

      const data = await res.json(); // { product_id, images: [{img_id, img_url, img_order, created_at}, ...] }
      setUploadedCount(Array.isArray(data?.images) ? data.images.length : files.length);

      // 다음 단계로 이동 (기존 경로 유지)
      navigate(`/seller/products/${id}/description/ai-gen`);
    } catch (e) {
      setError(e?.message || "업로드 실패");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <div style={{fontSize: '18px', margin: '50px 0px'}}> 상품등록을 위해 이미지를 업로드 하세요</div>
      {!pidFromUrl && (
        <div style={{ marginBottom: 8 }}>
          <label>상품 ID: </label>
          <input
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            placeholder="예: 1"
            style={{ border: "1px solid #ccc", padding: 6 }}
          />
        </div>
      )}

      <div>
  {/* label을 버튼처럼 스타일 */}
  <label 
    style={{ 
      display: "inline-block", 
      backgroundColor: "#B6D19B",  // 원하는 버튼 색
      padding: "8px 16px",
      borderRadius: "6px",
      cursor: "pointer",
      marginTop: '14px'
    }}
  >
    파일 선택
    {/* 실제 input은 숨김 */}
    <input 
      type="file" 
      accept="image/*" 
      multiple 
      onChange={onPickFiles} 
      style={{ display: "none" }} 
    />
  </label>
  <p style={{ fontSize: 12, color: "#666" }}>
    여러 장 선택 가능 · 위/아래 버튼으로 순서 조정 (이 순서가 <code>img_order</code>가 됩니다)
  </p>
</div>

      {!!files.length && (
        <ul style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginTop: 12 }}>
          {previews.map((p, idx) => (
            <li key={p.url} style={{ border: "1px solid #ddd", borderRadius: 8, padding: 8 }}>
              <img src={p.url} alt={p.name} style={{ width: "100%", height: 120, objectFit: "cover", borderRadius: 6 }} />
              <div style={{ fontSize: 12, marginTop: 6 }}>{idx + 1}. {p.name}</div>
              <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                <button onClick={() => move(idx, -1)} disabled={idx === 0}>위로</button>
                <button onClick={() => move(idx, 1)} disabled={idx === files.length - 1}>아래</button>
                <button style={{ marginLeft: "auto", color: "#c00" }} onClick={() => remove(idx)}>삭제</button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div style={{ display: "flex", 
        alignItems: "center", 
        justifyContent: "center",  // 가로 가운데 정렬
        gap: 10, 
        marginTop: 12  }}>
        <button
          onClick={onUpload}
          disabled={uploading || !files.length}
          style={{
            backgroundColor: uploading || !files.length ? "#aaa" : "#B6D19B", // 비활성화일 땐 회색
            padding: "8px 16px",
            borderRadius: "6px",
            cursor: uploading || !files.length ? "not-allowed" : "pointer",
            border: "none"
          }}
        >
          {uploading ? "업로드 중..." : "이미지 업로드"}
      </button>

  {uploadedCount > 0 && (
    <span style={{ color: "green", fontSize: 13 }}>
      {uploadedCount}개 업로드 완료
    </span>
  )}
</div>

      {error && <p style={{ color: "#c00", marginTop: 8 }}>{error}</p>}
    </div>
  );
}
