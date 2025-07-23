import React from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineChatBubbleLeft } from 'react-icons/hi2'; // 말풍선 아이콘

function Header() {
  const navItems = [
    { label: '카테고리', to: '/category' },
    { label: '주문/배송 관리', to: '/order' },
    { label: '상품 등록', to: '/product/register' },
    { label: '나의 가게', to: '/shop' },
    { label: '매출/선호도 분석', to: '/analytics' },
    { label: 'AI 추천', to: '/ai' },
  ];

  return (
    <header>
      <div style={styles.topBar}>
        <div style={styles.logo}>🧺 바로팜</div>
        <input style={styles.search} type="text" placeholder="판매할 상품을 검색하세요" />
        <div>
          <a href="#" style={styles.link}>마이페이지</a>
          <span style={styles.separator}>|</span>
          <a href="#" style={styles.link}>로그아웃</a>
        </div>
      </div>
      <nav style={styles.nav}>
        {navItems.map((item, i) => (
          <React.Fragment key={i}>
            <Link to={item.to} style={styles.navItem}>{item.label}</Link>
            {item.label === '카테고리' && <div style={styles.divider} />}
          </React.Fragment>
        ))}
        <button style={styles.chatbotButton}>
          <HiOutlineChatBubbleLeft size={18} style={{ marginRight: '6px' }} />
          <span>AI 챗봇</span>
        </button>
      </nav>
    </header>
  );
}

const styles = {
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 24px',
    backgroundColor: '#f8f8f8',
    borderBottom: '1px solid #ddd',
  },
  logo: {
    fontWeight: 'bold',
    fontSize: '20px',
  },
  search: {
    flex: 1,
    margin: '0 20px',
    padding: '6px 12px',
    fontSize: '14px',
    border: '1px solid #ccc',
    borderRadius: '4px',
  },
  link: {
    marginLeft: '12px',
    fontSize: '14px',
    color: '#333',
    textDecoration: 'none',
  },
  separator: {
    margin: '0 8px',
    color: '#aaa',
  },
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
}
,
};

export default Header;
