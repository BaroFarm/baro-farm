// src/pages/ProductFinalPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

/* ---------- helpers ---------- */
const toNum = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};
const FORM_FILE_FIELD = "file"; // 서버 multer.single('file') 기준
const DUMMY_CLOUDINARY =
  "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg";

async function fetchBlob(url, token) {
  const r = await fetch(url, {
    method: "GET",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    cache: "no-store",
  });
  if (r.status === 401) throw new Error("소스 이미지 다운로드 실패 (401: 인증 필요)");
  if (!r.ok) throw new Error(`소스 이미지 다운로드 실패 (${r.status})`);
  return await r.blob();
}

/* ---------- component ---------- */
export default function ProductFinalPage() {
  const { state } = useLocation() || {};
  const navigate = useNavigate();

  // withVideo / 전달된 임시 videoUrl
  const withVideo = !!state?.withVideo;
  const stateVideoUrl = state?.videoUrl;

  // productId: state → localStorage
  const productId =
    toNum(state?.productId) ?? toNum(localStorage.getItem("current_product_id"));

  const BASE = (process.env.REACT_APP_API_BASE_URL || "").replace(/\/$/, "");
  const token = localStorage.getItem("accessToken");

  /* ---- 영상 URL (임시 폴백 포함) ---- */
  const cachedVideo = productId
    ? localStorage.getItem(`last_ai_video_${productId}`)
    : "";
  const fallbackVideo = useMemo(() => {
    if (process.env.REACT_APP_VIDEO_PLACEHOLDER) return process.env.REACT_APP_VIDEO_PLACEHOLDER;
    if (BASE) return `${BASE}/videos/test_720p.mp4`; // server/public/videos/...
    return "/videos/test_720p.mp4"; // CRA public
  }, [BASE]);
  const videoUrl = stateVideoUrl || cachedVideo || fallbackVideo;

  /* ---- 상세 프리뷰: HTML 우선, PNG 폴백 ---- */
  const htmlUrl = productId && BASE ? `${BASE}/api/s-products/${productId}/figma-spec?format=html` : "";
  const pngUrl  = productId && BASE ? `${BASE}/api/s-products/${productId}/preview?format=png`      : "";

  const [checkingPreview, setCheckingPreview] = useState(false);
  const [htmlDoc, setHtmlDoc] = useState("");        // 성공 시 iframe srcDoc
  const [pngObjectUrl, setPngObjectUrl] = useState(""); // 성공 시 <img src=blob:...>
  const [previewErr, setPreviewErr] = useState("");

  useEffect(() => {
    let aborted = false;
    let blobUrlToRevoke = "";

    // HTML 먼저 받아보기 → 실패하면 PNG(blob)
    (async () => {
      if (!htmlUrl && !pngUrl) return;
      try {
        setCheckingPreview(true);
        setPreviewErr("");

        if (htmlUrl) {
          const r = await fetch(htmlUrl, {
            method: "GET",
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            cache: "no-store",
          });
          if (aborted) return;
          if (r.ok && r.headers.get("content-type")?.includes("text/html")) {
            const txt = await r.text();
            if (!aborted) setHtmlDoc(txt);
            return; // HTML 성공 시 PNG 시도 불필요
          }
        }

        if (pngUrl) {
          const blob = await fetchBlob(pngUrl, token);
          if (aborted) return;
          const url = URL.createObjectURL(blob);
          blobUrlToRevoke = url;
          setPngObjectUrl(url);
        } else {
          setPreviewErr("프리뷰를 표시할 수 없습니다.");
        }
      } catch (e) {
        if (!aborted) setPreviewErr(e.message || "프리뷰 로딩 실패");
      } finally {
        if (!aborted) setCheckingPreview(false);
      }
    })();

    return () => {
      aborted = true;
      if (blobUrlToRevoke) URL.revokeObjectURL(blobUrlToRevoke);
    };
  }, [htmlUrl, pngUrl, token]);

  /* ---- 최종 제출 ---- */
  const [submitting, setSubmitting] = useState(false);
  const [submitErr, setSubmitErr] = useState("");

  // figma_export_url 후보(state 두 형태, localStorage, 서버 PNG 프리뷰, 더미)
  const figmaCandidate =
    state?.figma_export_url ||
    state?.figmaExportUrl ||
    (productId ? localStorage.getItem(`figma_export_url_${productId}`) : "") ||
    (pngUrl || "") || // 서버 프리뷰 URL 자체(뒷단이 받아줄 수 있다면)
    DUMMY_CLOUDINARY;

  const goPrev = () => navigate("/product/summary-preview", { state: { productId } });

  const goComplete = async () => {
    if (!productId) return alert("상품 ID가 없습니다.");
    if (!BASE)      return alert("REACT_APP_API_BASE_URL 미설정");

    try {
      setSubmitting(true);
      setSubmitErr("");

      // 1) JSON 방식(명세) 먼저 시도
      const jsonRes = await fetch(`${BASE}/api/s-products/${productId}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          product_id: Number(productId),
          figma_export_url: figmaCandidate,
        }),
      });

      if (jsonRes.status === 401) {
        alert("로그인이 필요합니다. 다시 로그인해주세요.");
        navigate("/login");
        return;
      }

      if (jsonRes.ok) {
        const js = await jsonRes.json().catch(() => ({}));
        const savedUrl = js?.data?.figma_export_url || figmaCandidate;
        if (productId && savedUrl) localStorage.setItem(`figma_export_url_${productId}`, savedUrl);
        navigate("/product/complete", {
          state: { productId, submitted: true, figma_export_url: savedUrl, public_id: js?.data?.public_id },
        });
        return;
      }

      // 2) JSON 실패 시 메시지 체크 → "파일 없음"이면 multipart 폴백
      const bodyText = await jsonRes.text().catch(() => "");
      const requiresFile = /파일\s*없음|no file/i.test(bodyText);
      if (!requiresFile) throw new Error(bodyText || `최종 제출 실패 (${jsonRes.status})`);

      // PNG 소스를 인증 포함으로 다시 받아 파일 생성
      const sourceUrl = pngUrl || figmaCandidate || DUMMY_CLOUDINARY;
      const blob = await fetchBlob(sourceUrl, token);
      const file = new File([blob], "figma_export.png", { type: blob.type || "image/png" });

      const fd = new FormData();
      fd.append("product_id", String(productId));
      fd.append(FORM_FILE_FIELD, file);

      const mpRes = await fetch(`${BASE}/api/s-products/${productId}/submit`, {
        method: "POST",
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: fd,
      });
      if (!mpRes.ok) {
        const t2 = await mpRes.text().catch(() => "");
        throw new Error(t2 || `멀티파트 제출 실패 (${mpRes.status})`);
      }

      const js2 = await mpRes.json().catch(() => ({}));
      const savedUrl2 = js2?.data?.figma_export_url || figmaCandidate;
      if (productId && savedUrl2) localStorage.setItem(`figma_export_url_${productId}`, savedUrl2);

      navigate("/product/complete", {
        state: { productId, submitted: true, figma_export_url: savedUrl2, public_id: js2?.data?.public_id },
      });
    } catch (e) {
      setSubmitErr(e.message || "최종 제출 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  /* ---- UI ---- */
  return (
    <>
    <h2 style={styles.title}>상품 등록</h2>
    <div style={styles.wrapper}>
      
      <p style={styles.subText}>마지막으로 상품 페이지를 점검해주세요.</p>

      {withVideo && (
        <div style={styles.mediaSection}>
          <video
            key={videoUrl}
            src={videoUrl}
            controls
            style={{ width: "100%", height: "auto", borderRadius: 8 }}
            onError={(e) => {
              if (videoUrl !== fallbackVideo) e.currentTarget.src = fallbackVideo;
            }}
          />
        </div>
      )}

      <div style={{ marginBottom: 20 }}>
        {checkingPreview ? (
          <p>미리보기 확인 중…</p>
        ) : htmlDoc ? (
          <iframe
            srcDoc={htmlDoc}
            title="상품 상세 프리뷰"
            width="100%"
            height="900"
            style={{ border: "none", borderRadius: 8 }}
          />
        ) : pngObjectUrl ? (
          <img
            src={pngObjectUrl}
            alt="상품 페이지 프리뷰"
            style={{ width: "100%", borderRadius: 8, border: "1px solid #eee" }}
          />
        ) : (
          <p>프리뷰를 표시할 수 없습니다. {previewErr}</p>
        )}
      </div>

      {submitErr && <p style={{ color: "#c00", marginTop: 8, whiteSpace: "pre-wrap" }}>{submitErr}</p>}

      <div style={styles.buttonGroup}>
        <button style={styles.buttonWhite} onClick={goPrev} disabled={submitting}>
          &lt; 이전 단계로 이동
        </button>
        <button
          style={styles.buttonGreen}
          onClick={goComplete}
          disabled={submitting}
          title={figmaCandidate ? "" : "figma_export_url이 비어 있어 임시 프리뷰로 제출될 수 있어요"}
        >
          {submitting ? "제출 중…" : "최종 등록하기"}
        </button>
      </div>
    </div>
    </>
  );
}

/* ---------- styles ---------- */
const styles = {
  wrapper: { maxWidth: "800px", margin: "0 auto", padding: "40px 20px", textAlign: "center" },
  title: { fontSize: 28, fontWeight: 'bold', marginLeft: "20px", marginTop: "17px", textAlign: "left", color: "#1d1d1f", },
  subText: { fontSize: "16px", margin: "20px 0 30px" },
  mediaSection: { marginBottom: "30px" },
  buttonGroup: { display: "flex", justifyContent: "space-between", marginTop: "40px" },
  buttonWhite: {
    backgroundColor: "white",
    border: "1px solid #ccc",
    borderRadius: "999px",
    padding: "10px 24px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
  },
  buttonGreen: {
    backgroundColor: "#B6D19B",
    border: "1px solid #1d1d1f",
    borderRadius: "999px",
    padding: "10px 24px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
  },
};
