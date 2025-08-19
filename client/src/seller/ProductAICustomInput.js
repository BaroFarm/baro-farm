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

  // 이전 단계에서 넘겨준 값들
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

  const goPrev = () => {
    // 직전 페이지로 돌아가기(라우트가 고정돼 있다면 원하는 경로로 바꿔도 됨)
    navigate(-1);
  };

  const goNext = async () => {
    setError('');
    if (!productId) return setError('상품 ID가 없습니다.');
    if (!BASE) return setError('REACT_APP_API_BASE_URL이 설정되지 않았습니다.');

    try {
      setSaving(true);

      // 명세: POST /api/s-products/{product_id}/description/manual (application/json)
      const res = await fetch(
        `${BASE}/api/s-products/${productId}/description/manual`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          // product_id는 URL 파라미터로 들어가지만, 서버가 바디를 참고할 수도 있으니 같이 전달
          body: JSON.stringify({
            product_id: Number(productId),
            description: customDescription || '', // 서버가 필요 없다면 무시
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

      // 로컬 캐시(다음 단계·복귀 대비)
      if (productId) {
        localStorage.setItem(`last_ai_desc_${productId}`, customDescription || '');
        localStorage.removeItem(`last_ai_summary_${productId}`); // 요약은 다음 단계에서 새로 생성/조회
      }

      // 다음 단계로 이동
      navigate('/product/summary-preview', {
        state: {
          productId,
          // summary 화면은 summary가 없으면 서버에서 생성/조회하므로
          // description만 넘겨도 무방하나, 즉시 표시하려면 summary로도 같이 전달 가능
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
    <div style={styles.wrapper}>
      <h2 style={styles.title}>상품 등록</h2>
      <p style={styles.subText}>상세 설명을 직접 작성해주세요.</p>

      <textarea
        style={styles.textarea}
        value={customDescription}
        onChange={(e) => setCustomDescription(e.target.value)}
        placeholder="여기에 상세 설명을 작성하세요."
      />

      {error && (
        <p style={{ color: '#c00', marginTop: 8, whiteSpace: 'pre-wrap' }}>{error}</p>
      )}

      <div style={styles.buttonGroup}>
        <button style={styles.button} onClick={goPrev} disabled={saving}>
          &lt; 이전 단계로 이동
        </button>
        <button style={styles.button} onClick={goNext} disabled={saving}>
          {saving ? '저장 중…' : '다음 단계로 이동 >'}
        </button>
      </div>
    </div>
  );
}

const styles = {
  wrapper: { maxWidth: '800px', margin: '0 auto', padding: '40px 20px', textAlign: 'center' },
  title: { fontSize: '22px', fontWeight: 'bold', textAlign: 'left' },
  subText: { marginTop: '24px', fontSize: '16px' },
  textarea: {
    marginTop: '20px',
    width: '100%',
    minHeight: '200px',
    padding: '16px',
    fontSize: '15px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    resize: 'vertical',
    boxSizing: 'border-box',
  },
  buttonGroup: { display: 'flex', justifyContent: 'space-between', marginTop: '40px' },
  button: {
    backgroundColor: '#B6D19B',
    border: '1px solid black',
    borderRadius: '999px',
    padding: '10px 24px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
  },
};

export default ProductAICustomInput;
