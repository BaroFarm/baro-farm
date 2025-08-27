// src/components/productDetail/ProductDetailInfo.jsx
import React, { useState, useRef, useEffect, useMemo } from "react";
import ProductReviewList from "./ProductReviewList";

const BASE = process.env.REACT_APP_API_BASE_URL || "";
const DEMO_MP4 = BASE ? `${BASE}/videos/test_720p.mp4` : "http://localhost:3002/videos/test.mp4";
const ENABLE_VIDEO_GEN = process.env.REACT_APP_ENABLE_VIDEO_GEN === "true";

/** 상대/프로토콜-상대 URL을 절대 URL로 보정 */
function toAbsolute(u = "") {
  if (!u) return "";
  if (/^https?:\/\//i.test(u)) return u;
  if (u.startsWith("//")) return `https:${u}`;
  try {
    return new URL(u, BASE).toString();
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
  if (url.endsWith(".m3u8")) return { type: "hls", src: raw }; // Safari만 기본 재생
  if (url.includes("youtube.com/") || url.includes("youtu.be/")) {
    const id = getYouTubeId(raw);
    return id ? { type: "youtube", src: `https://www.youtube.com/embed/${id}` } : { type: "iframe", src: raw };
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
  // ✅ productId 우선
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

  // ✅ /video-gen 호출 여부 (DB에 video_url 없고, 플래그 켜져 있고, is_video=true)
  const shouldCallVideoGen = ENABLE_VIDEO_GEN && !!productId && !product?.video_url && !!product?.is_video;

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

  // ===== 상세 페이지 소스 계산: HTML(사전검증) → PNG 폴백 =====
  const serverDetailHtml = useMemo(
    () => (productId ? `${BASE}/api/s-products/${productId}/figma-spec?format=html` : ""),
    [productId]
  );
  const serverDetailPng = useMemo(
    () => (productId ? `${BASE}/api/s-products/${productId}/figma-spec?format=png` : ""),
    [productId]
  );
  const rawDetailFromServer = product?.detail_page?.figma_export_url || "";

  // HTML 사전 체크 (HEAD로 200 OK 확인)
  const [htmlOk, setHtmlOk] = useState(false);
  useEffect(() => {
    let alive = true;
    setHtmlOk(false);
    if (!serverDetailHtml) return;
    (async () => {
      try {
        const r = await fetch(serverDetailHtml, { method: "HEAD" });
        if (!alive) return;
        setHtmlOk(r.ok);
      } catch {
        if (!alive) return;
        setHtmlOk(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [serverDetailHtml]);

  // 우선순위: 서버 HTML(검증됨) > DB URL(페이지성격) > 없음
  const iframeSrc = useMemo(() => {
    if (htmlOk && serverDetailHtml) return serverDetailHtml;
    if (rawDetailFromServer && !isImageUrl(rawDetailFromServer)) {
      return toEmbeddableDetailUrl(rawDetailFromServer);
    }
    return "";
  }, [htmlOk, serverDetailHtml, rawDetailFromServer]);

  // 이미지 폴백: DB 이미지 > 서버 PNG 캡처
  const imgSrc = useMemo(() => {
    if (rawDetailFromServer && isImageUrl(rawDetailFromServer)) return rawDetailFromServer;
    if (serverDetailPng) return serverDetailPng;
    return "";
  }, [rawDetailFromServer, serverDetailPng]);

  const [htmlFailed, setHtmlFailed] = useState(false);

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
              style={{ width: "100%", maxWidth: 720, borderRadius: 8, background: "#000" }}
              onError={(e) => {
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
        {/* 가운데 정렬 래퍼 */}
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      width: "100%",
    }}
  >
    <div style={{ width: "100%", maxWidth: 960 }}>
      {/* 우선 iframe(HTML) 시도 → 실패/미검증이면 이미지 */}
      {!htmlFailed && iframeSrc ? (
        <iframe
          src={iframeSrc}
          width="75%"
          height="800"
          style={{ border: "none", display: "block", margin: "0 auto" }}
          title="상세정보 보기"
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          allow="fullscreen; clipboard-write"
          onError={() => setHtmlFailed(true)} // 일부 브라우저에서만 동작
        />
      ) : imgSrc ? (
        <img
          src={imgSrc}
          alt="상세페이지"
          style={{ width: "100%", maxWidth: 960, display: "block", margin: "0 auto", borderRadius: 8 }}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = `${BASE}/images/mock/no-image-240.png`;
          }}
        />
      ) : (
        <div style={{ color: "#666", textAlign: "center" }}>상세 페이지가 아직 없습니다.</div>
      )}
    </div>
      </div>
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
