// src/seller/SellerMyPage.jsx
import React, {useEffect, useState, useMemo} from 'react';
import { MdAccountCircle, MdAssignment } from 'react-icons/md';
import { FiUsers } from 'react-icons/fi';
import { Link} from 'react-router-dom';

const BASE = (process.env.REACT_APP_API_BASE_URL || '').replace(/\/$/, '');

function getStoreId() {
  // 프로젝트별로 저장 키가 다를 수 있어 여러 경로를 시도
  const direct = localStorage.getItem('storeId');
  if (direct) return direct;
  const fromUser = localStorage.getItem('user');
  if (fromUser) {
    try {
      const parsed = JSON.parse(fromUser);
      if (parsed?.store_id) return String(parsed.store_id);
      if (parsed?.seller?.store_id) return String(parsed.seller.store_id);
    } catch {}
  }
  // 최후: userId가 store_id와 동일하게 운용된다면(프로젝트 정책에 따라)
  const maybe = localStorage.getItem('userId');
  return maybe || null;
}


export default function SellerMyPage() {
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  
  const storeId = useMemo(getStoreId, []);
  const token = localStorage.getItem('accessToken') || '';

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr('');
      try {
        if (!storeId) {
          setErr('store_id를 찾을 수 없습니다. (로컬스토리지 storeId/user.user.store_id 확인)');
          setLoading(false);
          return;
        }

        const url = `${BASE}/api/seller?store_id=${encodeURIComponent(storeId)}`;
        const res = await fetch(url, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`판매자 정보 조회 실패(${res.status}): ${text}`);
        }

        const json = await res.json();
        // 명세 예시: { "status": "success", "data": { name, email, password, phone, contact, license_number } }
        const data = json?.data ?? json; // 백 응답 형태 유연화
        setSeller(data);
      } catch (e) {
        console.error(e);
        setErr(e.message || '판매자 정보 조회 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    })();
  }, [storeId, token]);

  const nameText = loading ? '불러오는 중...' : (seller?.name || '(실명)');
  const verified = !!seller?.license_number;

  return (
    <div style={{ padding: '32px', maxWidth: '960px', margin: '0 auto' }}>
      {/* 사용자 정보 */}
      <div style={userBox}>
        {/* 프로필 아이콘 */}
        <MdAccountCircle size={42} color="#1d1d1f" style={{ marginRight: '10px' }} />

        {/* 실명 */}
        <span style={realNameStyle}>{nameText}</span>

        {/* 회원 정보 링크 */}
        <Link to="/mypage/member-info" style={linkStyle}>
          회원 정보
        </Link>

        {/* 신원 인증 */}
        <span style={verifyWrap} title={verified ? '인증 완료' : '미인증'}>
          {verified ? '신원 인증 완료' : '신원 인증 미완료'}
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
