// src/components/NavBar.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom'; // ✅ 추가

function NavBar() {
  const menuItems = ['카테고리', '주문/배송 관리', '상품 등록', '나의 가게', '매출/선호도 분석', 'AI 추천'];
  const navigate = useNavigate(); // ✅ 추가

  const handleClick = (item) => {
    if (item === '상품 등록') {
      navigate('/register'); // ✅ 상품 등록 페이지로 이동
    } else {
      alert(`${item} 페이지는 아직 준비 중입니다!`);
    }
  };

  return (
    <nav style={styles.nav}>
      {menuItems.map((item, index) => (
        <button
          key={index}
          style={styles.button}
          onClick={() => handleClick(item)} // ✅ 추가
        >
          {item}
        </button>
      ))}
    </nav>
  );
}

const styles = {
  nav: {
    display: 'flex',
    gap: '16px',
    padding: '12px 24px',
    backgroundColor: '#e6efdc',
    borderBottom: '1px solid #ccc',
    flexWrap: 'wrap',
  },
  button: {
    background: 'none',
    border: 'none',
    fontSize: '15px',
    cursor: 'pointer',
    padding: '6px 10px',
    color: '#333',
    fontWeight: '500',
  },
};

export default NavBar;
