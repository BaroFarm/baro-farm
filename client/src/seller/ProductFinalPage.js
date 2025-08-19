// src/pages/ProductFinalPage.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const toNum = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};

function ProductFinalPage() {
  const { state } = useLocation() || {};
  const navigate = useNavigate();

  const withVideo = !!state?.withVideo;
  const stateVideoUrl = state?.videoUrl;

  const productId =
    toNum(state?.productId) ?? toNum(localStorage.getItem('current_product_id'));

  const BASE = (process.env.REACT_APP_API_BASE_URL || '').replace(/\/$/, '');
  const token = localStorage.getItem('accessToken');

  // ---- 영상 URL (임시 폴백 포함)
  const cachedVideo = productId
    ? localStorage.getItem(`last_ai_video_${productId}`)
    : '';
  const fallbackVideo = useMemo(() => {
    if (process.env.REACT_APP_VIDEO_PLACEHOLDER)
      return process.env.REACT_APP_VIDEO_PLACEHOLDER;
    if (BASE) return `${BASE}/videos/test_720p.mp4`;
    return '/videos/test_720p.mp4';
  }, [BASE]);

  const videoUrl = stateVideoUrl || cachedVideo || fallbackVideo;

  // ---- 상세 프리뷰: HTML 우선, PNG 폴백
  const htmlUrl =
    productId && BASE
      ? `${BASE}/api/s-products/${productId}/figma-spec?format=html`
      : '';
  const pngUrl =
    productId && BASE
      ? `${BASE}/api/s-products/${productId}/preview?format=png`
      : '';

  const [htmlOk, setHtmlOk] = useState(false);
  const [checkingHtml, setCheckingHtml] = useState(false);
  const [previewErr, setPreviewErr] = useState('');

  useEffect(() => {
    if (!htmlUrl) return;
    let alive = true;

    (async () => {
      try {
        setCheckingHtml(true);
        setPreviewErr('');
        const res = await fetch(htmlUrl, {
          method: 'GET',
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          cache: 'no-store',
        });
        if (!alive) return;
        setHtmlOk(res.ok && res.headers.get('content-type')?.includes('text/html'));
        if (!res.ok) setPreviewErr(`HTML 프리뷰 응답 ${res.status}`);
      } catch (e) {
        if (!alive) return;
        setHtmlOk(false);
        setPreviewErr(e.message || 'HTML 프리뷰 확인 실패');
      } finally {
        if (alive) setCheckingHtml(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [htmlUrl, token]);

  // ===== 최종 제출 =====
  const [submitting, setSubmitting] = useState(false);
  const [submitErr, setSubmitErr] = useState('');

  // figma_export_url 후보:
  // 1) 이전 단계/어딘가에서 저장해둔 값 (localStorage) 2) 백엔드 PNG 프리뷰 URL(임시 대체) 3) state로 넘겨온 값
  const cachedFigma = productId
    ? localStorage.getItem(`figma_export_url_${productId}`)
    : '';
  const figmaExportUrl =
    state?.figmaExportUrl || cachedFigma || (pngUrl || '');

  const goPrev = () =>
    navigate('/product/summary-preview', { state: { productId } });

  const goComplete = async () => {
    if (!productId) {
      alert('상품 ID가 없습니다.');
      return;
    }
    if (!BASE) {
      alert('REACT_APP_API_BASE_URL이 설정되지 않았습니다.');
      return;
    }
    if (!figmaExportUrl) {
      // 명세상 필수값이라 가급적 막아줌
      const proceed = window.confirm(
        'figma_export_url이 비어 있습니다. 임시 프리뷰로 대체하여 제출할까요?'
      );
      if (!proceed) return;
    }

    try {
      setSubmitting(true);
      setSubmitErr('');

      const res = await fetch(`${BASE}/api/s-products/${productId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          product_id: Number(productId),
          figma_export_url: figmaExportUrl,
        }),
      });

      if (res.status === 401) {
        alert('로그인이 필요합니다. 다시 로그인해주세요.');
        navigate('/login');
        return;
      }
      if (!res.ok) {
        const t = await res.text().catch(() => '');
        throw new Error(t || `최종 제출 실패 (${res.status})`);
      }

      const json = await res.json().catch(() => ({}));
      // 명세 예: { status: "success", data: { product_id, figma_export_url, public_id } }
      const savedUrl = json?.data?.figma_export_url || figmaExportUrl;
      if (productId && savedUrl) {
        localStorage.setItem(`figma_export_url_${productId}`, savedUrl);
      }

      navigate('/product/complete', {
        state: {
          productId,
          submitted: true,
          figma_export_url: savedUrl,
          public_id: json?.data?.public_id,
        },
      });
    } catch (e) {
      setSubmitErr(e.message || '최종 제출 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <h2 style={styles.title}>상품 등록</h2>
      <p style={styles.subText}>마지막으로 상품 페이지를 점검해주세요.</p>

      {withVideo && (
        <div style={styles.mediaSection}>
          <video
            key={videoUrl}
            src={videoUrl}
            controls
            style={{ width: '100%', height: 'auto', borderRadius: 8 }}
            onError={(e) => {
              if (videoUrl !== fallbackVideo) {
                e.currentTarget.src = fallbackVideo;
              }
            }}
          />
        </div>
      )}

      <div style={{ marginBottom: 20 }}>
        {checkingHtml ? (
          <p>미리보기 확인 중…</p>
        ) : htmlOk ? (
          <iframe
            src={htmlUrl}
            title="상품 상세 프리뷰"
            width="100%"
            height="900"
            style={{ border: 'none', borderRadius: 8 }}
          />
        ) : pngUrl ? (
          <>
            <img
              src={pngUrl}
              alt="상품 페이지 프리뷰"
              style={{ width: '100%', borderRadius: 8, border: '1px solid #eee' }}
            />
            {previewErr && (
              <p style={{ color: '#c00', marginTop: 8 }}>{previewErr}</p>
            )}
            {htmlUrl && (
              <p style={{ marginTop: 8 }}>
                HTML 임베드가 차단되었거나 제공되지 않습니다.{' '}
                <a href={htmlUrl} target="_blank" rel="noreferrer">
                  새 창에서 프리뷰 열기
                </a>
              </p>
            )}
          </>
        ) : (
          <p>프리뷰를 표시할 수 없습니다.</p>
        )}
      </div>

      {/* 제출 상태/오류 표시 */}
      {submitErr && (
        <p style={{ color: '#c00', marginTop: 8, whiteSpace: 'pre-wrap' }}>
          {submitErr}
        </p>
      )}

      <div style={styles.buttonGroup}>
        <button style={styles.buttonWhite} onClick={goPrev} disabled={submitting}>
          &lt; 이전 단계로 이동
        </button>
        <button
          style={styles.buttonGreen}
          onClick={goComplete}
          disabled={submitting}
          title={figmaExportUrl ? '' : 'figma_export_url이 비어 있어 임시 프리뷰로 제출될 수 있어요'}
        >
          {submitting ? '제출 중…' : '최종 등록하기'}
        </button>
      </div>
    </div>
  );
}

const styles = {
  wrapper: { maxWidth: '800px', margin: '0 auto', padding: '40px 20px', textAlign: 'center' },
  title: { fontSize: '22px', fontWeight: 'bold', textAlign: 'left' },
  subText: { fontSize: '16px', margin: '20px 0 30px' },
  mediaSection: { marginBottom: '30px' },
  buttonGroup: { display: 'flex', justifyContent: 'space-between', marginTop: '40px' },
  buttonWhite: {
    backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '999px',
    padding: '10px 24px', fontSize: '14px', fontWeight: '500', cursor: 'pointer',
  },
  buttonGreen: {
    backgroundColor: '#B6D19B', border: '1px solid #1d1d1f', borderRadius: '999px',
    padding: '10px 24px', fontSize: '14px', fontWeight: '500', cursor: 'pointer',
  },
};

export default ProductFinalPage;
