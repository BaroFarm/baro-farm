// src/seller/MemberInfoPage.js
import React from 'react';
import { MdAccountCircle } from 'react-icons/md';

export default function MemberInfoPage() {
  return (
    <div style={pageWrap}>
      <div style={card}>
        <h2 style={title}>회원 정보</h2>

        {/* 상단 프로필/인증 */}
        <div style={topRow}>
          <MdAccountCircle size={40} color="#1d1d1f" style={{ marginRight: '10px' }} />
          <span style={realname}>(실명)</span>
          <button type="button" style={verifyBtn}>
            신원 인증
            <span style={verifyDot} aria-hidden />
          </button>
        </div>

        {/* 폼 */}
        <div style={grid}>
          <Label>회원 유형</Label>
          <span style={badgeSeller}>판매자</span>

          <Label>이름</Label>
          <ReadOnly value="홍길동" />

          <Label>이메일</Label>
          <ReadOnly value="user@example.com" />

          <Label>비밀번호</Label>
          <button type="button" style={btnGreenSm}>비밀번호 변경</button>

          <Label>전화번호</Label>
          <ReadOnly value="010-1234-5678" />

          {/* 구분선 */}
          <div style={divider} />
          <div style={divider} />

          <Label>상호명</Label>
          <Input placeholder="응애네 채소" />

          <Label>우편주소</Label>
          <div style={inline}>
            <Input placeholder="경기도 가평시 000" style={{ flex: 1 }} />
            <button type="button" style={btnGreenSm}>검색</button>
          </div>

          <Label>도로명 주소</Label>
          <Input placeholder="13-14" />

          <Label>상세 주소</Label>
          <Input placeholder="동 호수" />

          <Label>통신판매번호</Label>
          <Input placeholder="123-45-67890" />

          <Label>고객 응대 연락처</Label>
          <Input placeholder="031-123-1234" />
        </div>

        {/* 하단 버튼 */}
        <div style={footer}>
          <button type="button" style={btnGhost}>뒤로</button>
          <button type="button" style={btnGreenLg}>수정</button>
        </div>
      </div>
    </div>
  );
}

/* ---------- 재사용 소품 ---------- */
const Label = ({ children }) => (
  <label style={labelStyle}>{children}</label>
);

const Input = ({ style, ...props }) => (
  <input
    {...props}
    style={{
      ...inputBase,
      ...style,
    }}
  />
);

const ReadOnly = ({ value }) => (
  <input value={value} readOnly style={{ ...inputBase, backgroundColor: '#fff' }} />
);

/* ---------- 스타일 ---------- */
const pageWrap = {
  padding: '24px',
  background: 'linear-gradient(180deg,#ffffff 0%, #f6f8f3 100%)',
  minHeight: '100dvh',
};

const card = {
  maxWidth: 880,
  margin: '0 auto',
  backgroundColor: '#f9fbf7',
  borderRadius: 16,
  padding: 28,
  boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
  border: '1px solid #e7eedf',
};

const title = { fontSize: 18, fontWeight: 'bold', marginBottom: 20, color: '#1b1b1b' };

const topRow = { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 };
const realname = { fontWeight: 600, color: '#333' };

const verifyBtn = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '6px 10px',
  background: '#fff',
  border: '1px solid #dfe7f9',
  borderRadius: 10,
  color: '#4a5568',
  cursor: 'pointer',
};

const verifyDot = {
  width: 16,
  height: 16,
  borderRadius: '50%',
  backgroundColor: '#246bfd',
  display: 'inline-block',
};

const grid = {
  display: 'grid',
  gridTemplateColumns: '140px 1fr',
  columnGap: 16,
  rowGap: 14,
};

const divider = {
  gridColumn: '1 / -1',
  height: 1,
  backgroundColor: '#dcdcdc',
  margin: '6px 0',
};

const badgeSeller = {
  display: 'inline-block',
  backgroundColor: '#d8e8ca',
  color: '#2b4d1f',
  padding: '4px 10px',
  fontSize: 13,
  borderRadius: 10,
  fontWeight: 600,
  width: 'fit-content',
};

const labelStyle = {
  alignSelf: 'center',
  color: '#333',
  fontSize: 16,   // 레이블 폰트 크기 ↑
  fontWeight: 700 // 볼드 처리
};

const inputBase = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 8,
  border: '1px solid #d5d5d5',
  outline: 'none',
  fontSize: 14,
  color: '#2d2d2d',
  backgroundColor: '#fff',
};

const inline = { display: 'flex', gap: 8, alignItems: 'center' };

const btnGreenSm = {
  backgroundColor: '#d8e8ca',
  border: '1px solid #cfe1c1',
  borderRadius: 8,
  padding: '8px 14px',
  fontSize: 14,
  cursor: 'pointer',
};

const footer = { marginTop: 26, display: 'flex', justifyContent: 'center', gap: 12 };

const btnGhost = {
  backgroundColor: '#fff',
  border: '1px solid #d5d5d5',
  borderRadius: 10,
  padding: '10px 18px',
  fontSize: 14,
  cursor: 'pointer',
};

const btnGreenLg = {
  backgroundColor: '#cfe4b8',
  border: '1px solid #b9d79a',
  borderRadius: 10,
  padding: '10px 22px',
  fontSize: 14,
  fontWeight: 700,
  cursor: 'pointer',
  boxShadow: '0 1px 0 rgba(0,0,0,0.04) inset',
};
