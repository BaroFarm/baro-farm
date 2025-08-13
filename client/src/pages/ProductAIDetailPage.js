import React from 'react';
import { useNavigate } from 'react-router-dom';

function ProductAIDetailPage() {
  const navigate = useNavigate();

  return (
    <div style={styles.pageWrapper}>
      <h2 style={styles.title}>상품 등록</h2>

      <div style={styles.centerContent}>
        <p style={styles.guideText}>
          키워드를 입력해 자동으로 상세 설명을 만들어보세요!
        </p>

        <div style={styles.inputGroup}>
          <label style={styles.label}>키워드 입력</label>
          <input
            type="text"
            placeholder="당일발송"
            style={styles.input}
          />
        </div>

        <button
        style={styles.generateButton}
        onClick={() => navigate('/product/ai-description-result')} // ✅ 이동 경로 연결
      >
        자동 AI 상세 설명 생성하기
      </button>


      </div>

      <div style={styles.footer}>
        <button style={styles.backButton} onClick={() => navigate('/product/image-upload')}>
          &lt; 이전 단계로 이동
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
    fontSize: '20px',
    fontWeight: 'bold',
    textAlign: 'left',
    marginBottom: '32px',
  },
  centerContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '24px',
  },
  guideText: {
    fontSize: '18px',
    lineHeight: '1.5',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    width: '100%',
    maxWidth: '500px',
  },
  label: {
    fontWeight: '500',
    fontSize: '15px',
    textAlign: 'left',
  },
  input: {
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #ccc',
    fontSize: '14px',
  },
  generateButton: {
    backgroundColor: '#3c763d',
    color: 'white',
    fontWeight: 'bold',
    padding: '14px 24px',
    borderRadius: '8px',
    border: '1px solid black',
    cursor: 'pointer',
    fontSize: '16px',
  },
  footer: {
    marginTop: '40px',
    display: 'flex',
    justifyContent: 'flex-start',
  },
  backButton: {
    border: '1px solid #ccc',
    backgroundColor: 'white',
    borderRadius: '999px',
    padding: '10px 20px',
    cursor: 'pointer',
  },
};

export default ProductAIDetailPage;
