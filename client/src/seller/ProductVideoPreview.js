import React,{useEffect, useState, useMemo} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const num = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};

function ProductVideoPreview() {
  const {state} = useLocation() || {};
  const navigate = useNavigate();

  const productId =
    num(state?.productId) ?? num(localStorage.getItem("current_product_id"));

  const BASE = (process.env.REACT_APP_API_BASE_URL || "").replace(/\/$/, "");
  const token = localStorage.getItem("accessToken");

  const cached = productId ? localStorage.getItem(`last_ai_video_${productId}`) : "";
  const [videoUrl, setVideoUrl] = useState(cached || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fallbackUrl = useMemo(() => {
    if (process.env.REACT_APP_VIDEO_PLACEHOLDER)
      return process.env.REACT_APP_VIDEO_PLACEHOLDER;
    if (BASE) return `${BASE}/videos/test_720p.mp4`;
    return "/videos/test_720p.mp4";
  }, [BASE]);

  const generate = async () => {
    setError("");
    if (!productId) return setError("상품 ID가 없습니다.");
    if (!BASE) return setError("REACT_APP_API_BASE_URL이 설정되지 않았습니다.");

    setLoading(true);
    try {
      let url = await (async () => {
        const res = await fetch(`${BASE}/api/s-products/${productId}/video-gen`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ product_id: Number(productId) }),
        });

        if (res.status === 401) {
          setError("로그인이 필요합니다. 다시 로그인해주세요.");
          setTimeout(() => navigate("/login"), 500);
          return null;
        }
        if (res.status === 404 || res.status === 405) return null;
        if (!res.ok) {
          const t = await res.text().catch(() => "");
          throw new Error(t || `영상 생성 실패 (${res.status})`);
        }
        const json = await res.json().catch(() => ({}));
        return json?.data?.video_url || json?.video_url || null;
      })();

      if (!url) {
        const res = await fetch(`${BASE}/api/s-products/${productId}/video`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        if (res.ok) {
          const json = await res.json().catch(() => ({}));
          url = json?.data?.video_url || json?.video_url || null;
        }
      }

      if (!url) {
        setError("영상 API를 찾을 수 없어 임시 영상으로 대체합니다.");
        setVideoUrl(fallbackUrl);
        localStorage.setItem(`last_ai_video_${productId}`, fallbackUrl);
        return;
      }

      setVideoUrl(url);
      localStorage.setItem(`last_ai_video_${productId}`, url);
    } catch (e) {
      setError(e.message || "영상 생성 중 오류가 발생했습니다.");
      setVideoUrl(fallbackUrl);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productId && !videoUrl) generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const goFinal = (useVideo) => {
    navigate("/product/final", {
      state: {
        productId,
        withVideo: useVideo,
        videoUrl: useVideo ? (videoUrl || fallbackUrl) : "",
      },
    });
  };

  return (
    <div style={styles.wrapper}>
      <h2 style={styles.title}>상품 등록</h2>
      <p style={styles.subtitle}>상품 상세 정보와 이미지를 바탕으로 제작한 영상입니다.</p>

      {/* ▶ 영상 크기 축소 + 중앙 정렬 */}
      <div style={styles.videoOuter}>
        <div style={styles.videoBox}>
          {videoUrl ? (
            <video
              key={videoUrl}
              src={videoUrl}
              controls
              style={styles.videoEl}
              onError={() => {
                if (videoUrl !== fallbackUrl) {
                  setError("영상 재생 오류 — 임시 영상으로 대체합니다.");
                  setVideoUrl(fallbackUrl);
                }
              }}
            />
          ) : (
            <div style={styles.placeholder}>
              {loading ? "영상 생성 중…" : "영상이 아직 없습니다."}
            </div>
          )}
        </div>
      </div>

      <p style={styles.question}>사용하시겠습니까?</p>

      {/* ▶ 버튼 사이 간격 더 크게 */}
      <div style={styles.buttonGroup}>
        <button style={styles.button} onClick={() => goFinal(true)}>
          영상 사용할게요
        </button>
        <button style={styles.button} onClick={() => goFinal(false)}>
          영상은 빼주세요
        </button>
      </div>
    </div>
  );
}

const styles = {
  // ProductFormPage 기준 좌측 정렬 컨테이너
  wrapper: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '40px 20px',
    textAlign: 'left',
  },
  title: {
    fontSize: 28, fontWeight: 'bold',marginTop: 0, textAlign: "left", color: "#1d1d1f",
  },
  subtitle: {
    fontSize: '16px',
    marginBottom: '24px',
    textAlign: 'center',
  },

  // ▶ 영상 가로폭 축소 (중앙 정렬)
  videoOuter: {
    display: 'flex',
    justifyContent: 'center',
  },
  videoBox: {
    width: '100%',
    maxWidth: '640px',        // ✅ 가로폭 줄임 (원하면 560/600 등으로 조정)
    aspectRatio: '16 / 9',    // ✅ 16:9 유지
    backgroundColor: '#f5f5f5',
    border: '1px solid #ccc',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  videoEl: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },

  question: {
    fontSize: '18px',
    marginTop: '24px',
    marginBottom: '0px',
    textAlign: 'center',
  },

  // ▶ 버튼 간격 더 크게 + 중앙 정렬
  buttonGroup: {
    display: 'flex',
    justifyContent: 'center',
    gap: '360px',           // ✅ 240 → 360 으로 더 크게
    maxWidth: '100%',
    margin: '36px auto 0',  // 상단 여백도 살짝 증가
    flexWrap: 'wrap',
  },
  button: {
    backgroundColor: '#B6D19B',
    border: '1px solid #000',
    borderRadius: '8px',
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    minWidth: '180px',
  },
};

export default ProductVideoPreview;
