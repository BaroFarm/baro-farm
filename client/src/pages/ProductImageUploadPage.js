import React, { useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams, useLocation } from "react-router-dom";
import { uploadProductImages } from "../api/products";

export default function ProductImageUploadPage() {
  const navigate = useNavigate();
  const { productId: pidFromUrl } = useParams();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const qid = searchParams.get("id"); // /product/image-upload?id=123
  const stateId = location.state?.productId; // navigate state로 받은 경우
  const storedId = typeof window !== "undefined" ? localStorage.getItem("currentProductId") : null;
  const initialId = pidFromUrl || qid || stateId || storedId || "";
  const [productId, setProductId] = useState(initialId);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrls, setUploadedUrls] = useState([]);
  const [error, setError] = useState(null);

  const previews = useMemo(
    () => files.map((f) => ({ name: f.name, url: URL.createObjectURL(f) })),
    [files]
  );

  const onPickFiles = (e) => {
    const list = e.target.files ? Array.from(e.target.files) : [];
    if (!list.length) return;
    setFiles((prev) => [...prev, ...list]); // 선택 순서 = 업로드 순서
  };

  const move = (idx, dir) => {
    setFiles((prev) => {
      const next = [...prev];
      const t = idx + dir;
      if (t < 0 || t >= next.length) return prev;
      [next[idx], next[t]] = [next[t], next[idx]];
      return next;
    });
  };

  const remove = (idx) => setFiles((prev) => prev.filter((_, i) => i !== idx));

  const onUpload = async () => {
    setError(null);
    const id = productId || pidFromUrl;
    if (!id) return setError("상품 ID가 필요합니다.");
    if (!files.length) return setError("업로드할 이미지를 선택하세요.");

    try {
      setUploading(true);
      const result = await uploadProductImages(id, files, "file"); 
      setUploadedUrls(result.urls || []);
      // 업로드 완료 후 AI 설명 생성 페이지로 이동 (프론트 라우트)
      navigate(`/seller/products/${id}/description/ai-gen`);
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        (e?.response?.status === 401 ? "로그인이 필요합니다. 다시 로그인해주세요." : e?.message) ||
        "업로드 실패";
      setError(msg);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ padding: 16 }}>
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
        <input type="file" accept="image/*" multiple onChange={onPickFiles} />
        <p style={{ fontSize: 12, color: "#666" }}>
          여러 장 선택 가능 · 위/아래 버튼으로 순서 조정 (이 순서가 DB img_order가 됩니다)
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

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12 }}>
        <button onClick={onUpload} disabled={uploading || !files.length}>
          {uploading ? "업로드 중..." : "이미지 업로드"}
        </button>
        {uploadedUrls.length > 0 && (
          <span style={{ color: "green", fontSize: 13 }}>
            {uploadedUrls.length}개 업로드 완료
          </span>
        )}
      </div>

      {error && <p style={{ color: "#c00", marginTop: 8 }}>{error}</p>}
    </div>
  );
}
