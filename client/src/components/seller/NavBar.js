import React, { useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HiOutlineChatBubbleLeft } from 'react-icons/hi2';
import ChatbotModal from '../../ai_chatbot/ChatbotModal';


function NavBar() {
  const [openChat, setOpenChat] = useState(false);
  const location = useLocation();

  const navItems = useMemo(() => ([
    { label: '카테고리', to: '/category' },
    { label: '주문/배송 관리', to: '/order' },
    { label: '상품 등록', to: '/product/register' },
    { label: '나의 가게', to: '/shop' },
    { label: '매출/선호도 분석', to: '/analytics' },
  ]), []);

  const isActive = (to) => {
    // pathname이 to로 시작하면 활성화로 처리
    return location.pathname === to || location.pathname.startsWith(to + '/');
  };

  return (
    <div style={styles.wrapper}>
      <nav style={styles.nav}>
        {/* 좌측: 메뉴 */}
        <ul style={styles.list}>
          {navItems.map((item, index) => (
            <React.Fragment key={item.to}>
              <li>
                <Link
                  to={item.to}
                  style={{
                    ...styles.navItem,
                    fontWeight: isActive(item.to) ? 700 : 500,
                    color: isActive(item.to) ? '#000' : '#49454F',
                  }}
                >
                  {item.label}
                </Link>
              </li>

              {/* 카테고리 뒤에 구분선 */}
              {item.label === '카테고리' && <div style={styles.divider} />}
            </React.Fragment>
          ))}
        </ul>

        {/* 우측: AI 챗봇 pill 버튼 */}
        <button
          style={styles.chatbotButton}
          onClick={() => setOpenChat(true)}
          type="button"
        >
          <HiOutlineChatBubbleLeft size={18} style={{ marginRight: 6 }} />
          <span>AI 챗봇</span>
        </button>
      </nav>

      {/* 모달 */}
      <ChatbotModal open={openChat} onClose={() => setOpenChat(false)} />
    </div>
  );
}

const styles = {
  // 바깥 래퍼: 전체 폭에서 가운데 정렬
  wrapper: {
    width: '100%',
    backgroundColor: '#B6D19B',  // ShopNav와 동일한 초록색
  },
  // 실제 콘텐츠 컨테이너
  nav: {
    height: 45,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    maxWidth: 1200,
    margin: '0 auto',
    padding: '0 24px',
    boxSizing: 'border-box',
    fontFamily: 'Arial, sans-serif',
  },
  list: {
    display: 'flex',
    listStyle: 'none',
    margin: 0,
    padding: 0,
    gap: 16,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  navItem: {
    textDecoration: 'none',
    fontSize: 15,
    padding: '4px 8px',
  },
  divider: {
    width: 1,
    height: 20,
    backgroundColor: '#8FB46B', // 초록 바와 어울리는 얇은 라인
    margin: '0 8px',
  },
  chatbotButton: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    border: '1px solid #ccc',
    borderRadius: 999,
    padding: '8px 16px',
    fontSize: 14,
    fontWeight: 600,
    color: '#1d1d1f',
    cursor: 'pointer',
  },
};

export default NavBar;
