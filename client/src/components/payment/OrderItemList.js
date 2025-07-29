import React from 'react';

export default function OrderItemList({ items }) {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div
      style={{
        backgroundColor: '#f9faf8',
        padding: '24px',
        borderRadius: '8px',
        marginBottom: '24px',
        textAlign: 'left',
      }}
    >
      {/* 제목 */}
      <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '16px', marginLeft: '15px' }}>
        주문 상품
      </div>

      {/* 상품 리스트 세로 정렬 */}
      {items.map((item) => (
        <div
          key={item.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '12px',
            marginLeft: '15px',
            gap: '16px'
          }}
        >
          {/* 상품 이미지 */}
          <img
            src={item.image}
            alt={item.name}
            style={{
              width: '100px',
              height: '100px',
              objectFit: 'cover',
              borderRadius: '4px'
            }}
          />

          {/* 상품 정보 */}
          <div style={{ display: 'flex', gap: '40px', fontWeight: 'bold' }}>
            <div>{item.name}</div>
            <div>{item.price.toLocaleString()}원</div>
            <div>{item.quantity}개</div>
            <div>{item.delivery}</div>
          </div>
        </div>
      ))}

      {/* 총 금액 */}
      <div style={{ fontWeight: 'bold', marginTop: '20px',marginLeft: '15px', }}>총 상품 금액</div>
      <div style={{ fontSize: '18px', fontWeight: 'bold',marginLeft: '15px', }}>
        {total.toLocaleString()}원
      </div>
    </div>
  );
}
