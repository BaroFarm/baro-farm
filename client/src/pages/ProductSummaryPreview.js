import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function ProductSummaryPreview() {
  const location = useLocation();
  const navigate = useNavigate();
  const summary = location.state?.summary || '';

  return (
    <div style={styles.wrapper}>
      <h2 style={styles.title}>상품 등록</h2>
      <p style={styles.subText}>상품에 대한 간단한 소개글입니다.</p>

      <div style={styles.labelRow}>
        <span>AI 요약</span>
        <button style={styles.editButton} onClick={() => navigate('/product/ai-custom-input')}>
          요약 수정하기
        </button>
      </div>

      <div style={styles.summaryBox}>{summary}</div>

      <div style={styles.buttonGroup}>
        <button style={styles.buttonWhite} onClick={() => navigate('/product/ai-custom-input')}>
          &lt; 이전 단계로 이동
        </button>
        <button style={styles.buttonGreen} onClick={() => navigate('/product/video-preview')}>
          다음 단계로 이동 &gt;
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
  },
  subText: {
    fontSize: '18px',
    margin: '40px 0 24px',
  },
  labelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
    fontSize: '15px',
  },
  editButton: {
    padding: '6px 12px',
    border: '1px solid #ccc',
    borderRadius: '999px',
    backgroundColor: 'white',
    cursor: 'pointer',
    fontSize: '13px',
  },
  summaryBox: {
    border: '1px solid #888',
    padding: '24px',
    minHeight: '80px',
    textAlign: 'left',
    fontSize: '16px',
    backgroundColor: '#fff',
  },
  buttonGroup: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '60px',
  },
  buttonWhite: {
    backgroundColor: 'white',
    border: '1px solid #ccc',
    borderRadius: '999px',
    padding: '10px 24px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  buttonGreen: {
    backgroundColor: '#B6D19B',
    border: '1px solid black'
,
    borderRadius: '999px',
    padding: '10px 24px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
  },
};

export default ProductSummaryPreview;
