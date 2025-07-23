import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function ProductAICustomInput() {
  const [customDescription, setCustomDescription] = useState('');
  const navigate = useNavigate();

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

      <div style={styles.buttonGroup}>
        <button
          style={styles.button}
          onClick={() => navigate('/product/ai-description')}
        >
          &lt; 이전 단계로 이동
        </button>
        <button
        style={styles.button}
        onClick={() => {
            navigate('/product/summary-preview', { state: { summary: customDescription } });
        }}
        >
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
    marginTop: '24px',
    fontSize: '16px',
  },
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
  buttonGroup: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '40px',
  },
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
