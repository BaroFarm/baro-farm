// src/pages/MainPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import PromoBanner from '../components/common/PromoBanner';

// ✅ 경로는 프로젝트 구조에 맞춰 수정
import SeasonalProduct from '../components/common/product/SeasonalProduct';
import Recommendations from '../components/common/product/Recommendations';

function MainPage() {
  return (
    <>
      {/* 🔹 NavBar 바로 밑에 붙는 배너 */}
      <PromoBanner />

      {/* 🔹 본문 컨테이너 */}
      <div style={container}>
        {/* 제철 상품 슬라이더 */}
        <SeasonalProduct limit={20} />

        {/* 추천 상품 슬라이더 */}
        <Recommendations title="추천 상품" />

        {/* 🔹 버튼 영역 */}
        <div style={actions}>
          <Link to="/buyer/coupons" style={btnStyle('#FF5722')}>쿠폰 (할인권)</Link>
          <Link to="/buyer/vouchers" style={btnStyle('#4CAF50')}>나의 금액권 보기</Link>
          <Link to="/buyer/direct-store/chat" style={btnStyle('#2563EB')}>직매장 소통채널</Link>
          <Link to="/buyer/direct-store/inquiry-channel" style={btnStyle('#F97316')}>직매장 문의채널</Link>
        </div>
      </div>
    </>
  );
}

const container = {
  maxWidth: 1200,
  margin: '0 auto',
  padding: '0 24px 24px',
  boxSizing: 'border-box',
};

const actions = {
  paddingTop: 20,
  display: 'flex',
  gap: 12,
  flexWrap: 'wrap',
};

const btnStyle = (bgColor) => ({
  display: 'inline-block',
  padding: '10px 20px',
  background: bgColor,
  color: '#fff',
  borderRadius: 8,
  textDecoration: 'none',
  fontWeight: 'bold',
});

export default MainPage;
