import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';

function ProductImageUploadPage() {
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      alert(`선택된 파일: ${file.name}`);
    }
  };

  return (
    <div style={styles.pageWrapper}>
      {/* 왼쪽 정렬된 제목 */}
      <h2 style={styles.title}>상품 등록</h2>

      {/* 가운데 안내문구 및 버튼 */}
      <div style={styles.centerContent}>
        <p style={styles.instruction}>상품등록을 위해<br />이미지를 업로드 하세요</p>

        <input
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          ref={fileInputRef}
          onChange={handleFileChange}
        />

        <button style={styles.uploadButton} onClick={handleUploadClick}>
          이미지 업로드
        </button>
      </div>

      {/* 하단 네비게이션 버튼 */}
      <div style={styles.navigation}>
        <button
          style={styles.prevButton}
          onClick={() => navigate('/product/form')}
        >
          &lt; 이전 단계로 이동
        </button>

        <button
          style={styles.nextButton}
          onClick={() => { alert('다음 단계로 이동');navigate('/product/ai-description');}}
          
        >
          다음 단계로 이동 <span style={{ marginLeft: '6px' }}>➔</span>
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
    marginBottom: '40px',
  },
  centerContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
    marginBottom: '60px',
    textAlign: 'center',
  },
  instruction: {
    fontSize: '18px',
    lineHeight: '1.6',
  },
  uploadButton: {
    backgroundColor: '#c9dfaf',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 24px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  navigation: {
    display: 'flex',
    justifyContent: 'space-between',
    maxWidth: '600px',
    margin: '0 auto',
  },
  prevButton: {
    border: '1px solid #ccc',
    backgroundColor: 'white',
    borderRadius: '999px',
    padding: '10px 20px',
    cursor: 'pointer',
  },
  nextButton: {
    backgroundColor: '#B6D19B',
    border: '1px solid black',
    borderRadius: '999px',
    padding: '10px 20px',
    cursor: 'pointer',
  },
};

export default ProductImageUploadPage;
