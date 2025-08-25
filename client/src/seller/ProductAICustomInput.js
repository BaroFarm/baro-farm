// src/pages/ProductAICustomInput.jsx
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const toNum = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};

function ProductAICustomInput() {
  const { state } = useLocation() || {};
  const navigate = useNavigate();

  const productId =
    toNum(state?.productId) ?? toNum(localStorage.getItem('current_product_id'));
  const baseText =
    state?.base ??
    (productId ? localStorage.getItem(`last_ai_desc_${productId}`) : '') ??
    '';

  const [customDescription, setCustomDescription] = useState(baseText);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const BASE = (process.env.REACT_APP_API_BASE_URL || '').replace(/\/$/, '');
  const token = localStorage.getItem('accessToken');

  const goPrev = () => navigate(-1);

  const goNext = async () => {
    setError('');
    if (!productId) return setError('상품 ID가 없습니다.');
    if (!BASE) return setError('REACT_APP_API_BASE_URL이 설정되지 않았습니다.');

    try {
      setSaving(true);

      const res = await fetch(
        `${BASE}/api/s-products/${productId}/description/manual`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            product_id: Number(productId),
            description: customDescription || '',
          }),
        }
      );

      if (res.status === 401) {
        alert('로그인이 필요합니다. 다시 로그인해주세요.');
        return navigate('/login');
      }
      if (!res.ok) {
        const t = await res.text().catch(() => '');
        throw new Error(t || `설명 저장 실패 (${res.status})`);
      }

      if (productId) {
        localStorage.setItem(`last_ai_desc_${productId}`, customDescription || '');
        localStorage.removeItem(`last_ai_summary_${productId}`);
      }

      navigate('/product/summary-preview', {
        state: {
          productId,
          description: customDescription,
          summary: customDescription,
        },
      });
    } catch (e) {
      setError(e.message || '설명 저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* 좌측 상단 타이틀 */}
      <div style={styles.titleRow}>
        <h1 style={styles.title}>상품 등록</h1>
      </div>

      {/* 안내 문구 (중앙 정렬 유지) */}
      <p style={styles.subTitle}>상세 설명을 직접 작성해주세요.</p>

      {/* 설명 박스 느낌으로 텍스트 영역 감싸기 */}
      <div style={styles.box}>
        <textarea
          style={styles.textarea}
          value={customDescription}
          onChange={(e) => setCustomDescription(e.target.value)}
          placeholder="여기에 상세 설명을 작성하세요."
        />
      </div>

      {error && (
        <p style={{ color: '#c00', marginTop: 8, whiteSpace: 'pre-wrap' }}>{error}</p>
      )}

      {/* 버튼 위치 및 모양 (DescriptionResult와 동일) */}
      <div style={styles.actions}>
        <button style={styles.btn} onClick={goPrev} disabled={saving}>
          &lt; 이전 단계로 이동
        </button>
        <button style={styles.btn} onClick={goNext} disabled={saving}>
          {saving ? '저장 중…' : '다음 단계로 이동 >'}
        </button>
      </div>
    </div>
  );
}

const styles = {
  // ✅ 좌측 정렬 강제: 가운데 컨테이너를 없애고 페이지 전체 좌정렬
  page: { padding: '24px', width: '100%', textAlign: 'left' },

  // ✅ 제목 줄도 왼쪽 정렬 고정
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
    justifyContent: 'flex-start',
  },
  title: { margin: 0, fontSize: '28px', fontWeight: 700, lineHeight: 1, textAlign: 'left' },

  // 본문 안내는 중앙 정렬 유지 (디자인 동일)
  subTitle: { textAlign: 'center', fontSize: '20px', fontWeight: 600, margin: '20px 0 24px' },

  // DescriptionResult의 박스와 동일한 톤
  box: {
    maxWidth: 720,
    margin: '0 auto',
    background: '#F9F9F9',
    border: '1px solid #E3E3E3',
    borderRadius: 10,
    padding: 24,
    minHeight: 260,
  },
  textarea: {
    width: '100%',
    minHeight: '200px',
    padding: '12px',
    fontSize: 16,
    border: 'none',
    outline: 'none',
    resize: 'vertical',
    background: 'transparent',
  },

  // 버튼 영역도 동일한 배치/간격
  actions: {
    maxWidth: 720,
    margin: '48px auto 0',
    display: 'flex',
    justifyContent: 'space-between',
    gap: 12,
  },
  btn: {
    backgroundColor: '#B6D19B',
    border: '1px solid #333',
    borderRadius: 15,      // DescriptionResult와 동일
    padding: '8px 26px',
    fontSize: 18,
    color: '#1d1d1f',
    cursor: 'pointer',
    fontWeight: 500,
  },
};

export default ProductAICustomInput;
