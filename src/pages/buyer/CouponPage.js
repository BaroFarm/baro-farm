import React from 'react';

// 임시 쿠폰 데이터
const coupons = [
  { id: 1, discount: '20% 할인', title: '심광쌀', desc: '맛있는밥상', image: '/images/coupons/rice.png' },
  { id: 2, discount: '10% 할인', title: '주호네 농원 사과', desc: '주호네 농원', image: '/images/coupons/apple.png' },
  { id: 3, discount: '10% 할인', title: '장수막걸리', desc: '장수합시다', image: '/images/coupons/makgeolli.png' }
];

function CouponPage() {
  return (
    <div style={{ padding: '20px' }}>
      {/* 페이지 제목 */}
      <h2 style={{ fontWeight: 'bold', borderBottom: '1px solid #ccc', paddingBottom: '8px' }}>
        쿠폰 (할인권)
      </h2>

      {/* 홍보 배너 */}
      <div style={{
        height: '200px',
        background: '#ddd',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '20px 0'
      }}>
        홍보 배너 <br /> (자동 슬라이드 형식)
      </div>

      {/* 쿠폰 리스트 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '16px',
        background: '#f9f9f9',
        padding: '20px',
        borderRadius: '12px'
      }}>
        {coupons.map(coupon => (
          <div key={coupon.id} style={{
            display: 'flex',
            alignItems: 'center',
            background: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            overflow: 'hidden'
          }}>
            <img src={coupon.image} alt={coupon.title} style={{ width: '60px', height: '60px', objectFit: 'contain', margin: '0 8px' }} />
            <div style={{ flex: 1 }}>
              <p style={{ color: 'red', fontSize: '12px', margin: 0 }}>{coupon.discount}</p>
              <p style={{ fontWeight: 'bold', margin: '4px 0 0' }}>{coupon.title} &gt;</p>
              <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>{coupon.desc}</p>
            </div>
            <button style={{
              background: '#e6f0e6',
              border: 'none',
              padding: '12px',
              cursor: 'pointer',
              fontWeight: 'bold',
              color: '#333',
              borderLeft: '1px solid #ddd'
            }}>
              쿠폰 받기
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CouponPage;
