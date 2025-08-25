// src/components/NavBar.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HiOutlineChatBubbleLeft } from 'react-icons/hi2';
import ChatbotModal from '../../ai_chatbot/ChatbotModal';

function NavBar() {
  const [openChat, setOpenChat] = useState(false);
  const [role, setRole] = useState('buyer'); // 기본 buyer
  const location = useLocation();

  // 로그인 정보에서 역할 감지 (localStorage → 프로필 API 순)
  useEffect(() => {
    // ★ LoginForm에서 저장하는 'userType' 우선, 없으면 'user_type'
    const cached = (
      localStorage.getItem('userType') ||
      localStorage.getItem('user_type') ||
      ''
    ).toLowerCase();
    if (cached === 'seller' || cached === 'buyer') setRole(cached);

    const token = localStorage.getItem('accessToken');
    const BASE = (process.env.REACT_APP_API_BASE_URL || '').replace(/\/$/, '');
    if (!token || !BASE) return;

    fetch(`${BASE}/api/my/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => (r.ok ? r.json() : null))
      .then(js => {
        const t = String(js?.data?.user_type || '').toLowerCase();
        if (t === 'seller' || t === 'buyer') setRole(t);
      })
      .catch(() => {});
  }, []);

  // 다른 탭/창에서 로그인 바뀌었을 때 역할 즉시 반영
  useEffect(() => {
    const onStorage = () => {
      const t = (
        localStorage.getItem('userType') ||
        localStorage.getItem('user_type') ||
        ''
      ).toLowerCase();
      if (t === 'seller' || t === 'buyer') setRole(t);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const navItems = useMemo(() => ([
    { label: '카테고리', to: '/' },
    { label: '주문/배송 관리', to: '/order' },
    { label: '상품 등록', to: '/product/register' },
    { label: '나의 가게', to: '/shop' },
    { label: '매출/선호도 분석', to: '/analytics' }
  ]), []);

  const isActive = (to) =>
    location.pathname === to || location.pathname.startsWith(to + '/');

  const handleSend = (text) => {
    console.log('[AI CHAT SEND]', { role, text });
  };

  return (
    <div style={styles.wrapper}>
      <nav style={styles.nav}>
        <ul style={styles.list}>
          {navItems.map((item) => (
            <React.Fragment key={item.to}>
              <li>
                <Link
                  to={item.to}
                  style={{
                    ...styles.navItem,
                    fontWeight: isActive(item.to) ? '700' : '400', // ★ normal로
                    color: isActive(item.to) ? '#000' : '#49454F',
                  }}
                  aria-current={isActive(item.to) ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              </li>
              {item.label === '카테고리' && <div style={styles.divider} />}
            </React.Fragment>
          ))}
        </ul>

        <button
          style={styles.chatbotButton}
          onClick={() => setOpenChat(true)}
          type="button"
        >
          <HiOutlineChatBubbleLeft size={18} style={{ marginRight: 6 }} />
          <span>AI 챗봇</span>
        </button>
      </nav>

      {/* ★ role 전달 (필수) */}
      <ChatbotModal
        open={openChat}
        onClose={() => setOpenChat(false)}
        onSend={handleSend}
        role={role}
        key={`chat-${role}`} // 역할 바뀔 때 초기화 원하면 유지
      />
    </div>
  );
}

const styles = {
  wrapper: { width: '100%', backgroundColor: '#B6D19B' },
  nav: {
    height: 45, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    maxWidth: 1200, margin: '0 auto', padding: '0 24px', boxSizing: 'border-box',
    fontFamily: 'Arial, sans-serif',
  },
  list: {
    display: 'flex', listStyle: 'none', margin: 0, padding: 0, gap: 16,
    alignItems: 'center', flexWrap: 'wrap',
  },
  navItem: { textDecoration: 'none', fontSize: 15, padding: '4px 8px' },
  divider: { width: 1, height: 20, backgroundColor: '#8FB46B', margin: '0 8px' },
  chatbotButton: {
    display: 'flex', alignItems: 'center', backgroundColor: '#fff',
    border: '1px solid #ccc', borderRadius: 999, padding: '8px 16px',
    fontSize: 14, fontWeight: 600, color: '#1d1d1f', cursor: 'pointer',
  },
};

export default NavBar;
