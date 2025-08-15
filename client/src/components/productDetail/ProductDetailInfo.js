// src/components/productDetail/ProductDetailInfo.jsx
import React, { useState, useRef, useEffect, useMemo } from "react";
import ProductReviewList from "./ProductReviewList";

const BASE = process.env.REACT_APP_API_BASE_URL || "";

/** 상대/프로토콜-상대 URL도 절대 URL로 보정 */
function toAbsolute(u = "") {
  if (!u) return "";
  if (/^https?:\/\//i.test(u)) return u;         // 절대 URL
  if (u.startsWith("//")) return `https:${u}`;    // 프로토콜-상대
  try {
    return new URL(u, BASE).toString();           // 상대경로를 BASE 기준으로
  } catch {
    return u;
  }
}

/** 유튜브 id 추출 (watch?v= / youtu.be / shorts) */
function getYouTubeId(url = "") {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return u.pathname.split("/").pop() || "";
    if (u.searchParams.get("v")) return u.searchParams.get("v") || "";
    if (u.pathname.includes("/shorts/"))
      return u.pathname.split("/shorts/")[1].split(/[/?#]/)[0];
  } catch {}
  if (/^[\w-]{11}$/.test(url)) return url;
  return "";
}

/** 비디오 임베드 타입 판별 */
function getEmbedKind(raw = "") {
  const url = raw.toLowerCase();
  if (!url) return { type: "none", src: "" };

  if (url.includes("youtube.com/") || url.includes("youtu.be/")) {
    const id = getYouTubeId(raw);
    return id
      ? { type: "youtube", src: `https://www.youtube.com/embed/${id}` }
      : { type: "iframe", src: raw };
  }
  if (url.includes("vimeo.com/")) {
    const id = raw.split("/").pop();
    return { type: "vimeo", src: `https://player.vimeo.com/video/${id}` };
  }
  if (url.endsWith(".mp4")) return { type: "mp4", src: raw };
  return { type: "iframe", src: raw };
}

/** 상세 페이지(예: Figma/정적페이지) 임베드 URL 변환 */
function toEmbeddableDetailUrl(u = "") {
  if (!u) return "";
  const abs = toAbsolute(u);
  if (/figma\.com/i.test(abs) && !/\/embed/i.test(abs)) {
    return `https://www.figma.com/embed?embed_host=baro&url=${encodeURIComponent(abs)}`;
  }
  return abs;
}

function isImageUrl(url = "") {
  return /\.(png|jpe?g|webp|gif|avif)(\?.*)?$/i.test(url);
}

export default function ProductDetailInfo({ product }) {
  // 펼쳐보기 토글
  const [isShowMore, setIsShowMore] = useState(false);
  const detailRef = useRef(null);
  const [detailHeight, setDetailHeight] = useState("500px");

  useEffect(() => {
    if (isShowMore && detailRef.current) setDetailHeight(`${detailRef.current.scrollHeight}px`);
    else setDetailHeight("500px");
  }, [isShowMore]); // ✅ 의존성 길이 고정

  // 저장된 영상만 사용 (API 호출 없음)
  const rawVideo = product?.video_url || "";
  const videoUrl = useMemo(() => toAbsolute(rawVideo), [rawVideo]);
  const videoEmbed = useMemo(() => getEmbedKind(videoUrl), [videoUrl]);

  // 상세 페이지 이미지/임베드 소스 계산 (⚠️ 반드시 컴포넌트 안에서!)
  const productId = product?.id ?? product?.product_id;
  const fallbackDetailImg = useMemo(
    () => (productId ? `${BASE}/api/s-products/${productId}/figma-spec?format=png` : ""),
    [productId]
  );

  const rawDetailFromServer = product?.detail_page?.figma_export_url || "";
  const detailCandidate = useMemo(() => {
    // 서버가 준 게 있으면 임베드 변환(피그마 등), 없으면 PNG 엔드포인트
    const src = rawDetailFromServer ? toEmbeddableDetailUrl(rawDetailFromServer) : fallbackDetailImg;
    return src;
  }, [rawDetailFromServer, fallbackDetailImg]);

  const renderAsImage = useMemo(
    () => !!detailCandidate && (isImageUrl(detailCandidate) || detailCandidate.includes("format=png")),
    [detailCandidate]
  );

  return (
    <>
      {/* 상단 타이틀 */}
      <section style={{ display: "flex", gap: 12, alignItems: "center", padding: "24px" }}>
        <h3 style={{ margin: 0, fontSize: 18 }}>상품 설명</h3>
      </section>

      {/* 영상 영역: 저장된 URL만 표시 */}
      <section style={{ padding: "0 24px", marginBottom: 12 }}>
        {videoUrl ? (
          videoEmbed.type === "mp4" ? (
            <video
              src={videoEmbed.src}
              controls
              style={{ width: "100%", maxWidth: 960, borderRadius: 8, background: "#000" }}
            />
          ) : (
            <iframe
              src={videoEmbed.src}
              width="100%"
              height="400"
              style={{ border: "none", maxWidth: 960, borderRadius: 8 }}
              title="제품 영상"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          )
        ) : (
          <div style={{ color: "#666", fontSize: 14 }}>등록된 영상이 없습니다.</div>
        )}
      </section>

      {/* 상세 정보(Figma/정적 HTML 등) */}
      <div
        ref={detailRef}
        style={{
          marginTop: 0,
          padding: "0 24px",
          maxHeight: detailHeight,
          overflow: "hidden",
          transition: "max-height 0.4s ease",
        }}
      >
        {detailCandidate ? (
          renderAsImage ? (
            <img
              src={detailCandidate}
              alt="상세페이지"
              style={{ width: "100%", borderRadius: 8 }}
              onError={(e) => {
                e.currentTarget.src = `${BASE}/images/mock/no-image-240.png`;
              }}
            />
          ) : (
            <iframe
              src={detailCandidate}
              width="100%"
              height="800"
              style={{ border: "none" }}
              title="상세정보 보기"
            />
          )
        ) : (
          <div style={{ color: "#666" }}>상세 페이지가 아직 없습니다.</div>
        )}
      </div>

      {/* 펼치기 버튼 */}
      <div
        style={{
          position: "relative",
          left: "50%",
          width: 800,
          transform: "translateX(-50%)",
          background: "#fff",
          border: "1px solid #ccc",
          padding: "12px 24px",
          borderRadius: 8,
          boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
          cursor: "pointer",
          marginTop: 12,
        }}
        onClick={() => setIsShowMore((prev) => !prev)}
      >
        <span style={{ fontWeight: "bold" }}>
          상세 정보 {isShowMore ? "접기 ▲" : "펼쳐보기 ▼"}
        </span>
      </div>

      {/* 후기 리스트 */}
      <ProductReviewList productId={productId} />
    </>
  );
}
