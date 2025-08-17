// src/pages/ProductSummaryPreview.jsx
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function ProductSummaryPreview() {
  const { state } = useLocation() || {};
  const navigate = useNavigate();

  // productId 이어받기 (없으면 캐시에서 복구)
  const productId =
    state?.productId ||
    Number(localStorage.getItem('current_product_id') || 0) ||
    null;

  // ✅ summary 우선, 없으면 description → 캐시 → ''
  const summary =
    state?.summary ||
    state?.description ||
    (productId ? localStorage.getItem(`last_ai_desc_${productId}`) : '') ||
    '';

  const goPrev = () => {
    // 직접 작성 페이지로 이동하면서 현재 summary를 기본값으로 전달(선택)
    navigate('/product/ai-custom-input', {
      state: { productId, base: summary },
    });
  };

  const goNext = () => {
    // 다음 단계에도 데이터를 이어서 전달
    navigate('/product/video-preview', {
      state: { productId, summary },
    });
  };

  return (
    <div style={styles.wrapper}>
      <h2 style={styles.title}>상품 등록</h2>
      <p style={styles.subText}>상품에 대한 간단한 소개글입니다.</p>

      <div style={styles.labelRow}>
        <span>AI 요약</span>
        <button style={styles.editButton} onClick={goPrev}>
          요약 수정하기
        </button>
      </div>

      <div style={styles.summaryBox}>
        {summary || '요약 내용이 없습니다. 이전 단계에서 설명을 생성/선택해 주세요.'}
      </div>

      <div style={styles.buttonGroup}>
        <button style={styles.buttonWhite} onClick={goPrev}>
          &lt; 이전 단계로 이동
        </button>
        <button
          style={styles.buttonGreen}
          onClick={goNext}
          disabled={!summary}
        >
          다음 단계로 이동 &gt;
        </button>
      </div>
    </div>
  );
}

const styles = {
  wrapper: { maxWidth: '800px', margin: '0 auto', padding: '40px 20px', textAlign: 'center' },
  title: { fontSize: '22px', fontWeight: 'bold', textAlign: 'left' },
  subText: { fontSize: '18px', margin: '40px 0 24px' },
  labelRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', fontSize: '15px' },
  editButton: { padding: '6px 12px', border: '1px solid #ccc', borderRadius: '999px', backgroundColor: 'white', cursor: 'pointer', fontSize: '13px' },
  summaryBox: { border: '1px solid #888', padding: '24px', minHeight: '80px', textAlign: 'left', fontSize: '16px', backgroundColor: '#fff' },
  buttonGroup: { display: 'flex', justifyContent: 'space-between', marginTop: '60px' },
  buttonWhite: { backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '999px', padding: '10px 24px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' },
  buttonGreen: { backgroundColor: '#B6D19B', border: '1px solid black', borderRadius: '999px', padding: '10px 24px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' },
};

export default ProductSummaryPreview;
