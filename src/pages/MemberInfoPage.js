import React from 'react';

export default function MemberInfoPage() {
  return (
    <div style={{ padding: '32px', maxWidth: '800px', margin: '0 auto', backgroundColor: '#f9fbf7', borderRadius: '16px' }}>
      <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '24px' }}>회원 정보</h2>

      {/* 상단 사용자 정보 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <div style={{ fontSize: '28px' }}>👤</div>
        <span style={{ fontWeight: 'bold' }}>(실명)</span>
        <span style={{ textDecoration: 'underline', cursor: 'pointer', color: '#555' }}>신원 인증</span>
        <span style={{
          marginLeft: '6px',
          width: '16px',
          height: '16px',
          backgroundColor: '#246bfd',
          borderRadius: '50%',
          display: 'inline-block'
        }}></span>
      </div>

      {/* 폼 영역 */}
      <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', rowGap: '16px', columnGap: '16px' }}>
        <label>회원 유형</label>
        <span style={{ backgroundColor: '#d8e8ca', borderRadius: '8px', padding: '4px 10px', fontSize: '14px', display: 'inline-block' }}>판매자</span>

        <label>이름</label>
        <input type="text" value="홍길동" readOnly style={inputStyle} />

        <label>이메일</label>
        <input type="text" value="서울특별시 도봉구 우이천로 381, ○○○동 ○○○호" readOnly style={inputStyle} />

        <label>비밀번호</label>
        <button style={greenButtonStyle}>비밀번호 변경</button>

        <label>전화번호</label>
        <input type="text" value="010-1234-5678" readOnly style={inputStyle} />

        <div style={{ gridColumn: '1 / 3', height: '1px', backgroundColor: '#ccc', margin: '8px 0' }}></div>

        <label>상호명</label>
        <input type="text" placeholder="응애네 채소" style={inputStyle} />

        <label>스토어 주소</label>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input type="text" placeholder="경기도 가평시 ○○○" style={{ ...inputStyle, flex: 1 }} />
          <button style={greenButtonStyle}>검색</button>
        </div>

        <label>통신판매번호</label>
        <input type="text" placeholder="123-45-67890" style={inputStyle} />

        <label>고객 응대 연락처</label>
        <input type="text" placeholder="031-123-1234" style={inputStyle} />
      </div>

      {/* 하단 버튼 */}
      <div style={{ marginTop: '32px', textAlign: 'center' }}>
        <button style={grayButtonStyle}>뒤로</button>
        <button style={greenButtonStyle}>수정</button>
      </div>
    </div>
  );
}

const inputStyle = {
  padding: '8px',
  border: '1px solid #ccc',
  borderRadius: '6px',
  fontSize: '14px',
  width: '100%',
  backgroundColor: '#fff'
};

const greenButtonStyle = {
  backgroundColor: '#d8e8ca',
  border: 'none',
  borderRadius: '8px',
  padding: '6px 14px',
  fontSize: '14px',
  cursor: 'pointer'
};

const grayButtonStyle = {
  backgroundColor: '#fff',
  border: '1px solid #ccc',
  borderRadius: '8px',
  padding: '6px 14px',
  fontSize: '14px',
  marginRight: '12px',
  cursor: 'pointer'
};
