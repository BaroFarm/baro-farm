// src/seller/SellerMyPage.jsx
import React from 'react';
import { MdAccountCircle, MdAssignment } from 'react-icons/md';
import { FiUsers } from 'react-icons/fi';
import { Link } from 'react-router-dom';

export default function SellerMyPage() {
  return (
    <div style={{ padding: '32px', maxWidth: '960px', margin: '0 auto' }}>
      {/* 사용자 정보 */}
      <div style={userBox}>
        {/* 프로필 아이콘 */}
        <MdAccountCircle size={42} color="#1d1d1f" style={{ marginRight: '10px' }} />

        {/* 실명 */}
        <span style={realNameStyle}>(실명)</span>

        {/* 회원 정보 링크 */}
        <Link to="/mypage/member-info" style={linkStyle}>
          회원 정보
        </Link>

        {/* 신원 인증 */}
        <span style={verifyWrap}>
          신원 인증
          <span style={verifyDot}></span>
        </span>
      </div>

      {/* 공지사항 */}
      <div style={sectionBox}>
        <h3 style={sectionTitle}>공지사항</h3>
        <ul style={noticeList}>
          <li style={listItemStyle}>
            플랫폼 정책 변경 관련 안내....
            <span style={dateStyle}>2025.07.13</span>
          </li>
          <li style={listItemStyle}>
            판매자 대상 이벤트 프로모션 안내....
            <span style={dateStyle}>2025.07.13</span>
          </li>
          <li style={listItemStyle}>
            고객 응대 안내.....
            <span style={dateStyle}>2025.07.13</span>
          </li>
        </ul>
      </div>

      {/* 문의 */}
      <div style={sectionBox}>
        <h3 style={sectionTitle}>문의</h3>

        <div style={inquiryWrap}>
          {/* 피드백 접수 */}
          <div style={inquiryItem}>
            <MdAssignment size={28} />
            <span style={inquiryText}>피드백 접수 및 관리</span>
          </div>

          {/* 문의 게시판 이동 */}
          <div style={inquiryItem}>
            <FiUsers size={28} />
            <span style={inquiryText}>문의 게시판 이동</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- 스타일 ---------------- */
const userBox = {
  backgroundColor: '#f8f8f8',
  borderRadius: '12px',
  padding: '20px 24px',
  display: 'flex',
  alignItems: 'center',
  marginBottom: '32px',
};

const realNameStyle = {
  fontWeight: 'bold',
  marginRight: '14px',
};

const linkStyle = {
  color: '#666',
  marginRight: '20px',
  cursor: 'pointer',
  textDecoration: 'underline',
};

const verifyWrap = {
  color: '#666',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  textDecoration: 'underline',
};

const verifyDot = {
  marginLeft: '6px',
  width: '16px',
  height: '16px',
  backgroundColor: '#246bfd',
  borderRadius: '50%',
  display: 'inline-block',
};

const sectionBox = {
  backgroundColor: '#f8f8f8',
  borderRadius: '12px',
  padding: '24px',
  marginBottom: '28px',
};

const sectionTitle = {
  fontWeight: 'bold',
  fontSize: '16px',
  marginBottom: '12px',
};

const noticeList = {
  listStyleType: 'disc',
  paddingLeft: '20px',
  fontSize: '14px',
  color: '#444',
};

const listItemStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '6px 0',
};

const dateStyle = {
  fontSize: '13px',
  color: '#888',
  marginLeft: '20px',
};

const inquiryWrap = {
  display: 'flex',
  gap: '80px',
  justifyContent: 'center',
};

const inquiryItem = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '16px',
};

const inquiryText = {
  fontSize: '14px',
};
