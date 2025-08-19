import React from 'react';
import { useNavigate } from 'react-router-dom'; // ✅ 꼭 필요!

function ProductRegisterPage() {
  const navigate = useNavigate(); // ✅ 이 줄이 없으면 navigate 에러남

  return (
    <div style={styles.pageWrapper}>
      <h2 style={styles.title}>상품 등록</h2>
      <div style={styles.centerContent}>
        <p>바로팜에 상품을 등록하시겠습니까?</p>
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
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '24px',
  },
  centerContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
  },
  button: {
    backgroundColor: '#B6D19B',
    padding: '10px 20px',
    border: '1px solid black',
    borderRadius: '8px',
    cursor: 'pointer',
  },
};

export default ProductRegisterPage;
