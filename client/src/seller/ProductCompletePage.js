// src/pages/ProductCompletePage.jsx
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const toNum = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};

function ProductCompletePage() {
  const { state } = useLocation() || {};
  const navigate = useNavigate();

  // 우선순위: location.state → (없으면) localStorage 백업
  const productId =
    state?.productId ??
    toNum(localStorage.getItem('current_product_id')) ??
    null;

  const goHome = () => navigate('/');

  const goDetail = () => {
    if (!productId) {
      alert('상품 ID가 없어 상세페이지로 이동할 수 없어요.');
      return;
    }
    // :productId 자리에 실제 ID 주입
    navigate(`/shop/product/${productId}`);
  };

  return (
    <>
    <h2 style={styles.title}>상품 등록</h2>
    <div style={styles.wrapper}>
      
      <p style={styles.message}>
        <span style={styles.emoji}>✅</span> 상품 등록이 완료되었습니다.
      </p>

      <div style={styles.buttonGroup}>
        <button style={styles.button} onClick={goHome}>
          메인 화면으로 돌아가기
        </button>
        <button
          style={styles.button}
          onClick={goDetail}
          disabled={!productId}
          title={productId ? '' : '상품 ID가 없어 비활성화되었습니다.'}
        >
          상세페이지로 확인하기
        </button>
      </div>
    </div>
    </>
  );
}

const styles = {
  wrapper: { maxWidth: '700px', margin: '0 auto', padding: '60px 20px', textAlign: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', marginLeft: "20px", marginTop: "17px", textAlign: "left", color: "#1d1d1f",},
  message: { fontSize: '20px', marginBottom: '40px' },
  emoji: { fontSize: '22px', marginRight: '8px' },
  buttonGroup: { display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' },
  button: {
    backgroundColor: '#B6D19B',
    border: '1px solid black',
    borderRadius: '999px',
    padding: '10px 24px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    width: '220px',
  },
};

export default ProductCompletePage;
