import React from 'react';

function BuyerDirectStoreChannelPage() {
  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '10px' }}>
        직매장 소통 채널
      </h2>
      <hr style={{ marginBottom: '20px' }} />

      {/* 1. 문의하기 */}
      <section style={{ marginBottom: '40px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>
          1. 문의 하기 <span style={{ fontSize: '14px', fontWeight: 'normal' }}>(문의 게시판 입력 폼 예시)</span>
        </h3>
        <a
          href="#"
          style={{ fontSize: '14px', marginLeft: '10px', textDecoration: 'underline', color: '#555' }}
        >
          문의게시판 이동 &gt;
        </a>

        <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px', marginTop: '10px' }}>
          <form>
            <div style={{ marginBottom: '10px' }}>
              <label>제목</label>
              <input type="text" placeholder="제목 입력" style={inputStyle} />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label>카테고리 선택</label>
              <select style={inputStyle}>
                <option>카테고리 선택</option>
                <option>배송 문의</option>
                <option>상품 문의</option>
              </select>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label>내용</label>
              <textarea placeholder="문의 내용" style={{ ...inputStyle, height: '100px' }} />
            </div>
            <div>
              <input type="checkbox" /> 공개 여부 설정
            </div>
            <button
              type="submit"
              style={{
                marginTop: '10px',
                padding: '10px 20px',
                background: '#111827',
                color: '#fff',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              제출
            </button>
          </form>
        </div>
      </section>

      {/* 2. 챗봇 FAQ */}
      <section style={{ marginBottom: '40px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>2. 챗봇 FAQ</h3>
        <div style={{ marginTop: '10px' }}>
          <img
            src="/images/chatbot-faq.png"
            alt="챗봇 FAQ"
            style={{ width: '80px', height: '80px' }}
          />
        </div>
      </section>

      {/* 3. SNS 채널 연동 */}
      <section>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>3. SNS 채널 연동</h3>
        <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
          <img src="/images/instagram.png" alt="Instagram" style={snsIcon} />
          <img src="/images/kakao.png" alt="KakaoTalk" style={snsIcon} />
          <img src="/images/naver-blog.png" alt="Naver Blog" style={snsIcon} />
        </div>
      </section>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '8px',
  border: '1px solid #ccc',
  borderRadius: '4px',
  marginTop: '4px'
};

const snsIcon = {
  width: '50px',
  height: '50px',
  cursor: 'pointer'
};

export default BuyerDirectStoreChannelPage;
