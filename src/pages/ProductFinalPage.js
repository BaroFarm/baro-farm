import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function ProductFinalPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const withVideo = location.state?.withVideo ?? false;

  return (
    <div style={styles.wrapper}>
      <h2 style={styles.title}>상품 등록</h2>
      <p style={styles.subText}>마지막으로 상품 페이지를 점검해주세요.</p>

      {withVideo ? (
        <div style={styles.mediaSection}>
          {/* AI가 생성한 영상 - 실제 영상 URL은 백엔드 연동 시 수정 */}
          <video width="100%" height="auto" controls style={{ borderRadius: '8px' }}>
            <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4" />
            브라우저가 영상을 지원하지 않습니다.
          </video>
        </div>
      ) : (
        <>
          <img
            src="https://i.imgur.com/Oa1eG6f.jpeg" // 예시 이미지
            alt="고구마"
            style={styles.image}
          />
          <p style={styles.description}>
            유기농 인증을 받은 친환경 고구마입니다. 농약을 사용하지 않고 정성껏 키워 안심하고 드실 수 있어요.
          </p>
        </>
      )}

      {/* 공통 설명 */}
      <div style={styles.extraContent}>
        <img
          src="https://i.imgur.com/hbCNSOq.jpeg"
          alt="고구마 근접"
          style={styles.image}
        />
        <p style={styles.description}>
          농약 없이 재배한 고구마는 단맛이 깊고 식감이 부드러워요. 믿을 수 있는 친환경 농가에서 자랐습니다.
        </p>

        <img
          src="https://i.imgur.com/YKz88Xq.png"
          alt="무농약 인증"
          style={{ width: 100, margin: '16px auto' }}
        />

        <table style={styles.table}>
          <tbody>
            <tr>
              <td>농가명</td>
              <td>양파 생산농가</td>
            </tr>
            <tr>
              <td>생산지 주소</td>
              <td>강원도 서원면길 15</td>
            </tr>
            <tr>
              <td>무농약 인증번호</td>
              <td>10006525</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={styles.buttonGroup}>
        <button
          style={styles.buttonWhite}
          onClick={() => navigate('/product/summary-preview')}
        >
          &lt; 이전 단계로 이동
        </button>
        <button
          style={styles.buttonGreen}
          onClick={() => alert('상품이 최종 등록되었습니다!')}
        >
          최종 등록하기
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
    fontSize: '16px',
    margin: '20px 0 30px',
  },
  mediaSection: {
    marginBottom: '30px',
  },
  image: {
    width: '100%',
    maxHeight: '300px',
    objectFit: 'cover',
    borderRadius: '8px',
    marginBottom: '16px',
  },
  description: {
    fontSize: '15px',
    textAlign: 'left',
    marginBottom: '30px',
    lineHeight: '1.6',
  },
  extraContent: {
    marginTop: '20px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '20px',
    fontSize: '14px',
  },
  buttonGroup: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '40px',
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
    border: '1px solid #1d1d1f',
    borderRadius: '999px',
    padding: '10px 24px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
  },
};

export default ProductFinalPage;
