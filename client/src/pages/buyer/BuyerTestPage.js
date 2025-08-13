// src/pages/buyer/BuyerTestPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function BuyerTestPage() {
  const btnStyle = {
    display: 'block',
    padding: '12px 16px',
    margin: '10px 0',
    background: '#4CAF50',
    color: '#fff',
    borderRadius: 8,
    textDecoration: 'none',
    textAlign: 'center',
    fontWeight: 'bold'
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>구매자 메뉴</h2>
      <Link to="/buyer/vouchers" style={btnStyle}>나의 금액권</Link>

      <Link to="#" style={btnStyle}>쿠폰</Link>
      <Link to="#" style={btnStyle}>직매장 소통 채널</Link>
      <Link to="#" style={btnStyle}>나의 문의내역</Link>
    </div>
  );
}
