import React from 'react';
import { useNavigate } from 'react-router-dom';

function ProductRegisterPage() {
  const navigate = useNavigate();

  return (
    <div style={styles.pageWrapper}>
      {/* 제목 */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={styles.title}>상품 등록</h2>
      </div>

      {/* 안내 문구 + 버튼 (세로/가로 정중앙 배치) */}
      <div style={styles.centerContent}>
        <p style={styles.description}>바로팜에 상품을 등록하시겠습니까?</p>
        <button style={styles.button} onClick={() => navigate('/product/form')}>
          시작하기
        </button>
      </div>
    </div>
  );
}

const styles = {
  pageWrapper: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '40px 20px',
  },
  title: {
    fontSize: '28px',
    fontWeight: '800',
    margin: 0,
    textAlign: 'left',
    color: '#1d1d1f',
  },
  centerContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',   // ✅ 세로 가운데 정렬
    minHeight: '60vh',          // ✅ 화면 중간쯤으로 내리기
    gap: '14px',
  },
  description: {
    fontSize: '22px',   // ✅ 크게
    margin: '20px 0 8px 0',
    color: '#333',
  },
  button: {
    backgroundColor: '#B6D19B',
    padding: '8px 50px',   // ✅ 위아래 얇게, 가로 넓게
    border: '1px solid black',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '15px',      // ✅ 약간 크게
    fontWeight: '400',     // ✅ Bold 제거
    color: '#1d1d1f',
  },
};

export default ProductRegisterPage;
