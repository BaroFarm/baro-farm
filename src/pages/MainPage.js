// src/pages/MainPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import Banner from '../components/Banner';
import ProductSection from '../components/ProductSection';

function MainPage() {
  return (
    <>
      <Banner />
      <ProductSection title="제철 상품" />
      <ProductSection title="추천 상품" />

      {/* 🔹 버튼 영역 */}
      <div style={{ padding: 20, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
         {/* 쿠폰 (할인권) */}
        <Link
          to="/buyer/coupons"
          style={btnStyle('#FF5722')}
        >
          쿠폰 (할인권)
      </Link>

        {/* 나의 금액권 보기 */}
        <Link
          to="/buyer/vouchers"
          style={btnStyle('#4CAF50')}
        >
          나의 금액권 보기
        </Link>

        {/* 직매장 소통채널 */}
        <Link
          to="/buyer/direct-store/chat"
          style={btnStyle('#2563EB')}
        >
          직매장 소통채널
        </Link>

         {/* 🔹 직매장 문의채널 */}
  <Link to="/buyer/direct-store/inquiry-channel" style={btnStyle('#F97316')}>
    직매장 문의채널
  </Link>
      </div>
    </>
  );
}

// 버튼 스타일 공통 함수
const btnStyle = (bgColor) => ({
  display: 'inline-block',
  padding: '10px 20px',
  background: bgColor,
  color: '#fff',
  borderRadius: 8,
  textDecoration: 'none',
  fontWeight: 'bold'
});

export default MainPage;
