import React from 'react';
import { MdAccountCircle, MdAssignment } from 'react-icons/md';
import { FiUsers } from 'react-icons/fi';
import { Link } from 'react-router-dom';


export default function MyPage() {
  return (
    <div style={{ padding: '32px', maxWidth: '960px', margin: '0 auto' }}>
      {/* 사용자 정보 */}
      <div style={{
        backgroundColor: '#f8f8f8',
        borderRadius: '12px',
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        marginBottom: '32px'
      }}>
        <MdAccountCircle size={32} color="#1d1d1f" style={{ marginRight: '12px' }} />
        <span style={{ fontWeight: 'bold', marginRight: '12px' }}>(실명)</span>

        <Link to="/mypage/member-info" style={{
        color: '#666',
        marginRight: '20px',
        cursor: 'pointer',
        textDecoration: 'underline'
        }}>
        회원 정보
        </Link>


        <span style={{
          color: '#666',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          textDecoration: 'underline'
        }}>
          신원 인증
          <span style={{
            marginLeft: '6px',
            width: '16px',
            height: '16px',
            backgroundColor: '#246bfd',
            borderRadius: '50%',
            display: 'inline-block'
          }}></span>
        </span>
      </div>

      {/* 공지사항 */}
      <div style={{
        backgroundColor: '#f8f8f8',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '28px'
      }}>
      
        <h3 style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '12px' }}>공지사항</h3>
        <ul style={{ listStyleType: 'disc', paddingLeft: '20px', fontSize: '14px', color: '#444' }}>
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
      <div style={{
        backgroundColor: '#f8f8f8',
        borderRadius: '12px',
        padding: '50px'
      }}>
        <h3 style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '16px' }}>문의</h3>

        <div style={{ display: 'flex', gap: '80px', justifyContent: 'center' }}>
          {/* 피드백 접수 */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px'
          }}>
            <MdAssignment size={28} />
            <span style={{ fontSize: '14px' }}>피드백 접수 및 관리</span>
          </div>

          {/* 문의 게시판 이동 */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px'
          }}>
            <FiUsers size={28} />
            <span style={{ fontSize: '14px' }}>문의 게시판 이동</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const listItemStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '6px 0'
};

const dateStyle = {
  fontSize: '13px',
  color: '#888',
  marginLeft: '20px'
};
