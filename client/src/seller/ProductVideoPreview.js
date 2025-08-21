import React,{useEffect, useState, useMemo} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const num = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};

function ProductVideoPreview() {
  const {state} =useLocation() || {};
  const navigate = useNavigate();

  // productId: state → localStorage
  const productId =
    num(state?.productId) ?? num(localStorage.getItem("current_product_id"));

  const BASE = (process.env.REACT_APP_API_BASE_URL || "").replace(/\/$/, "");
  const token = localStorage.getItem("accessToken");

  // 캐시된 영상 URL 먼저 사용
  const cached = productId ? localStorage.getItem(`last_ai_video_${productId}`) : "";
  const [videoUrl, setVideoUrl] = useState(cached || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ▶ 폴백 URL 계산: .env 지정 > 백엔드 정적 경로 > (없으면) 프론트 퍼블릭
  const fallbackUrl = useMemo(() => {
    if (process.env.REACT_APP_VIDEO_PLACEHOLDER)
      return process.env.REACT_APP_VIDEO_PLACEHOLDER; // 예: https://…/sample.mp4
    if (BASE) return `${BASE}/videos/test_720p.mp4`; // server/public/videos/test_720p.mp4
    return "/videos/test_720p.mp4"; // CRA public 폴더에 둘 경우
  }, [BASE]);

  // ▶ 영상 생성 호출
  const generate = async () => {
    setError("");
    if (!productId) return setError("상품 ID가 없습니다.");
    if (!BASE) return setError("REACT_APP_API_BASE_URL이 설정되지 않았습니다.");

    setLoading(true);
    try {
    // 1) 먼저 POST /video-gen (임시 구현 약속)
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

      // 라우트가 없거나 메서드가 다르면 404/405로 떨어질 수 있음 → 다음 전략으로
      if (res.status === 404 || res.status === 405) return null;

      if (!res.ok) {
        // 다른 오류는 에러 처리
        const t = await res.text().catch(() => "");
        throw new Error(t || `영상 생성 실패 (${res.status})`);
      }

      const json = await res.json().catch(() => ({}));
      return json?.data?.video_url || json?.video_url || null;
    })();

    // 2) 대체 경로 시도: GET /video (서버가 조회용으로 이렇게 만들어둔 경우 대비)
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

    // 3) 최종 결정: 성공했으면 그 URL, 아니면 폴백
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
    // 에러 시에도 폴백 적용
    setVideoUrl(fallbackUrl);
  } finally {
    setLoading(false);
  }
};

  // 최초 진입 시 자동 생성(캐시 없을 때만)
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

      {/* ▶️ 여기에 나중에 AI 영상이 들어갈 예정 */}
      <div style={styles.videoBox}>
        {videoUrl ? (
          <video
            key={videoUrl}
            src={videoUrl}
            controls
            style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 8 }}
            onError={() => {
              // 재생 오류도 폴백으로 자동 대체
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
      {/* {error && (
        <p style={{ color: "#c00", marginTop: 8, whiteSpace: "pre-wrap" }}>{error}</p>
      )} */}

      <p style={styles.question}>사용하시겠습니까?</p>

      <div style={styles.buttonGroup}>
        <button
          style={styles.button}
          onClick={() => navigate('/product/final', { state: { withVideo: true } })}
        >
          영상 사용할게요
        </button>
        <button
          style={styles.button}
          onClick={() => navigate('/product/final', { state: { withVideo: false } })}
        >
          영상은 빼주세요
        </button>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '40px 20px',
    textAlign: 'center',
  },
  title: {
    fontSize: '22px',
    fontWeight: 'bold',
    textAlign: 'left',
    marginBottom: '24px',
  },
  subtitle: {
    fontSize: '16px',
    marginBottom: '24px',
  },
  videoBox: {
    width: '100%',
    height: '250px',
    backgroundColor: '#f5f5f5',
    border: '1px solid #ccc',
    marginBottom: '32px',
  },
  question: {
    fontSize: '18px',
    marginBottom: '32px',
  },
  buttonGroup: {
    display: 'flex',
    justifyContent: 'space-between',
    maxWidth: '500px',
    margin: '0 auto',
    gap: '80px',
  },
  button: {
    backgroundColor: '#B6D19B',
    border: '1px solid #000',
    borderRadius: '999px',
    padding: '10px 24px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    flex: 1,
  },
};

export default ProductVideoPreview;
//