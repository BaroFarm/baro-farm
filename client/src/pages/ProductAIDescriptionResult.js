import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function ProductAIDescriptionResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const aiDescription = location.state?.description || 'AI가 생성한 상세 설명이 여기에 표시됩니다.';

  return (
    <div style={styles.wrapper}>
      <h2 style={styles.title}>상품 등록</h2>
      <p style={styles.subText}>AI가 자동으로 생성한 상세 설명입니다.</p>

      <div style={styles.box}>
        <p style={styles.description}>
          {aiDescription}
        </p>
      </div>

      <div style={styles.buttonGroup}>
  <button style={styles.outlineButton} onClick={() => alert('위 설명 사용')}>
    위 설명 사용할게요
  </button>
  <button
    style={styles.outlineButton}
    onClick={() => navigate('/product/ai-custom-input')} // ✅ 직접 작성 페이지로 이동
    >
    직접 작성할게요
</button>
</div>

    </div>
  );
}

const styles = {
  wrapper: {
    maxWidth: '700px',
    margin: '0 auto',
    padding: '40px 20px',
    textAlign: 'center',
  },
  title: {
    fontSize: '22px',
    fontWeight: 'bold',
    textAlign: 'left',
  },
  subText: {
    marginTop: '24px',
    fontSize: '16px',
  },
  box: {
    border: '1px solid #ccc',
    padding: '24px',
    marginTop: '30px',
    textAlign: 'left',
    minHeight: '180px',
    backgroundColor: '#fff',
  },
  description: {
    fontSize: '15px',
    lineHeight: '1.6',
    whiteSpace: 'pre-wrap',
  },
  buttonGroup: {
  display: 'flex',
  justifyContent: 'space-between',
  marginTop: '40px',
  gap: '250px',             // 버튼 사이 간격
  maxWidth: '700px',
  marginLeft: 'auto',
  marginRight: 'auto',
},
outlineButton: {
  flex: 1,
  padding: '12px 20px',
  border: '1px solid black', // ✅ 테두리
  borderRadius: '999px',
  backgroundColor: '#B6D19B', // ✅ 연두색 배경
  color: '#1d1d1f', // ✅ 진한 글자색
  fontSize: '14px',
  fontWeight: '500',
  cursor: 'pointer',
},

};

export default ProductAIDescriptionResult;
