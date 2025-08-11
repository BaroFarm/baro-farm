// src/components/NavBar.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineChatBubbleLeft } from 'react-icons/hi2';
import ChatbotModal from './ChatbotModal'; 

function NavBar() {

  const [openChat, setOpenChat] = useState(false);

  const navItems = [
    { label: '카테고리', to: '/category' },
    { label: '주문/배송 관리', to: '/order' },
    { label: '상품 등록', to: '/product/register' },
    { label: '나의 가게', to: '/shop' },
    { label: '매출/선호도 분석', to: '/analytics' }
  ];

  return (
    <nav style={styles.nav}>
      {navItems.map((item, index) => (
        <React.Fragment key={index}>
          <Link to={item.to} style={styles.navItem}>{item.label}</Link>
          {item.label === '카테고리' && <div style={styles.divider} />}
        </React.Fragment>
      ))}

      <button style={styles.chatbotButton}
       onClick={() => setOpenChat(true)}>
        <HiOutlineChatBubbleLeft size={18} style={{ marginRight: '6px' }} />
        <span>AI 챗봇</span>
      </button>

      {/* 모달 */}
      <ChatbotModal open={openChat} onClose={() => setOpenChat(false)} />
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
  },
};

export default NavBar;
