// src/components/productDetail/ProductDetailInfo.jsx
import React, { useState, useRef, useEffect, useMemo } from "react";
import ProductReviewList from "./ProductReviewList";

const BASE = process.env.REACT_APP_API_BASE_URL || "";
const DEMO_MP4 = BASE ? `${BASE}/videos/test_720p.mp4`
                      : "http://localhost:3002/videos/test.mp4"; // 서버에 둔 mp4 경로
const ENABLE_VIDEO_GEN = process.env.REACT_APP_ENABLE_VIDEO_GEN === "true";

/** 상대/프로토콜-상대 URL도 절대 URL로 보정 */
function toAbsolute(u = "") {
  if (!u) return "";
  if (/^https?:\/\//i.test(u)) return u; // 절대 URL
  if (u.startsWith("//")) return `https:${u}`; // 프로토콜-상대
  try {
    return new URL(u, BASE).toString(); // 상대경로를 BASE 기준으로
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

  if (url.endsWith(".mp4")) return { type: "mp4", src: raw };
  if (url.endsWith(".m3u8")) return { type: "hls", src: raw };
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
  // ✅ productId를 먼저 계산
  const productId = product?.id ?? product?.product_id;

  // video-gen 결과/에러 상태
  const [genVideoUrl, setGenVideoUrl] = useState("");
  const [videoFetchErr, setVideoFetchErr] = useState("");

  // 펼쳐보기 토글
  const [isShowMore, setIsShowMore] = useState(false);
  const detailRef = useRef(null);
  const [detailHeight, setDetailHeight] = useState("500px");

  useEffect(() => {
    if (isShowMore && detailRef.current) setDetailHeight(`${detailRef.current.scrollHeight}px`);
    else setDetailHeight("500px");
  }, [isShowMore]);

  // ✅ 이제 안전하게 계산 (productId 사용 가능)
  const shouldCallVideoGen =
    ENABLE_VIDEO_GEN && !!productId && !product?.video_url && !!product?.is_video;

  // ✅ product.video_url이 없고, video-gen 활성화된 경우만 호출
  useEffect(() => {
    if (!shouldCallVideoGen) return;

    const ac = new AbortController();
    (async () => {
      try {
        const resp = await fetch(`${BASE}/api/s-products/${productId}/video-gen`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: ac.signal,
        });
        if (!resp.ok) {
          const text = await resp.text().catch(() => "");
          throw new Error(`video-gen 실패 (${resp.status}) ${text}`);
        }
        const json = await resp.json();
        const url = json?.data?.video_url || "";
        if (url) setGenVideoUrl(url);
        else setVideoFetchErr("임시 영상 링크가 없습니다.");
      } catch (err) {
        if (err.name !== "AbortError") setVideoFetchErr(String(err));
      }
    })();

    return () => ac.abort();
  }, [shouldCallVideoGen, productId]);

  // 🔗 최종 영상 URL: DB 값 > /video-gen 결과 > DEMO
  const finalVideoUrlRaw = product?.video_url || genVideoUrl || DEMO_MP4;
  const videoUrl = useMemo(() => toAbsolute(finalVideoUrlRaw), [finalVideoUrlRaw]);
  const videoEmbed = useMemo(() => getEmbedKind(videoUrl), [videoUrl]);

  // 상세 페이지 이미지/임베드 소스 계산
  const fallbackDetailImg = useMemo(
    () => (productId ? `${BASE}/api/s-products/${productId}/figma-spec?format=png` : ""),
    [productId]
  );
  const rawDetailFromServer = product?.detail_page?.figma_export_url || "";
  const detailCandidate = useMemo(() => {
    return rawDetailFromServer ? toEmbeddableDetailUrl(rawDetailFromServer) : fallbackDetailImg;
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

      {/* 영상 영역 */}
      <section style={{ padding: "0 24px", marginBottom: 12 }}>
        {videoUrl ? (
          videoEmbed.type === "mp4" ? (
            <video
              src={videoEmbed.src}
              controls
              playsInline
              preload="metadata"
              style={{ width: "100%", maxWidth: 1500, borderRadius: 8, background: "#000" }}
              onError={(e) => {
                // 마지막 폴백
                if (DEMO_MP4 && e.currentTarget.src !== DEMO_MP4) {
                  e.currentTarget.src = DEMO_MP4;
                }
              }}
            />
          ) : (
            <iframe
              src={videoEmbed.src}
              width="100%"
              height="400"
              style={{ border: "none", maxWidth: 960, borderRadius: 8 }}
              title="제품 영상"
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          )
        ) : (
          <div style={{ color: "#666", fontSize: 14 }}>등록된 영상이 없습니다.</div>
        )}

        {videoFetchErr && (
          <div style={{ color: "#b00020", fontSize: 13, marginTop: 8 }}>{videoFetchErr}</div>
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
              loading="lazy"
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
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              allow="fullscreen; clipboard-write"
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

      <ProductReviewList productId={productId} />
    </>
  );
}
