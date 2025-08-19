import React from 'react';
import { useNavigate } from 'react-router-dom';

function ProductCompletePage() {
  const navigate = useNavigate();

  return (
    <div style={styles.wrapper}>
      <h2 style={styles.title}>상품 등록</h2>
      <p style={styles.message}>
        <span style={styles.emoji}>✅</span> 상품 등록이 완료되었습니다.
      </p>

      <div style={styles.buttonGroup}>
        <button
          style={styles.button}
          onClick={() => navigate('/')}
        >
          메인 화면으로 돌아가기
        </button>
        <button
          style={styles.button}
          onClick={() => alert('상세페이지 이동 (연결 예정)')}
        >
          상세페이지로 확인하기
        </button>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    maxWidth: '700px',
    margin: '0 auto',
    padding: '60px 20px',
    textAlign: 'center',
  },
  title: {
    fontSize: '22px',
    fontWeight: 'bold',
    textAlign: 'left',
    marginBottom: '60px',
  },
  message: {
    fontSize: '20px',
    marginBottom: '40px',
  },
  emoji: {
    fontSize: '22px',
    marginRight: '8px',
  },
  buttonGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    alignItems: 'center',
  },
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
