import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function ProductVideoPreview() {
  const navigate = useNavigate();

  return (
    <div style={styles.wrapper}>
      <h2 style={styles.title}>상품 등록</h2>
      <p style={styles.subtitle}>상품 상세 정보와 이미지를 바탕으로 제작한 영상입니다.</p>

      {/* ▶️ 여기에 나중에 AI 영상이 들어갈 예정 */}
      <div style={styles.videoBox}>
        {/* 백엔드 연동 시 <video> 또는 <img> 태그로 교체 */}
      </div>

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