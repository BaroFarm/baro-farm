import React from 'react';
import PointUsage from './PointUsage';

export default function CouponDiscount() {
  return (
    <div
      style={{
        backgroundColor: '#f9faf8',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '24px',
        textAlign: 'left',
      }}
    >
      {/* 제목 */}
      <div style={{
        fontWeight: 'bold',
        fontSize: '16px',
        marginBottom: '12px',
        marginLeft: '15px'
      }}>
        쿠폰 할인
      </div>

      {/* 보유 쿠폰 조회 + 금액 나란히 정렬 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '15px',
        marginLeft: '15px'
      }}>
        <button style={{
            border: 'none',
            borderRadius: '20px',
            backgroundColor: '#B6D19B',
            padding: '6px 16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            whiteSpace: 'nowrap'
        }}>
          보유 쿠폰 조회
        </button>
        <div style={{ marginLeft: '100px', fontWeight: 'bold' }}>0원</div>
      </div>
      <PointUsage />
    </div>
  );
}
