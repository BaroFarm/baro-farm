// src/components/NavBar.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineChatBubbleLeft } from 'react-icons/hi2';
import ChatbotModal from '../ai_chatbot/ChatbotModal'; 

function NavBar() {
  const [openChat, setOpenChat] = useState(false);
  const [role, setRole] = useState('buyer'); // ← 기본 buyer

  // 로그인 정보에서 역할 감지 (localStorage → 프로필 API 순)
  useEffect(() => {
    const cached = (localStorage.getItem('user_type') || '').toLowerCase();
    if (cached) setRole(cached === 'seller' ? 'seller' : 'buyer');

    const token = localStorage.getItem('accessToken');
    const BASE = (process.env.REACT_APP_API_BASE_URL || '').replace(/\/$/, '');
    if (!token || !BASE) return;

    fetch(`${BASE}/api/my/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => (r.ok ? r.json() : null))
      .then(js => {
        const t = String(js?.data?.user_type || '').toLowerCase();
        if (t) setRole(t === 'seller' ? 'seller' : 'buyer');
      })
      .catch(() => {});
  }, []);

  const navItems = [
    { label: '카테고리', to: '/category' },
    { label: '주문/배송 관리', to: '/order' },
    { label: '상품 등록', to: '/product/register' },
    { label: '나의 가게', to: '/shop' },
    { label: '매출/선호도 분석', to: '/analytics' }
  ];

  // 메시지 전송 콜백 (백엔드 붙이면 여기서 API 호출)
  const handleSend = (text) => {
    console.log('[AI CHAT SEND]', { role, text });
  };

  return (
    <nav style={styles.nav}>
      {navItems.map((item, index) => (
        <React.Fragment key={index}>
          <Link to={item.to} style={styles.navItem}>{item.label}</Link>
          {item.label === '카테고리' && <div style={styles.divider} />}
        </React.Fragment>
      ))}

      <button
        style={styles.chatbotButton}
        onClick={() => setOpenChat(true)}
      >
        <HiOutlineChatBubbleLeft size={18} style={{ marginRight: '6px' }} />
        <span>AI 챗봇</span>
      </button>

      {/* 모달 */}
      <ChatbotModal
        open={openChat}
        onClose={() => setOpenChat(false)}
        onSend={handleSend}
        role={role}                 
      />
    </nav>
  );
}

const styles = {
  nav: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    backgroundColor: '#e6efdc',
    padding: '10px 24px',
    borderBottom: '1px solid #ccc',
  },
  navItem: {
    color: '#333',
    fontSize: '15px',
    textDecoration: 'none',
    fontWeight: '500',
    padding: '4px 8px',
  },
  divider: {
    width: '1px',
    height: '20px',
    backgroundColor: '#bbb',
    margin: '0 8px',
  },
  chatbotButton: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    border: '1px solid #ccc',
    borderRadius: '999px',
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#1d1d1f',
    cursor: 'pointer',
    boxShadow: 'none',
    marginLeft: 'auto', // 필요하면 오른쪽 정렬
  },
};

export default NavBar;
