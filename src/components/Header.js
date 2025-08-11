// src/components/Header.jsx
import React from 'react';
import { Link } from 'react-router-dom';

function Header() {
  return (
    <header>
      <div style={styles.topBar}>
        {/* 로고 클릭 시 "/"로 이동 */}
        <Link to="/" style={{ ...styles.logo, textDecoration: 'none', color: 'inherit' }}>
          🧺 바로팜
        </Link>

        <input
          style={styles.search}
          type="text"
          placeholder="판매할 상품을 검색하세요"
        />

        <div>
          <Link to="/mypage" style={styles.link}>마이페이지</Link>
          <span style={styles.separator}>|</span>
          <a href="#" style={styles.link}>로그아웃</a>
        </div>
      </div>
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
    cursor: 'pointer',
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
};

export default Header;
